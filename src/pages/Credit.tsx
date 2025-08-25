import { useRouter } from "next/router";
import MenuBackgroundWrapper from "../components/MenuBackgroundWrapper";
import GameButton from "../components/GameButton";

const CreditPage = () => {
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
      {/* Konten lain bisa ditambahkan di sini dan akan terpusat */}
    </MenuBackgroundWrapper>
  );
};

export default CreditPage;