// MessageInput.tsx
import React, { useState } from 'react';
import { axiosInstance } from "../../api/api.config";

type MessageInputProps = {
  groupId: number;
  onNewMessage: (message: any) => void;
};

const MessageInput = ({ groupId, onNewMessage }: MessageInputProps) => {
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    try {
      const response = await axiosInstance.post('/api/messages', {
        group_id: groupId,
        content: message
      });
      
      onNewMessage(response.data);
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
        placeholder="Type a message..."
      />
      <button type="submit">Send</button>
    </form>
  );
};

export default MessageInput;