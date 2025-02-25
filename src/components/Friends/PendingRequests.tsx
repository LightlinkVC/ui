import { useState, useEffect } from "react";
import { observer } from "mobx-react-lite";
import { axiosInstance } from "../../api/api.config";
import { authStore } from "../../store/AuthStore";

type Friendship = {
  user1_id: number;
  user2_id: number;
  status_name: string;
  action_user_id: number;
};

const PendingRequests = observer(() => {
  const [pendingRequests, setPendingRequests] = useState<Friendship[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchPendingRequests = async () => {
      try {
        const response = await axiosInstance.get("/api/pending-requests");
        setPendingRequests(response.data);
      } catch (err) {
        setError("Failed to load pending requests");
      } finally {
        setLoading(false);
      }
    };

    fetchPendingRequests();
  }, []);

  const handleAcceptRequest = async (senderId: number) => {
    try {
      await axiosInstance.post("/api/accept-friend-request", { receiver_id: senderId });

      setPendingRequests((prev) => prev.filter((req) => req.user1_id !== senderId && req.user2_id !== senderId));
    } catch (error) {
      console.error("Error accepting request:", error);
    }
  };

  const handleDeclineRequest = async (senderId: number) => {
    try {
      await axiosInstance.post("/api/decline-friend-request", { receiver_id: senderId });

      setPendingRequests((prev) => prev.filter((req) => req.user1_id !== senderId && req.user2_id !== senderId));
    } catch (error) {
      console.error("Error declining request:", error);
    }
  };

  const getRequesterInfo = (request: Friendship) => {
    if (!authStore.userId) return "Unknown user";

    const isReceiver = request.user2_id === authStore.userId;
    const senderId = isReceiver ? request.user1_id : request.user2_id;

    return `User #${senderId} → You (#${authStore.userId})`;
  };

  if (loading) return <div>Loading pending requests...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="pending-requests">
      <h2>Pending Friend Requests</h2>

      <div className="requests-list">
        {pendingRequests
          .filter((request) => request.status_name === "pending")
          .map((request, index) => {
            const isReceiver = request.user2_id === authStore.userId;
            const senderId = isReceiver ? request.user1_id : request.user2_id;

            return (
              <div key={index} className="request-item">
                <div className="request-info">
                  <span>{getRequesterInfo(request)}</span>
                  <span className="status-badge">Pending</span>
                </div>

                  <div className="request-actions">
                    <button onClick={() => handleAcceptRequest(senderId)} className="accept-btn">
                      Accept
                    </button>
                    <button onClick={() => handleDeclineRequest(senderId)} className="reject-btn">
                      Decline
                    </button>
                  </div>
              </div>
            );
          })}
      </div>
    </div>
  );
});

export default PendingRequests;
