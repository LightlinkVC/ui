// PendingRequests.tsx
import { useState, useEffect } from 'react';
import { axiosInstance } from "../../api/api.config";

type Friendship = {
  user1_id: number;
  user2_id: number;
  status_name: string;
  action_user_id: number;
};

type RespondRequestPayload = {
  receiver_id: number;
};

const PendingRequests = () => {
  const [pendingRequests, setPendingRequests] = useState<Friendship[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchPendingRequests = async () => {
      try {
        const response = await axiosInstance.get('/api/pending-requests');
        setPendingRequests(response.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to load pending requests');
        setLoading(false);
      }
    };
    
    fetchPendingRequests();
  }, []);

  const handleAcceptRequest = async (senderId: number) => {
    try {
      const payload: RespondRequestPayload = { receiver_id: senderId };
      await axiosInstance.post('/api/accept-friend-request', payload);
      
      setPendingRequests(prev => 
        prev.filter(request => request.user1_id !== senderId)
      );
    } catch (error) {
      console.error('Error accepting request:', error);
    }
  };

  const handleDeclineRequest = async (senderId: number) => {
    try {
      const payload: RespondRequestPayload = { receiver_id: senderId };
      await axiosInstance.post('/api/decline-friend-request', payload);
      
      setPendingRequests(prev => 
        prev.filter(request => request.user1_id !== senderId)
      );
    } catch (error) {
      console.error('Error declining request:', error);
    }
  };

  const getRequesterInfo = (request: Friendship) => {
    return `User #${request.user1_id} → You (${request.user2_id})`;
  };

  if (loading) return <div>Loading pending requests...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="pending-requests">
      <h2>Pending Friend Requests</h2>
      
      <div className="requests-list">
        {pendingRequests
          .filter(request => 
            request.status_name === 'pending'
          )
          .map((request, index) => (
            <div key={index} className="request-item">
              <div className="request-info">
                <span>{getRequesterInfo(request)}</span>
                <span className="status-badge">Pending</span>
              </div>
              
              <div className="request-actions">
                <button 
                  onClick={() => handleAcceptRequest(request.user1_id)}
                  className="accept-btn"
                >
                  Accept
                </button>
                <button 
                  onClick={() => handleDeclineRequest(request.user1_id)}
                  className="reject-btn"
                >
                  Decline
                </button>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
};

export default PendingRequests;