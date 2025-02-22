// MainPage.tsx
import FriendList from '../../components/Friends/FriendList';

const MainPage = () => {
  return (
    <div className="main-page">
      <h1>Header</h1>
      <div className="content">
        <FriendList />
      </div>
    </div>
  );
};

export default MainPage;