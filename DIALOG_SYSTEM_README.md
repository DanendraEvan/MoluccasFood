# Dialog System Documentation

## Overview
Sistem dialog terpusat yang terintegrasi dengan KitchenBackgroundWrapper untuk memberikan pengalaman gameplay yang konsisten di semua scene makanan.

## Fitur Utama

### 1. Toggle Button dengan Asset
- **Button Up**: `/assets/ui/buttons/up/up_normal.png`, `up_hover.png`, `up_active.png`
- **Button Down**: `/assets/ui/buttons/down/down_normal.png`, `down_hover.png`, `down_active.png`
- **Fungsi**: Membuka/menutup dialog dengan animasi smooth
- **Posisi**: Dinamis berdasarkan status dialog (atas saat terbuka, tengah saat tertutup)

### 2. Dialog Panel
- **Mode Collapsed**: Tinggi 40px, menampilkan step counter
- **Mode Expanded**: Tinggi 150px, menampilkan instruksi lengkap
- **Progress Bar**: Visual indicator untuk kemajuan cooking
- **Navigation**: Previous/Next buttons untuk navigasi manual

### 3. Step-based Gameplay
- **Validation**: User hanya bisa melakukan action sesuai step saat ini
- **Auto Progression**: Otomatis lanjut ke step berikutnya saat action selesai
- **Visual Feedback**: Highlight objects yang perlu di-interact

## File Structure

```
src/
├── components/
│   ├── KitchenBackgroundWrapper.tsx    # Main dialog system
│   ├── DialogSteps.ts                  # Dialog content untuk semua scene
│   └── PhaserDialogBridge.ts          # Bridge React-Phaser
├── game/scenes/
│   └── ColoColoSceneWithDialog.ts     # Contoh implementasi
└── pages/game/
    └── scene_loader.tsx               # Integration example
```

## Cara Penggunaan

### 1. Untuk Scene Developer (Phaser)

```typescript
import {
  initializeDialogBridge,
  completeStep,
  isActionAllowed,
  getCurrentDialogStep,
  showHint,
  highlightGameObject
} from '@/components/PhaserDialogBridge';
import { coloColoSteps } from '@/components/DialogSteps';

// Di create() method
initializeDialogBridge(this, coloColoSteps, {
  onStepComplete: (stepId: number, action: string) => {
    console.log(`Step ${stepId + 1} completed: ${action}`);
    // Handle completion logic
  },
  onStepChange: (stepId: number) => {
    console.log(`Changed to step ${stepId + 1}`);
    this.updateGameLogicForStep(stepId);
  },
  onDialogToggle: (isOpen: boolean) => {
    console.log(`Dialog ${isOpen ? 'opened' : 'closed'}`);
  }
});

// Saat user drop ingredient
private handleDrop(ingredient: string, target: string) {
  let action = '';
  if (ingredient === 'cabai' && target === 'telenan') {
    action = 'place_chili';
  }

  // Validasi dengan dialog system
  if (isActionAllowed(action)) {
    this.executeSuccessfulDrop(() => {
      completeStep(action); // Auto lanjut ke step berikutnya
    });
  } else {
    this.showErrorFeedback();
  }
}

// Show hint untuk step saat ini
showHint(); // Otomatis ambil text dari current step

// Highlight object yang perlu di-interact
highlightGameObject(this.gameObjects.telenan, 3000);
```

### 2. Untuk React Component

```tsx
import KitchenBackgroundWrapper, { useDialogSystem } from '@/components/KitchenBackgroundWrapper';
import { getDialogStepsForScene } from '@/components/DialogSteps';

function GamePage() {
  const dialogSteps = getDialogStepsForScene('colocolo');
  const dialogSystem = useDialogSystem(dialogSteps);

  return (
    <KitchenBackgroundWrapper
      sceneTitle="Colo-Colo"
      dialogSteps={dialogSystem.dialogSteps}
      currentDialogStep={dialogSystem.currentStep}
      onDialogStepChange={dialogSystem.setCurrentStep}
      onDialogToggle={dialogSystem.setIsDialogOpen}
      showDialog={gameStatus === 'playing'}
      sceneName="colocolo"
    >
      {/* Phaser game container */}
    </KitchenBackgroundWrapper>
  );
}
```

### 3. Menambah Dialog Steps Baru

Di `DialogSteps.ts`:

```typescript
export const newSceneSteps: DialogStep[] = [
  {
    id: 1,
    text: "Instruksi untuk step pertama",
    character: "karakter1",
    requiredAction: "action_name"
  },
  // ... steps lainnya
];

// Update getDialogStepsForScene function
export const getDialogStepsForScene = (sceneName: string): DialogStep[] => {
  switch (sceneName.toLowerCase()) {
    case 'newscene':
      return newSceneSteps;
    // ... cases lainnya
  }
};
```

## API Reference

### DialogStep Interface
```typescript
interface DialogStep {
  id: number;              // Unique ID
  text: string;            // Instruksi untuk user
  character?: string;      // Karakter yang bicara
  requiredAction?: string; // Action yang harus dilakukan
  onStepComplete?: () => void; // Callback saat step selesai
}
```

### Bridge Functions
- `initializeDialogBridge()` - Initialize bridge di scene
- `completeStep(action)` - Mark step sebagai complete
- `isActionAllowed(action)` - Check apakah action diizinkan
- `getCurrentDialogStep()` - Get step saat ini
- `showHint(text?)` - Show hint popup
- `highlightGameObject(obj, duration)` - Highlight object
- `cleanupDialogBridge()` - Cleanup saat scene destroy

## Button States

### Up Button (Dialog Tertutup)
- **Normal**: `up_normal.png` - State default
- **Hover**: `up_hover.png` - Saat mouse hover
- **Active**: `up_active.png` - Saat diklik/pressed

### Down Button (Dialog Terbuka)
- **Normal**: `down_normal.png` - State default
- **Hover**: `down_hover.png` - Saat mouse hover
- **Active**: `down_active.png` - Saat diklik/pressed

## Styling & Layout

Dialog menggunakan styling inline dengan theme yang konsisten:

### Dialog Panel
- **Position**: 110px from top (50px below header), centered horizontally
- **Size**:
  - Collapsed: 400px width × 35px height
  - Expanded: 600px width × 120px height
- **Background**: `rgba(255, 255, 255, 0.95)` dengan border radius 12px
- **Colors**: Brown theme (`#8B4513`) untuk consistency
- **Font**:
  - Collapsed: 14px
  - Expanded: 14px untuk text, 12px untuk controls
- **Animations**: Smooth transitions (0.3s ease) untuk semua perubahan state

### Toggle Button
- **Position**: Centered horizontally, moves vertically based on dialog state
  - Dialog closed: 110px from top
  - Dialog open: 170px from top
- **Size**: 32px × 32px (reduced from previous 40px)
- **Assets**: `/assets/ui/buttons/up/` dan `/assets/ui/buttons/down/`

## Troubleshooting

### Asset Button Tidak Muncul
1. Pastikan asset ada di `/public/assets/ui/buttons/up/` dan `/public/assets/ui/buttons/down/`
2. Check nama file: `up_normal.png`, `up_hover.png`, `up_active.png`, dll
3. Jika error, akan fallback ke arrow symbols (▲/▼)

### Dialog Tidak Update
1. Pastikan `onDialogStepChange` dipassing ke KitchenBackgroundWrapper
2. Check console untuk error di PhaserDialogBridge
3. Pastikan `initializeDialogBridge` dipanggil di scene create()

### Action Tidak Diizinkan
1. Check `requiredAction` di DialogSteps matches dengan action yang dipassing
2. Pastikan `isActionAllowed()` dipanggil sebelum `completeStep()`
3. Debug dengan `getCurrentDialogStep()` untuk melihat step saat ini