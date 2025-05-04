import { useState, useEffect } from 'react';
import ChatWindow from '../../components/Friends/ChatWindow';
import VideoRoom from '../../components/VideoRoom/VideoRoom';
import { axiosInstance } from "../../api/api.config";

const ChatWithVideo = ({ groupId, centrifugoUrl }: { groupId: number, centrifugoUrl: string }) => {
  const [centToken, setCentToken] = useState<string | null>(null);
  const [channels, setChannels] = useState<{ room: string; group_messages: string; user: string } | null>(null);
  const [videoActive, setVideoActive] = useState(false);
  const [loading, setLoading] = useState(true);

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
  
      setVideoActive(true);
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
        groupId={groupId} 
        centrifugoUrl={centrifugoUrl}
        centToken={centToken}
        channels={{ room: channels.room, user: channels.user, group_messages: channels.group_messages }}
      />
      <button onClick={handleCallClick} className="call-button">📞 Позвонить</button>
      {videoActive && (
        <VideoRoom
          roomId={groupId.toString()} 
          centrifugoUrl={centrifugoUrl}
          centToken={centToken}
          channels={{ room: channels.room, user: channels.user }}
        />
      )}
    </div>
  );
};

export default ChatWithVideo;
