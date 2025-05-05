import { useFriendRequestModalStore } from '../../../store/FriendRequestModalStore';
import './FriendRequestModal.css';

const FriendRequestModal = () => {
  const { isOpen, username, message, close } = useFriendRequestModalStore();

  if (!isOpen || !username) return null;

  return (
    <div className="fr-toast">
      <div className="fr-toast-content">
        <span><strong>{username}</strong> {message}</span>
        <button className="fr-toast-button" onClick={close}>OK</button>
      </div>
    </div>
  );
};

export default FriendRequestModal;
