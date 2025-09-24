import { useEffect, useState, useCallback } from 'react';
import { AlertCircle } from 'lucide-react';
import CameraFeed from './components/Camera/CameraFeed';
import FaceGallery from './components/FaceGallery/FaceGallery';
import { useFaceSwapStore, useModelStore } from './contexts/store';
import { FaceDetectionService } from './services/faceDetection';
// import { FaceSwapService } from './services/faceSwap';

function App() {
  const { 
    currentTargetFace, 
    detectedFaces, 
    setDetectedFaces, 
    isProcessing, 
    setIsProcessing, 
    config,
    error,
    setError 
  } = useFaceSwapStore();
  
  const { 
    faceDetection, 
    isLoading, 
    setIsLoading, 
    setFaceDetectionLoaded,
    error: modelError,
    setError: setModelError 
  } = useModelStore();

  const [faceDetectionService] = useState(() => FaceDetectionService.getInstance());
  // const [faceSwapService] = useState(() => FaceSwapService.getInstance());
  const [swappedCanvas] = useState<HTMLCanvasElement | null>(null);

  // Initialize ML models
  useEffect(() => {
    const initializeModels = async () => {
      setIsLoading(true);
      setModelError(null);
      
      try {
        await faceDetectionService.initialize();
        setFaceDetectionLoaded(true);
        console.log('Face detection models loaded successfully');
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to load models';
        setModelError(errorMessage);
        console.error('Model initialization error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeModels();
  }, [faceDetectionService, setIsLoading, setFaceDetectionLoaded, setModelError]);

  // Handle frame processing from camera
  const handleFrameCapture = useCallback(async (imageData: ImageData) => {
    if (!faceDetection || isProcessing || !currentTargetFace) return;

    try {
      setIsProcessing(true);
      
      // Create a temporary canvas to convert ImageData to HTMLImageElement
      const tempCanvas = document.createElement('canvas');
      const ctx = tempCanvas.getContext('2d');
      
      if (!ctx) return;
      
      tempCanvas.width = imageData.width;
      tempCanvas.height = imageData.height;
      ctx.putImageData(imageData, 0, 0);
      
      // Create image element from canvas
      const img = new Image();
      img.onload = async () => {
        try {
          // Detect faces
          const faces = await faceDetectionService.detectFaces(img);
          setDetectedFaces(faces);
          
          // Perform face swap if faces are detected
          if (faces.length > 0 && config.realTimeMode) {
            // const result = await faceSwapService.swapMultipleFaces(
            //   img,
            //   faces,
            //   currentTargetFace,
            //   config
            // );
            
            // if (result.success && result.imageData) {
            //   // Update the canvas with swapped result
            //   const canvas = faceSwapService.getCanvas();
            //   setSwappedCanvas(canvas);
            // }
          }
        } catch (error) {
          console.error('Face processing error:', error);
          setError(error instanceof Error ? error.message : 'Face processing failed');
        } finally {
          setIsProcessing(false);
        }
      };
      
      img.src = tempCanvas.toDataURL();
    } catch (error) {
      console.error('Frame capture error:', error);
      setError(error instanceof Error ? error.message : 'Frame processing failed');
      setIsProcessing(false);
    }
  }, [
    faceDetection, 
    isProcessing, 
    currentTargetFace, 
    config, 
    faceDetectionService, 
    // faceSwapService, 
    setDetectedFaces, 
    setIsProcessing, 
    setError
  ]);

  if (isLoading) {
    return (
      <div className="app-container flex items-center justify-center">
        <div className="text-center">
          <div className="spinner mx-auto mb-4 w-12 h-12"></div>
          <h2 className="text-xl font-semibold text-white mb-2">
            Loading Face Swap Models
          </h2>
          <p className="text-gray-400">
            This may take a few moments...
          </p>
        </div>
      </div>
    );
  }

  if (modelError) {
    return (
      <div className="app-container flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <AlertCircle className="w-16 h-16 text-error mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-white mb-2">
            Failed to Load Models
          </h2>
          <p className="text-gray-400 mb-4">
            {modelError}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="btn btn-primary"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="app-container">
      {/* Header */}
      <header className="header">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-primary mb-2">
                🎭 AI Face Swap
              </h1>
              <p className="text-gray-400 text-base">
                Real-time face swapping with expression mapping
              </p>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Status indicators */}
              <div className={`status-badge ${faceDetection ? 'success' : 'error'}`}>
                <div className={`status-indicator ${faceDetection ? 'online' : 'offline'}`} />
                <span>
                  {faceDetection ? 'Models Ready' : 'Loading Models'}
                </span>
              </div>
              
              {detectedFaces.length > 0 && (
                <div className="status-badge success">
                  <span>{detectedFaces.length} face{detectedFaces.length !== 1 ? 's' : ''} detected</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="main-content">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Camera Feed */}
          <div className="lg:col-span-2">
            <div className="glass-card p-6">
              <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
                📹 Camera Feed
                {isProcessing && (
                  <div className="ml-3 flex items-center text-primary">
                    <div className="spinner mr-2"></div>
                    Processing<span className="loading-dots"></span>
                  </div>
                )}
              </h2>
              
              <div className="relative">
                <div className="camera-container">
                  <CameraFeed
                    onFrameCapture={handleFrameCapture}
                    className="w-full h-full"
                  />
                </div>
                
                {/* Swapped result overlay */}
                {swappedCanvas && currentTargetFace && config.realTimeMode && (
                  <div className="absolute top-4 right-4 w-1/3 h-1/3 border-2 border-primary rounded-lg overflow-hidden shadow-lg bg-gray-800/80 backdrop-blur-sm">
                    <div className="absolute -top-8 left-0 bg-primary text-white text-xs font-medium px-3 py-1 rounded-full">
                      Swapped Result
                    </div>
                    <canvas
                      ref={(canvas) => {
                        if (canvas && swappedCanvas) {
                          const ctx = canvas.getContext('2d');
                          if (ctx) {
                            canvas.width = swappedCanvas.width / 3;
                            canvas.height = swappedCanvas.height / 3;
                            ctx.drawImage(
                              swappedCanvas, 
                              0, 0, 
                              canvas.width, 
                              canvas.height
                            );
                          }
                        }
                      }}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                
                {/* Face detection overlays */}
                {detectedFaces.map((face) => (
                  <div
                    key={face.id}
                    className="face-detection-overlay"
                    style={{
                      left: `${(face.boundingBox.x / 640) * 100}%`,
                      top: `${(face.boundingBox.y / 480) * 100}%`,
                      width: `${(face.boundingBox.width / 640) * 100}%`,
                      height: `${(face.boundingBox.height / 480) * 100}%`,
                    }}
                  >
                    <div className="face-label">
                      {face.expression?.type || 'neutral'} ({Math.round((face.confidence || 0) * 100)}%)
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Current Target Face */}
              {currentTargetFace && (
                <div className="mt-6 card">
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 rounded-lg overflow-hidden border-2 border-primary">
                      <img
                        src={currentTargetFace.thumbnailUrl}
                        alt={currentTargetFace.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <p className="text-lg font-semibold text-white">
                        🎯 Swapping with: {currentTargetFace.name}
                      </p>
                      <p className="text-gray-400">
                        Real-time mode: <span className={`font-medium ${config.realTimeMode ? 'text-success' : 'text-error'}`}>
                          {config.realTimeMode ? 'ON' : 'OFF'}
                        </span>
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Face Gallery */}
          <div className="lg:col-span-1">
            <div className="glass-card">
              <FaceGallery />
            </div>
          </div>
        </div>
        
        {/* Error Display */}
        {error && (
          <div className="mt-8 error-card animate-fade-in">
            <div className="flex items-center">
              <AlertCircle className="error-icon mr-3" />
              <p className="text-error text-base font-medium flex-1">{error}</p>
              <button
                onClick={() => setError(null)}
                className="ml-4 text-error hover:text-red-600 text-xl font-bold transition-colors"
              >
                ×
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
