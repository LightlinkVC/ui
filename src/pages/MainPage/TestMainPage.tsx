import { useState } from 'react';
import { useNavigate, Link, Outlet, useParams, useLocation } from 'react-router-dom';
import FriendList from '../../components/Friends/FriendList';
import PendingRequests from '../../components/Friends/PendingRequests';
import { axiosInstance } from "../../api/api.config";
import useIsMobile from '../../hooks/Mobile/useIsMobile';
import BackButton from '../../components/UI/BackButton/HomeButton';
import AddFriendButton from '../../components/UI/AddFriendButton/AddFriendButton';
import './TestMainPage.css';

const TestMainPage = () => {
  const navigate = useNavigate();
  const { groupId } = useParams();
  const location = useLocation();
  const isMobile = useIsMobile();
  
  const [view, setView] = useState<'friends' | 'requests'>('friends');

  // Проверяем, находимся ли мы на странице добавления друзей
  const isAddFriendsPage = location.pathname.includes('/add-friend');

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
          (isMobile && (groupId || isAddFriendsPage)) ? 'hidden' : ''
        }`}
      >
        <div className="sidebar-content">
          {view === 'friends' ? (
            <>
              <AddFriendButton />
              <FriendList onFriendSelect={handleFriendSelect} />
            </>
          ) : (
            <PendingRequests />
          )}

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
        </div>
      </aside>

      {/* Основной контент */}
      <main
        className={`main-content ${
          isMobile && !groupId && !isAddFriendsPage ? 'hidden' : ''
        }`}
      >
        {isMobile && isAddFriendsPage && (
          <div className="mobile-home-button-wrapper">
            <BackButton />
          </div>
        )}
        
        <Outlet />
      </main>
    </div>
  );
};

export default TestMainPage;