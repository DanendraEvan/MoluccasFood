import os
from PIL import Image

# === Lokasi folder tempat file PNG ===
folder_path = r"D:\PROJEK FULL\projekEnuma\python\Converter Python\foods\foods\papeda"

# === Pengaturan konversi ===
quality = 80   # 0–100 (semakin tinggi = kualitas lebih bagus tapi file lebih besar)
method = 6     # 0–6 (6 = kompresi paling optimal)

# === Proses konversi ===
converted = 0
deleted = 0

for filename in os.listdir(folder_path):
    if filename.lower().endswith(".png"):
        file_path = os.path.join(folder_path, filename)
        output_path = os.path.splitext(file_path)[0] + ".webp"

        try:
            with Image.open(file_path) as img:
                img.save(output_path, format="webp", quality=quality, method=method)
                converted += 1
                print(f"✅ {filename} dikonversi menjadi {os.path.basename(output_path)}")

            # Hapus file PNG setelah berhasil dikonversi
            os.remove(file_path)
            deleted += 1
            print(f"🗑️  {filename} dihapus setelah konversi.")

        except Exception as e:
            print(f"⚠️ Gagal mengonversi {filename}: {e}")

print(f"\nSelesai! {converted} file berhasil dikonversi ke WebP dan {deleted} file PNG dihapus 🎉")
