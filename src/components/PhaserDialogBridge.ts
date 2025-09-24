// src/components/PhaserDialogBridge.ts - Bridge untuk komunikasi antara Phaser scene dan React dialog system

import { DialogStep } from './KitchenBackgroundWrapper';

// Interface untuk komunikasi dengan dialog system
export interface DialogBridgeEvents {
  onStepComplete: (stepId: number, action: string) => void;
  onStepChange: (stepId: number) => void;
  onDialogToggle: (isOpen: boolean) => void;
}

// Global dialog bridge untuk komunikasi antar sistem
class PhaserDialogBridge {
  private static instance: PhaserDialogBridge;
  private currentStep: number = 0;
  private dialogSteps: DialogStep[] = [];
  private eventHandlers: DialogBridgeEvents | null = null;
  private sceneInstance: Phaser.Scene | null = null;

  static getInstance(): PhaserDialogBridge {
    if (!PhaserDialogBridge.instance) {
      PhaserDialogBridge.instance = new PhaserDialogBridge();
    }
    return PhaserDialogBridge.instance;
  }

  // Initialize bridge dengan scene dan event handlers
  initialize(scene: Phaser.Scene, steps: DialogStep[], handlers: DialogBridgeEvents) {
    this.sceneInstance = scene;
    this.dialogSteps = steps;
    this.eventHandlers = handlers;
    this.currentStep = 0;

    console.log(`Dialog Bridge initialized for scene: ${scene.scene.key}`);
    console.log(`Total steps: ${steps.length}`);
  }

  // Set step saat ini
  setCurrentStep(stepId: number) {
    if (stepId >= 0 && stepId < this.dialogSteps.length) {
      this.currentStep = stepId;
      this.eventHandlers?.onStepChange(stepId);
      console.log(`Dialog step changed to: ${stepId + 1}/${this.dialogSteps.length}`);
    }
  }

  // Get step saat ini
  getCurrentStep(): DialogStep | null {
    if (this.currentStep < this.dialogSteps.length) {
      return this.dialogSteps[this.currentStep];
    }
    return null;
  }

  // Get step ID saat ini
  getCurrentStepId(): number {
    return this.currentStep;
  }

  // Check apakah action sesuai dengan step saat ini
  isActionAllowed(action: string): boolean {
    const currentStep = this.getCurrentStep();
    if (!currentStep) return false;

    // Jika step tidak memiliki required action, izinkan semua action
    if (!currentStep.requiredAction) return true;

    return currentStep.requiredAction === action;
  }

  // Complete step saat ini dan lanjut ke step berikutnya
  completeCurrentStep(action?: string) {
    const currentStep = this.getCurrentStep();
    if (!currentStep) return false;

    // Verifikasi action jika diperlukan
    if (currentStep.requiredAction && action && currentStep.requiredAction !== action) {
      console.warn(`Action mismatch: expected ${currentStep.requiredAction}, got ${action}`);
      return false;
    }

    // Call step completion callback jika ada
    if (currentStep.onStepComplete) {
      currentStep.onStepComplete();
    }

    // Notify event handler
    this.eventHandlers?.onStepComplete(this.currentStep, action || currentStep.requiredAction || '');

    // Lanjut ke step berikutnya
    if (this.currentStep < this.dialogSteps.length - 1) {
      this.setCurrentStep(this.currentStep + 1);
      return true;
    } else {
      console.log('All dialog steps completed!');
      return false; // Semua step selesai
    }
  }

  // Get step berdasarkan action
  getStepByAction(action: string): DialogStep | null {
    return this.dialogSteps.find(step => step.requiredAction === action) || null;
  }

  // Check apakah semua step sudah selesai
  isAllStepsComplete(): boolean {
    return this.currentStep >= this.dialogSteps.length - 1;
  }

  // Get progress percentage
  getProgress(): number {
    if (this.dialogSteps.length === 0) return 100;
    return ((this.currentStep + 1) / this.dialogSteps.length) * 100;
  }

  // Force go to specific step (untuk debugging atau navigasi manual)
  goToStep(stepId: number) {
    if (stepId >= 0 && stepId < this.dialogSteps.length) {
      this.setCurrentStep(stepId);
    }
  }

  // Get semua steps
  getAllSteps(): DialogStep[] {
    return this.dialogSteps;
  }

  // Reset dialog ke step pertama
  reset() {
    this.currentStep = 0;
    this.eventHandlers?.onStepChange(0);
  }

  // Clean up saat scene destroyed
  cleanup() {
    this.sceneInstance = null;
    this.eventHandlers = null;
    this.dialogSteps = [];
    this.currentStep = 0;
  }

  // Utility function untuk scene Phaser
  // Scene bisa call method ini untuk memberikan feedback visual
  showStepHint(text?: string) {
    if (!this.sceneInstance) return;

    const currentStep = this.getCurrentStep();
    const hintText = text || currentStep?.text || '';

    // Create temporary hint text di scene
    const hint = this.sceneInstance.add.text(
      this.sceneInstance.cameras.main.width / 2,
      100,
      hintText,
      {
        fontSize: '24px',
        fontFamily: 'Chewy, cursive',
        color: '#FFD700',
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        padding: { x: 20, y: 10 },
        align: 'center'
      }
    ).setOrigin(0.5);

    // Auto-hide after 3 seconds
    this.sceneInstance.time.delayedCall(3000, () => {
      if (hint) {
        hint.destroy();
      }
    });
  }

  // Utility untuk highlight objek yang perlu di-interact
  highlightObject(gameObject: Phaser.GameObjects.GameObject, duration: number = 2000) {
    if (!this.sceneInstance || !gameObject) return;

    // Add glow effect
    const image = gameObject as Phaser.GameObjects.Image;
    if (image.setTint) {
      const originalTint = image.tint;

      // Pulse effect
      this.sceneInstance.tweens.add({
        targets: image,
        alpha: 0.7,
        duration: 500,
        yoyo: true,
        repeat: Math.floor(duration / 1000),
        onComplete: () => {
          image.setTint(originalTint);
          image.setAlpha(1);
        }
      });

      // Tint effect
      image.setTint(0xFFD700);
    }
  }
}

// Export singleton instance
export const dialogBridge = PhaserDialogBridge.getInstance();

// Helper functions untuk digunakan di Phaser scenes
export const initializeDialogBridge = (
  scene: Phaser.Scene,
  steps: DialogStep[],
  handlers: DialogBridgeEvents
) => {
  dialogBridge.initialize(scene, steps, handlers);
};

export const completeStep = (action?: string) => {
  return dialogBridge.completeCurrentStep(action);
};

export const isActionAllowed = (action: string) => {
  return dialogBridge.isActionAllowed(action);
};

export const getCurrentDialogStep = () => {
  return dialogBridge.getCurrentStep();
};

export const getCurrentStepId = () => {
  return dialogBridge.getCurrentStepId();
};

export const showHint = (text?: string) => {
  dialogBridge.showStepHint(text);
};

export const highlightGameObject = (gameObject: Phaser.GameObjects.GameObject, duration?: number) => {
  dialogBridge.highlightObject(gameObject, duration);
};

export const getDialogProgress = () => {
  return dialogBridge.getProgress();
};

export const resetDialog = () => {
  dialogBridge.reset();
};

export const goToDialogStep = (stepId: number) => {
  dialogBridge.goToStep(stepId);
};

export const cleanupDialogBridge = () => {
  dialogBridge.cleanup();
};