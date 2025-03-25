import React, { useState, useRef, useEffect } from 'react';
import { Centrifuge } from 'centrifuge';
import { axiosInstance } from "../../api/api.config";
import { observer } from "mobx-react-lite";
import { authStore } from '../../store/AuthStore';

// @ts-ignore
import kurentoUtils from "kurento-utils";

interface VideoCallProps {
  roomId: string;
  centrifugoUrl: string;
}

interface RoomMeta {
  existingUserIds: string[],
}

const VideoRoom: React.FC<VideoCallProps> = observer(({ roomId, centrifugoUrl }) => {
  const publisherPeerRef = useRef<any>(null);
  const subscribersPeersRef = useRef<Map<string, any>>(new Map());
  const centrifugeRef = useRef<Centrifuge | null>(null);
  const [centToken, setCentToken] = useState<string | null>(null);
  const [channels, setChannels] = useState<{ room: string; user: string } | null>(null);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const messageQueueRef = useRef<any[]>([]);

  useEffect(() => {
    const fetchChannels = async () => {
      try {
        const response = await axiosInstance.get(`/api/room/${roomId}/info`);
        setCentToken(response.data.token);
        setChannels(response.data.channels);
      } catch (error) {
        console.error("Ошибка при получении каналов:", error);
      }
    };

    fetchChannels();
  }, [roomId]);

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

    return () => {
      console.log("Trying to kill connection")
      if (traceWs.readyState === WebSocket.OPEN) {
        traceWs.send(JSON.stringify({ status: 'inactive' }));
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

    // Создание приемников для новых участников
    roomMeta.existingUserIds.forEach(userId => {
      if (!subscribersPeersRef.current.has(userId) && authStore.userId?.toString() != userId) {
        createSubscriberPeer(userId);
      }
    });
  }

  const handleUserLeft = (payload: {userId: string}) => {
    subscribersPeersRef.current.delete(payload.userId)

    const remoteVideo = document.getElementById(`remote-${payload.userId}`);
    if (remoteVideo) {
      const videoContainer = document.getElementById('video-container');
      if (videoContainer) {
        videoContainer.removeChild(remoteVideo);
      }
    }
  }

  const createSubscriberPeer = (userId: string) => {
    if (userId == "") return

      const remoteVideo = document.createElement('video');
      remoteVideo.id = `remote-${userId}`;
      remoteVideo.autoplay = true;
      remoteVideo.playsInline = true;
      document.getElementById('video-container')?.appendChild(remoteVideo);

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

  const handleSubscriberIceCandidate = (subCandidate: {candidate: RTCIceCandidateInit, targetUserId: string}) => {
    console.log("check subscriber peer ice: ", subscribersPeersRef.current)
    subscribersPeersRef.current?.get(subCandidate.targetUserId)?.addIceCandidate(subCandidate.candidate, (error: any) => {
      error && console.error("Ошибка добавления remote ICE:", error);
    });
  }

  const startRTCExchange = async () => {
    await axiosInstance.post(`/api/room/${roomId}`);
  }

  const startCall = () => {
    if (!localVideoRef.current) return;

    const options = {
      localVideo: localVideoRef.current,
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
        
        // Инициализируем подписки после создания offer
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

  return (
    <div>
      <div>Комната: {roomId}</div>
      <video ref={localVideoRef} autoPlay playsInline></video>
      <div id='video-container'></div>
    </div>
  );
});

export default VideoRoom;