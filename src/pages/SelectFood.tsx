import { useRouter } from "next/router";
import GameButton from "../components/GameButton";
import MenuBackgroundWrapper from "../components/MenuBackgroundWrapper";

const SelectFoodPage: React.FC = () => {
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
            Pilih Makanan
          </h1>
        </div>

        {/* Tombol Menu - diatur dalam grid */}
        <div className="flex flex-wrap justify-center items-center gap-8 max-w-4xl">
          <GameButton
            normal="/assets/ui/buttons/play/play_normal.png"
            hover="/assets/ui/buttons/play/play_hover.png"
            active="/assets/ui/buttons/play/play_active.png"
            onClick={() => router.push("/Game?food=papeda")}
            alt="Papeda Button"
            width={200}
            height={200}
          />
          <GameButton
            normal="/assets/ui/buttons/play/play_normal.png"
            hover="/assets/ui/buttons/play/play_hover.png"
            active="/assets/ui/buttons/play/play_active.png"
            onClick={() => router.push("/Game?food=kohukohu")}
            alt="Kohu Kohu Button"
            width={200}
            height={200}
          />
          <GameButton
            normal="/assets/ui/buttons/play/play_normal.png"
            hover="/assets/ui/buttons/play/play_hover.png"
            active="/assets/ui/buttons/play/play_active.png"
            onClick={() => router.push("/Game?food=nasi_lapola")}
            alt="Nasi Lapola Button"
            width={200}
            height={200}
          />
          <GameButton
            normal="/assets/ui/buttons/play/play_normal.png"
            hover="/assets/ui/buttons/play/play_hover.png"
            active="/assets/ui/buttons/play/play_active.png"
            onClick={() => router.push("/Game?food=colo_colo")}
            alt="Colo Colo Button"
            width={200}
            height={200}
          />
          <GameButton
            normal="/assets/ui/buttons/play/play_normal.png"
            hover="/assets/ui/buttons/play/play_hover.png"
            active="/assets/ui/buttons/play/play_active.png"
            onClick={() => router.push("/Game?food=ikan_kuahkuning")}
            alt="Ikan Kuah Kuning Button"
            width={200}
            height={200}
          />
        </div>
      </div>
    </MenuBackgroundWrapper>
  );
};

export default SelectFoodPage;
