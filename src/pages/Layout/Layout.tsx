import { FC, useEffect, useState, useRef } from "react";
import { authStore } from "../../store/AuthStore";
import { Outlet } from "react-router-dom";
import { axiosInstance } from "../../api/api.config";
import { Centrifuge } from 'centrifuge';

import { useCallModalStore } from '../../store/CallModalStore';
import IncomingCallModal from '../../components/Notifications/IncomingCall/IncomingCallModal';

import FriendRequestModal from '../../components/Notifications/FriendRequest/FriendRequestModal';
import { useFriendRequestModalStore } from '../../store/FriendRequestModalStore';

import IncomingMessageModal from '../../components/Notifications/IncomingMessage/IncomingMessageModal';
import { useIncomingMessageModalStore } from '../../store/MessageModalStore';

import { useCallStore } from '../../store/CallStore';
import { useNavigate } from "react-router-dom";

interface FriendRequestPayload {
  fromUserId: string,
  fromUsername: string,
  toUserId: string,
}

interface IncomingMessagePayload {
  fromUserId: string,
  fromUsername: string,
  toUserId: string,
  roomId: string,
  content: string,
}

interface IncomingCallPayload {
  fromUserId: string,
  fromUsername: string,
  toUserId: string,
  roomId: string,
}

const Layout: FC = () => {
  const [centToken, setCentToken] = useState<string | null>(null);
  const [channels, setChannels] = useState<{ personal: string; } | null>(null);
  const centrifugeRef = useRef<Centrifuge | null>(null);

  const navigate = useNavigate();

  useEffect(() => {
    if (authStore.isAuthenticated && authStore.userId) {
      const fetchChannels = async () => {
        try {
          const response = await axiosInstance.get('/api/info');
          setCentToken(response.data.token);
          setChannels(response.data.channels);
        } catch (error) {
          console.error("Ошибка при получении каналов:", error);
        }
      };
      
      fetchChannels();
    }
    
    return () => {
      
    };
  }, [authStore.userId]);

  useEffect(() => {
    initCentrifugeSubscription()
    }, [centToken]);

  const initCentrifugeSubscription = () => {
    if (!centToken || !channels) return;
    console.log("connecting basic cent")
    const centrifuge = new Centrifuge(
      "ws://localhost:8000/connection/websocket",
      { token: centToken },
    );
    centrifugeRef.current = centrifuge;

    const personalSub = centrifuge.newSubscription(channels.personal);

    personalSub.on("publication", (ctx) => handleMessage(ctx.data));

    personalSub.subscribe();
    centrifuge.connect();

    centrifuge.on("connected", () => console.log("cent connected"))
  
    return () => {
      personalSub.unsubscribe();
      centrifuge.disconnect();
    };
  };

  const handleMessage = (base64Message: any) => {
    const decodedMessage = atob(base64Message);
    const messageObject = JSON.parse(decodedMessage);

    console.log("Обработка layout-сообщения:", messageObject);
    switch (messageObject.type) {
      case "friendRequest":
        handleIncomingFriendRequest({ 
            fromUserId: messageObject.from_user_id,
            fromUsername: messageObject.from_username,
            toUserId: messageObject.to_user_id,
        })

        break;
      case "incomingMessage":
        handleIncomingMessage({ 
          fromUserId: messageObject.from_user_id,
          fromUsername: messageObject.from_username,
          toUserId: messageObject.to_user_id,
          roomId: messageObject.room_id,
          content: messageObject.content,
        })

        break;
      case "incomingCall":
        handleIncomingCall({ 
          fromUserId: messageObject.from_user_id,
          fromUsername: messageObject.from_username,
          toUserId: messageObject.to_user_id,
          roomId: messageObject.room_id,
        })

        break;
      default:
        console.log("Неизвестное сообщение", messageObject);
    }
  };

  const handleIncomingFriendRequest = (friendRequestMessage: FriendRequestPayload) => {
    useFriendRequestModalStore.getState().show(
      friendRequestMessage.fromUsername,
      "хочет добавить вас в друзья"
    );  
  }

  const handleIncomingMessage = (incomingMessageRequest: IncomingMessagePayload) => {
    useIncomingMessageModalStore.getState().show(
      incomingMessageRequest.fromUsername,
      incomingMessageRequest.content
    );
  }

  // // debug only (incoming call)
  // useEffect(() => {
  //   useCallModalStore.getState().showModal(
  //     "TestUser",
  //     () => console.log("Принято (dev)"),
  //     () => console.log("Отклонено (dev)")
  //   );
  // }, []);

  // debug only (friend request)
  // useEffect(() => {
  //   useFriendRequestModalStore.getState().show(
  //     "DevUser",
  //     "хочет добавить вас в друзья"
  //   );
  // }, []);

  // debug only (incoming message)
  // useEffect(() => {
  //   useIncomingMessageModalStore.getState().show(
  //     "DevUser",
  //     "Тестовове сообщение"
  //   );
  // }, []);

  // useEffect(() => {
  //   let incomingCallRequest: IncomingCallPayload = {
  //     fromUserId: "1",
  //     fromUsername: "test",
  //     toUserId: "2",
  //     roomId: "1",
  //   }
  //   handleIncomingCall(incomingCallRequest)
  // }, []);

  const handleIncomingCall = (incomingCallRequest: IncomingCallPayload) => {
    const { fromUsername, roomId } = incomingCallRequest;
  
    useCallModalStore.getState().showModal(
      fromUsername,
      () => {
        useCallStore.getState().activateRoom(roomId);
        console.log('Звонок принят');

        navigate(`/chat/${roomId}`);
      },
      () => {
        console.log('Звонок отклонён');
      }
    );
  };

  return (
    <>
      <Outlet />
      <IncomingCallModal />
      <FriendRequestModal />
      <IncomingMessageModal />
    </>
  )
};
  
export default Layout;