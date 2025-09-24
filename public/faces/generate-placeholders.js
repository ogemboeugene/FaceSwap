// Simple script to create placeholder face images for development
// This will create colored squares as placeholder face images

const canvas = document.createElement('canvas');
canvas.width = 512;
canvas.height = 512;
const ctx = canvas.getContext('2d');

const faces = [
  { id: 'einstein', color: '#8B4513', name: 'Einstein' },
  { id: 'obama', color: '#1E3A8A', name: 'Obama' },
  { id: 'mona-lisa', color: '#DC2626', name: 'Mona Lisa' }
];

faces.forEach(face => {
  // Clear canvas
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, 512, 512);
  
  // Draw colored background
  ctx.fillStyle = face.color;
  ctx.fillRect(50, 50, 412, 412);
  
  // Add face-like shapes
  // Head outline
  ctx.fillStyle = '#F4D1AE';
  ctx.beginPath();
  ctx.ellipse(256, 280, 120, 150, 0, 0, 2 * Math.PI);
  ctx.fill();
  
  // Eyes
  ctx.fillStyle = '#2D3748';
  ctx.beginPath();
  ctx.ellipse(220, 240, 15, 20, 0, 0, 2 * Math.PI);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(292, 240, 15, 20, 0, 0, 2 * Math.PI);
  ctx.fill();
  
  // Nose
  ctx.fillStyle = '#E2B794';
  ctx.beginPath();
  ctx.ellipse(256, 280, 8, 15, 0, 0, 2 * Math.PI);
  ctx.fill();
  
  // Mouth
  ctx.fillStyle = '#A0522D';
  ctx.beginPath();
  ctx.ellipse(256, 320, 25, 10, 0, 0, Math.PI);
  ctx.fill();
  
  // Add text label
  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 24px Arial';
  ctx.textAlign = 'center';
  ctx.fillText(face.name, 256, 450);
  
  // Convert to blob and download
  canvas.toBlob(blob => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${face.id}-face.jpg`;
    a.click();
    URL.revokeObjectURL(url);
  }, 'image/jpeg', 0.9);
  
  // Create thumbnail version
  const thumbCanvas = document.createElement('canvas');
  thumbCanvas.width = 128;
  thumbCanvas.height = 128;
  const thumbCtx = thumbCanvas.getContext('2d');
  thumbCtx.drawImage(canvas, 0, 0, 512, 512, 0, 0, 128, 128);
  
  thumbCanvas.toBlob(blob => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${face.id}-thumb.jpg`;
    a.click();
    URL.revokeObjectURL(url);
  }, 'image/jpeg', 0.9);
});

console.log('Placeholder face images generated!');
