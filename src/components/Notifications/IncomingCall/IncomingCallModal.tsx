// components/IncomingCallModal.tsx
import { useCallModalStore } from '../../../store/CallModalStore';
import './IncomingCallModal.css';

const IncomingCallModal = () => {
  const { isOpen, username, onAccept, onDecline, closeModal } = useCallModalStore();

  if (!isOpen || !username) return null;

  const handleAccept = () => {
    closeModal();
    onAccept?.();
  };

  const handleDecline = () => {
    closeModal();
    onDecline?.();
  };

  return (
    <div className="discord-modal-overlay">
      <div className="discord-modal">
        <div className="discord-modal-header">
          <div className="discord-avatar">
            <div className="discord-avatar-initial">{username.charAt(0)}</div>
          </div>
          <div className="discord-call-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M14.5 3C15.5503 3 16.539 3.42761 17.2322 4.16605C17.9255 4.90449 18.25 5.87681 18.25 6.88889V15.1111C18.25 16.1232 17.9255 17.0955 17.2322 17.8339C16.539 18.5724 15.5503 19 14.5 19H9.5C8.44975 19 7.46104 18.5724 6.76777 17.8339C6.07451 17.0955 5.75 16.1232 5.75 15.1111V6.88889C5.75 5.87681 6.07451 4.90449 6.76777 4.16605C7.46104 3.42761 8.44975 3 9.5 3H14.5Z" stroke="currentColor" strokeWidth="1.5"/>
              <path d="M12 15C13.1046 15 14 14.1046 14 13C14 11.8954 13.1046 11 12 11C10.8954 11 10 11.8954 10 13C10 14.1046 10.8954 15 12 15Z" fill="currentColor"/>
              <path d="M15.5 8.5L15.5 10.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              <path d="M8.5 8.5L8.5 10.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </div>
        </div>
        
        <div className="discord-modal-content">
          <h2 className="discord-modal-title">Входящий звонок</h2>
          <p className="discord-modal-text">
            <span className="discord-username">{username}</span> звонит вам
          </p>
        </div>
        
        <div className="discord-button-group">
          <button className="discord-button discord-button-decline" onClick={handleDecline}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M6 18L18 6M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </button>
          <button className="discord-button discord-button-accept" onClick={handleAccept}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M5 4H9L11 9L8 10C9.5 12.5 12 14.5 15 13.5L17 16C14.5 17.5 10.5 17 8 14L5 15V4Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
              <path d="M15 7H19" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              <path d="M15 11H19" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              <path d="M17 9V13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default IncomingCallModal;