/** PNG data URL from canvas if any non-transparent pixels were drawn. */
export function signaturePadToPngDataUrl(canvas: HTMLCanvasElement | null): string | null {
  if (!canvas) return null;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;
  const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
  let hasInk = false;
  for (let i = 3; i < data.length; i += 4) {
    if (data[i] > 10) {
      hasInk = true;
      break;
    }
  }
  if (!hasInk) return null;
  return canvas.toDataURL('image/png');
}
