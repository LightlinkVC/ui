import type { FC } from 'react';
import { useParams } from "react-router-dom";

import VideoRoom from "../../components/VideoRoom/VideoRoom";

const VideoPage: FC = () => {
    const { room_id } = useParams();
    if (!room_id) return <div>Комната не найдена</div>;

    return (
        <VideoRoom
        centrifugoUrl='ws://localhost:8000/connection/websocket'
        roomId={room_id}
        />
    );
};

export default VideoPage;