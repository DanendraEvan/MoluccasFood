# Panduan Implementasi Responsive System untuk Game Scenes

## Overview
Sistem responsif telah dibuat untuk semua 5 game scenes dengan 2 file utility utama:
1. `ResponsiveUtils.ts` - Core responsive logic
2. `ResponsiveMixin.ts` - Easy implementation mixin

## Implementasi untuk Setiap Scene

### Langkah 1: Import Dependencies
Tambahkan di bagian atas setiap scene file:

```typescript
import ResponsiveMixin, { ResponsiveScene } from "../utils/ResponsiveMixin";
```

### Langkah 2: Implement Interface
Update class definition:

```typescript
export default class YourScene extends Phaser.Scene implements ResponsiveScene {
  // Properties yang diperlukan sudah ada di ResponsiveScene interface
  public responsiveLayout?: ResponsiveLayout;
  public originalLayoutConfig?: any;
  // ... existing properties
}
```

### Langkah 3: Setup di Method create()
Tambahkan setelah membuat background:

```typescript
create() {
  this.add.image(0, 0, "background").setOrigin(0);

  // Setup responsive system
  ResponsiveMixin.setupResponsiveSystem(this);
  ResponsiveMixin.exposeDialogConfigToReact(this);

  // ... rest of create method
}
```

### Langkah 4: Update Panel Title (Jika Ada)
Dalam method `updateIngredientsPanelVisuals()` atau sejenisnya:

```typescript
private updateIngredientsPanelVisuals() {
  // ... existing code ...

  // Update panel title dengan responsive font size
  const titleFontSize = this.responsiveLayout
    ? this.responsiveLayout.infoPanel.titleFontSize
    : 24;

  this.panelTitle.setStyle({
    fontSize: `${titleFontSize}px`,
    fontFamily: 'Chewy, cursive',
    color: '#FFE4B5',
    align: 'center',
    fontStyle: 'bold'
  });
}
```

## Daftar Scene yang Perlu Diupdate

### ✅ Sudah Diimplementasi:
- [x] `KohuKohuScene.ts` - Fully implemented

### 🔄 Perlu Diimplementasi:
- [ ] `ColoColoScene.ts` - Partially added (import + interface)
- [ ] `IkanKuahKuningScene.ts`
- [ ] `NasiLapolaScene.ts`
- [ ] `PapedaScene.ts`

## Features yang Tersedia

### 1. Dialog Responsif
- Otomatis menyesuaikan ukuran dan posisi dialog berdasarkan layar
- Responsive font size untuk teks dialog
- Mobile-friendly layout

### 2. Info Panel Responsif
- Dinamis width, height, dan posisi
- Responsive font size untuk title dan content
- Menyesuaikan ukuran items dalam panel

### 3. Breakpoints
- `xs`: < 480px
- `sm`: 480px - 640px
- `md`: 640px - 768px
- `lg`: 768px - 1024px
- `xl`: > 1024px

### 4. Landscape/Portrait Detection
- Otomatis mendeteksi orientasi
- Layout berbeda untuk landscape dan portrait

## Cara Menggunakan

### Mendapatkan Dialog Config untuk React
```typescript
// Di dalam scene, config dialog otomatis tersedia untuk React
const dialogConfig = ResponsiveMixin.getDialogConfig(this);
```

### Mendapatkan Info Panel Config
```typescript
const infoPanelConfig = ResponsiveMixin.getInfoPanelConfig(this);
```

### Membuat Panel Responsif Baru
```typescript
const items = [
  { key: "ingredient1", name: "Bahan 1" },
  { key: "ingredient2", name: "Bahan 2" },
  // ... more items
];

this.ingredientsPanel = ResponsiveMixin.createResponsiveIngredientsPanel(this, items);
```

## Testing

### Desktop Testing
- Resize browser window
- Test different aspect ratios
- Check landscape/portrait modes

### Mobile Testing
- Test pada berbagai ukuran device
- Portrait/landscape orientation
- Touch interface compatibility

## Troubleshooting

### Issue: Panel tidak berubah ukuran
**Solution**: Pastikan scene implements `ResponsiveScene` interface dan memanggil `ResponsiveMixin.setupResponsiveSystem(this)` di method `create()`.

### Issue: Font size tidak responsive
**Solution**: Update method yang mengatur style text untuk menggunakan `this.responsiveLayout.infoPanel.titleFontSize` atau `this.responsiveLayout.infoPanel.fontSize`.

### Issue: Dialog tidak responsif
**Solution**: Pastikan React dialog component menggunakan config dari `scene.getResponsiveDialogConfig()`.

## Next Steps

1. Implementasi pada scene yang belum diupdate
2. Test pada berbagai device dan ukuran layar
3. Fine-tune breakpoints jika diperlukan
4. Add more responsive elements if needed

## Files Modified/Created

### New Files:
- `src/game/utils/ResponsiveUtils.ts` - Core responsive utilities
- `src/game/utils/ResponsiveMixin.ts` - Implementation mixin
- `RESPONSIVE_IMPLEMENTATION_GUIDE.md` - This guide

### Modified Files:
- `src/game/scenes/KohuKohuScene.ts` - Full implementation
- `src/game/scenes/ColoColoScene.ts` - Partial implementation

### Files to Update:
- `src/game/scenes/IkanKuahKuningScene.ts`
- `src/game/scenes/NasiLapolaScene.ts`
- `src/game/scenes/PapedaScene.ts`