// FriendList.tsx
import { useState, useEffect } from 'react';
import { axiosInstance } from "../../api/api.config";
import { authStore } from "../../store/AuthStore";

type Friendship = {
  user1_id: number;
  user2_id: number;
  status_name: string;
  action_user_id: number;
};

type FriendListProps = {
  onFriendSelect: (friendId: number) => void;
};

const FriendList = ({ onFriendSelect }: FriendListProps) => {
  const [friends, setFriends] = useState<Friendship[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Загрузка списка друзей
  useEffect(() => {
    const fetchFriends = async () => {
      try {
        const response = await axiosInstance.get('/api/friend-list');
        setFriends(response.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to load friends list');
        setLoading(false);
      }
    };
    
    fetchFriends();
  }, []);

  const getFriendStatus = (status: string) => {
    switch(status) {
      case 'pending': return '⏳ Ожидает подтверждения';
      case 'accepted': return '✅ Друзья';
      case 'rejected': return '❌ Отклонено';
      default: return status;
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="friend-list">
      {/* ... */}
      <div className="friends-container">
        {friends.map((friendship, index) => {
          const currentUserId = authStore.userId;
          if (!currentUserId) return null;

          const friendId = friendship.user1_id === currentUserId 
            ? friendship.user2_id 
            : friendship.user1_id;

          return (
            <div 
              key={index} 
              className="friend-item"
              onClick={() => onFriendSelect(friendId)}
              style={{ cursor: 'pointer' }}
            >
              <div className="friend-info">
                <span>Friend ID: {friendId}</span>
              </div>
              <div className="friend-status">
                {getFriendStatus(friendship.status_name)}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default FriendList;