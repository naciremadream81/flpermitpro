import { useRef, useCallback } from 'react';
import { Button } from '@/components/shared/Button';

interface SignaturePadProps {
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  onClear?: () => void;
}

export function SignaturePad({ canvasRef, onClear }: SignaturePadProps) {
  const drawing = useRef(false);

  const getCtx = useCallback(() => {
    const c = canvasRef.current;
    if (!c) return null;
    const ctx = c.getContext('2d');
    if (!ctx) return null;
    return { canvas: c, ctx };
  }, [canvasRef]);

  const pos = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    const { canvas, ctx } = getCtx() ?? {};
    if (!canvas || !ctx) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    if ('touches' in e && e.touches[0]) {
      return {
        x: (e.touches[0].clientX - rect.left) * scaleX,
        y: (e.touches[0].clientY - rect.top) * scaleY,
      };
    }
    const me = e as React.MouseEvent;
    return {
      x: (me.clientX - rect.left) * scaleX,
      y: (me.clientY - rect.top) * scaleY,
    };
  }, [getCtx]);

  const start = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    drawing.current = true;
    const { ctx } = getCtx() ?? {};
    if (!ctx) return;
    const { x, y } = pos(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
  }, [getCtx, pos]);

  const draw = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    if (!drawing.current) return;
    e.preventDefault();
    const { ctx } = getCtx() ?? {};
    if (!ctx) return;
    const { x, y } = pos(e);
    ctx.lineTo(x, y);
    ctx.strokeStyle = '#111827';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.stroke();
  }, [getCtx, pos]);

  const end = useCallback(() => {
    drawing.current = false;
  }, []);

  const clear = useCallback(() => {
    const { canvas, ctx } = getCtx() ?? {};
    if (!canvas || !ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    onClear?.();
  }, [getCtx, onClear]);

  return (
    <div className="space-y-2">
      <canvas
        ref={canvasRef}
        width={560}
        height={180}
        className="w-full max-w-full touch-none cursor-crosshair rounded-lg border border-gray-300 bg-white dark:border-gray-600 dark:bg-gray-900"
        onMouseDown={start}
        onMouseMove={draw}
        onMouseUp={end}
        onMouseLeave={end}
        onTouchStart={start}
        onTouchMove={draw}
        onTouchEnd={end}
      />
      <Button type="button" variant="secondary" size="sm" onClick={clear}>
        Clear
      </Button>
    </div>
  );
}
