import { useRouter } from "next/router";
import GameButton from "./GameButton";
import MenuBackgroundWrapper from "./MenuBackgroundWrapper";

interface InfoPageWrapperProps {
  children: React.ReactNode;
  nextPage?: string;
  prevPage?: string;
}

const InfoPageWrapper: React.FC<InfoPageWrapperProps> = ({ children, nextPage, prevPage }) => {
  const router = useRouter();

  return (
    <MenuBackgroundWrapper>
      <div className="relative w-full h-full flex flex-col">
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
        <main className="flex-grow flex items-center justify-center">
          {children}
        </main>
        <footer className="w-full p-4">
          <div className="flex justify-center items-center gap-16">
            {prevPage ? (
              <GameButton
                normal="/assets/ui/buttons/back/back_normal.png"
                hover="/assets/ui/buttons/back/back_hover.png"
                active="/assets/ui/buttons/back/back_active.png"
                alt="Previous Button"
                onClick={() => router.push(prevPage)}
                width={120}
                height={120}
              />
            ) : (
              <div style={{ width: 120, height: 120 }} /> // Placeholder for spacing
            )}
            {nextPage ? (
              <GameButton
                normal="/assets/ui/buttons/next/next_normal.png"
                hover="/assets/ui/buttons/next/next_hover.png"
                active="/assets/ui/buttons/next/next_active.png"
                alt="Next Button"
                onClick={() => router.push(nextPage)}
                width={120}
                height={120}
              />
            ) : (
              <div style={{ width: 120, height: 120 }} /> // Placeholder for spacing
            )}
          </div>
        </footer>
      </div>
    </MenuBackgroundWrapper>
  );
};

export default InfoPageWrapper;
