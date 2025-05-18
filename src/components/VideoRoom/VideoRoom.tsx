import React, { useState, useRef, useEffect } from 'react';
import { Centrifuge } from 'centrifuge';
import { axiosInstance } from "../../api/api.config";
import { observer } from "mobx-react-lite";
import { authStore } from '../../store/AuthStore';
import { useCallStore } from '../../store/CallStore';
import defaultAvatar from '../assets/default-avatar.png'

// @ts-ignore
import kurentoUtils from "kurento-utils";

import "./VideoRoom.css"

interface VideoCallProps {
  roomId: string;
  centrifugoUrl: string;
  centToken: string;
  channels: { room: string; user: string };
}

interface RoomMeta {
  existingUserIds: string[],
}

const VideoRoom: React.FC<VideoCallProps> = observer(({ roomId, centrifugoUrl, centToken, channels }) => {
  const publisherPeerRef = useRef<any>(null);
  const subscribersPeersRef = useRef<Map<string, any>>(new Map());
  const centrifugeRef = useRef<Centrifuge | null>(null);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const messageQueueRef = useRef<any[]>([]);

  const [isControlsVisible, setIsControlsVisible] = useState(true);
  const controlsTimeout = useRef<NodeJS.Timeout | null>(null);

  const localStreamRef = useRef<MediaStream | null>(null);
  const [isMicMuted, setIsMicMuted] = useState(false);
  const [isCameraMuted, setIsCameraMuted] = useState(false);

  const handleMouseMove = () => {
    setIsControlsVisible(true);
    if (controlsTimeout.current) clearTimeout(controlsTimeout.current);
    controlsTimeout.current = setTimeout(() => setIsControlsVisible(false), 2000);
  };

  useEffect(() => {
    return () => {
      if (controlsTimeout.current) clearTimeout(controlsTimeout.current);
    };
  }, []);

  useEffect(() => {
    const startProcess = async () => {
      if (!centToken || !channels || !authStore.userId) return;
  
      console.log("Автостарт звонка...");
      initTraceWsConnection()
  
      initCentrifugeSubscriptions();
      console.log("Subscribed to centrifugo");

      startCall();
  
      await startRTCExchange();
      console.log("RTC обмен завершен");
    };
  
    startProcess();
  }, [centToken]);

  const handleMessage = (msg: any) => {
    if (!publisherPeerRef.current) {
      console.log("WebRtcPeer еще не готов. Сообщение добавлено в очередь: ", msg);
      messageQueueRef.current.push(msg);
      return;
    }

    console.log("Обработка сообщения:", msg);
    switch (msg.type) {
      case "user_joined":
        handleNewUserJoined({
          existingUserIds: msg.payload.existing_user_ids,
        });
        break;
      case "user_left":
        handleUserLeft(msg.payload);
        break;
      case "answer":
        handleAnswer(msg.payload);
        break;
      case "answer_sub":
        console.log("ans sub got")
        handleAnswerSub(msg.payload);
        break;
      case "publisher_ice":
        handleIceCandidate(msg.payload.candidate);
        console.log(publisherPeerRef.current)
        break;
      case "subscriber_ice":
        handleSubscriberIceCandidate(msg.payload);
        console.log(publisherPeerRef.current)
        break;
      case "media_change":
        handleMediaChange(msg.payload);
        break;
      default:
        console.log("Неизвестное сообщение", msg);
    }
  };

  const initTraceWsConnection = () => {
    if (!authStore.userId) return;

    const traceWs = new WebSocket(`ws://localhost/ws/api/room/${roomId}/trace?userID=${authStore.userId}`);

    traceWs.onopen = () => {
      console.log("WebSocket для мониторинга статуса подключен");
    };

    traceWs.onerror = (error) => {
      console.error("WebSocket ошибка:", error);
    };

    traceWs.onclose = (event) => {
      console.log("WebSocket соединение закрыто:", event.reason);
    };

    return () => {
      console.log("Trying to kill connection")
      if (traceWs.readyState === WebSocket.OPEN) {
        traceWs.send(JSON.stringify({ status: 'inactive' }));

        setTimeout(() => {
          traceWs.close(1000, "User left");
        }, 50);
      } else {
        traceWs.close(1000, "Connection terminated");
      }
    };
  }

  const initCentrifugeSubscriptions = () => {
    if (!centToken || !channels) return;

    const centrifuge = new Centrifuge(centrifugoUrl, { token: centToken });
    centrifugeRef.current = centrifuge;

    const userSub = centrifuge.newSubscription(channels.user);
    const roomSub = centrifuge.newSubscription(channels.room);

    userSub.on("publication", (ctx) => handleMessage(ctx.data));
    roomSub.on("publication", (ctx) => handleMessage(ctx.data));

    userSub.subscribe();
    roomSub.subscribe();
    centrifuge.connect();

    return () => {
      userSub.unsubscribe();
      roomSub.unsubscribe();
      centrifuge.disconnect();
    };
  };

  const handleNewUserJoined = (roomMeta: RoomMeta) => {
    if (!authStore.userId) return;
    console.log("Room meta: ", roomMeta)

    roomMeta.existingUserIds.forEach(userId => {
      if (!subscribersPeersRef.current.has(userId) && authStore.userId?.toString() != userId) {
        createSubscriberPeer(userId);
      }
    });

    calculateGrid();
  }

  const handleUserLeft = (payload: {userId: string}) => {
    console.log(`User #${payload.userId} left the channel`)
    subscribersPeersRef.current.delete(payload.userId)

    const remoteVideo = document.getElementById(`remote-${payload.userId}`);
    if (remoteVideo) {
      const videoContainer = document.getElementById('video-container');
      if (videoContainer) {
        videoContainer.removeChild(remoteVideo);
      }
    }

    calculateGrid();
  }

  const createSubscriberPeer = (userId: string) => {
    if (userId == "") return

    const videoWrapper = document.createElement('div');
    videoWrapper.id = `remote-${userId}`;
    videoWrapper.classList.add("video-tile");

    const remoteVideo = document.createElement('video');
    remoteVideo.id = `video-${userId}`;
    remoteVideo.autoplay = true;
    remoteVideo.playsInline = true;
    remoteVideo.classList.add("video-element");

    videoWrapper.appendChild(remoteVideo);
    document.getElementById('video-container')?.appendChild(videoWrapper);

    const options = {
      remoteVideo: remoteVideo,
      onicecandidate: (candidate: any) => {
        console.log("New remote ICE candidate:", candidate);
        sendToBackend('remoteIce', { targetUserId: userId, candidate });
      }
    };

    const peer = kurentoUtils.WebRtcPeer.WebRtcPeerRecvonly(options, (error: any) => {
      if (error) return console.error(`Subscriber error [${userId}]:`, error);

      peer.generateOffer((error: any, offer: string) => {
        sendToBackend('subscribe', { targetUserId: userId, offer });
      });
    });

    subscribersPeersRef.current.set(userId, peer);
  };

  const handleAnswer = (sdpAnswer: string) => {
    publisherPeerRef.current?.processAnswer(sdpAnswer, (error: any) => {
      error 
        ? console.error("Ошибка обработки ответа SDP:", error)
        : console.log("Remote SDP установлен:", sdpAnswer);
    });
  };

  const handleAnswerSub = (sdpAnswerSub: {targetUserId: string, sdpAnswer: string}) => {
    console.log("check subscriber peer sdp answer: ", subscribersPeersRef.current)
    subscribersPeersRef.current?.get(sdpAnswerSub.targetUserId).processAnswer(sdpAnswerSub.sdpAnswer, (error: any) => {
      error 
        ? console.error("Ошибка обработки ответа SDP:", error)
        : console.log("Remote SDP установлен:", sdpAnswerSub.sdpAnswer);
    });
  }

  const handleIceCandidate = (candidate: RTCIceCandidateInit) => {
    publisherPeerRef.current?.addIceCandidate(candidate, (error: any) => {
      error && console.error("Ошибка добавления ICE:", error);
    });
  };

  function showVideoPlaceholder(userId: string, avatarUrl: string) {
    const wrapper = document.getElementById(`remote-${userId}`);
    const video = document.getElementById(`video-${userId}`) as HTMLVideoElement;

    if (!wrapper || !video) return;

    video.style.display = 'none';

    if (wrapper.querySelector('.video-placeholder')) return;

    const placeholder = document.createElement('div');
    placeholder.className = 'video-placeholder';

    const avatar = document.createElement('img');
    avatar.src = avatarUrl;
    avatar.alt = 'avatar';
    avatar.className = 'avatar';

    placeholder.appendChild(avatar);
    wrapper.appendChild(placeholder);
  }

  function hideVideoPlaceholder(userId: string) {
    const wrapper = document.getElementById(`remote-${userId}`);
    const video = document.getElementById(`video-${userId}`) as HTMLVideoElement;

    if (!wrapper || !video) return;

    video.style.display = 'block';

    const placeholder = wrapper.querySelector('.video-placeholder');
    if (placeholder) {
      wrapper.removeChild(placeholder);
    }
  }

  const handleMediaChange = (mediaStatus: {audio: boolean, video: boolean, user_id: string}) => {
    if (Number(mediaStatus.user_id) == authStore.userId) return

    if (!subscribersPeersRef.current) return

    if (mediaStatus.video) {
      hideVideoPlaceholder(mediaStatus.user_id)
    } else {
      showVideoPlaceholder(mediaStatus.user_id, defaultAvatar)
    }
  }

  const handleSubscriberIceCandidate = (subCandidate: {candidate: RTCIceCandidateInit, targetUserId: string}) => {
    console.log("check subscriber peer ice: ", subscribersPeersRef.current)
    subscribersPeersRef.current?.get(subCandidate.targetUserId)?.addIceCandidate(subCandidate.candidate, (error: any) => {
      error && console.error("Ошибка добавления remote ICE:", error);
    });
  }

  const startRTCExchange = async () => {
    await axiosInstance.post(`/api/room/${roomId}`);
  }

  const startCall = async () => {
    if (!localVideoRef.current) return;

    let mediaConstraints = { audio: !isMicMuted, video: !isCameraMuted };
    let stream: MediaStream;

    try {
      stream = await navigator.mediaDevices.getUserMedia(mediaConstraints);
    } catch (error) {
      console.warn("Камера недоступна, пробуем только с микрофоном:", error);
      try {
        mediaConstraints = { audio: !isMicMuted, video: false };
        stream = await navigator.mediaDevices.getUserMedia(mediaConstraints);
      } catch (err) {
        console.error("Нет доступа даже к микрофону:", err);
        
        mediaConstraints = { audio: false, video: false };
        stream = await navigator.mediaDevices.getUserMedia(mediaConstraints);
      }
    }

    if (mediaConstraints.video && stream.getVideoTracks().length > 0) {
      localVideoRef.current.srcObject = stream;
    }

    localStreamRef.current = stream;

    const options = {
      mediaStream: localStreamRef.current,
      onicecandidate: (candidate: any) => {
        console.log("New local ICE candidate:", candidate);
        sendToBackend("ice", candidate);
      },
    };

    const peer = kurentoUtils.WebRtcPeer.WebRtcPeerSendonly(options, (error: any) => {
      if (error) return console.error("Ошибка создания WebRtcPeer:", error);

      peer.generateOffer((error: any, sdpOffer: string) => {
        if (error) return console.error("Ошибка генерации SDP Offer:", error);

        console.log("Generated SDP Offer");
        sendToBackend("offer", sdpOffer);
        
        publisherPeerRef.current = peer;

        console.log("Обрабатываем очередь сообщений:", messageQueueRef.current);
        messageQueueRef.current.forEach(msg => handleMessage(msg));
        messageQueueRef.current = [];
      });
    });
  };

  const sendToBackend = async (type: string, payload: any) => {
    if (!channels) return;

    try {
      await axiosInstance.post(`/api/room/${roomId}/signal`, { type, payload });
    } catch (error) {
      console.error("Ошибка при отправке сигнала:", error);
    }
  };

  const toggleMic = async () => {
    const stream = localStreamRef.current;
    if (!stream) return;

    stream.getAudioTracks().forEach(track => {
      track.enabled = !track.enabled;
    });
    setIsMicMuted(prev => !prev);

    const status = !publisherPeerRef.current.audioEnabled
    publisherPeerRef.current.audioEnabled = status

    try {
      await axiosInstance.post(`/api/room/${roomId}/signal`, { 
        type: "mediaChange", 
        payload: {
          video: !isCameraMuted,
          audio: status
        }
      });
    } catch (error) {
      console.error("Ошибка при отправке сигнала:", error);
    }
  };

  const toggleCamera = async () => {
    const stream = localStreamRef.current;
    if (!stream) return;

    stream.getVideoTracks().forEach(track => {
      track.enabled = !track.enabled;
      
    });
    setIsCameraMuted(prev => !prev);

    const status = !publisherPeerRef.current.videoEnabled
    publisherPeerRef.current.videoEnabled = status

    try {
      await axiosInstance.post(`/api/room/${roomId}/signal`, { 
        type: "mediaChange", 
        payload: {
          video: status,
          audio: !isMicMuted
        }
      });
    } catch (error) {
      console.error("Ошибка при отправке сигнала:", error);
    }
  };

  const leaveCall = () => {
    const stream = localStreamRef.current;
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }

    publisherPeerRef.current?.dispose();
    publisherPeerRef.current = null;

    subscribersPeersRef.current.clear();

    if (localVideoRef.current) {
      localVideoRef.current.srcObject = null;
    }

    useCallStore.getState().deactivateRoom();
  };

  const calculateGrid = () => {
    const container = document.querySelector('.video-grid');
    if (!container) {
      console.warn("Контейнер видео не найден.");
      return;
    }
    if (!(container instanceof HTMLElement)) {
      console.warn("Контейнер видео не найден или не является HTMLElement.");
      return;
    }

    const tiles = document.querySelectorAll('.video-tile');
    const gap = 15;
    
    const containerWidth = container.clientWidth;
    const containerHeight = container.clientHeight;
    
    const tileCount = tiles.length;
    let bestLayout = { cols: 1, rows: 1, width: 0, height: 0 }; 
    
    for (let cols = 1; cols <= tileCount; cols++) {
        const rows = Math.ceil(tileCount / cols);
        
        const tileWidth = (containerWidth - (cols - 1) * gap) / cols;
        const tileHeight = (containerHeight - (rows - 1) * gap) / rows;
        
        const aspectRatio = tileWidth / tileHeight;
        const targetRatio = 4/3;
        
        let width, height;
        if (aspectRatio > targetRatio) {
            height = tileHeight;
            width = height * targetRatio;
        } else {
            width = tileWidth;
            height = width / targetRatio;
        }
        
        if (width * cols + gap * (cols - 1) <= containerWidth &&
            height * rows + gap * (rows - 1) <= containerHeight) {
            if (width * height > (bestLayout.width || 0) * (bestLayout.height || 0)) {
                bestLayout = { cols, rows, width, height };
            }
        }
    }
    
    container.style.gridTemplateColumns = `repeat(${bestLayout.cols}, ${bestLayout.width}px)`;
    container.style.gridTemplateRows = `repeat(${bestLayout.rows}, ${bestLayout.height}px)`;
  }

  useEffect(() => {
    let resizeTimer: NodeJS.Timeout;
  
    const onResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        calculateGrid();
      }, 100);
    };
  
    window.addEventListener('resize', onResize);
  
    return () => {
      window.removeEventListener('resize', onResize);
      clearTimeout(resizeTimer);
    };
  }, []);
  
  return (
    <div 
      className="video-room-container"
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setIsControlsVisible(false)}
    >
      <div id="video-container" className="video-grid">
        <div className="video-tile">
          {isCameraMuted && (
            <div className="video-placeholder">
              <img src={defaultAvatar} alt="avatar" className="avatar" />
            </div>
          )}
          <video
            ref={localVideoRef}
            autoPlay
            playsInline
            muted
            className="video-element"
          ></video>
        </div>
      </div>
      <div className={`controls ${isControlsVisible ? 'visible' : 'hidden'} `}>
        <button className={`control-btn ${isMicMuted ? 'muted' : ''}`} id="micToggle" onClick={toggleMic}>
            <svg viewBox="0 0 24 24">
              {!isMicMuted ? (
                <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm-1 1.93c-3.94-.49-7-3.85-7-7.93h2c0 3.31 2.69 6 6 6s6-2.69 6-6h2c0 4.08-3.06 7.44-7 7.93V19h4v2H8v-2h4v-3.07z"/>
              ) : (
                <>
                  <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm-1 1.93c-3.94-.49-7-3.85-7-7.93h2c0 3.31 2.69 6 6 6s6-2.69 6-6h2c0 4.08-3.06 7.44-7 7.93V19h4v2H8v-2h4v-3.07z"/>
                  <line 
                    x1="3"
                    y1="3" 
                    x2="21"
                    y2="21" 
                    stroke="white" 
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </>
              )}
            </svg>
        </button>
        
        <button className={`control-btn ${isCameraMuted ? 'muted' : ''}`} id="videoToggle" onClick={toggleCamera}>
          <svg viewBox="0 0 24 24">
            {!isCameraMuted ? (
              <path d="M17 10.5V7c0-1.1-.9-2-2-2H5C3.9 5 3 5.9 3 7v10c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2v-3.5l4 4v-11l-4 4z"/>
            ) : (
              <>
                <path d="M17 10.5V7c0-1.1-.9-2-2-2H5C3.9 5 3 5.9 3 7v10c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2v-3.5l4 4v-11l-4 4z"/>
                <line 
                    x1="3"
                    y1="3" 
                    x2="21"
                    y2="21" 
                    stroke="white" 
                    strokeWidth="2"
                    strokeLinecap="round"
                />
              </>
            )}
          </svg>
        </button>
        
        <button className="control-btn" id="screenShare">
            <svg viewBox="0 0 24 24">
                <path d="M20 18c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2H4c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2H1c-.55 0-1 .45-1 1s.45 1 1 1h22c.55 0 1-.45 1-1s-.45-1-1-1h-3zm-7-3.53v-2.19c-1.78.37-3.2 1.68-3.75 3.27 1.14.55 2.33.93 3.58 1.11L16 13.5V11h1v2.47l3.07 1.53-.56.93-2.51-1.26z"/>
            </svg>
        </button>
        
        <button className="control-btn danger" id="leaveCall" onClick={leaveCall}>
            <svg viewBox="0 0 24 24">
              <path d="M21 7.5c-5.05-2.94-12.95-2.94-18 0-.47.27-.7.81-.53 1.33l1.29 4.12a1 1 0 0 0 1.3.64l3.11-1.04c.43-.14.68-.59.58-1.03l-.33-1.49c2.22-.68 4.6-.68 6.82 0l-.33 1.49c-.1.44.15.89.58 1.03l3.11 1.04a1 1 0 0 0 1.3-.64l1.29-4.12c.17-.52-.06-1.06-.53-1.33z"/>
            </svg>
        </button>
      </div>
    </div>
  );  
});

export default VideoRoom;