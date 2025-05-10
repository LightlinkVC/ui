// components/ui/BackButton.tsx
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const BackButton = () => {
  const navigate = useNavigate();

  return (
    <button
      onClick={() => navigate('/')}
      className="flex items-center gap-2 p-2 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-200 transition"
    >
      <ArrowLeft size={20} />
    </button>
  );
};

export default BackButton;