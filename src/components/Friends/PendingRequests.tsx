import { useState, useEffect } from "react";
import { observer } from "mobx-react-lite";
import { axiosInstance } from "../../api/api.config";

type FriendshipRequest = {
  user_id: number;
  username: string;
};

const PendingRequests = observer(() => {
  const [pendingRequests, setPendingRequests] = useState<FriendshipRequest[]>([]);
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

  const handleAcceptRequest = async (userId: number) => {
    try {
      await axiosInstance.post("/api/accept-friend-request", { receiver_id: userId });
      setPendingRequests((prev) => prev.filter((req) => req.user_id !== userId));
    } catch (error) {
      console.error("Error accepting request:", error);
    }
  };

  const handleDeclineRequest = async (userId: number) => {
    try {
      await axiosInstance.post("/api/decline-friend-request", { receiver_id: userId });
      setPendingRequests((prev) => prev.filter((req) => req.user_id !== userId));
    } catch (error) {
      console.error("Error declining request:", error);
    }
  };

  if (loading) return <div>Loading pending requests...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="pending-requests">
      <h3>Pending Friend Requests</h3>

      <div className="requests-list">
        {pendingRequests.map((request) => (
          <div key={request.user_id} className="request-item">
            <div className="request-info">
              <span>{request.username}</span>
              <span className="status-badge">Pending</span>
            </div>

            <div className="request-actions">
              <button onClick={() => handleAcceptRequest(request.user_id)} className="accept-btn">
                Accept
              </button>
              <button onClick={() => handleDeclineRequest(request.user_id)} className="reject-btn">
                Decline
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
});

export default PendingRequests;
