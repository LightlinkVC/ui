import { axiosInstance } from "../../api/api.config";
import FriendList from '../../components/Friends/FriendList';
import PendingRequests from '../../components/Friends/PendingRequests';
import { useNavigate } from 'react-router-dom';

const TestMainPage = () => {
  const navigate = useNavigate();

  const handleFriendSelect = async (friendId: number) => {
    try {
      const response = await axiosInstance.get(`/api/get-group-id/${friendId}`);
      const groupId = response.data.group_id;

      console.log("Redirecting to group chat:", { friendId, groupId });

      navigate(`/chat/${groupId}`);
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

        <div className="chat-placeholder">
          Select a friend to start chatting
        </div>
      </div>
    </div>
  );
};

export default TestMainPage;
