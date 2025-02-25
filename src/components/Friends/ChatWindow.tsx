import { useState, useEffect, useRef } from 'react';
import { axiosInstance } from "../../api/api.config";
import MessageInput from './MessageInput';

type Message = {
  id: string;
  user_id: number;
  group_id: number;
  content: string;
};

const ChatWindow = ({ groupId }: { groupId: number }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Загрузка сообщений
  useEffect(() => {
    const loadMessages = async () => {
      try {
        const response = await axiosInstance.get(`/api/messages/${groupId}`);
        setMessages(response.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to load messages');
        setLoading(false);
      }
    };

    loadMessages();
  }, [groupId]);

  // Автопрокрутка к последнему сообщению
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Обработчик нового сообщения
  const handleNewMessage = (newMessage: Message) => {
    // Добавляем новое сообщение в начало списка
    setMessages(prev => [...prev, newMessage]);
  };

  if (loading) return <div>Loading messages...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="chat-window">
      <div className="messages-container">
        {messages.map(message => (
          <div key={message.id} className="message">
            <div className="message-header">
              <span className="user-id">User #{message.user_id}</span>
            </div>
            <div className="message-content">{message.content}</div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <MessageInput groupId={groupId} onNewMessage={handleNewMessage} />
    </div>
  );
};

export default ChatWindow;
