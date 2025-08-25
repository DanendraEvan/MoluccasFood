import { useRouter } from "next/router";
import MenuBackgroundWrapper from "../../components/MenuBackgroundWrapper";
import GameButton from "../../components/GameButton";

const InfoPage2 = () => {
  const router = useRouter();

  return (
    <MenuBackgroundWrapper>
      <div className="absolute top-4 left-4">
        <GameButton
          normal="/assets/ui/buttons/home/home_normal.png"
          hover="/assets/ui/buttons/home/home_hover.png"
          active="/assets/ui/buttons/home/home_active.png"
          alt="Home Button"
          onClick={() => router.push("/menu")}
          width={120}
          height={120}
        />
      </div>

      <div className="flex flex-col items-center justify-center h-full text-white">
        <div className="flex items-center gap-16">
            <GameButton
                normal="/assets/ui/buttons/back/back_normal.png"
                hover="/assets/ui/buttons/back/back_hover.png"
                active="/assets/ui/buttons/back/back_active.png"
                alt="Previous Button"
                onClick={() => router.push("/info/1")}
                width={120}
                height={120}
            />
            <GameButton
                normal="/assets/ui/buttons/next/next_normal.png"
                hover="/assets/ui/buttons/next/next_hover.png"
                active="/assets/ui/buttons/next/next_active.png"
                alt="Next Button"
                onClick={() => router.push("/info/3")}
                width={120}
                height={120}
            />
        </div>
      </div>
    </MenuBackgroundWrapper>
  );
};

export default InfoPage2;
