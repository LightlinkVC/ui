import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import FriendList from '../../components/Friends/FriendList';
import PendingRequests from '../../components/Friends/PendingRequests';
import { axiosInstance } from "../../api/api.config";
import { Outlet, useParams } from 'react-router-dom';
import useIsMobile from '../../hooks/Mobile/useIsMobile';

import './TestMainPage.css';

const TestMainPage = () => {
  const navigate = useNavigate()
  const { groupId } = useParams();

  const [view, setView] = useState<'friends' | 'requests'>('friends');
  const isMobile = useIsMobile();

  const handleFriendSelect = async (friendId: number) => {
    try {
      const response = await axiosInstance.get(`/api/get-group-id/${friendId}`);
      const groupId = response.data.group_id;
      navigate(`/chat/${groupId}`);
    } catch (error) {
      console.error("Error fetching group ID:", error);
    }
  };

  return (
    <div className="main-container">
      {/* Sidebar View */}
      <aside
        className={`sidebar ${
          isMobile && groupId ? 'hidden' : ''
        }`}
      >
        <div className="sidebar-content">
          {view === 'friends' ? (
            <FriendList onFriendSelect={handleFriendSelect} />
          ) : (
            <PendingRequests />
          )}
        </div>
        <div className="sidebar-tabs">
          <button
            className={`tab-button ${view === 'friends' ? 'active' : ''}`}
            onClick={() => setView('friends')}
            title="Друзья"
          >
            👥
          </button>
          <button
            className={`tab-button ${view === 'requests' ? 'active' : ''}`}
            onClick={() => setView('requests')}
            title="Заявки"
          >
            📨
          </button>
        </div>
      </aside>

      {/* Chat View */}
      <main
        className={`main-content ${
          isMobile && !groupId ? 'hidden' : ''
        }`}
      >
        {!groupId && (
          <div className="chat-placeholder">
            Выберите пользователя для начала чата
          </div>
        )}

        <Outlet />
      </main>
    </div>
  );
};

export default TestMainPage;
