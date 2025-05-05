import { useIncomingMessageModalStore } from '../../../store/MessageModalStore';
import './IncomingMessageModal.css';

const IncomingMessageModal = () => {
  const { isOpen, username, message, close } = useIncomingMessageModalStore();

  if (!isOpen || !username || !message) return null;

  return (
    <div className="im-toast">
      <div className="im-header">
        Сообщение от <strong>{username}</strong>
      </div>
      <div className="im-message">{message}</div>
      <button className="im-ok-button" onClick={close}>OK</button>
    </div>
  );
};

export default IncomingMessageModal;