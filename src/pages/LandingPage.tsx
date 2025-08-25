import { useRouter } from "next/router";
import MenuBackgroundWrapper from "../components/MenuBackgroundWrapper";
import GameButton from "../components/GameButton";

const LandingPage = () => {
  const router = useRouter();

  return (
    <MenuBackgroundWrapper>
      <div className="flex flex-col items-center justify-center h-full gap-40">
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

        {/* Start Button */}
        <GameButton
          normal="/assets/ui/buttons/start/start_normal.png"
          hover="/assets/ui/buttons/start/start_hover.png"
          active="/assets/ui/buttons/start/start_active.png"
          alt="Start Button"
          onClick={() => router.push("/menu")}
          width={350}
          height={152}
        />
      </div>
    </MenuBackgroundWrapper>
  );
};

export default LandingPage;
