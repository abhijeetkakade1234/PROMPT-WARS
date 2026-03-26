"use client";
import React, { useEffect, useRef } from 'react';

export default function Starfield() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let w = canvas.width = window.innerWidth || 1920;
    let h = canvas.height = window.innerHeight || 1080;

    const stars = Array.from({ length: 800 }, () => ({
      x: Math.random() * w - w / 2,
      y: Math.random() * h - h / 2,
      z: Math.random() * w,
    }));

    let running = true;
    const loop = () => {
      if (!running) return;
      ctx.fillStyle = "black";
      ctx.fillRect(0, 0, w, h);

      ctx.save();
      ctx.translate(w / 2, h / 2);

      for (let i = 0; i < stars.length; i++) {
        const s = stars[i];
        
        // Dynamic speed
        s.z -= 10;
        
        if (s.z <= 0) {
          s.z = w;
          s.x = Math.random() * w - w / 2;
          s.y = Math.random() * h - h / 2;
        }

        const x = s.x / (s.z / w);
        const y = s.y / (s.z / w);
        
        // Longer streaks
        const prevZ = s.z + 40;
        const px = s.x / (prevZ / w);
        const py = s.y / (prevZ / w);

        const alpha = Math.min(1, Math.max(0, 1 - s.z / w));
        ctx.beginPath();
        ctx.strokeStyle = `rgba(255, 255, 255, ${alpha})`;
        ctx.lineWidth = 1.5;
        ctx.moveTo(px, py);
        ctx.lineTo(x, y);
        ctx.stroke();
      }
      ctx.restore();
      requestAnimationFrame(loop);
    };

    const handleResize = () => {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);
    loop();

    return () => {
      running = false;
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return <canvas ref={canvasRef} className="fixed inset-0 z-[-1] pointer-events-none" />;
}
