import { useState } from 'react';
import { Camera, X } from 'lucide-react';
import { Camera as CapCamera, CameraResultType, CameraSource } from '@capacitor/camera';
import { Capacitor } from '@capacitor/core';
import type { DocumentType } from '@/types';

interface CameraCaptureProps {
  onCapture: (file: File, docType: DocumentType) => void;
  docType: DocumentType;
  label?: string;
}

function dataUrlToFile(dataUrl: string, filename: string): File {
  const comma = dataUrl.indexOf(',');
  const header = comma >= 0 ? dataUrl.slice(0, comma) : '';
  const base64 = comma >= 0 ? dataUrl.slice(comma + 1) : dataUrl;
  const mimeMatch = /^data:([^;]+);/.exec(header);
  const mime = mimeMatch?.[1] ?? 'image/jpeg';
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return new File([bytes], filename, { type: mime });
}

export function CameraCapture({ onCapture, docType, label = 'Capture Document' }: CameraCaptureProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function handleFileInput(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);
    setPreview(URL.createObjectURL(file));
    onCapture(file, docType);
    e.target.value = '';
  }

  function clearPreview() {
    if (preview?.startsWith('blob:')) URL.revokeObjectURL(preview);
    setPreview(null);
    setError(null);
  }

  async function captureNative() {
    setError(null);
    try {
      const photo = await CapCamera.getPhoto({
        quality: 80,
        resultType: CameraResultType.DataUrl,
        source: CameraSource.Camera,
      });
      const dataUrl = photo.dataUrl;
      if (!dataUrl) {
        setError('We could not read the photo. Please try again.');
        return;
      }
      const ext = photo.format === 'png' ? 'png' : 'jpeg';
      const file = dataUrlToFile(dataUrl, `capture-${Date.now()}.${ext}`);
      setPreview(dataUrl);
      onCapture(file, docType);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      const lower = message.toLowerCase();
      if (lower.includes('cancel') || lower.includes('dismiss') || lower.includes('user denied')) {
        setError('Capture was cancelled or camera access was not allowed.');
      } else {
        setError('Something went wrong opening the camera. Please try again.');
      }
    }
  }

  if (Capacitor.isNativePlatform()) {
    return (
      <div className="space-y-3">
        {error ? (
          <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800 dark:border-red-900 dark:bg-red-950/40 dark:text-red-200">
            {error}
          </p>
        ) : null}
        {preview ? (
          <div className="relative">
            <img
              src={preview}
              alt="Captured document"
              className="w-full max-h-48 object-contain rounded-lg border border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800"
            />
            <button
              type="button"
              onClick={clearPreview}
              className="absolute top-2 right-2 rounded-full border border-gray-200 bg-white p-1 shadow hover:bg-gray-100 dark:border-gray-600 dark:bg-gray-700 dark:hover:bg-gray-600"
              aria-label="Remove capture"
            >
              <X className="h-4 w-4 text-gray-600 dark:text-gray-300" />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => void captureNative()}
            className="flex w-full cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 p-6 transition-colors hover:border-blue-400 hover:bg-white dark:border-gray-600 dark:bg-gray-800 dark:hover:border-blue-500"
          >
            <Camera className="mb-2 h-8 w-8 text-gray-400 dark:text-gray-500" />
            <p className="text-sm font-medium text-gray-600 dark:text-gray-300">{label}</p>
            <p className="mt-0.5 text-xs text-gray-400">Tap to open your device camera</p>
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {preview ? (
        <div className="relative">
          <img
            src={preview}
            alt="Captured document"
            className="w-full max-h-48 object-contain rounded-lg border border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800"
          />
          <button
            type="button"
            onClick={clearPreview}
            className="absolute top-2 right-2 rounded-full border border-gray-200 bg-white p-1 shadow hover:bg-gray-100 dark:border-gray-600 dark:bg-gray-700 dark:hover:bg-gray-600"
            aria-label="Remove capture"
          >
            <X className="h-4 w-4 text-gray-600 dark:text-gray-300" />
          </button>
        </div>
      ) : (
        <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 p-6 transition-colors hover:border-blue-400 hover:bg-white dark:border-gray-600 dark:bg-gray-800 dark:hover:border-blue-500">
          <Camera className="mb-2 h-8 w-8 text-gray-400 dark:text-gray-500" />
          <p className="text-sm font-medium text-gray-600 dark:text-gray-300">{label}</p>
          <p className="mt-0.5 text-xs text-gray-400">Tap to open your device camera</p>
          <input
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleFileInput}
            className="hidden"
          />
        </label>
      )}
    </div>
  );
}
