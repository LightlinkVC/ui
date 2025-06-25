import { useIncomingMessageModalStore } from '../../../store/MessageModalStore';
import './IncomingMessageModal.css';

const IncomingMessageModal = () => {
  const { isOpen, username, message, close } = useIncomingMessageModalStore();

  if (!isOpen || !username || !message) return null;

  return (
    <div className="discord-toast">
      <div className="discord-toast-header">
        <svg className="discord-message-icon" width="20" height="20" viewBox="0 0 24 24" fill="none">
          <path d="M19 3H5C3.89543 3 3 3.89543 3 5V19C3 20.1046 3.89543 21 5 21H19C20.1046 21 21 20.1046 21 19V5C21 3.89543 20.1046 3 19 3Z" stroke="currentColor" strokeWidth="2"/>
          <path d="M7 8H17" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          <path d="M7 12H14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          <path d="M7 16H11" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        </svg>
        <div>
          Сообщение от <strong className="discord-username">{username}</strong>
        </div>
      </div>
      <div className="discord-toast-message">{message}</div>
      <button className="discord-ok-button" onClick={close}>OK</button>
    </div>
  );
};

export default IncomingMessageModal;