import { useState, useEffect } from 'react';
import { useParams, useNavigate } from "react-router-dom";
import ChatWindow from '../../components/Friends/ChatWindow';
import VideoRoom from '../../components/VideoRoom/VideoRoom';
import BackButton from '../../components/UI/BackButton';
import { axiosInstance } from "../../api/api.config";
import { useCallStore } from '../../store/CallStore';
import useIsMobile from '../../hooks/Mobile/useIsMobile';

const ChatWithVideo = ({ centrifugoUrl }: { centrifugoUrl: string }) => {
  const { groupId } = useParams();

  const [centToken, setCentToken] = useState<string | null>(null);
  const [channels, setChannels] = useState<{ room: string; group_messages: string; user: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const activeRoomId = useCallStore((state) => state.activeRoomId);

  const isMobile = useIsMobile();
  const navigate = useNavigate();

  const handleBack = () => navigate('/');

  if (!groupId) {
    return <div>Неверный или отсутствующий идентификатор группы</div>;
  }

  useEffect(() => {
    const fetchChannels = async () => {
      try {
        const response = await axiosInstance.get(`/api/group/${groupId}/info`);
        setCentToken(response.data.token);
        setChannels(response.data.channels);
      } catch (error) {
        console.error("Ошибка при получении каналов:", error);
      } finally {
        setLoading(false);
      }
    };
  
    fetchChannels();
  }, [groupId]);

  const handleCallClick = async () => {
    try {
      await axiosInstance.post(`/api/group/${groupId}/start-call`);
  
      useCallStore.getState().activateRoom(groupId.toString());
    } catch (error) {
      console.error("Ошибка при старте звонка:", error);
    }
  };

  if (loading) {
    return <div>Загрузка данных...</div>;
  }

  if (!centToken || !channels) {
    return <div>Не удалось получить данные для подключения.</div>;
  }

  return (
    <div className="chat-container">
      <div className="chat-header">
        {isMobile && (
          <BackButton />
        )}
        <span className="chat-username">Пользователь #{groupId}</span>
        <button onClick={handleCallClick} className="call-button">
          📞 Позвонить
        </button>
      </div>
      
      {activeRoomId === groupId.toString() && (
        <VideoRoom
          roomId={activeRoomId}
          centrifugoUrl={centrifugoUrl}
          centToken={centToken}
          channels={{ room: channels.room, user: channels.user }}
        />
      )}

      <div className="chat-body">
        <ChatWindow 
          groupId={Number(groupId)} 
          centrifugoUrl={centrifugoUrl}
          centToken={centToken}
          channels={channels}
        />
      </div>
    </div>
  );  
};

export default ChatWithVideo;
