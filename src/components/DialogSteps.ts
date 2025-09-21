// src/components/DialogSteps.ts - Dialog steps data untuk setiap scene
import { DialogStep } from './KitchenBackgroundWrapper';

// Dialog steps untuk Nasi Lapola Scene
export const nasiLapolaSteps: DialogStep[] = [
  {
    id: 1,
    text: "Selamat Datang di Game Traditional of Moluccas Food, sudah siap untuk Memasak Nasi Lapola hari ini!?! Oke Step 1 ambil Panci di Menu dan taruh di atas kompor. Sudah? Ambil air dan masukkan kedalam Panci. Setelah air masukkan kacang ke dalamnya.",
    character: "karakter1",
    requiredAction: "place_pot_water_beans"
  },
  {
    id: 2,
    text: "Step ke 2 ayo kita nyalakan Kompornya dengan Klik tuasnya. Tunggu beberapa saat sampai matang. Kacang yang sudah matang dan tempatkan ke Tempat Tiris.",
    character: "karakter2",
    requiredAction: "cook_beans"
  },
  {
    id: 3,
    text: "Lanjut, kita parut kelapa terlebih dahulu. Ambil Baskom dan taruh di sebelah kompor. Ambil Parutan Kelapa dan Kelapa diatas baskom. Sudah? Mari kita parut kelapa dengan menggerakkan kelapa ke atas dan bawah",
    character: "karakter3",
    requiredAction: "grate_coconut"
  },
  {
    id: 4,
    text: "Step ke 4 Taruh Panci baru dari Menu dan taruh ke atas Kompor. Kemudian Ambil Parutan Kelapa tadi dan masukkan ke panci, lanjut kita nyalakan Kompornya dengan Klik tuasnya. Tunggu beberapa saat sampai matang. Kukusan kelapa yang sudah matang dan tempatkan ke Tempat Tiris.",
    character: "karakter4",
    requiredAction: "steam_coconut"
  },
  {
    id: 5,
    text: "Baik setelah Merebus kacang dan Mengukus kelapa, mari kita masak berasnya. Ambil Panci berisi Air di menu dan Taruh ke Kompor. Ambil Beras dari menu dan masukkan ke dalam Panci air diatas Kompor. Lanjut!! Kita aduk terus beras sampai masak setengah matang.",
    character: "karakter5",
    requiredAction: "cook_rice"
  },
  {
    id: 6,
    text: "Beras yang setengah matang mari kita tambahkan dengan bahan lainnya. Ambil Garam terlebih dahulu di Menu dan Kukusan kelapa yang ada di Tempat Tiris. Sudah? Mari kita tambahkan Rebusan Kacang di Tempat Tiris dan Masukkan ke dalam Masakan Beras tadi. Aduk hingga merata, kemudian tunggu beberapa saat sampai matang.",
    character: "karakter6",
    requiredAction: "mix_ingredients"
  },
  {
    id: 7,
    text: "Oke lanjut ya? Kita sisihkan Masakan nasi yang kita masak ke Tempat Tiris di Kiri. Lanjut kita ambil Panci Kukus di Menu dan taruh keatas kompor. Kita ambil lagi Masakan Nasi yang kita sisihkan di Area Tiris dan masukkan ke dalam Panci Kukus. Kita tunggu beberapa saat sampai Nasi matang",
    character: "karakter1",
    requiredAction: "steam_rice"
  },
  {
    id: 8,
    text: "Yeayy!!! Kita telah menyelesaikan Masakan Nasi Lapola. Ambil Piring di Menu dan taruh ke Tempat Tiris. Ambil Kukusan Nasi Lapola yang sudah matang dan sajikan ke Piring di Tempat Tiris.",
    character: "karakter2",
    requiredAction: "serve_dish"
  }
];

// Dialog steps untuk Colo-Colo Scene
export const coloColoSteps: DialogStep[] = [
  {
    id: 1,
    text: "Mari kita mulai! Pertama, letakkan cabai di atas talenan.",
    character: "karakter1",
    requiredAction: "place_chili"
  },
  {
    id: 2,
    text: "Ambil pisau lalu gesekkan pada cabai untuk memotongnya.",
    character: "karakter1",
    requiredAction: "slice_chili"
  },
  {
    id: 3,
    text: "Bagus! Klik talenan berisi cabai, lalu klik mangkok untuk memindahkannya.",
    character: "karakter2",
    requiredAction: "transfer_chili"
  },
  {
    id: 4,
    text: "Sekarang, letakkan bawang putih di talenan yang kosong.",
    character: "karakter2",
    requiredAction: "place_garlic"
  },
  {
    id: 5,
    text: "Sama seperti cabai, potong bawang putih hingga halus.",
    character: "karakter2",
    requiredAction: "slice_garlic"
  },
  {
    id: 6,
    text: "Kerja bagus! Pindahkan bawang putih ke dalam mangkok.",
    character: "karakter3",
    requiredAction: "transfer_garlic"
  },
  {
    id: 7,
    text: "Saatnya menambahkan kecap. Seret dan letakkan kecap ke dalam mangkok.",
    character: "karakter3",
    requiredAction: "add_soy_sauce"
  },
  {
    id: 8,
    text: "Sekarang, tambahkan daun jeruk untuk memberi aroma segar.",
    character: "karakter4",
    requiredAction: "add_citrus_leaves"
  },
  {
    id: 9,
    text: "Kita perlu talenan lagi. Aku akan siapkan untukmu.",
    character: "karakter1",
    requiredAction: "prepare_cutting_board"
  },
  {
    id: 10,
    text: "Letakkan jeruk nipis di atas talenan yang bersih.",
    character: "karakter5",
    requiredAction: "place_lime"
  },
  {
    id: 11,
    text: "Potong jeruk nipis menjadi dua bagian dengan pisau.",
    character: "karakter5",
    requiredAction: "slice_lime"
  },
  {
    id: 12,
    text: "Pindahkan potongan jeruk nipis ke dalam mangkok.",
    character: "karakter5",
    requiredAction: "transfer_lime"
  },
  {
    id: 13,
    text: "Ambil munthu untuk mengulek semua bahan di dalam mangkok.",
    character: "karakter1",
    requiredAction: "grind_ingredients"
  },
  {
    id: 14,
    text: "Hampir selesai! Ambil piring dan sajikan sambalmu.",
    character: "karakter2",
    requiredAction: "serve_dish"
  },
  {
    id: 15,
    text: "Luar biasa! Sambal Colo-colo khas Maluku buatanmu sudah jadi!",
    character: "karakter2",
    requiredAction: "complete"
  }
];

// Dialog steps untuk Kohu-Kohu Scene
export const kohuKohuSteps: DialogStep[] = [
  {
    id: 1,
    text: "Halo! Mari kita buat Kohu-Kohu. Pertama, masukkan kelapa ke dalam baskom.",
    character: "karakter1",
    requiredAction: "add_coconut"
  },
  {
    id: 2,
    text: "Bagus! Sekarang, drag baskom berisi kelapa untuk memindahkannya ke teflon.",
    character: "karakter2",
    requiredAction: "transfer_coconut"
  },
  {
    id: 3,
    text: "Saatnya menyangrai kelapa. Gunakan spatula untuk mengaduk.",
    character: "karakter3",
    requiredAction: "stir_coconut"
  },
  {
    id: 4,
    text: "Sip! Sekarang, kita siapkan sayurannya. Masukkan kemangi ke dalam wajan.",
    character: "karakter3",
    requiredAction: "add_basil"
  },
  {
    id: 5,
    text: "Lanjutkan dengan memasukkan selada.",
    character: "karakter3",
    requiredAction: "add_lettuce"
  },
  {
    id: 6,
    text: "Sekarang masukkan sawi.",
    character: "karakter3",
    requiredAction: "add_mustard_greens"
  },
  {
    id: 7,
    text: "Terakhir, masukkan tauge.",
    character: "karakter3",
    requiredAction: "add_bean_sprouts"
  },
  {
    id: 8,
    text: "Supaya ada sensasi pedasnya, coba masukkan potongan cabe dan irisan bawang merah. Setelah itu, ambil suwiran daging ikan cakalang kita dan masukkan ke wajan. Ini yang bikin rasanya makin gurih.",
    character: "karakter4",
    requiredAction: "add_spices_fish"
  },
  {
    id: 9,
    text: "Terakhir, tuangkan sedikit minyak ikan untuk sentuhan akhir yang sempurna.",
    character: "karakter5",
    requiredAction: "add_fish_oil"
  },
  {
    id: 10,
    text: "Bagus! Sekarang ambil piring dari panel bahan dan letakkan di area plating di sebelah kiri.",
    character: "karakter5",
    requiredAction: "place_plate"
  },
  {
    id: 11,
    text: "Letakkan kelapa sangrai dari teflon ke atas piring.",
    character: "karakter6",
    requiredAction: "plate_coconut"
  },
  {
    id: 12,
    text: "Hampir selesai! Ambil sayuran dari wajan menggunakan spatula dan taruh di atas piring.",
    character: "karakter6",
    requiredAction: "plate_vegetables"
  },
  {
    id: 13,
    text: "Wah, kamu luar biasa! Kohu Kohu kita sudah siap disajikan!",
    character: "karakter6",
    requiredAction: "complete"
  }
];

// Dialog steps untuk Ikan Kuah Kuning Scene
export const ikanKuahKuningSteps: DialogStep[] = [
  {
    id: 1,
    text: "Selamat Datang di Game Traditional of Moluccas Food, sudah siap untuk Memasak Ikan Kuah Kuning hari ini!?! Okee!! Pertama ambil Cobek dari Menu dan taruh ke sebelah kanan Kompor. Lanjut kita masukkan Bawang Merah, Cabai Keriting, Kunyit dan, Bawang Putih.",
    character: "karakter1",
    requiredAction: "prepare_mortar_spices"
  },
  {
    id: 2,
    text: "Bumbu sudah masuk mari kita haluskan bumbunya!! Ambil Ulekan di Menu dan taruh ke dalam Cobek. Sudah? Ayo kita haluskan bumbunya dengan menggerakkan Ulekan ke kanan dan kiri sampai jadi.",
    character: "karakter2",
    requiredAction: "grind_spices"
  },
  {
    id: 3,
    text: "Step ke 3 ayo kita ambil wajan di Menu dan taruh ke atas Kompor. Sudah? Masukkan Bumbu Halus ke Wajan dan Aduk sampai harum.",
    character: "karakter3",
    requiredAction: "saute_spices"
  },
  {
    id: 4,
    text: "Oke sudah Diaduk?!? Ayo Kita masukkan Daun Salam, Sereh, dan Lengkuas ke dalam Wajan. Ayo Kita aduk lagi Bumbunya.",
    character: "karakter4",
    requiredAction: "add_herbs"
  },
  {
    id: 5,
    text: "Lanjut lagi. Ayo kita masukkan Irisan jahe, Daun Jeruk, Ikan Cakalang, dan Air kedalam bumbu yang kita masak tadi. Kemudian aduk lagi sampai semua nya bercampur rata dan Air mendidih.",
    character: "karakter5",
    requiredAction: "add_fish_water"
  },
  {
    id: 6,
    text: "Setelah mendidih masukkan Tomat, Garam, Gula, Daun Bawang, dan Asam Jawa, Kemudian aduk dan tunggu Ikan Kuah Kuning sampai Matang.",
    character: "karakter6",
    requiredAction: "add_final_seasoning"
  },
  {
    id: 7,
    text: "Yeayy!!! Kita telah menyelesaikan Masakan Ikan Kuah Kuning. Ambil Mangkuk di Menu dan taruh di Meja. Ambil Masakan Ikan Kuah Kuning yang sudah matang dari Wajan dan sajikan ke Mangkuk yang ada di Meja.",
    character: "karakter1",
    requiredAction: "serve_dish"
  }
];

// Dialog steps untuk Papeda Scene
export const papedaSteps: DialogStep[] = [
  {
    id: 1,
    text: "Selamat Datang di Game Traditional of Moluccas Food, sudah siap untuk Memasak Papeda hari ini!?! Oke Step 1 ambil Mangkuk di Menu dan taruh di Meja. Sudah? Ambil Tepung Sagu di Menu dan Tarik ke Area Staging di kanan.",
    character: "karakter1",
    requiredAction: "place_bowl_stage_flour"
  },
  {
    id: 2,
    text: "Step ke 2 ayo kita potong bungkus tepungnya. Klik terus pada Area Potong di kiri atas sampai tepung terbuka. Sudah? Selanjutnya ambil Tepung Sagu dan taruh pada Mangkuk di Meja.",
    character: "karakter2",
    requiredAction: "cut_flour_package"
  },
  {
    id: 3,
    text: "Tepung sudah masuk? kita siap untuk Step ke 3 yaitu tuangkan 200 ml air ke mangkuk berisi Tepung.",
    character: "karakter3",
    requiredAction: "add_water_200ml"
  },
  {
    id: 4,
    text: "Air sudah masuk? ambil sendok di menu dan taruh diatas mangkuk, mari kita aduk adonan papedanya. Aduk dengan slide kanan dan kiri menggunakan kursor anda hingga adonan tercampur rata",
    character: "karakter4",
    requiredAction: "stir_mixture"
  },
  {
    id: 5,
    text: "Siap ke Langkah Selanjutnya!?! Oke kali ini kita akan menyaring adonan yang sudah diaduk. Ambil Mangkuk lagi di Menu dan taruh di sebelah mangkuk adonan sebelumnya. Sudah? ambil Saringan kemudian taruh ke atas mangkuk kosong, selanjutnya tarik adonan sebelumnya diatas saringan.",
    character: "karakter5",
    requiredAction: "strain_mixture"
  },
  {
    id: 6,
    text: "Sudah menyaring kita tunggu selama beberapa saat sampai adonan sagu mengering dan menyisakan air di pinggir. Sudah? Selanjutnya kita akan buang air sisa tadi, yaitu taruh adonan ke Area Persiapan di sebelah kiri halaman dan tunggu beberapa detik sampai air menghilang.",
    character: "karakter6",
    requiredAction: "drain_water"
  },
  {
    id: 7,
    text: "Oke lanjut ya? Kita ambil 100 ml air dan masukkan ke adonan. Setelah air di Tuang kita aduk lagi adonan dengan sendok hingga adonan tercampur rata",
    character: "karakter1",
    requiredAction: "add_water_100ml_stir"
  },
  {
    id: 8,
    text: "Sebagai tambahan rasa mari kita ambil Jeruk Nipis di Menu dan peras diatas Adonan Tepung. Klik beberapa kali pada jeruk hingga semua perasannya masuk ke adonan.",
    character: "karakter2",
    requiredAction: "add_lime_juice"
  },
  {
    id: 9,
    text: "Perasan Jeruk sudah masuk, lanjut kita aduk lagi hingga rata.",
    character: "karakter3",
    requiredAction: "stir_with_lime"
  },
  {
    id: 10,
    text: "Siapkan Air Panas sebanyak 1.4 liter di Menu dan Tuangkan ke dalam adonan.",
    character: "karakter4",
    requiredAction: "add_hot_water_1400ml"
  },
  {
    id: 11,
    text: "Aduk Lagi adonan hingga rata dan adonan berubah jadi mengental, ini sedikit memakan waktu sampai adonan jadi.",
    character: "karakter5",
    requiredAction: "final_stir"
  },
  {
    id: 12,
    text: "Yeayy!!! Adonan Papeda telah jadi, Kita ambil Makanan Ikan Kuah Kuning yang ada di menu dan taruh di Area Persiapan di kiri Area Memasak. Selanjutnya kita ambil adonan papeda tadi dan Campurkan ke Ikan Kuah Kuning yang ditaruh di Area Persiapan",
    character: "karakter6",
    requiredAction: "serve_with_fish_soup"
  }
];

// Function untuk mendapatkan dialog steps berdasarkan scene
export const getDialogStepsForScene = (sceneName: string): DialogStep[] => {
  switch (sceneName.toLowerCase()) {
    case 'nasilapola':
    case 'nasi-lapola':
      return nasiLapolaSteps;
    case 'colocolo':
    case 'colo-colo':
      return coloColoSteps;
    case 'kohukohu':
    case 'kohu-kohu':
      return kohuKohuSteps;
    case 'ikankuahkuning':
    case 'ikan-kuah-kuning':
      return ikanKuahKuningSteps;
    case 'papeda':
      return papedaSteps;
    default:
      return [];
  }
};

// Function untuk mendapatkan step berdasarkan required action
export const getStepByAction = (steps: DialogStep[], action: string): DialogStep | undefined => {
  return steps.find(step => step.requiredAction === action);
};

// Function untuk mendapatkan step selanjutnya
export const getNextStep = (steps: DialogStep[], currentStepId: number): DialogStep | undefined => {
  const currentIndex = steps.findIndex(step => step.id === currentStepId);
  if (currentIndex >= 0 && currentIndex < steps.length - 1) {
    return steps[currentIndex + 1];
  }
  return undefined;
};

// Function untuk memeriksa apakah semua step sudah selesai
export const isAllStepsComplete = (currentStepId: number, totalSteps: number): boolean => {
  return currentStepId >= totalSteps;
};