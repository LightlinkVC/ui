import { useState, useEffect } from 'react';
import { useParams } from "react-router-dom";
import ChatWindow from '../../components/Friends/ChatWindow';
import VideoRoom from '../../components/VideoRoom/VideoRoom';
import BackButton from '../../components/UI/BackButton/HomeButton';
import { axiosInstance } from "../../api/api.config";
import { useCallStore } from '../../store/CallStore';
import useIsMobile from '../../hooks/Mobile/useIsMobile';
import './ChatWithVideo.css'

const ChatWithVideo = ({ centrifugoUrl }: { centrifugoUrl: string }) => {
  const { groupId } = useParams();

  const [centToken, setCentToken] = useState<string | null>(null);
  const [channels, setChannels] = useState<{ room: string; group_messages: string; user: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const activeRoomId = useCallStore((state) => state.activeRoomId);

  const isMobile = useIsMobile();

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
      <div className='chat-inner'>
        <div className="chat-header">
          {isMobile && (
            <BackButton />
          )}
          <span className="chat-username">Группа #{groupId}</span>
          <button onClick={handleCallClick} className="call-button">
            <svg className="call-icon" width="20" height="20" viewBox="0 0 24 24">
              <path fill="currentColor" d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/>
            </svg>
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
    </div>
  );  
};

export default ChatWithVideo;
