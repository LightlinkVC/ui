import { useState } from 'react';
import { useNavigate, Outlet, useParams, useLocation } from 'react-router-dom';
import FriendList from '../../components/Friends/FriendList';
import PendingRequests from '../../components/Friends/PendingRequests';
import GroupList from '../../components/Friends/GroupList';
import { axiosInstance } from "../../api/api.config";
import useIsMobile from '../../hooks/Mobile/useIsMobile';
import BackButton from '../../components/UI/BackButton/HomeButton';
import AddFriendButton from '../../components/UI/AddFriendButton/AddFriendButton';
import { Users, Bell, Home } from 'lucide-react';
import { useCallStore } from '../../store/CallStore';
import './TestMainPage.css';

const TestMainPage = () => {
  const navigate = useNavigate();
  const { groupId } = useParams();
  const location = useLocation();
  const isMobile = useIsMobile();
  
  const [view, setView] = useState<'friends' | 'requests' | 'groups'>('friends');

  const isAddFriendsPage = location.pathname.includes('/add-friend');

  const handleFriendSelect = async (friendId: number) => {
    try {
      const response = await axiosInstance.get(`/api/get-group-id/${friendId}`);
      const groupId = response.data.group_id;
      useCallStore.getState().activateGroup(groupId.toString())
      navigate(`/chat/${groupId}`);
    } catch (error) {
      console.error("Error fetching group ID:", error);
    }
  };

  const handleGroupSelect = (groupId: number) => {
    useCallStore.getState().activateGroup(groupId.toString())
    navigate(`/chat/${groupId}`);
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
          {view === 'friends' && (
            <>
              <AddFriendButton />
              <FriendList onFriendSelect={handleFriendSelect} />
            </>
          )}
          {view === 'requests' && <PendingRequests />}
          {view === 'groups' && (
            <GroupList onGroupSelect={handleGroupSelect} />
          )}

          <div className="sidebar-tabs">
            <button
              className={`tab-button ${view === 'friends' ? 'active' : ''}`}
              onClick={() => setView('friends')}
              title="Друзья"
            >
              <Users size={24} />
            </button>
            <button
              className={`tab-button ${view === 'requests' ? 'active' : ''}`}
              onClick={() => setView('requests')}
              title="Заявки"
            >
              <Bell size={24} />
            </button>
            <button
              className={`tab-button ${view === 'groups' ? 'active' : ''}`}
              onClick={() => setView('groups')}
              title="Группы"
            >
              <Home size={24} />
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