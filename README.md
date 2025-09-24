# AI Face Swap Application

A real-time face swap web application built with React, TypeScript, and machine learning libraries. This app detects faces in real-time camera feed and swaps them with pre-loaded celebrity faces or user-uploaded images while preserving facial expressions.

## 🚀 Features

- **Real-time Face Detection**: Uses MediaPipe and face-api.js for accurate face detection
- **Expression Mapping**: Preserves user's facial expressions on target faces
- **Celebrity Face Database**: Pre-loaded collection of famous faces with multiple expressions
- **Custom Face Upload**: Users can upload their own target faces
- **Real-time Processing**: 30fps face swapping with optimized performance
- **Photo/Video Capture**: Save swapped results as images
- **Responsive Design**: Works on desktop and mobile devices
- **Dark Mode Support**: Modern UI with light/dark theme support

## 🛠 Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS
- **ML Libraries**: 
  - TensorFlow.js for neural network operations
  - MediaPipe for face mesh detection
  - face-api.js for face recognition and expression analysis
- **State Management**: Zustand
- **Camera**: WebRTC API for video capture
- **Icons**: Lucide React

## 📋 Prerequisites

- Node.js 18+ and npm
- Modern web browser with camera support
- Camera/webcam for real-time face detection

## 🚀 Quick Start

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Start development server**:
   ```bash
   npm run dev
   ```

3. **Open in browser**:
   Navigate to `http://localhost:5173`

## 🎯 Usage

1. **Grant Camera Permission**: Allow the app to access your camera
2. **Select Target Face**: Choose from the celebrity gallery or upload your own
3. **Start Face Swap**: The app will detect your face and swap it in real-time
4. **Capture Results**: Take photos of the swapped faces
5. **Adjust Settings**: Modify quality, blend modes, and other preferences

## 🏗 Project Structure

```
src/
├── components/
│   ├── Camera/          # Camera feed and controls
│   ├── FaceSwap/        # Face swapping logic
│   ├── FaceGallery/     # Target face selection
│   ├── Controls/        # App settings and controls
│   └── UI/              # Reusable UI components
├── hooks/               # Custom React hooks
├── services/            # ML model services
├── utils/               # Helper functions
├── types/               # TypeScript definitions
└── contexts/            # State management
```

## ⚠ Important Notes

- **Privacy**: All processing is done locally in the browser
- **Performance**: Requires a modern device with good GPU support
- **Camera Access**: HTTPS required for camera access in production
- **Model Files**: ML models will be loaded from CDN on first use

## 🚀 Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```
