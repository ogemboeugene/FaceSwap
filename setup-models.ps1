#!/usr/bin/env pwsh

Write-Host "Setting up Face Swap Models..." -ForegroundColor Green

# Create model directories
$modelDirs = @(
    "public/models/face-api",
    "public/models/mediapipe", 
    "public/models/tensorflow",
    "public/models/faceswap"
)

foreach ($dir in $modelDirs) {
    New-Item -ItemType Directory -Force -Path $dir
    Write-Host "Created directory: $dir" -ForegroundColor Yellow
}

# Download face-api.js models
Write-Host "Downloading face-api.js models..." -ForegroundColor Cyan

$faceApiModels = @{
    "tiny_face_detector_model-weights_manifest.json" = "https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights/tiny_face_detector_model-weights_manifest.json"
    "tiny_face_detector_model-shard1" = "https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights/tiny_face_detector_model-shard1"
    "face_landmark_68_model-weights_manifest.json" = "https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights/face_landmark_68_model-weights_manifest.json"
    "face_landmark_68_model-shard1" = "https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights/face_landmark_68_model-shard1"
    "face_expression_model-weights_manifest.json" = "https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights/face_expression_model-weights_manifest.json"
    "face_expression_model-shard1" = "https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights/face_expression_model-shard1"
    "face_recognition_model-weights_manifest.json" = "https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights/face_recognition_model-weights_manifest.json"
    "face_recognition_model-shard1" = "https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights/face_recognition_model-shard1"
    "face_recognition_model-shard2" = "https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights/face_recognition_model-shard2"
}

foreach ($model in $faceApiModels.GetEnumerator()) {
    try {
        Invoke-WebRequest -Uri $model.Value -OutFile "public/models/face-api/$($model.Key)"
        Write-Host "Downloaded: $($model.Key)" -ForegroundColor Green
    }
    catch {
        Write-Host "Failed to download: $($model.Key)" -ForegroundColor Red
    }
}

# Download MediaPipe models
Write-Host "Downloading MediaPipe models..." -ForegroundColor Cyan

$mediaPipeModels = @{
    "blaze_face_short_range.tflite" = "https://storage.googleapis.com/mediapipe-models/face_detector/blaze_face_short_range/float16/1/blaze_face_short_range.tflite"
    "face_landmarker.task" = "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task"
}

foreach ($model in $mediaPipeModels.GetEnumerator()) {
    try {
        Invoke-WebRequest -Uri $model.Value -OutFile "public/models/mediapipe/$($model.Key)"
        Write-Host "Downloaded: $($model.Key)" -ForegroundColor Green
    }
    catch {
        Write-Host "Failed to download: $($model.Key)" -ForegroundColor Red
    }
}

# Clone and setup SimSwap (lightweight face swap model)
Write-Host "Setting up SimSwap models..." -ForegroundColor Cyan

if (Get-Command git -ErrorAction SilentlyContinue) {
    try {
        git clone --depth 1 https://github.com/neuralchen/SimSwap.git temp_simswap
        
        # Copy SimSwap models if they exist
        if (Test-Path "temp_simswap/parsing_model") {
            Copy-Item "temp_simswap/parsing_model/*" "public/models/faceswap/" -Recurse -Force
            Write-Host "Copied SimSwap parsing models" -ForegroundColor Green
        }
        
        if (Test-Path "temp_simswap/checkpoints") {
            Copy-Item "temp_simswap/checkpoints/*" "public/models/faceswap/" -Recurse -Force  
            Write-Host "Copied SimSwap checkpoint models" -ForegroundColor Green
        }
        
        # Clean up
        Remove-Item -Recurse -Force temp_simswap
    }
    catch {
        Write-Host "Failed to clone SimSwap repository" -ForegroundColor Red
    }
} else {
    Write-Host "Git not found. Please install Git to download SimSwap models." -ForegroundColor Yellow
}

# Download TensorFlow.js face models
Write-Host "Downloading TensorFlow.js models..." -ForegroundColor Cyan

$tfModels = @{
    "face_landmarks_model.json" = "https://tfhub.dev/mediapipe/tfjs-model/facemesh/1/default/1/model.json?tfjs-format=file"
    "group1-shard1of1.bin" = "https://tfhub.dev/mediapipe/tfjs-model/facemesh/1/default/1/group1-shard1of1.bin?tfjs-format=file"
}

foreach ($model in $tfModels.GetEnumerator()) {
    try {
        Invoke-WebRequest -Uri $model.Value -OutFile "public/models/tensorflow/$($model.Key)"
        Write-Host "Downloaded: $($model.Key)" -ForegroundColor Green
    }
    catch {
        Write-Host "Failed to download: $($model.Key)" -ForegroundColor Red
    }
}

Write-Host "`nModel setup complete!" -ForegroundColor Green
Write-Host "Models are available in the public/models/ directory" -ForegroundColor Yellow

# Install additional npm packages if needed
Write-Host "Installing additional npm packages..." -ForegroundColor Cyan
npm install @mediapipe/face_mesh @mediapipe/camera_utils @mediapipe/drawing_utils

Write-Host "`nSetup completed successfully!" -ForegroundColor Green
Write-Host "You can now run 'npm run dev' to start the application" -ForegroundColor Yellow
