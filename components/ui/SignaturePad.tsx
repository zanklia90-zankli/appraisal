import React, { useRef, useEffect, forwardRef, useImperativeHandle, useState, useCallback } from 'react';
import { Edit } from 'lucide-react';

interface SignaturePadProps {
  onEnd: (dataUrl: string) => void;
}

export interface SignaturePadHandle {
  clear: () => void;
}

const SignaturePad = forwardRef<SignaturePadHandle, SignaturePadProps>(({ onEnd }, ref) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isEmpty, setIsEmpty] = useState(true);

  // This useEffect encapsulates all the drawing logic and event handling.
  // By keeping it here, we ensure listeners are added and removed correctly
  // with the component's lifecycle.
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext('2d');
    if (!context) return;

    let isDrawing = false;
    let lastPos = { x: 0, y: 0 };
    let animationFrameId: number;

    const setCanvasDimensions = () => {
      const ratio = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();

      // Set the internal drawing buffer size
      canvas.width = rect.width * ratio;
      canvas.height = rect.height * ratio;

      // Set the display size of the canvas
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;

      // Scale the context to ensure 1:1 drawing
      context.scale(ratio, ratio);
    };

    const setupContext = () => {
        context.strokeStyle = '#374151'; // gray-700
        context.lineWidth = 2.5;
        context.lineCap = 'round';
        context.lineJoin = 'round';
    };

    const handleResize = () => {
        setCanvasDimensions();
        setupContext();
        // Clear the canvas on resize. This is a trade-off for simplicity and stability.
        onEnd('');
        setIsEmpty(true);
    };

    const getEventCoords = (e: MouseEvent | TouchEvent): { x: number, y: number } => {
        const rect = canvas.getBoundingClientRect();
        const event = 'touches' in e ? e.touches[0] : e;
        return {
            x: event.clientX - rect.left,
            y: event.clientY - rect.top,
        };
    };

    const startDrawing = (e: MouseEvent | TouchEvent) => {
        e.preventDefault();
        isDrawing = true;
        setIsEmpty(false);
        lastPos = getEventCoords(e);
    };

    const draw = (e: MouseEvent | TouchEvent) => {
        if (!isDrawing) return;
        e.preventDefault();
        const pos = getEventCoords(e);

        // Throttle drawing with requestAnimationFrame for smoother lines
        cancelAnimationFrame(animationFrameId);
        animationFrameId = requestAnimationFrame(() => {
            context.beginPath();
            context.moveTo(lastPos.x, lastPos.y);
            context.lineTo(pos.x, pos.y);
            context.stroke();
            lastPos = pos;
        });
    };

    const stopDrawing = () => {
        if (!isDrawing) return;
        isDrawing = false;
        cancelAnimationFrame(animationFrameId);
        onEnd(canvas.toDataURL('image/png'));
    };
    
    // Initial setup
    handleResize();

    // Add all event listeners
    canvas.addEventListener('mousedown', startDrawing);
    canvas.addEventListener('mousemove', draw);
    canvas.addEventListener('mouseup', stopDrawing);
    canvas.addEventListener('mouseleave', stopDrawing);

    canvas.addEventListener('touchstart', startDrawing, { passive: false });
    canvas.addEventListener('touchmove', draw, { passive: false });
    canvas.addEventListener('touchend', stopDrawing);

    window.addEventListener('resize', handleResize);

    // Cleanup function to remove listeners
    return () => {
        cancelAnimationFrame(animationFrameId);
        
        canvas.removeEventListener('mousedown', startDrawing);
        canvas.removeEventListener('mousemove', draw);
        canvas.removeEventListener('mouseup', stopDrawing);
        canvas.removeEventListener('mouseleave', stopDrawing);

        canvas.removeEventListener('touchstart', startDrawing);
        canvas.removeEventListener('touchmove', draw);
        canvas.removeEventListener('touchend', stopDrawing);

        window.removeEventListener('resize', handleResize);
    };
  }, [onEnd]);

  const clear = useCallback(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const context = canvas.getContext('2d');
      if (context) {
        // We need to account for the scaled context when clearing
        const rect = canvas.getBoundingClientRect();
        context.clearRect(0, 0, rect.width, rect.height);
      }
      onEnd('');
      setIsEmpty(true);
    }
  }, [onEnd]);

  useImperativeHandle(ref, () => ({ clear }));

  return (
    <div className="relative w-full h-32 border border-gray-300 rounded-lg bg-gray-50 touch-none overflow-hidden cursor-crosshair">
      <canvas
        ref={canvasRef}
        className="absolute top-0 left-0 w-full h-full"
      />
      {isEmpty && (
        <div className="absolute inset-0 flex items-center justify-center text-gray-400 pointer-events-none">
          <Edit size={16} className="mr-2" />
          <span>Sign here</span>
        </div>
      )}
    </div>
  );
});

export default SignaturePad;
