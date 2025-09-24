<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

# Face Swap Application Instructions

This is a React TypeScript face swap web application that uses machine learning for real-time face detection and swapping.

## Project Architecture

- **Frontend**: React 18 with TypeScript and Vite
- **Styling**: Tailwind CSS for responsive, modern UI
- **ML Libraries**: TensorFlow.js, MediaPipe, face-api.js for face detection and processing
- **State Management**: Zustand for lightweight state management
- **Camera**: WebRTC for real-time video capture

## Key Features

1. Real-time camera feed with face detection
2. Expression recognition and mapping
3. Face swapping with pre-loaded celebrity faces
4. User face upload functionality
5. Photo/video capture of results
6. Responsive design for desktop and mobile

## Development Guidelines

- Use TypeScript for all components and services
- Implement proper error handling for camera access and ML model loading
- Optimize for performance (target 30fps for real-time processing)
- Follow React best practices with hooks and functional components
- Use Tailwind utility classes for styling
- Implement proper loading states and user feedback
- Ensure accessibility compliance
- Handle edge cases (no face detected, multiple faces, poor lighting)

## File Structure

- `src/components/`: React components organized by feature
- `src/services/`: ML model services and API integrations
- `src/hooks/`: Custom React hooks for camera, face detection, etc.
- `src/utils/`: Helper functions and utilities
- `src/types/`: TypeScript type definitions
- `src/contexts/`: React context providers
- `public/models/`: Pre-trained ML models
- `public/faces/`: Default face database

## Performance Considerations

- Lazy load ML models and heavy components
- Use Web Workers for intensive computations when possible
- Implement frame skipping for better performance
- Cache processed face data to reduce computation
- Provide quality/performance toggles for users

When generating code, prioritize:
1. Type safety with comprehensive TypeScript definitions
2. Performance optimization for real-time processing
3. User experience with proper loading states and error handling
4. Modular, reusable components
5. Accessibility and responsive design
