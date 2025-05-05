// components/IncomingCallModal.tsx
import { useCallModalStore } from '../../../store/CallModalStore';
import './IncomingCallModal.css'; // подключаем CSS

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
    <div className="modal-overlay">
      <div className="modal">
        <h2>Входящий звонок</h2>
        <p>Пользователь <strong>{username}</strong> звонит вам.</p>
        <div className="button-group">
          <button className="accept-button" onClick={handleAccept}>Принять</button>
          <button className="decline-button" onClick={handleDecline}>Отклонить</button>
        </div>
      </div>
    </div>
  );
};

export default IncomingCallModal;
