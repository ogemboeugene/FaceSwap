import * as tf from '@tensorflow/tfjs';
import '@tensorflow/tfjs-backend-webgl';
// import * as faceapi from 'face-api.js';
import type { DetectedFace, FaceLandmarks } from '../types/index';

export class FaceDetectionService {
  private static instance: FaceDetectionService;
  private isInitialized = false;

  static getInstance(): FaceDetectionService {
    if (!FaceDetectionService.instance) {
      FaceDetectionService.instance = new FaceDetectionService();
    }
    return FaceDetectionService.instance;
  }  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      // Initialize TensorFlow.js
      await tf.ready();      console.log('TensorFlow.js initialized');
      
      // For demo purposes, let's simulate face detection without loading heavy models
      console.log('Setting up fast face detection (demo mode)...');
      
      // Simulate model loading with a fast timeout
      await new Promise(resolve => setTimeout(resolve, 300));
      
      console.log('✅ Face detection service initialized (demo mode)');

      this.isInitialized = true;
      console.log('🎯 Face detection service fully initialized and ready');
    } catch (error) {
      console.error('💥 Failed to initialize face detection service:', error);
      throw error; // Throw error so the app knows face detection is not available
    }
  }
  async detectFaces(imageElement: HTMLVideoElement | HTMLImageElement): Promise<DetectedFace[]> {
    if (!this.isInitialized) {
      throw new Error('Face detection service not initialized');
    }

    try {
      // For demo purposes, create a fast mock face detection
      console.log('🔍 Detecting faces (demo mode)...');
      
      // Simulate processing time
      await new Promise(resolve => setTimeout(resolve, 200));
      
      // Get image dimensions
      const width = imageElement instanceof HTMLVideoElement ? imageElement.videoWidth : imageElement.width;
      const height = imageElement instanceof HTMLVideoElement ? imageElement.videoHeight : imageElement.height;
      
      // Create a mock detected face in the center of the image
      const mockFace: DetectedFace = {
        id: `demo_face_${Date.now()}`,
        landmarks: this.generateMockLandmarks(width, height),
        boundingBox: {
          x: width * 0.25,
          y: height * 0.25,
          width: width * 0.5,
          height: height * 0.5,
        },
        confidence: 0.95,
        expression: {
          type: 'neutral',
          confidence: 0.8,
          features: {
            eyebrows: 0.2,
            eyes: 0.5,
            mouth: 0.3,
            overall: 0.8,
          },
        },
      };

      console.log('✅ Face detected (demo)');
      return [mockFace];
    } catch (error) {
      console.error('Face detection failed:', error);
      throw error;
    }
  }

  private generateMockLandmarks(width: number, height: number): FaceLandmarks[] {
    // Generate 68 facial landmarks in a realistic face pattern
    const landmarks: FaceLandmarks[] = [];
    const centerX = width * 0.5;
    const centerY = height * 0.5;
    const faceWidth = width * 0.3;
    const faceHeight = height * 0.4;

    // Generate landmarks around face perimeter and features
    for (let i = 0; i < 68; i++) {
      const angle = (i / 68) * Math.PI * 2;
      const x = centerX + Math.cos(angle) * (faceWidth / 2) * (0.8 + Math.random() * 0.4);
      const y = centerY + Math.sin(angle) * (faceHeight / 2) * (0.8 + Math.random() * 0.4);
      
      landmarks.push({
        x: Math.max(0, Math.min(width, x)),
        y: Math.max(0, Math.min(height, y)),
        z: 0,
      });
    }

    return landmarks;
  }
  // private mapToDetectedFace(detection: any, index: number): DetectedFace {
  //   const landmarks: FaceLandmarks[] = detection.landmarks.positions.map((point: any) => ({
  //     x: point.x,
  //     y: point.y,
  //     z: 0,
  //   }));

  //   const expression = this.mapExpression(detection.expressions);
    
  //   return {
  //     id: `face_${index}_${Date.now()}`,
  //     landmarks,
  //     boundingBox: {
  //       x: detection.detection.box.x,
  //       y: detection.detection.box.y,
  //       width: detection.detection.box.width,
  //       height: detection.detection.box.height,
  //     },
  //     confidence: detection.detection.score,
  //     expression,
  //   };
  // }
  // private mapExpression(expressions: any): FacialExpression {
  //   const expressionEntries = Object.entries(expressions) as [string, number][];
  //   const dominant = expressionEntries.reduce(
  //     (prev: [string, number], curr: [string, number]) =>
  //       curr[1] > prev[1] ? curr : prev
  //   );

  //   const type = this.normalizeExpressionType(dominant[0]);
  //   const confidence = dominant[1] as number;

  //   return {
  //     type,
  //     confidence,
  //     features: {
  //       eyebrows: expressions.angry || 0,
  //       eyes: expressions.surprised || 0,
  //       mouth: expressions.happy || expressions.sad || 0,
  //       overall: confidence,
  //     },
  //   };
  // }
  // private normalizeExpressionType(expression: string): ExpressionType {
  //   const mapping: { [key: string]: ExpressionType } = {
  //     'neutral': 'neutral',
  //     'happy': 'happy',
  //     'sad': 'sad',
  //     'angry': 'angry',
  //     'surprised': 'surprised',
  //     'fearful': 'fear',
  //     'disgusted': 'disgust',
  //   };

  //   return mapping[expression] || 'neutral';
  // }

  async extractFaceImage(
    imageElement: HTMLVideoElement | HTMLImageElement,
    face: DetectedFace
  ): Promise<ImageData | null> {
    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx) return null;

      const { x, y, width, height } = face.boundingBox;
      const padding = 20; // Add some padding around the face
      
      canvas.width = width + padding * 2;
      canvas.height = height + padding * 2;
      
      ctx.drawImage(
        imageElement,
        x - padding,
        y - padding,
        width + padding * 2,
        height + padding * 2,
        0,
        0,
        canvas.width,
        canvas.height
      );
      
      return ctx.getImageData(0, 0, canvas.width, canvas.height);
    } catch (error) {
      console.error('Failed to extract face image:', error);
      return null;
    }
  }

  getRequiredModels(): string[] {
    return [
      'tiny_face_detector_model-weights_manifest.json',
      'face_landmark_68_model-weights_manifest.json',
      'face_expression_model-weights_manifest.json',
      'face_recognition_model-weights_manifest.json',
    ];
  }

  isReady(): boolean {
    return this.isInitialized;
  }
}
