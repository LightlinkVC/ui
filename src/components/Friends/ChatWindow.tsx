import { useState, useEffect, useRef } from 'react';
import { axiosInstance } from "../../api/api.config";
import MessageInput from './MessageInput';
import { Centrifuge, Subscription } from 'centrifuge';

type Message = {
  id: string;
  user_id: number;
  group_id: number;
  content: string;
};

type ChatWindowProps = {
  groupId: number;
  centrifuge: Centrifuge | null;
};

/*
  TODO

  1. Обрабатывать ровно одну подписку.
  2. Убрать ненужное колбэк для добавления сообщений.
*/

const ChatWindow = ({ groupId, centrifuge }: ChatWindowProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const subscriptionRef = useRef<Subscription | null>(null);
  const isMountedRef = useRef(true);

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
  useEffect(() => {
    isMountedRef.current = true;
    
    const setupSubscription = async () => {
      if (!centrifuge || !isMountedRef.current) return;

      try {
        if (subscriptionRef.current) {
          console.log(`Unsubscribing from ${subscriptionRef.current.channel}`);
          subscriptionRef.current.unsubscribe();
          subscriptionRef.current = null;
        }

        const channel = `group:${groupId}`;
        console.log(`Subscribing to ${channel}`);
        
        const subscription = centrifuge.newSubscription(channel);
        
        subscription
          .on('publication', (ctx) => {
            setMessages(prev => [...prev, ctx.data]);
          })
          .on('subscribed', () => {
            console.log(`Subscribed to ${channel}`);
          })
          .on('error', (err) => {
            console.error(`Subscription error in ${channel}:`, err);
          });

        subscription.subscribe();
        subscriptionRef.current = subscription;
        
      } catch (err) {
        console.error('Subscription error:', err);
      }
    };

    setupSubscription();

    return () => {
      isMountedRef.current = false;
      const cleanup = async () => {
        if (subscriptionRef.current) {
          console.log(`Cleaning up subscription for ${subscriptionRef.current.channel}`);
          subscriptionRef.current.unsubscribe();
          subscriptionRef.current = null;
        }
      };
      cleanup();
    };
  }, [groupId, centrifuge]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleNewMessage = (newMessage: Message) => {
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
