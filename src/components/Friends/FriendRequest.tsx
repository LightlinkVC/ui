import React, { useState } from 'react';
import { axiosInstance } from "../../api/api.config";
import './FriendRequest.css';

const FriendRequest = () => {
  const [username, setUsername] = useState('');
  const [status, setStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await axiosInstance.post('/api/friend-request', {
        username: username
      });
      
      setStatus({ type: 'success', message: 'Friend request sent successfully!' });
      setUsername('');
      setTimeout(() => setStatus(null), 3000);
    } catch (error) {
      setStatus({ type: 'error', message: 'Failed to send friend request' });
      console.error('Error sending friend request:', error);
      setTimeout(() => setStatus(null), 3000);
    }
  };

  return (
    <>
      <div className="friend-request-wrapper">
        <h3 className="friend-request-title">Add Friend</h3>
        <form onSubmit={handleSubmit} className="friend-request-form">
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Enter username"
            className="friend-request-input"
            required
          />
          <button type="submit" className="friend-request-button">
            Send Request
          </button>
        </form>
      </div>
      {status && (
        <div className={`request-status ${status.type}`}>
          {status.message}
        </div>
      )}
    </>
  );
};

export default FriendRequest;