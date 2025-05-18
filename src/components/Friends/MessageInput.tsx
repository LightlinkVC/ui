import React, { useState } from 'react';
import { axiosInstance } from "../../api/api.config";
import { authStore } from '../../store/AuthStore';
import './MessageInput.css';

type MessageInputProps = {
  groupId: number;
  lastId: number,
  onNewMessage: (message: any) => void;
};

const MessageInput = ({ groupId, lastId, onNewMessage }: MessageInputProps) => {
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    try {
      const userId = authStore.userId;

      const tempDate = new Date();

      const newMessage = {
        user_id: userId,
        group_id: groupId,
        content: message,
        created_at: tempDate.toISOString(),
        id: lastId + 1,
        status: 'pending',
      };

      const response = await axiosInstance.post('/api/messages', {
        group_id: groupId,
        content: message,
      });

      const messageWithId = {
        ...newMessage,
        id: response.data.id || newMessage.id,
      };

      onNewMessage(messageWithId);

      setMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  return (
    <form className="message-input" onSubmit={handleSubmit}>
      <input
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Введите сообщение..."
        className="input-field"
      />
      <button type="submit" className="send-button">
        <svg 
          className="send-icon" 
          width="20" 
          height="20" 
          viewBox="0 0 24 24"
          fill="none"
        >
          <path 
            d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" 
            fill="currentColor"
          />
        </svg>
      </button>
    </form>
  );
};

export default MessageInput;
