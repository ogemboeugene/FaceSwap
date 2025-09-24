import { useState, useEffect, useRef, useCallback } from 'react';
import type { CameraConfig, VideoStreamState } from '../types/index';

const defaultConfig: CameraConfig = {
  width: 640,
  height: 480,
  fps: 30,
  facingMode: 'user',
};

export const useCamera = (config: Partial<CameraConfig> = {}) => {
  const [videoState, setVideoState] = useState<VideoStreamState>({
    stream: null,
    isActive: false,
    error: null,
  });
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const finalConfig = { ...defaultConfig, ...config };

  const startCamera = useCallback(async () => {
    try {
      setVideoState(prev => ({ ...prev, error: null }));
      
      const constraints: MediaStreamConstraints = {
        video: {
          width: { ideal: finalConfig.width },
          height: { ideal: finalConfig.height },
          frameRate: { ideal: finalConfig.fps },
          facingMode: finalConfig.facingMode,
        },
        audio: false,
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      
      setVideoState({
        stream,
        isActive: true,
        error: null,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Camera access failed';
      setVideoState(prev => ({
        ...prev,
        error: errorMessage,
        isActive: false,
      }));
    }
  }, [finalConfig]);

  const stopCamera = useCallback(() => {
    if (videoState.stream) {
      videoState.stream.getTracks().forEach(track => track.stop());
      
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
    }
    
    setVideoState({
      stream: null,
      isActive: false,
      error: null,
    });
  }, [videoState.stream]);
  const switchCamera = useCallback(async () => {
    // const newFacingMode = finalConfig.facingMode === 'user' ? 'environment' : 'user';
    stopCamera();
    
    // Wait a bit before starting new camera
    setTimeout(() => {
      startCamera();
    }, 100);
  }, [finalConfig.facingMode, stopCamera, startCamera]);

  const captureFrame = useCallback((): ImageData | null => {
    if (!videoRef.current) return null;
    
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    if (!ctx) return null;
    
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    
    ctx.drawImage(videoRef.current, 0, 0);
    
    return ctx.getImageData(0, 0, canvas.width, canvas.height);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (videoState.stream) {
        videoState.stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [videoState.stream]);

  // Check camera permission
  useEffect(() => {
    const checkPermissions = async () => {
      try {
        const result = await navigator.permissions.query({ name: 'camera' as PermissionName });
        if (result.state === 'denied') {
          setVideoState(prev => ({
            ...prev,
            error: 'Camera permission denied. Please allow camera access.',
          }));
        }
      } catch (error) {
        // Permission API not supported, continue normally
      }
    };
    
    checkPermissions();
  }, []);

  return {
    videoRef,
    videoState,
    startCamera,
    stopCamera,
    switchCamera,
    captureFrame,
    isSupported: 'mediaDevices' in navigator && 'getUserMedia' in navigator.mediaDevices,
  };
};
