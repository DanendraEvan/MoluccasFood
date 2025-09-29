// src/components/InstructionDisplay.tsx - Cooking Instructions Display Component
import React, { useState } from 'react';

// Cooking instructions from info.txt
const COOKING_INSTRUCTIONS: Record<string, string[]> = {
  nasilapola: [
    "Selamat datang di TFM, Su siap par masa nasi lapola hari ini?! Sakarang ambe 1 panci la taruh diatas kompor. Sudah? Ambe air la kasi maso kadalam panci, abis itu kasi maso kacang kadalam panci.",
    "Kas nyala kompor. Tunggu sadiki sampe kacang masa. Kalo kacang su masa taru di tampa tiris.",
    "Tarus, katong paru kalapa dolo. Ambe loyang la taro di sabalah kompor. Ambe parudang kalapa deng kalapa la taro diatas loyang. Mari katong paru kalapa deng kasi gerak kalapa nae turun.",
    "Taro panci baru di atas kompor. Tarus ambe parutan kalapa la ramas akang jadi santan. Abis itu kas maso dalam panci la kasi nyala kompor. Tunggu sadiki sampe masa. Santan yang su masa taru di tampa tiris.",
    "Kalo su rabus kacang deng masa santan. Sakarang katong masa bras. Ambe panci yang isi aer la taruh atas kompor. Ambe bras la kasi maso dalam panci aer tadi. Tarus katong masa sampe stengah masa.",
    "Bras yang stengah masa katong tambah deng bahan yang laeng. Ambe garam dan kukusan kalapa la campor deng bras. Sudah? Sakarang ambe kacang yang su rebus la kasi maso dalam bras tadi. campor sampe rata, tunggu sadiki sampe matang/masa.",
    "Abis itu, katong simpan nasi yang su masa di tampa tiris. tarus katong ambe panci kukus la taro diatas kompor. Katong ambe nasi yang tadi disimpan dan masukan kadalam panci kukus. Katong tunggu sadiki sampe nasi masa.",
    "Kasarr! Katong su abis masa nasi lapola. Ambe piring la taro di tampa tiris. Ambe kukusan nasi lapola yang su masa, tarus sajikan ke piring di tampa tiris."
  ],
  ikankuahkuning: [
    "Selamat datang di game TFM, su siap masa ikang kuah kuning? Pertama ambel cobe, taro di sebelah kanan kompor. Lanjot katong kase maso bawang merah, cili basar, kuning, deng bawang putih.",
    "Bumbu su maso, mari katong gilinng kas halus. Ambel ana cobe, taro dalam cobe. Sudah? Ayo katong giling bumbu sampai halus.",
    "Ambel tacu dari menu, taro di atas kompor. Sudah? Kase masuk bumbu halus, aduk sampai harum.",
    "Kase masuk daun salam, sareh, deng langkuas dalam tacu. Katong aduk akang.",
    "Tarus kase masuk halia iris, daong lemong, ikang cakalang, deng aer. Aduk ulang sampe tacampur rata dan aer mandidih.",
    "Abis mandidih, kase masa tomat, garam, gula, daong bawang, deng asam jawa. Aduk tarus, tunggu sampai matang.",
    "Yeayy! Katong su jadi masak ikan kuah kuning! Ambel mangko dari menu, taro di meja. Ambel masakan dari tacu, sajikan di mangko. Hidangan ini biasanya disajikan dengan nasi putih atau papeda, dan memberikan sensasi hangat serta menyegarkan dengan aroma rempah yang khas."
  ],
  papeda: [
    "Selamat datang di game Traditional of Moluccas Food. Su siap masa papeda hari ini? Ambe mangko dari menu, taro di meja. Sudah? Ambe tepung sagu dari menu, taro di tampa saji sabalah kanan.",
    "Katong potong kuli tapong. Tekan tarus di bagian tenga sampe tapong tabuka. Sudah? Abis itu ambe tepung sagu la taro di mangko.",
    "Su kas maso tepung? Sakarang katong tuang aer 200 mL kadalam mangko.",
    "Aer su maso? Ambe sendok la taruh diatas mangko, par campor adonan sampe tacampor rata.",
    "Lanjut ka langkat berikut! Katong akan saring adonan yang su tacampor. Ambe mangko baru la taro disabalah mangko adonan tadi. Sudah? Ambe tapis tapis tarus taro diatas mangko kosong. Abis itu ambe adonan sebelumnya taro diatas tapi tapis.",
    "Su saring katong tunggu sadiki dolo, sampe adonan karing deng kasi sisa aer di pinggir. Sudah? Katong taro adonan di tampa saji sabalah kiri par buang aer sisa. Tunggu sadiki sampe aer abis.",
    "Tarus ka langkah berikut, katong ambe aer 100 mL la kas maso dalam adonan. Abis itu katong campor adonan deng sendo sampe tacampor rata.",
    "Par tamba rasa katong ambe jeruk nipis la ramas diatas adonan tepung. Tekan jeruk ulang ulang sampe aer jaruk maso dalam adonan.",
    "Tarus katong campor lagi supaya tacampor rata.",
    "Kasi siap aer panas 1.4 L la tuang dalam adonan.",
    "Campor lagi sampe adonan kantal, ini katong tunggu sadiki lama sampe adonan jadi.",
    "Adonan papeda su jadi! Katong ambe ikan kuah kuning la taro di tampa saji. Abis itu katong ambe papeda la campor deng ikan kuah kuning di tampa saji tadi. Oleh karena itu, Papeda hampir selalu disajikan bersama makanan berkuah seperti Ikan Kuah Kuning."
  ],
  kohukohu: [
    "Pertama, kase maso kalapa dalam loyang.",
    "Bagus, sakarang pindah kalapa dari loyang pi teflon.",
    "Abis tu, katong sangrai kalapa. Pake bila-bila par aduk. Geser kiri-kanan par aduk.",
    "Mantap! Sakarang katong siapakn sayor, kase maso daun kumange dalam tacu.",
    "Tarus, kase maso kacang panjang.",
    "Sakarang kase maso kangkung.",
    "Tarus kase maso kacang tumbu.",
    "Supaya ada rasa padis, kase maso potongan cili deng irisan bawang merah. Abis tu, ambe suwiran daging ikan cakalang, kase maso dalam tacu. Ini yang bikin akang sadap.",
    "Laste, sirang sadiki minya ikang par bikin mantap.",
    "Bagus! Ambe piring, taro tampa saji sabalah kiri.",
    "Kas pindah kalapa sangrai dari teflon, taro di atas piring.",
    "Amper jadi! Ambe sayor dari tacu pake bila-bila, taro di atas piring.",
    "Mantap e! Kohu-kohu su jadi, katong siap makan!",
    "Selamat kohu kohu su jadi. Ose su kasi selesai samua langkah deng bae dan memberikan rasa segar yang menyegarkan dengan sensasi pedas dari cabai rawit."
  ],
  colocolo: [
    "Ambil cili lalu taru di papang pengiris",
    "Potong jadi kotak-kotak",
    "Ambil bawang merah deng bawang putih taru di papang pengiris",
    "Potong jadi kotak kotak",
    "Ambil mangko taru di meja",
    "Taru potongan bawang dan cili di mangko",
    "Tambahkan kecap di mangko",
    "Tambahkan aer lemon cina",
    "Tambahakn daun kemanggi",
    "Colo colo su siap par making, Sambal ini sangat digemari karena kesegaran dan rasa pedasnya yang khas, serta kemudahan dalam pembuatannya yang tidak memerlukan proses memasak."
  ]
};

// Game scene display names
const SCENE_DISPLAY_NAMES: Record<string, string> = {
  nasilapola: 'Nasi Lapola',
  ikankuahkuning: 'Ikan Kuah Kuning',
  papeda: 'Papeda',
  kohukohu: 'Kohu-Kohu',
  colocolo: 'Colo-Colo'
};

interface InstructionDisplayProps {
  sceneName: string;
  onStartGame: () => void;
  isVisible: boolean;
  onClose: () => void;
}

const InstructionDisplay: React.FC<InstructionDisplayProps> = ({ 
  sceneName, 
  onStartGame, 
  isVisible, 
  onClose 
}) => {
  const instructions = COOKING_INSTRUCTIONS[sceneName] || [];
  
  if (instructions.length === 0 || !isVisible) return null;

  const handleStartGame = () => {
    onClose();
    onStartGame();
  };

  return (
    <>
      {/* Overlay */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: 'rgba(0, 0, 0, 0.7)',
          zIndex: 1999,
          display: isVisible ? 'block' : 'none'
        }}
      />

      {/* Main Panel */}
      <div
        style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '90vw',
          maxWidth: '600px',
          height: '70vh',
          maxHeight: '500px',
          background: 'linear-gradient(135deg, #8B4513, #A0522D, #CD853F, #DEB887)',
          borderRadius: '20px',
          zIndex: 2000,
          display: isVisible ? 'flex' : 'none',
          flexDirection: 'column',
          overflow: 'hidden',
          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.5)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            background: 'rgba(139, 69, 19, 0.9)',
            padding: '15px 20px',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center'
          }}
        >
          <h2
            style={{
              fontSize: '24px',
              fontFamily: 'Chewy, cursive',
              color: '#FFD700',
              margin: 0,
              fontWeight: 'bold'
            }}
          >
            Cara Membuat {SCENE_DISPLAY_NAMES[sceneName] || sceneName}
          </h2>
        </div>

        {/* Content Area with Scroll */}
        <div
          style={{
            flex: 1,
            background: 'rgba(255, 253, 208, 0.95)',
            margin: '10px',
            borderRadius: '15px',
            padding: '20px',
            overflowY: 'auto',
            overflowX: 'hidden',
            // Custom scrollbar styles
            scrollbarWidth: 'thin',
            scrollbarColor: '#8B4513 rgba(139, 69, 19, 0.2)'
          }}
          className="instruction-scroll"
        >
          {instructions.map((instruction, index) => (
            <div
              key={index}
              style={{
                marginBottom: '20px',
                padding: '15px',
                background: index % 2 === 0 ? 'rgba(139, 69, 19, 0.1)' : 'rgba(255, 215, 0, 0.1)',
                borderRadius: '10px',
                borderLeft: '4px solid #8B4513',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateX(5px)';
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(139, 69, 19, 0.2)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateX(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <div
                style={{
                  fontSize: '16px',
                  fontFamily: 'Chewy, cursive',
                  color: '#8B4513',
                  fontWeight: 'bold',
                  marginBottom: '8px'
                }}
              >
                Step {index + 1}
              </div>
              <div
                style={{
                  fontSize: '14px',
                  fontFamily: 'Chewy, cursive',
                  color: '#2C1810',
                  lineHeight: '1.5'
                }}
              >
                {instruction}
              </div>
            </div>
          ))}
          
          {/* Completion Message */}
          <div
            style={{
              marginTop: '20px',
              padding: '20px',
              background: 'linear-gradient(135deg, #FFD700, #FFA500)',
              borderRadius: '15px',
              textAlign: 'center',
              boxShadow: '0 4px 12px rgba(255, 215, 0, 0.3)'
            }}
          >
            <div
              style={{
                fontSize: '18px',
                fontFamily: 'Chewy, cursive',
                color: '#8B4513',
                fontWeight: 'bold'
              }}
            >
              🎉 Selamat! Anda telah menyelesaikan semua langkah! 🎉
            </div>
          </div>
        </div>

        {/* Footer with Start Game Button */}
        <div
          style={{
            padding: '15px 20px',
            background: 'rgba(139, 69, 19, 0.9)',
            display: 'flex',
            justifyContent: 'center'
          }}
        >
          <button
            onClick={handleStartGame}
            style={{
              background: 'linear-gradient(135deg, #FFD700, #FFA500)',
              border: 'none',
              borderRadius: '25px',
              padding: '12px 30px',
              fontSize: '16px',
              fontFamily: 'Chewy, cursive',
              fontWeight: 'bold',
              color: '#8B4513',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.05)';
              e.currentTarget.style.boxShadow = '0 5px 15px rgba(255, 215, 0, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.2)';
            }}
          >
            Mulai Game
          </button>
        </div>
      </div>

      {/* Custom CSS for scrollbar */}
      <style jsx>{`
        .instruction-scroll::-webkit-scrollbar {
          width: 8px;
        }
        
        .instruction-scroll::-webkit-scrollbar-track {
          background: rgba(139, 69, 19, 0.2);
          border-radius: 4px;
        }
        
        .instruction-scroll::-webkit-scrollbar-thumb {
          background: #8B4513;
          border-radius: 4px;
        }
        
        .instruction-scroll::-webkit-scrollbar-thumb:hover {
          background: #A0522D;
        }

        /* Mobile touch scrolling */
        .instruction-scroll {
          -webkit-overflow-scrolling: touch;
        }
      `}</style>
    </>
  );
};

export default InstructionDisplay;
