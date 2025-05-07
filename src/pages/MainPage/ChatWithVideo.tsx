import { useState, useEffect } from 'react';
import { useParams } from "react-router-dom";
import ChatWindow from '../../components/Friends/ChatWindow';
import VideoRoom from '../../components/VideoRoom/VideoRoom';
import { axiosInstance } from "../../api/api.config";
import { useCallStore } from '../../store/CallStore';

const ChatWithVideo = ({ centrifugoUrl }: { centrifugoUrl: string }) => {
  const { groupId } = useParams();

  const [centToken, setCentToken] = useState<string | null>(null);
  const [channels, setChannels] = useState<{ room: string; group_messages: string; user: string } | null>(null);
  const [loading, setLoading] = useState(true);

  const activeRoomId = useCallStore((state) => state.activeRoomId);

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
    <div className="flex flex-col gap-4">
      <ChatWindow 
        groupId={Number(groupId)} 
        centrifugoUrl={centrifugoUrl}
        centToken={centToken}
        channels={{ room: channels.room, user: channels.user, group_messages: channels.group_messages }}
      />
      <button onClick={handleCallClick} className="call-button">📞 Позвонить</button>
      {activeRoomId === groupId.toString() && (
        <VideoRoom
          roomId={activeRoomId}
          centrifugoUrl={centrifugoUrl}
          centToken={centToken}
          channels={{ room: channels.room, user: channels.user }}
        />
      )}
    </div>
  );
};

export default ChatWithVideo;
