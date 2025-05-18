import { Link} from 'react-router-dom';
import './AddFriendButton.css'

const AddFriendButton = () => {
  return (
    <div className="add-friend-wrapper">
      <Link 
        to="/add-friend" 
        className="add-friend-button"
      >
        <svg 
          className="add-friend-icon" 
          viewBox="0 0 24 24"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
          />
        </svg>
        Add Friend
      </Link>
    </div>
  );
};

export default AddFriendButton;