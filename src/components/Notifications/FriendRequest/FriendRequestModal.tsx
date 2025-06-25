import { useFriendRequestModalStore } from '../../../store/FriendRequestModalStore';
import './FriendRequestModal.css';

const FriendRequestModal = () => {
  const { isOpen, username, message, close } = useFriendRequestModalStore();

  if (!isOpen || !username) return null;

  return (
    <div className="discord-fr-toast">
      <div className="discord-fr-toast-content">
        <div className="discord-fr-user-info">
          <div className="discord-fr-avatar">
            <div className="discord-fr-avatar-initial">{username.charAt(0)}</div>
          </div>
          <div className="discord-fr-text">
            <span className="discord-fr-username">{username}</span> 
            <span className="discord-fr-message">{message || "хочет добавить вас в друзья"}</span>
          </div>
        </div>
        <button className="discord-fr-toast-button" onClick={close}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </button>
      </div>
    </div>
  );
};

export default FriendRequestModal;