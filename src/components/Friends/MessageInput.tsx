import React, { useState } from 'react';
import { axiosInstance } from "../../api/api.config";
import { authStore } from '../../store/AuthStore';

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
      const userId = authStore.userId;

      const newMessage = {
        user_id: userId, // Подставьте реальный user_id
        group_id: groupId,
        content: message,
        id: 'temp-id', // Уникальный временный ID
      };

      // Отправляем сообщение на сервер
      const response = await axiosInstance.post('/api/messages', {
        group_id: groupId,
        content: message,
      });

      // Если сервер возвращает данные о сообщении, обновляем состояние с реальным id
      const messageWithId = {
        ...newMessage,
        id: response.data.id || newMessage.id,
      };

      // Обновляем сообщения с новым сообщением
      onNewMessage(messageWithId);

      // Очищаем поле ввода
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
