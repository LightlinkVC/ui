import { FC, useEffect, useState, useRef } from "react";
import { authStore } from "../../store/AuthStore";
import { Outlet } from "react-router-dom";
import { axiosInstance } from "../../api/api.config";
import { Centrifuge } from 'centrifuge';

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
  toUserId: string,
  roomId: string,
}

const Layout: FC = () => {
  const [centToken, setCentToken] = useState<string | null>(null);
  const [channels, setChannels] = useState<{ personal: string; } | null>(null);
  const centrifugeRef = useRef<Centrifuge | null>(null);

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
      default:
        console.log("Неизвестное сообщение", messageObject);
    }
  };

  const handleIncomingFriendRequest = (friendRequestMessage: FriendRequestPayload) => {
    
  }
  const handleIncomingMessage = (incomingMessageRequest: IncomingMessagePayload) => {

  }

  return (
    <>
      <Outlet />
    </>
  )
};
  
export default Layout;