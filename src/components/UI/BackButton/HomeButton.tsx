import { useNavigate } from 'react-router-dom';
import { Menu } from 'lucide-react';
import './HomeButton.css';

const BackButton = () => {
  const navigate = useNavigate();

  return (
    <button
      onClick={() => navigate("/")}
      className="home-button"
    >
      <Menu className="home-button-icon" />
    </button>
  );
};

export default BackButton;
