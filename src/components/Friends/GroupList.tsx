import { useState, useEffect } from 'react';
import { axiosInstance } from "../../api/api.config";
import './GroupList.css';
import defaultGroupAvatar from '../assets/default-group-avatar.png';
import defaultAvatar from '../assets/default-avatar.png'
import AddGroupButton from '../../components/UI/AddGroupButton/AddGroupButton';
import Modal from './Modal';

type GroupMeta = {
  group_id: number;
  name: string;
  avatar?: string | null;
};

type FriendMeta = {
  user_id: number;
  username: string;
  status?: string;
  avatar?: string | null;
};

type GroupListProps = {
  onGroupSelect: (groupId: number) => void;
};

const GroupList = ({ onGroupSelect }: GroupListProps) => {
  const [groups, setGroups] = useState<GroupMeta[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [groupName, setGroupName] = useState('');
  const [friends, setFriends] = useState<FriendMeta[]>([]);
  const [selectedFriends, setSelectedFriends] = useState<{user_id: number; role: string}[]>([]);

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const response = await axiosInstance.get('/api/groups');
        setGroups(response.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to load groups list');
        setLoading(false);
      }
    };
    fetchGroups();
  }, []);

  useEffect(() => {
    const fetchFriends = async () => {
      try {
        const response = await axiosInstance.get('/api/friend-list');
        setFriends(response.data);
      } catch (err) {
        console.error('Failed to load friends list');
      }
    };
    if (isModalOpen) fetchFriends();
  }, [isModalOpen]);

  const handleCreateGroup = async () => {
    try {
      const request = {
        name: groupName,
        members: selectedFriends
      };

      const response = await axiosInstance.post('/api/groups', request);
      
      setGroups(prev => [...prev, response.data]);
      
      setIsModalOpen(false);
      setGroupName('');
      setSelectedFriends([]);

    } catch (err) {
      console.error('Failed to create group:', err);
      alert('Error creating group');
    }
  };

  const toggleFriendSelection = (friend: FriendMeta) => {
    setSelectedFriends(prev => {
      const exists = prev.some(f => f.user_id === friend.user_id);
      if (exists) {
        return prev.filter(f => f.user_id !== friend.user_id);
      }
      return [...prev, { user_id: friend.user_id, role: 'member' }];
    });
  };

  const changeFriendRole = (userId: number, newRole: string) => {
    setSelectedFriends(prev => 
      prev.map(f => 
        f.user_id === userId ? { ...f, role: newRole } : f
      )
    );
  };

  return (
    <>
    <div className="add-group-wrapper">
      <AddGroupButton onClick={() => setIsModalOpen(true)} />
    </div>
    <div className="group-list-container">

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <div className="create-group-modal">
          <h2>Create New Group</h2>
          
          <div className="form-group">
            <label>Group Name</label>
            <input
              type="text"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              placeholder="Enter group name"
            />
          </div>

          <h3>Select Friends</h3>

          <div className="friends-list">
            {friends.map(friend => (
              <div key={friend.user_id} className="friend-item">
                <label>
                  <input
                    type="checkbox"
                    checked={selectedFriends.some(f => f.user_id === friend.user_id)}
                    onChange={() => toggleFriendSelection(friend)}
                  />
                  <div 
                    className="group-friend-avatar" 
                    data-has-avatar={!!friend.avatar}
                    data-initial={friend.username[0].toUpperCase()}
                  >
                    <img 
                      src={friend.avatar || defaultAvatar} 
                      alt={friend.username}
                    />
                  </div>
                  {friend.username}
                </label>

                {selectedFriends.some(f => f.user_id === friend.user_id) && (
                  <select
                    value={selectedFriends.find(f => f.user_id === friend.user_id)?.role || 'member'}
                    onChange={(e) => changeFriendRole(friend.user_id, e.target.value)}
                  >
                    <option value="admin">Admin</option>
                    <option value="member">Member</option>
                  </select>
                )}
              </div>
            ))}
          </div>

          <div className="modal-actions">
            <button onClick={handleCreateGroup} disabled={!groupName || selectedFriends.length === 0}>
              Create Group
            </button>
            <button onClick={() => setIsModalOpen(false)}>Cancel</button>
          </div>
        </div>
      </Modal>

      <div className="groups-grid">
        {groups.map((group) => (
          <div 
            key={group.group_id} 
            className="group-card"
            onClick={() => onGroupSelect(group.group_id)}
          >
            <div 
              className="group-avatar" 
              data-has-avatar={!!group.avatar}
              data-initial={group.name[0].toUpperCase()}
            >
              <img 
                src={group.avatar || defaultGroupAvatar} 
                alt={group.name}
              />
            </div>
            <div className="group-details">
              <span className="group-name">{group.name}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
    </>
  );
};

export default GroupList;