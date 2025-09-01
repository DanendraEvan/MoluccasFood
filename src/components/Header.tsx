import { useRouter } from 'next/router';
import GameButton from './GameButton';

const Header = () => {
  const router = useRouter();

  return (
    <div className="absolute top-4 left-4">
      <GameButton
        normal="/assets/ui/buttons/home/home_normal.png"
        hover="/assets/ui/buttons/home/home_hover.png"
        active="/assets/ui/buttons/home/home_active.png"
        onClick={() => router.push('/')}
        alt="Home"
      />
    </div>
  );
};

export default Header;
