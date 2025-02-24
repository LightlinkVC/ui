import React, { useState } from 'react';
import { axiosInstance } from "../../api/api.config";

const FriendRequest = () => {
  const [username, setUsername] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const response = await axiosInstance.post('/api/friend-request', {
        username: username
      });
      
      console.log('Request successful:', response.data);
      setUsername('');
    } catch (error) {
      console.error('Error sending friend request:', error);
    }
  };

  return (
    <div className="friend-list">
      <h2>Send Friend Request</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Enter username"
          required
        />
        <button type="submit">Send Request</button>
      </form>
    </div>
  );
};

export default FriendRequest;