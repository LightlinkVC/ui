import { useState } from 'react';
import { axiosInstance } from "../../api/api.config";
import FriendList from '../../components/Friends/FriendList';
import PendingRequests from '../../components/Friends/PendingRequests';
import ChatWindow from '../../components/Friends/ChatWindow';

const MainPage = () => {
  const [selectedFriend, setSelectedFriend] = useState<{
    friendId: number;
    groupId: number;
  } | null>(null);

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
              centrifugoUrl='ws://localhost:8000/connection/websocket'
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
