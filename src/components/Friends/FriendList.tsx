import { useState, useEffect } from 'react';
import { axiosInstance } from "../../api/api.config";
import { authStore } from "../../store/AuthStore";
import './FriendList.css';
import defaultAvatar from '../assets/default-avatar.png'

type FriendMeta = {
  user_id: number;
  username: string;
  status?: string;
  avatar?: string | null;
};

type FriendListProps = {
  onFriendSelect: (friendId: number) => void;
};

const FriendList = ({ onFriendSelect }: FriendListProps) => {
  const [friends, setFriends] = useState<FriendMeta[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchFriends = async () => {
      try {
        const response = await axiosInstance.get('/api/friend-list');
        setFriends(response.data.map((friend: FriendMeta) => ({
          ...friend,
          avatar: friend.avatar || null
        })));
        setLoading(false);
      } catch (err) {
        setError('Failed to load friends list');
        setLoading(false);
      }
    };
    
    fetchFriends();
  }, []);

  const getStatusBadge = (status: string) => {
    const statusConfig: { [key: string]: { text: string; color: string } } = {
      pending: { text: 'Pending', color: 'bg-yellow-500' },
      accepted: { text: 'Friends', color: 'bg-green-500' },
      rejected: { text: 'Declined', color: 'bg-red-500' },
    };
    
    const { text, color } = statusConfig[status] || { text: status, color: 'bg-gray-500' };
    
    return (
      <span className={`status-badge ${color} text-white px-2 py-1 rounded-full text-xs`}>
        {text}
      </span>
    );
  };

  if (loading) return (
    <div className="loading-container">
      <div className="loading-spinner"></div>
    </div>
  );

  if (error) return (
    <div className="error-message">
      ⚠️ {error}
    </div>
  );

  return (
    <div className="friend-list-container">
      <div className="friends-grid">
        {friends.map((friend) => {
          const currentUserId = authStore.userId;
          if (!currentUserId) return null;

          return (
            <div 
              key={friend.user_id} 
              className="friend-card"
              onClick={() => onFriendSelect(friend.user_id)}
            >
              <div 
                className="friend-avatar" 
                data-has-avatar={!!friend.avatar}
                data-initial={friend.username[0].toUpperCase()}
              >
                <img 
                  src={friend.avatar || defaultAvatar} 
                  alt={friend.username}
                />
              </div>
              <div className="friend-details">
                <span className="friend-username">{friend.username}</span>
                {friend.status && getStatusBadge(friend.status)}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default FriendList;