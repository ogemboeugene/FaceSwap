import { create } from 'zustand';
import type { AppState, TargetFace, DetectedFace, FaceSwapConfig, ModelLoadingState } from '../types/index';

interface FaceSwapStore extends AppState {
  // Actions
  setCurrentTargetFace: (face: TargetFace | null) => void;
  setDetectedFaces: (faces: DetectedFace[]) => void;
  setIsProcessing: (processing: boolean) => void;
  setError: (error: string | null) => void;
  updateConfig: (config: Partial<FaceSwapConfig>) => void;
  initialize: () => void;
  reset: () => void;
}

interface ModelStore extends ModelLoadingState {
  setFaceDetectionLoaded: (loaded: boolean) => void;
  setExpressionRecognitionLoaded: (loaded: boolean) => void;
  setFaceSwapLoaded: (loaded: boolean) => void;
  setIsLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

const defaultConfig: FaceSwapConfig = {
  quality: 'medium',
  blendMode: 'normal',
  featherAmount: 0.5,
  colorMatch: true,
  realTimeMode: true,
};

export const useFaceSwapStore = create<FaceSwapStore>((set) => ({
  isInitialized: false,
  currentTargetFace: null,
  detectedFaces: [],
  isProcessing: false,
  error: null,
  config: defaultConfig,
  
  setCurrentTargetFace: (face) => set({ currentTargetFace: face }),
  setDetectedFaces: (faces) => set({ detectedFaces: faces }),
  setIsProcessing: (processing) => set({ isProcessing: processing }),
  setError: (error) => set({ error }),
  updateConfig: (newConfig) => set((state) => ({ 
    config: { ...state.config, ...newConfig } 
  })),
  initialize: () => set({ isInitialized: true, error: null }),
  reset: () => set({
    currentTargetFace: null,
    detectedFaces: [],
    isProcessing: false,
    error: null,
    config: defaultConfig,
  }),
}));

export const useModelStore = create<ModelStore>((set) => ({
  faceDetection: false,
  expressionRecognition: false,
  faceSwap: false,
  isLoading: false,
  error: null,
  
  setFaceDetectionLoaded: (loaded) => set({ faceDetection: loaded }),
  setExpressionRecognitionLoaded: (loaded) => set({ expressionRecognition: loaded }),
  setFaceSwapLoaded: (loaded) => set({ faceSwap: loaded }),
  setIsLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),
}));
