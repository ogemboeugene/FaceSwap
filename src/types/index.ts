// Core types for face detection and swapping
export interface FaceLandmarks {
  x: number;
  y: number;
  z?: number;
}

export interface DetectedFace {
  id: string;
  landmarks: FaceLandmarks[];
  boundingBox: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  confidence: number;
  expression?: FacialExpression;
}

export interface FacialExpression {
  type: ExpressionType;
  confidence: number;
  features: {
    eyebrows: number;
    eyes: number;
    mouth: number;
    overall: number;
  };
}

export type ExpressionType = 
  | 'neutral'
  | 'happy'
  | 'sad'
  | 'angry'
  | 'surprised'
  | 'fear'
  | 'disgust';

// Target face database
export interface TargetFace {
  id: string;
  name: string;
  imageUrl: string;
  thumbnailUrl: string;
  expressions: {
    [key in ExpressionType]?: string; // URL to expression image
  };
  metadata?: {
    celebrity?: boolean;
    category?: string;
    tags?: string[];
  };
}

// Camera and video types
export interface CameraConfig {
  width: number;
  height: number;
  fps: number;
  facingMode: 'user' | 'environment';
}

export interface VideoStreamState {
  stream: MediaStream | null;
  isActive: boolean;
  error: string | null;
}

// Face swap processing
export interface FaceSwapConfig {
  quality: 'low' | 'medium' | 'high';
  blendMode: 'normal' | 'overlay' | 'multiply';
  featherAmount: number;
  colorMatch: boolean;
  realTimeMode: boolean;
}

export interface SwapResult {
  success: boolean;
  imageData?: ImageData;
  processingTime: number;
  error?: string;
}

// Application state
export interface AppState {
  isInitialized: boolean;
  currentTargetFace: TargetFace | null;
  detectedFaces: DetectedFace[];
  isProcessing: boolean;
  error: string | null;
  config: FaceSwapConfig;
}

// ML Model types
export interface ModelLoadingState {
  faceDetection: boolean;
  expressionRecognition: boolean;
  faceSwap: boolean;
  isLoading: boolean;
  error: string | null;
}

// File upload types
export interface UploadedFile {
  id: string;
  file: File;
  preview: string;
  processed: boolean;
  targetFace?: TargetFace;
}

// Performance metrics
export interface PerformanceMetrics {
  fps: number;
  detectionTime: number;
  swapTime: number;
  totalTime: number;
  frameCount: number;
}
