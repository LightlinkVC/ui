import { useEffect, useState, useRef } from 'react';
import { axiosInstance } from "../../api/api.config";
import FriendList from '../../components/Friends/FriendList';
import PendingRequests from '../../components/Friends/PendingRequests';
import ChatWindow from '../../components/Friends/ChatWindow';
import { Centrifuge } from 'centrifuge';
import { authStore } from "../../store/AuthStore";

const MainPage = () => {
  const [selectedFriend, setSelectedFriend] = useState<{
    friendId: number;
    groupId: number;
  } | null>(null);

  const centrifugeRef = useRef<Centrifuge | null>(null);

  const handleFriendSelect = async (friendId: number) => {
    try {
      const response = await axiosInstance.get(`/api/get-group-id/${friendId}`);

      setSelectedFriend({
        friendId,
        groupId: response.data.group_id
      });

      console.log("Selected friend updated:", { friendId, groupId: response.data.group_id });
    } catch (error) {
      console.error("Error fetching group ID:", error);
    }
  };

  useEffect(() => {
    if (!centrifugeRef.current) {
      console.log("Initializing WebSocket connection...");

      const centrifuge = new Centrifuge('ws://localhost/connection/websocket', {
        token: authStore.token ?? undefined, // Use token or undefined
        debug: true,
      });

      centrifuge.on('connected', (ctx) => {
        console.log('Connected to Centrifugo', ctx);
      });

      centrifuge.on('disconnected', (ctx) => {
        console.log('Disconnected from Centrifugo', ctx);
      });

      centrifugeRef.current = centrifuge;
      centrifuge.connect();
    }

    // 📌 Убираем вызов disconnect() при размонтировании компонента
    return () => {
      console.log("MainPage unmounting, but NOT closing WebSocket.");
    };
  }, []);

  return (
    <div className="main-page">
      <h1>Main page</h1>

      <div className="content-container">
        <div className="friends-section">
          <h2>Friend list</h2>
          <FriendList onFriendSelect={handleFriendSelect} />

          <h2>Pending requests</h2>
          <PendingRequests />
        </div>

        <div className="chat-section">
          {selectedFriend ? (
            <ChatWindow 
              groupId={selectedFriend.groupId} 
              centrifuge={centrifugeRef.current} // 📌 Передаём одно подключение
            />
          ) : (
            <div className="chat-placeholder">
              Select a friend to start chatting
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MainPage;
