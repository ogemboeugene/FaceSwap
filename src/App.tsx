import { useState, useRef, useCallback, useEffect } from 'react';
import { Camera, Upload, Download, Zap, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { useFaceSwap } from './hooks/useFaceSwap';

function App() {
  const [mode, setMode] = useState<'camera' | 'upload'>('camera');
  const [result, setResult] = useState<string | null>(null);
  const [imageLoaded, setImageLoaded] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  // Use the face swap hook
  const {
    isInitialized,
    isProcessing,
    detectedFaces,
    matchedFace,
    error,
    initProgress,
    initialize,
    processImage,
    cleanup,
    clearError
  } = useFaceSwap();  // Initialize camera
  const startCamera = useCallback(async () => {
    try {
      // Start initialization when user activates camera
      if (!isInitialized) {
        console.log('Starting initialization from camera...');
        await initialize(); // Wait for initialization
      }

      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { width: 640, height: 480 } 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error('Camera access failed:', err);
    }
  }, [isInitialized, initialize]);  // Handle image upload
  const handleImageUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Start initialization when user uploads an image
    if (!isInitialized) {
      console.log('Starting initialization from image upload...');
      await initialize(); // Wait for initialization
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        // Draw image to canvas for processing
        const canvas = canvasRef.current;
        if (canvas) {
          const ctx = canvas.getContext('2d');
          if (ctx) {
            canvas.width = img.width;
            canvas.height = img.height;
            ctx.drawImage(img, 0, 0);
            setImageLoaded(true); // Mark image as loaded
          }
        }
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  }, [isInitialized, initialize]);  // Apply face swap using real ML services
  const applyFaceSwap = useCallback(async () => {
    console.log('🎬 Apply Face Swap button clicked');
    console.log('Current state:', { mode, isInitialized, imageLoaded, hasVideo: !!videoRef.current?.srcObject });
    
    // Ensure services are initialized
    if (!isInitialized) {
      console.log('Services not initialized, starting initialization...');
      const initialized = await initialize();
      if (!initialized) {
        console.error('Failed to initialize services');
        return;
      }
    }

    if (!canvasRef.current) {
      console.error('Canvas not available');
      return;
    }

    let inputElement: HTMLVideoElement | HTMLImageElement | HTMLCanvasElement;

    if (mode === 'camera' && videoRef.current?.srcObject) {
      console.log('Using camera input');
      inputElement = videoRef.current;
    } else if (mode === 'upload' && imageLoaded) {
      console.log('Using uploaded image from canvas');
      inputElement = canvasRef.current;
    } else {
      console.error('No valid input element available:', { mode, imageLoaded, hasVideo: !!videoRef.current?.srcObject });
      return;
    }

    try {
      console.log('🚀 Starting face swap process...');
      const result = await processImage(inputElement, canvasRef.current);
      
      if (result.success && result.imageData) {
        setResult(result.imageData);
        console.log(`✅ Face swap completed successfully in ${result.processingTime}ms`);
      } else {
        console.error('❌ Face swap failed:', result.error);
      }
    } catch (err) {
      console.error('❌ Face swap process failed:', err);
    }
  }, [mode, isInitialized, imageLoaded, initialize, processImage]);
  // Download result
  const downloadResult = useCallback(() => {
    if (result && canvasRef.current) {
      const link = document.createElement('a');
      link.download = 'face-swap-result.png';
      link.href = canvasRef.current.toDataURL();
      link.click();
    }
  }, [result]);

  // Reset state when switching modes
  const switchMode = useCallback((newMode: 'camera' | 'upload') => {
    setMode(newMode);
    setResult(null);
    setImageLoaded(false);
    clearError();
    
    // Clear canvas when switching modes
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      }
    }
  }, [clearError]);

  // Initialize camera when switching to camera mode
  useEffect(() => {
    if (mode === 'camera') {
      startCamera();
    }
  }, [mode, startCamera]);

  // Cleanup on unmount only
  useEffect(() => {
    return () => {
      cleanup();
    };
  }, [cleanup]);

  const faceDetected = detectedFaces.length > 0;

  return (
    <div className="app-container">
      <header className="app-header">
        <h1 className="app-title">AI Face Swap</h1>
        <p className="app-subtitle">
          Automatic face detection and intelligent swapping
        </p>
      </header>

      <main className="app-main">        {/* Mode Selection */}
        <div className="mode-selector">
          <button
            className={`btn mode-btn ${mode === 'camera' ? 'active' : ''}`}
            onClick={() => switchMode('camera')}
          >
            <Camera size={20} />
            Live Camera
          </button>
          <button
            className={`btn mode-btn ${mode === 'upload' ? 'active' : ''}`}
            onClick={() => switchMode('upload')}
          >
            <Upload size={20} />
            Upload Image
          </button>
        </div>

        {/* Main Content Area */}
        <div className="content-grid">
          {/* Input Section */}
          <div className="input-section">
            <div className="card">
              <div className="card-header">
                <h3>{mode === 'camera' ? 'Live Camera Feed' : 'Upload Your Image'}</h3>
              </div>
              <div className="card-content">
                {mode === 'camera' ? (
                  <div className="camera-container">
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      className="camera-feed"
                    />
                    {faceDetected && (
                      <div className="face-overlay">
                        <div className="face-badge">
                          <CheckCircle size={16} />
                          Face Detected
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="upload-area">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="file-input"
                    />
                    <div 
                      className="upload-zone"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Upload size={48} />
                      <p>Click to upload an image</p>
                      <span>Supports JPG, PNG, WebP</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>          {/* Process Section */}
          <div className="process-section">
            <div className="card">
              <div className="card-header">
                <h3>AI Processing</h3>
                {!isInitialized && initProgress && (
                  <div className="init-status">
                    <Loader2 size={16} className="animate-spin" />
                    <span>{initProgress}</span>
                  </div>
                )}
              </div>              <div className="card-content">
                {!isInitialized && !initProgress && (
                  <div className="process-placeholder">
                    <Zap size={48} />
                    <p>Ready for face swapping</p>
                    <span>Upload an image or use camera to start</span>
                  </div>
                )}

                {!isInitialized && initProgress && (
                  <div className="process-placeholder">
                    <Loader2 size={48} className="animate-spin" />
                    <p>Initializing AI services...</p>
                    <span>{initProgress || 'Loading machine learning models...'}</span>
                  </div>
                )}

                {isInitialized && !isProcessing && !faceDetected && (
                  <div className="process-placeholder">
                    <Zap size={48} />
                    <p>Ready to detect and swap faces</p>
                    <span>AI will automatically find the best match</span>
                  </div>
                )}

                {isProcessing && (
                  <div className="processing-state">
                    <div className="loading-spinner"></div>
                    <h4>Processing...</h4>
                    <div className="processing-steps">
                      <div className="step active">
                        <div className="step-indicator"></div>
                        <span>Detecting face</span>
                      </div>
                      <div className={`step ${faceDetected ? 'active' : ''}`}>
                        <div className="step-indicator"></div>
                        <span>Finding match</span>
                      </div>
                      <div className={`step ${matchedFace ? 'active' : ''}`}>
                        <div className="step-indicator"></div>
                        <span>Applying swap</span>
                      </div>
                    </div>
                  </div>
                )}

                {faceDetected && matchedFace && !isProcessing && (
                  <div className="match-info">
                    <div className="matched-face">
                      <img 
                        src={matchedFace.thumbnailPath} 
                        alt={`Matched face: ${matchedFace.name}`}
                        className="matched-face-img"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = `/faces/${matchedFace.id}/thumb.svg`;
                        }}
                      />
                      <div className="match-details">
                        <h4>Best Match Found</h4>
                        <p>{matchedFace.name}</p>
                        <div className="confidence-score">
                          {detectedFaces[0]?.confidence 
                            ? `${Math.round(detectedFaces[0].confidence * 100)}% confidence`
                            : '95% confidence'
                          }
                        </div>
                      </div>
                    </div>
                  </div>
                )}                <div className="action-buttons">
                  <button
                    className="btn btn-primary"
                    onClick={applyFaceSwap}
                    disabled={isProcessing || (mode === 'upload' && !imageLoaded) || (mode === 'camera' && !videoRef.current?.srcObject)}
                  >
                    {isProcessing ? (
                      <>
                        <div className="btn-spinner"></div>
                        Processing...
                      </>
                    ) : !isInitialized ? (
                      <>
                        <Zap size={16} />
                        Initialize & Apply Face Swap
                      </>
                    ) : (
                      <>
                        <Zap size={16} />
                        Apply Face Swap
                      </>
                    )}
                  </button>

                  {result && (
                    <button
                      className="btn btn-secondary"
                      onClick={downloadResult}
                    >
                      <Download size={16} />
                      Download Result
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Result Section */}
          <div className="result-section">
            <div className="card">
              <div className="card-header">
                <h3>Result</h3>
              </div>
              <div className="card-content">
                {result ? (
                  <div className="result-container">
                    <canvas
                      ref={canvasRef}
                      className="result-canvas"
                    />
                    <div className="result-overlay">
                      <div className="success-badge">
                        <CheckCircle size={16} />
                        Face swap completed!
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="result-placeholder">
                    <div className="placeholder-icon">🎭</div>
                    <p>Your face swap result will appear here</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="error-card">
            <div className="error-content">
              <AlertCircle size={20} />
              <span>{error}</span>              <button
                className="error-close"
                onClick={() => clearError()}
              >
                ×
              </button>
            </div>
          </div>
        )}        {/* Status Bar */}
        <div className="status-bar">
          <div className="status-item">
            <div className={`status-indicator ${mode === 'camera' ? 'online' : 'offline'}`}></div>
            <span>Camera: {mode === 'camera' ? 'Active' : 'Inactive'}</span>
          </div>
          <div className="status-item">
            <div className={`status-indicator ${isInitialized ? 'online' : 'offline'}`}></div>
            <span>AI Services: {isInitialized ? 'Ready' : 'Loading'}</span>
          </div>
          <div className="status-item">
            <div className={`status-indicator ${faceDetected ? 'online' : 'offline'}`}></div>
            <span>Face Detection: {faceDetected ? `${detectedFaces.length} face(s)` : 'Waiting'}</span>
          </div>
          <div className="status-item">
            <div className={`status-indicator ${isProcessing ? 'processing' : 'offline'}`}></div>
            <span>AI Processing: {isProcessing ? 'Running' : 'Ready'}</span>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;