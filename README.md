# Moluccas Food Game

Selamat datang di **Moluccas Food Game**! Ini adalah sebuah game edukasi berbasis web yang mengajak pemain untuk belajar dan mencoba memasak berbagai makanan khas dari Maluku. Game ini dibangun dengan tujuan untuk memperkenalkan kekayaan kuliner Maluku melalui pengalaman yang interaktif dan menyenangkan.

## 🎮 Tentang Game

Game ini mensimulasikan proses memasak beberapa hidangan ikonik dari Maluku. Pemain akan mengikuti langkah-langkah sesuai resep, mulai dari menyiapkan bahan hingga menyajikannya. Setiap masakan disajikan sebagai sebuah level atau mini-game yang unik.

## ✨ Fitur

- **Gameplay Memasak Interaktif**: Ikuti resep dengan mekanisme *drag-and-drop* dan klik yang intuitif.
- **Beragam Resep Khas Maluku**:
  - Papeda
  - Ikan Kuah Kuning
  - Nasi Lapola
  - Kohu-Kohu
  - Colo-Colo
- **Edukasi Budaya**: Belajar mengenai bahan-bahan dan cara memasak kuliner tradisional Maluku.
- **Aset Visual Menarik**: Game ini dilengkapi dengan aset visual dan karakter yang digambar khusus untuk menciptakan pengalaman yang imersif.
- **Musik Latar**: Dilengkapi dengan musik latar yang menenangkan untuk menemani sesi bermain game.

## 🛠️ Teknologi yang Digunakan

- **Framework**: [Next.js](https://nextjs.org/)
- **Library UI**: [React](https://reactjs.org/)
- **Bahasa**: [TypeScript](https://www.typescriptlang.org/)
- **Game Engine**: [Phaser.js](https://phaser.io/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)

## 📂 Struktur Proyek

```
MoluccasFood/
├── public/
│   ├── assets/         # Semua aset game (gambar, suara, font)
│   └── ...
├── src/
│   ├── components/     # Komponen React (UI, wrapper, dll.)
│   ├── contexts/       # React Context (e.g., MusicContext)
│   ├── game/
│   │   ├── scenes/     # Logika untuk setiap scene/level game (Phaser)
│   │   └── GameEngine.ts # Konfigurasi utama game Phaser
│   ├── pages/          # Halaman-halaman aplikasi (Next.js)
│   └── styles/         # Global CSS
├── package.json        # Dependensi dan skrip proyek
└── ...
```

## 🚀 Cara Menjalankan Proyek

Untuk menjalankan proyek ini di lingkungan lokal, ikuti langkah-langkah berikut:

1.  **Clone repository ini**
    ```bash
    git clone <URL_REPOSITORY_ANDA>
    ```

2.  **Masuk ke direktori proyek**
    ```bash
    cd MoluccasFood
    ```

3.  **Install semua dependensi yang dibutuhkan**
    ```bash
    npm install
    ```

4.  **Jalankan server pengembangan**
    ```bash
    npm run dev
    ```

5.  Buka [http://localhost:3000](http://localhost:3000) di browser Anda untuk melihat hasilnya.

## 📜 Skrip yang Tersedia

Dalam proyek ini, Anda dapat menjalankan beberapa skrip:

- `npm run dev`: Menjalankan aplikasi dalam mode pengembangan.
- `npm run build`: Mem-build aplikasi untuk lingkungan produksi.
- `npm run start`: Menjalankan aplikasi yang sudah di-build.
- `npm run lint`: Menjalankan linter untuk memeriksa kualitas kode.

## 📄 Lisensi

Proyek ini dilisensikan di bawah Lisensi yang tertera pada file `LICENSE`.