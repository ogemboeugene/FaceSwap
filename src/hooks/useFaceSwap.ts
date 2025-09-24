import { useState, useCallback, useRef } from 'react';
import { FaceDetectionService } from '../services/faceDetection';
import { FaceSwapService } from '../services/faceSwap';
import type { FaceData } from '../data/faceDatabase';
import { faceDatabase } from '../data/faceDatabase';

export interface DetectedFace {
  landmarks: number[][];
  expressions: Record<string, number>;
  box: { x: number; y: number; width: number; height: number };
  confidence: number;
}

export interface FaceSwapResult {
  success: boolean;
  imageData?: string;
  processedCanvas?: HTMLCanvasElement;
  error?: string;
  processingTime?: number;
}

export const useFaceSwap = () => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [detectedFaces, setDetectedFaces] = useState<DetectedFace[]>([]);
  const [matchedFace, setMatchedFace] = useState<FaceData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [initProgress, setInitProgress] = useState<string>('');
  const faceDetectionRef = useRef<FaceDetectionService | null>(null);
  const faceSwapRef = useRef<FaceSwapService | null>(null);
  // Initialize ML services
  const initialize = useCallback(async () => {
    if (isInitialized) return true;

    try {
      setInitProgress('Starting AI services...');
      console.log('🚀 Starting face swap services initialization');

      // Fast parallel initialization
      const initPromises = [
        (async () => {
          faceDetectionRef.current = new FaceDetectionService();
          await faceDetectionRef.current.initialize();
        })(),
        (async () => {
          faceSwapRef.current = new FaceSwapService();
          await faceSwapRef.current.initialize();
        })()
      ];

      // Wait for both services with a timeout
      await Promise.race([
        Promise.all(initPromises),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Initialization timeout')), 5000)
        )
      ]);

      setInitProgress('Ready!');
      setIsInitialized(true);
      setError(null);
      
      console.log('✅ Face swap services initialized successfully');
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to initialize face swap services';
      console.error('❌ Face swap initialization failed:', errorMessage);
      setError(errorMessage);
      setInitProgress('');
      return false;
    }
  }, [isInitialized]);
  // Detect faces in image or video frame
  const detectFaces = useCallback(async (
    input: HTMLVideoElement | HTMLImageElement | HTMLCanvasElement
  ): Promise<DetectedFace[]> => {
    if (!faceDetectionRef.current) {
      throw new Error('Face detection service not initialized');
    }

    try {
      // Convert HTMLCanvasElement to HTMLImageElement if needed
      let inputElement: HTMLVideoElement | HTMLImageElement;
      if (input instanceof HTMLCanvasElement) {
        const img = new Image();
        img.src = input.toDataURL();
        await new Promise<void>((resolve) => {
          img.onload = () => resolve();
        });
        inputElement = img;
      } else {
        inputElement = input;
      }

      const faces = await faceDetectionRef.current.detectFaces(inputElement);
      const detectedFaces: DetectedFace[] = faces.map(face => ({
        landmarks: face.landmarks.map(point => [point.x, point.y]),
        expressions: {
          neutral: face.expression?.type === 'neutral' ? face.expression.confidence : 0,
          happy: face.expression?.type === 'happy' ? face.expression.confidence : 0,
          sad: face.expression?.type === 'sad' ? face.expression.confidence : 0,
          angry: face.expression?.type === 'angry' ? face.expression.confidence : 0,
          surprised: face.expression?.type === 'surprised' ? face.expression.confidence : 0
        },
        box: {
          x: face.boundingBox.x,
          y: face.boundingBox.y,
          width: face.boundingBox.width,
          height: face.boundingBox.height
        },
        confidence: face.confidence
      }));

      setDetectedFaces(detectedFaces);
      return detectedFaces;
    } catch (err) {
      console.error('Face detection failed:', err);
      setDetectedFaces([]);
      throw err;
    }
  }, []);

  // Find best matching face from database
  const findBestMatch = useCallback((detectedFace: DetectedFace): FaceData | null => {
    // Simple matching algorithm based on expressions
    // In a real implementation, this would use more sophisticated matching
    const { expressions } = detectedFace;
    
    let bestMatch: FaceData | null = null;
    let bestScore = 0;

    for (const faceData of faceDatabase) {
      // For now, we'll randomly assign a match with some logic
      // In production, this would compare facial features, expressions, etc.
      let score = Math.random() * 0.5 + 0.5; // Random score between 0.5-1.0

      // Boost score for certain expression matches
      if (expressions.happy > 0.7 && faceData.id === 'obama') score += 0.2;
      if (expressions.neutral > 0.8 && faceData.id === 'mona-lisa') score += 0.2;
      if (expressions.surprised > 0.6 && faceData.id === 'einstein') score += 0.2;

      if (score > bestScore) {
        bestScore = score;
        bestMatch = faceData;
      }
    }

    setMatchedFace(bestMatch);
    return bestMatch;
  }, []);
  // Perform face swap
  const performFaceSwap = useCallback(async (
    sourceCanvas: HTMLCanvasElement,
    targetFace: FaceData,
    detectedFace?: DetectedFace
  ): Promise<FaceSwapResult> => {
    if (!faceSwapRef.current || !isInitialized) {
      throw new Error('Face swap service not initialized');
    }

    setIsProcessing(true);
    const startTime = Date.now();

    try {
      console.log(`🎭 Starting face swap with ${targetFace.name}`);

      // Load target face image
      const targetImage = new Image();
      await new Promise<void>((resolve, reject) => {
        targetImage.onload = () => resolve();
        targetImage.onerror = () => reject(new Error(`Failed to load target face: ${targetFace.imagePath}`));
        targetImage.src = targetFace.imagePath;
      });

      // Convert our DetectedFace to the service's expected format
      const serviceDetectedFace: import('../types/index').DetectedFace = {
        id: detectedFace ? `face-${Date.now()}` : 'unknown',
        landmarks: detectedFace?.landmarks?.map(point => ({ x: point[0], y: point[1] })) || [],
        boundingBox: detectedFace?.box || { x: 0, y: 0, width: 100, height: 100 },
        confidence: detectedFace?.confidence || 0.8,
        expression: detectedFace?.expressions ? {
          type: 'neutral' as const,
          confidence: 0.8,
          features: {
            eyebrows: detectedFace.expressions.surprised || 0,
            eyes: detectedFace.expressions.happy || 0,
            mouth: detectedFace.expressions.happy || 0,
            overall: 0.8
          }
        } : undefined
      };

      // Convert FaceData to TargetFace format
      const serviceTargetFace: import('../types/index').TargetFace = {
        id: targetFace.id,
        name: targetFace.name,
        imageUrl: targetFace.imagePath,
        thumbnailUrl: targetFace.thumbnailPath,
        expressions: {
          neutral: targetFace.imagePath
        }
      };

      // Create face swap config
      const config: import('../types/index').FaceSwapConfig = {
        quality: 'high',
        blendMode: 'normal',
        featherAmount: 0.1,
        colorMatch: true,
        realTimeMode: false
      };

      // Perform the face swap using the service
      const result = await faceSwapRef.current.swapFace(
        sourceCanvas,
        serviceDetectedFace,
        serviceTargetFace,
        config
      );

      const processingTime = Date.now() - startTime;
      
      if (result.success && result.imageData) {
        console.log(`✅ Face swap completed in ${processingTime}ms`);
        
        // Convert ImageData to data URL for display
        const canvas = document.createElement('canvas');
        canvas.width = result.imageData.width;
        canvas.height = result.imageData.height;
        const ctx = canvas.getContext('2d')!;
        ctx.putImageData(result.imageData, 0, 0);
        const imageData = canvas.toDataURL('image/png');
        
        return {
          success: true,
          imageData,
          processedCanvas: canvas,
          processingTime
        };
      } else {
        throw new Error(result.error || 'Face swap processing failed');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Face swap failed';
      console.error('❌ Face swap failed:', errorMessage);
      
      return {
        success: false,
        error: errorMessage,
        processingTime: Date.now() - startTime
      };
    } finally {
      setIsProcessing(false);
    }
  }, [isInitialized]);

  // Complete pipeline: detect -> match -> swap
  const processImage = useCallback(async (
    input: HTMLVideoElement | HTMLImageElement | HTMLCanvasElement,
    canvas: HTMLCanvasElement
  ): Promise<FaceSwapResult> => {
    try {
      setError(null);
      
      // Step 1: Detect faces
      console.log('🔍 Detecting faces...');
      const faces = await detectFaces(input);
      
      if (faces.length === 0) {
        throw new Error('No faces detected in the image');
      }

      // Step 2: Find best match
      console.log('🎯 Finding best face match...');
      const bestMatch = findBestMatch(faces[0]);
      
      if (!bestMatch) {
        throw new Error('No suitable face match found in database');
      }

      // Step 3: Prepare canvas with source image
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        throw new Error('Could not get canvas context');
      }

      // Draw source image to canvas
      if (input instanceof HTMLVideoElement) {
        canvas.width = input.videoWidth;
        canvas.height = input.videoHeight;
        ctx.drawImage(input, 0, 0);
      } else {
        canvas.width = input.width;
        canvas.height = input.height;
        ctx.drawImage(input, 0, 0);
      }

      // Step 4: Perform face swap
      console.log('🎭 Performing face swap...');
      const result = await performFaceSwap(canvas, bestMatch, faces[0]);
      
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Image processing failed';
      setError(errorMessage);
      return {
        success: false,
        error: errorMessage
      };
    }
  }, [detectFaces, findBestMatch, performFaceSwap]);
  // Clear error function
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Cleanup resources
  const cleanup = useCallback(() => {
    if (faceSwapRef.current) {
      faceSwapRef.current.dispose();
    }
    setDetectedFaces([]);
    setMatchedFace(null);
    setError(null);
  }, []);

  return {
    // State
    isInitialized,
    isProcessing,
    detectedFaces,
    matchedFace,
    error,
    initProgress,    // Methods
    initialize,
    detectFaces,
    findBestMatch,
    performFaceSwap,
    processImage,
    cleanup,
    clearError,

    // Utilities
    faceDatabase
  };
};
