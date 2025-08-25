import { useRouter } from "next/router";
import GameButton from "../components/GameButton";
import MenuBackgroundWrapper from "../components/MenuBackgroundWrapper";

const MenuPage: React.FC = () => {
  const router = useRouter();

  return (
    <MenuBackgroundWrapper>
      <div className="flex flex-col items-center justify-center h-full gap-48">
        {/* Judul */}
        <div className="text-center">
          <h1
            className="text-[4.25rem] font-chewy font-bold drop-shadow-lg leading-tight mb-2"
            style={{ color: 'black' }}
          >
            TFM
          </h1>
          <h2
            className="text-[2.5rem] font-chewy font-bold drop-shadow-lg leading-tight"
            style={{ color: 'black' }}
          >
            TRADISIONAL FOOD OF MOLLUCAS
          </h2>
        </div>

        {/* Tombol Menu - diatur horizontal */}
        <div className="flex items-center gap-2">
          <GameButton
            normal="/assets/ui/buttons/credit/credit_normal.png"
            hover="/assets/ui/buttons/credit/credit_hover.png"
            active="/assets/ui/buttons/credit/credit_active.png"
            onClick={() => router.push("/Credit")}
            alt="Credit Button"
            width={200}
            height={200}
          />
          <GameButton
            normal="/assets/ui/buttons/play/play_normal.png"
            hover="/assets/ui/buttons/play/play_hover.png"
            active="/assets/ui/buttons/play/play_active.png"
            onClick={() => router.push("/game")}
            alt="Play Button"
            width={200}
            height={200}
          />
          <GameButton
            normal="/assets/ui/buttons/info/info_normal.png"
            hover="/assets/ui/buttons/info/info_hover.png"
            active="/assets/ui/buttons/info/info_active.png"
            onClick={() => router.push("/info/1")}
            alt="Info Button"
            width={200}
            height={200}
          />
        </div>
      </div>
    </MenuBackgroundWrapper>
  );
};

export default MenuPage;
