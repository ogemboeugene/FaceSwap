import * as tf from '@tensorflow/tfjs';
import '@tensorflow/tfjs-backend-webgl';
import type { DetectedFace, TargetFace, FaceSwapConfig, SwapResult, ExpressionType } from '../types/index';

export class FaceSwapService {
  private static instance: FaceSwapService;
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private isInitialized = false;
  private swapModel: tf.LayersModel | null = null;

  constructor() {
    this.canvas = document.createElement('canvas');
    this.ctx = this.canvas.getContext('2d')!;
  }

  static getInstance(): FaceSwapService {
    if (!FaceSwapService.instance) {
      FaceSwapService.instance = new FaceSwapService();
    }
    return FaceSwapService.instance;
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      console.log('🔄 Initializing Face Swap Service...');
      
      // Initialize TensorFlow.js backend
      await tf.ready();
      console.log('✅ TensorFlow.js backend ready');

      // Try to load local face swap models (if available)
      try {
        // For now, we'll use a simplified approach without heavy ML models
        // In a production app, you'd load actual face swap models here
        console.log('⚙️ Setting up face swap processing pipeline...');
        
        // Initialize canvas-based face swapping
        this.setupCanvasProcessing();
        
        console.log('✅ Face swap service initialized with canvas-based processing');
      } catch (modelError) {
        console.warn('⚠️ Advanced ML models not available, using simplified face swapping:', modelError);
        this.setupCanvasProcessing();
      }

      this.isInitialized = true;
      console.log('🎯 Face Swap Service fully initialized');
    } catch (error) {
      console.error('💥 Failed to initialize face swap service:', error);
      throw error;
    }
  }

  private setupCanvasProcessing(): void {
    // Set up optimized canvas processing
    this.ctx.imageSmoothingEnabled = true;
    this.ctx.imageSmoothingQuality = 'high';
  }

  async swapFace(
    sourceImage: HTMLVideoElement | HTMLImageElement,
    detectedFace: DetectedFace,
    targetFace: TargetFace,
    config: FaceSwapConfig
  ): Promise<SwapResult> {
    const startTime = performance.now();

    try {
      if (!this.isInitialized) {
        await this.initialize();
      }

      console.log('🔄 Starting face swap processing...');

      // Get the target face image based on detected expression
      const targetImageUrl = this.getTargetImageForExpression(targetFace, detectedFace.expression?.type || 'neutral');
      const targetImage = await this.loadImage(targetImageUrl);

      // Set canvas size to match source
      this.canvas.width = sourceImage instanceof HTMLVideoElement ? sourceImage.videoWidth : sourceImage.width;
      this.canvas.height = sourceImage instanceof HTMLVideoElement ? sourceImage.videoHeight : sourceImage.height;

      // Draw the original image
      this.ctx.drawImage(sourceImage, 0, 0);

      // Perform enhanced face swap
      await this.performAdvancedSwap(detectedFace, targetImage, config);

      const imageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
      const processingTime = performance.now() - startTime;

      console.log(`✅ Face swap completed in ${processingTime.toFixed(2)}ms`);

      return {
        success: true,
        imageData,
        processingTime,
      };
    } catch (error) {
      const processingTime = performance.now() - startTime;
      console.error('💥 Face swap failed:', error);

      return {
        success: false,
        processingTime,
        error: error instanceof Error ? error.message : 'Face swap failed',
      };
    }
  }

  private getTargetImageForExpression(targetFace: TargetFace, expression: ExpressionType): string {
    // Try to get the specific expression, fall back to a default if not available
    return targetFace.expressions[expression] || 
           targetFace.expressions.neutral || 
           targetFace.imageUrl;
  }

  private async performAdvancedSwap(
    detectedFace: DetectedFace,
    targetImage: HTMLImageElement,
    config: FaceSwapConfig
  ): Promise<void> {
    const { boundingBox, landmarks } = detectedFace;
    
    // Save current canvas state
    this.ctx.save();

    try {
      // Calculate optimal scaling and positioning
      const transform = this.calculateFaceTransform(boundingBox, targetImage, landmarks);
      
      // Apply feathering/blending if configured
      if (config.featherAmount > 0) {
        this.applyFeathering(boundingBox, config.featherAmount);
      }

      // Set blend mode for realistic mixing
      this.ctx.globalCompositeOperation = this.getBlendMode(config.blendMode);
      this.ctx.globalAlpha = this.getBlendOpacity(config.quality);

      // Draw the target face with proper transformation
      this.ctx.drawImage(
        targetImage,
        transform.translateX,
        transform.translateY,
        transform.scaleX * targetImage.width,
        transform.scaleY * targetImage.height
      );

      // Reset blend mode
      this.ctx.globalCompositeOperation = 'source-over';
      this.ctx.globalAlpha = 1.0;

      // Apply color matching if enabled
      if (config.colorMatch) {
        await this.applyColorMatching(boundingBox);
      }
    } finally {
      // Restore canvas state
      this.ctx.restore();
    }
  }
  private calculateFaceTransform(
    boundingBox: DetectedFace['boundingBox'],
    targetImage: HTMLImageElement,
    _landmarks?: DetectedFace['landmarks']
  ): {
    scaleX: number,
    scaleY: number,
    translateX: number,
    translateY: number
  } {
    // Calculate scaling to fit target face over detected face
    const scaleX = boundingBox.width / targetImage.width;
    const scaleY = boundingBox.height / targetImage.height;
    
    // Maintain aspect ratio but allow slight stretching for better fit
    const uniformScale = Math.min(scaleX, scaleY);
    const finalScaleX = uniformScale + (scaleX - uniformScale) * 0.3;
    const finalScaleY = uniformScale + (scaleY - uniformScale) * 0.3;

    // Calculate position to center the target face
    const scaledWidth = targetImage.width * finalScaleX;
    const scaledHeight = targetImage.height * finalScaleY;
    const translateX = boundingBox.x - (scaledWidth - boundingBox.width) / 2;
    const translateY = boundingBox.y - (scaledHeight - boundingBox.height) / 2;

    return {
      scaleX: finalScaleX,
      scaleY: finalScaleY,
      translateX,
      translateY
    };
  }

  private applyFeathering(boundingBox: DetectedFace['boundingBox'], amount: number): void {
    // Create a radial gradient for soft edges
    const centerX = boundingBox.x + boundingBox.width / 2;
    const centerY = boundingBox.y + boundingBox.height / 2;
    const radius = Math.max(boundingBox.width, boundingBox.height) / 2;
    
    const gradient = this.ctx.createRadialGradient(
      centerX, centerY, radius * (1 - amount),
      centerX, centerY, radius
    );
    
    gradient.addColorStop(0, 'rgba(255,255,255,1)');
    gradient.addColorStop(1, 'rgba(255,255,255,0)');
    
    this.ctx.globalCompositeOperation = 'destination-in';
    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(
      boundingBox.x - radius,
      boundingBox.y - radius,
      boundingBox.width + radius * 2,
      boundingBox.height + radius * 2
    );
    this.ctx.globalCompositeOperation = 'source-over';
  }

  private getBlendMode(mode: FaceSwapConfig['blendMode']): GlobalCompositeOperation {
    const blendModes: Record<FaceSwapConfig['blendMode'], GlobalCompositeOperation> = {
      'normal': 'source-over',
      'overlay': 'overlay',
      'multiply': 'multiply'
    };
    return blendModes[mode] || 'source-over';
  }

  private getBlendOpacity(quality: FaceSwapConfig['quality']): number {
    const opacityMap: Record<FaceSwapConfig['quality'], number> = {
      'low': 0.8,
      'medium': 0.9,
      'high': 0.95
    };
    return opacityMap[quality] || 0.9;
  }

  private async applyColorMatching(boundingBox: DetectedFace['boundingBox']): Promise<void> {
    try {
      // Get source face region colors for basic color matching
      const imageData = this.ctx.getImageData(
        boundingBox.x, 
        boundingBox.y, 
        boundingBox.width, 
        boundingBox.height
      );

      // Apply simple color correction
      this.ctx.filter = 'contrast(1.05) brightness(1.02) saturate(0.95)';
      this.ctx.putImageData(imageData, boundingBox.x, boundingBox.y);
      this.ctx.filter = 'none';
    } catch (error) {
      console.warn('Color matching failed:', error);
    }
  }

  private async loadImage(src: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = src;
    });
  }

  // Utility methods
  getCanvas(): HTMLCanvasElement {
    return this.canvas;
  }

  isReady(): boolean {
    return this.isInitialized;
  }

  dispose(): void {
    if (this.swapModel) {
      this.swapModel.dispose();
      this.swapModel = null;
    }
    this.isInitialized = false;
    console.log('🧹 Face swap service disposed');
  }
}
