import React, { useEffect, useRef, useState } from 'react';
import { Camera, CameraOff, RotateCcw, Download } from 'lucide-react';
import { useCamera } from '../../hooks/useCamera';
import { useFaceSwapStore } from '../../contexts/store';

interface CameraFeedProps {
  onFrameCapture?: (imageData: ImageData) => void;
  className?: string;
}

export const CameraFeed: React.FC<CameraFeedProps> = ({ 
  onFrameCapture, 
  className = '' 
}) => {
  const { videoRef, videoState, startCamera, stopCamera, switchCamera, captureFrame, isSupported } = useCamera();
  const { isProcessing } = useFaceSwapStore();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isCapturing, setIsCapturing] = useState(false);

  useEffect(() => {
    if (videoState.isActive && onFrameCapture) {
      const interval = setInterval(() => {
        const frame = captureFrame();
        if (frame) {
          onFrameCapture(frame);
        }
      }, 33); // ~30fps

      return () => clearInterval(interval);
    }
  }, [videoState.isActive, onFrameCapture, captureFrame]);

  const handleCapturePhoto = async () => {
    if (!videoRef.current || !canvasRef.current) return;
    
    setIsCapturing(true);
    
    try {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      
      if (ctx) {
        canvas.width = videoRef.current.videoWidth;
        canvas.height = videoRef.current.videoHeight;
        ctx.drawImage(videoRef.current, 0, 0);
        
        // Download the image
        canvas.toBlob((blob) => {
          if (blob) {
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `faceswap-${Date.now()}.png`;
            a.click();
            URL.revokeObjectURL(url);
          }
        });
      }
    } catch (error) {
      console.error('Failed to capture photo:', error);
    } finally {
      setIsCapturing(false);
    }
  };

  if (!isSupported) {
    return (
      <div className={`camera-container flex items-center justify-center bg-gray-100 ${className}`}>
        <div className="text-center p-8">
          <CameraOff className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">Camera not supported in this browser</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`camera-container relative ${className}`}>
      {/* Video Element */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="w-full h-full object-cover"
        style={{ transform: 'scaleX(-1)' }} // Mirror effect for selfie view
      />
      
      {/* Hidden canvas for photo capture */}
      <canvas ref={canvasRef} className="hidden" />
      
      {/* Overlay UI */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Processing indicator */}
        {isProcessing && (
          <div className="absolute top-4 left-4 bg-blue-600 text-white px-3 py-1 rounded-full text-sm">
            Processing...
          </div>
        )}
        
        {/* Error message */}
        {videoState.error && (
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-red-600 text-white p-4 rounded-lg max-w-sm text-center">
              <CameraOff className="w-8 h-8 mx-auto mb-2" />
              <p className="font-medium">Camera Error</p>
              <p className="text-sm mt-1">{videoState.error}</p>
              <button
                onClick={startCamera}
                className="btn-primary mt-3"
              >
                Try Again
              </button>
            </div>
          </div>
        )}
      </div>
      
      {/* Controls */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 pointer-events-auto">
        <div className="flex items-center space-x-4 bg-black bg-opacity-50 rounded-full px-6 py-3">
          {/* Start/Stop Camera */}
          {!videoState.isActive ? (
            <button
              onClick={startCamera}
              disabled={isProcessing}
              className="p-3 bg-green-600 hover:bg-green-700 text-white rounded-full transition-colors duration-200 disabled:opacity-50"
              title="Start Camera"
            >
              <Camera className="w-6 h-6" />
            </button>
          ) : (
            <button
              onClick={stopCamera}
              disabled={isProcessing}
              className="p-3 bg-red-600 hover:bg-red-700 text-white rounded-full transition-colors duration-200 disabled:opacity-50"
              title="Stop Camera"
            >
              <CameraOff className="w-6 h-6" />
            </button>
          )}
          
          {/* Switch Camera */}
          {videoState.isActive && (
            <button
              onClick={switchCamera}
              disabled={isProcessing}
              className="p-3 bg-gray-600 hover:bg-gray-700 text-white rounded-full transition-colors duration-200 disabled:opacity-50"
              title="Switch Camera"
            >
              <RotateCcw className="w-6 h-6" />
            </button>
          )}
          
          {/* Capture Photo */}
          {videoState.isActive && (
            <button
              onClick={handleCapturePhoto}
              disabled={isProcessing || isCapturing}
              className="p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-full transition-colors duration-200 disabled:opacity-50"
              title="Capture Photo"
            >
              <Download className="w-6 h-6" />
            </button>
          )}
        </div>
      </div>
      
      {/* Face detection overlay (will be added by parent component) */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Face bounding boxes will be rendered here */}
      </div>
    </div>
  );
};

export default CameraFeed;
