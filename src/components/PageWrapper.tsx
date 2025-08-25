import { useRouter } from "next/router";
import GameButton from "./GameButton";
import MenuBackgroundWrapper from "./MenuBackgroundWrapper";

interface PageWrapperProps {
  children: React.ReactNode;
}

const PageWrapper: React.FC<PageWrapperProps> = ({ children }) => {
  const router = useRouter();

  return (
    <MenuBackgroundWrapper>
      <div className="w-full h-full relative">
        <div className="absolute top-4 left-4 z-10">
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
          {children}
        </div>
      </div>
    </MenuBackgroundWrapper>
  );
};

export default PageWrapper;