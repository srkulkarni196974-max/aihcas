'use client';
import { useEffect, useRef } from 'react';

interface ImageSnippetProps {
  imageSrc: string;
  boundingBox: number[]; // [ymin, xmin, ymax, xmax] (0 to 1000 scale)
  altTextText: string;
}

export default function ImageSnippet({ imageSrc, boundingBox, altTextText }: ImageSnippetProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!imageSrc || !boundingBox || boundingBox.length !== 4) return;

    const img = new Image();
    img.src = imageSrc;
    img.onload = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const [ymin, xmin, ymax, xmax] = boundingBox;
      
      // Convert normalized coordinates (0-1000) to actual pixel values
      const x = (xmin / 1000) * img.width;
      const y = (ymin / 1000) * img.height;
      const w = ((xmax - xmin) / 1000) * img.width;
      const h = ((ymax - ymin) / 1000) * img.height;

      // Avoid zero-width/height issues
      if (w <= 0 || h <= 0) return;

      // Set canvas size to match the cropped row snippet dimensions
      canvas.width = w;
      canvas.height = h;

      // Draw the cropped segment onto the canvas
      ctx.drawImage(img, x, y, w, h, 0, 0, w, h);
    };
  }, [imageSrc, boundingBox]);

  return (
    <div style={{ marginTop: '8px', border: '1.5px solid rgba(226, 232, 240, 0.8)', borderRadius: '8px', overflow: 'hidden', maxWidth: '100%', background: '#F8FAFC', padding: '6px' }}>
      <div style={{ fontSize: '0.62rem', color: 'var(--text-light)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px', textAlign: 'left', display: 'flex', alignItems: 'center', gap: 4 }}>
        <span>📸 Verification Crop snippet</span>
      </div>
      <canvas ref={canvasRef} style={{ width: '100%', height: 'auto', display: 'block', maxHeight: '70px', objectFit: 'contain', background: '#FFFFFF', borderRadius: '4px' }} title={altTextText} />
    </div>
  );
}
