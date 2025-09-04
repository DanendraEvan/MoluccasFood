# HomeButton Size Control Documentation

## Overview
Function baru telah ditambahkan ke `KitchenBackgroundWrapper` untuk mengontrol ukuran HomeButton secara dinamis.

## Features

### 1. Props untuk KitchenBackgroundWrapper
```typescript
interface KitchenBackgroundWrapperProps {
  // ... existing props
  homeButtonSize?: number; // Ukuran home button dalam pixel (default: 108)
  onHomeButtonSizeChange?: (size: number) => void; // Callback ketika ukuran berubah
}
```

### 2. Hook useHomeButtonSize
```typescript
import { useHomeButtonSize } from './KitchenBackgroundWrapper';

const { 
  size, 
  changeSize, 
  resetToDefault, 
  setToSmall, 
  setToMedium, 
  setToLarge 
} = useHomeButtonSize();
```

### 3. Komponen HomeButtonSizeController
```typescript
import HomeButtonSizeController from './HomeButtonSizeController';

<HomeButtonSizeController 
  onSizeChange={(newSize) => console.log(`Size changed to: ${newSize}px`)}
  showControls={true}
/>
```

## Usage Examples

### Contoh 1: Menggunakan KitchenBackgroundWrapper dengan ukuran custom
```typescript
import KitchenBackgroundWrapper from '@/components/KitchenBackgroundWrapper';

const MyGamePage = () => {
  const [buttonSize, setButtonSize] = useState(120);

  return (
    <KitchenBackgroundWrapper
      homeButtonSize={buttonSize}
      onHomeButtonSizeChange={(newSize) => setButtonSize(newSize)}
      sceneTitle="My Game"
    >
      {/* Game content */}
    </KitchenBackgroundWrapper>
  );
};
```

### Contoh 2: Menggunakan hook useHomeButtonSize
```typescript
import { useHomeButtonSize } from '@/components/KitchenBackgroundWrapper';

const MyComponent = () => {
  const { size, changeSize, setToLarge } = useHomeButtonSize();

  return (
    <div>
      <p>Current button size: {size}px</p>
      <button onClick={() => setToLarge()}>Set to Large</button>
      <button onClick={() => changeSize(150)}>Set to 150px</button>
    </div>
  );
};
```

### Contoh 3: Menggunakan HomeButtonSizeController
```typescript
import HomeButtonSizeController from '@/components/HomeButtonSizeController';

const GamePage = () => {
  const [showControls, setShowControls] = useState(false);

  return (
    <div>
      <button onClick={() => setShowControls(!showControls)}>
        Toggle Size Controls
      </button>
      
      <HomeButtonSizeController 
        showControls={showControls}
        onSizeChange={(size) => console.log(`Button size: ${size}px`)}
      />
    </div>
  );
};
```

## Available Functions

### useHomeButtonSize Hook
- `size`: Ukuran saat ini (number)
- `changeSize(newSize)`: Mengubah ukuran ke nilai tertentu (60-200px)
- `resetToDefault()`: Reset ke ukuran default (108px)
- `setToSmall()`: Set ke ukuran kecil (80px)
- `setToMedium()`: Set ke ukuran medium (108px)
- `setToLarge()`: Set ke ukuran besar (120px)

### KitchenBackgroundWrapper Props
- `homeButtonSize`: Ukuran awal home button
- `onHomeButtonSizeChange`: Callback function ketika ukuran berubah

### HomeButtonSizeController Props
- `onSizeChange`: Callback function ketika ukuran berubah
- `showControls`: Boolean untuk menampilkan/menyembunyikan kontrol

## Size Ranges
- **Minimum**: 60px
- **Maximum**: 200px
- **Default**: 108px
- **Small**: 80px
- **Medium**: 108px
- **Large**: 120px

## Responsive Behavior
Function `getOptimalHomeButtonSize()` secara otomatis menyesuaikan ukuran berdasarkan screen size:
- Mobile (< 768px): 80px
- Tablet (768px - 1024px): 100px
- Desktop (> 1024px): 120px
