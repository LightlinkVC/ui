import { useState, useEffect, useRef } from 'react';
import { Centrifuge } from 'centrifuge';
import { axiosInstance } from "../../api/api.config";
import MessageInput from './MessageInput';
import { observer } from "mobx-react-lite";
import { authStore } from '../../store/AuthStore';
import FormatTimestamp from './utils/DateFormatter'
import './ChatWindow.css'

type Message = {
  id: number;
  user_id: number;
  group_id: number;
  status: string;
  content: string;
  created_at: string;
};

type ChatWindowProps = {
  groupId: number;
  centrifugoUrl: string;
  centToken: string;
  channels: { room: string; user: string; group_messages: string };
};

const ChatWindow = observer(({ groupId, centrifugoUrl, centToken, channels }: ChatWindowProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const centrifugeRef = useRef<Centrifuge | null>(null);
  const [revealedMessages, setRevealedMessages] = useState<number[]>([]);

  useEffect(() => {
    const loadMessages = async () => {
      try {
        const response = await axiosInstance.get(`/api/messages/${groupId}`);
        console.log(response)
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
    const startProcess = async () => {
      if (!centToken || !channels || !authStore.userId) return;

      // initTraceWsConnection()
  
      initCentrifugeSubscriptions();
      console.log("Subscribed to centrifugo");
    };
  
    startProcess();
  }, [centToken]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleNewMessage = (newMessage: Message) => {
    setMessages(prev => [...prev, newMessage]);
  };

  const initCentrifugeSubscriptions = () => {
    if (!centToken || !channels) return;

    const centrifuge = new Centrifuge(centrifugoUrl, { token: centToken });
    centrifugeRef.current = centrifuge;

    const groupSub = centrifuge.newSubscription(channels.group_messages);

    groupSub.on("publication", (ctx) => handleGroupMessage(ctx.data));

    groupSub.subscribe();
    centrifuge.connect();

    return () => {
      groupSub.unsubscribe();
      centrifuge.disconnect();
    };
  };

  const handleGroupMessage = (msg: any) => {
    console.log("Обработка сообщения:", msg);
    switch (msg.type) {
      case "newMessage":
        if (authStore.userId && msg.payload.user_id != authStore.userId)
          handleNewMessage(msg.payload);
        break;
      case "hateUpdate":
        handleUpdateMessageStatus(msg.payload.id, 'hate');
        break;
      default:
        console.log("Неизвестное сообщение", msg);
    }
  };

  const initTraceWsConnection = () => {
    if (!authStore.userId) return;

    const traceWs = new WebSocket(`ws://localhost/ws/api/room/${groupId}/trace?userID=${authStore.userId}`);

    traceWs.onopen = () => {
      console.log("WebSocket для мониторинга статуса подключен");
    };

    traceWs.onerror = (error) => {
      console.error("WebSocket ошибка:", error);
    };

    return () => {
      console.log("Trying to kill connection")
      if (traceWs.readyState === WebSocket.OPEN) {
        traceWs.send(JSON.stringify({ status: 'inactive' }));
      }
    };
  }

  const handleUpdateMessageStatus = (messageId: number, newStatus: string) => {
    setMessages(prevMessages =>
      prevMessages.map(message => 
        message.id === messageId ? { ...message, status: newStatus } : message
      )
    );
  };

  const handleMessageClick = (messageId: number) => {
    if (!revealedMessages.includes(messageId)) {
      setRevealedMessages(prev => [...prev, messageId]);
    }
  };

  if (loading) return <div>Loading messages...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="chat-window">
      <div className="messages-container">
        {messages.map((message) => {
          const isHate = message.status === 'hate';
          const isRevealed = revealedMessages.includes(message.id);
          const isOwn = message.user_id === authStore.userId;

          return (
            <div 
              key={message.id} 
              className={`message ${isOwn ? 'own' : ''}`}
              onClick={isHate ? () => handleMessageClick(message.id) : undefined}
              style={{ cursor: isHate ? 'pointer' : 'default' }}
            >
              <div className="message-header">
                <div className="message-user">User #{message.user_id}</div>
                <div className="message-time">
                  {FormatTimestamp(new Date(message.created_at))}
                </div>
              </div>
              <div className={`message-content ${isHate && !isRevealed ? 'blurred' : ''}`}>
                {message.content}
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>
      <div className="input-container">
        <MessageInput groupId={groupId} lastId={messages.length > 0 ? messages[messages.length - 1].id : -1} onNewMessage={handleNewMessage} />
      </div>
    </div>
  );  
});

export default ChatWindow;
