'use client';

import React, { useRef, useState, useEffect, useCallback } from 'react';
import { CameraIcon } from '@/components/icons';
import { Button } from '@/components/ui';

export interface CapturedImageSlot {
  id: 'front' | 'back' | 'batch';
  label: string;
  required: boolean;
  dataUrl?: string;
  sizeKb?: number;
  qualityNote?: string;
}

export interface PackCameraProps {
  onCaptureComplete: (images: { front: string; back?: string; batch?: string }) => void;
  isProcessing?: boolean;
}

/**
 * Compresses an image blob or file to JPEG under 500 KB.
 * Target long edge: 1600 pixels (PRD v4.0 §5).
 */
export async function compressImageToBudget(
  source: HTMLVideoElement | HTMLImageElement | File | Blob,
  maxDimension = 1600,
  quality = 0.82
): Promise<{ blob: Blob; dataUrl: string; sizeKb: number; brightness: number }> {
  return new Promise((resolve, reject) => {
    const processCanvas = (src: CanvasImageSource, origW: number, origH: number) => {
      let targetW = origW;
      let targetH = origH;

      if (targetW > maxDimension || targetH > maxDimension) {
        if (targetW > targetH) {
          targetH = Math.round((targetH * maxDimension) / targetW);
          targetW = maxDimension;
        } else {
          targetW = Math.round((targetW * maxDimension) / targetH);
          targetH = maxDimension;
        }
      }

      const canvas = document.createElement('canvas');
      canvas.width = targetW;
      canvas.height = targetH;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Failed to get 2d context for image downsampling'));
        return;
      }

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(src, 0, 0, targetW, targetH);

      // Estimate image brightness via sample pixels
      let avgBrightness = 128;
      try {
        const sampleW = Math.min(100, targetW);
        const sampleH = Math.min(100, targetH);
        const imgData = ctx.getImageData(0, 0, sampleW, sampleH).data;
        let totalLuma = 0;
        const count = imgData.length / 4;
        for (let i = 0; i < imgData.length; i += 4) {
          const r = imgData[i] ?? 0;
          const g = imgData[i + 1] ?? 0;
          const b = imgData[i + 2] ?? 0;
          totalLuma += 0.299 * r + 0.587 * g + 0.114 * b;
        }
        avgBrightness = Math.round(totalLuma / count);
      } catch {
        // Pixel sampling fallback
      }

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error('Canvas toBlob failed'));
            return;
          }
          const dataUrl = canvas.toDataURL('image/jpeg', quality);
          const sizeKb = Math.round(blob.size / 1024);
          resolve({ blob, dataUrl, sizeKb, brightness: avgBrightness });
        },
        'image/jpeg',
        quality
      );
    };

    if (source instanceof HTMLVideoElement) {
      if (source.videoWidth === 0 || source.videoHeight === 0) {
        reject(new Error('Video stream is not ready for capture'));
        return;
      }
      processCanvas(source, source.videoWidth, source.videoHeight);
    } else if (source instanceof HTMLImageElement) {
      processCanvas(source, source.naturalWidth, source.naturalHeight);
    } else {
      // File or Blob
      const img = new Image();
      const objectUrl = URL.createObjectURL(source);
      img.onload = () => {
        URL.revokeObjectURL(objectUrl);
        processCanvas(img, img.naturalWidth, img.naturalHeight);
      };
      img.onerror = () => {
        URL.revokeObjectURL(objectUrl);
        reject(new Error('Failed to decode image file'));
      };
      img.src = objectUrl;
    }
  });
}

export const PackCamera: React.FC<PackCameraProps> = ({
  onCaptureComplete,
  isProcessing = false,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [activeSlot, setActiveSlot] = useState<'front' | 'back' | 'batch'>('front');
  const [slots, setSlots] = useState<{
    front: CapturedImageSlot;
    back: CapturedImageSlot;
    batch: CapturedImageSlot;
  }>({
    front: { id: 'front', label: 'Front (Brand & Number)', required: true },
    back: { id: 'back', label: 'Back (Ingredients/Directions)', required: false },
    batch: { id: 'batch', label: 'Batch & Expiry Area', required: false },
  });

  const [cameraActive, setCameraActive] = useState<boolean>(false);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [hasMultipleCameras, setHasMultipleCameras] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [qualityFeedback, setQualityFeedback] = useState<string | null>(null);

  useEffect(() => {
    if (typeof navigator !== 'undefined' && navigator.mediaDevices?.enumerateDevices) {
      navigator.mediaDevices
        .enumerateDevices()
        .then((devices) => {
          const videoInputs = devices.filter((d) => d.kind === 'videoinput');
          setHasMultipleCameras(videoInputs.length > 1);
        })
        .catch(() => setHasMultipleCameras(false));
    }
  }, []);

  const startCamera = useCallback(async () => {
    setErrorMessage(null);
    if (!navigator.mediaDevices?.getUserMedia) {
      setErrorMessage('Camera access is not supported by your browser. Please use the file upload option.');
      return;
    }

    try {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }

      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: facingMode },
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
        audio: false,
      });

      streamRef.current = mediaStream;

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        await videoRef.current.play();
        setCameraActive(true);
      }
    } catch (err: unknown) {
      console.warn('[PackCamera] Could not start camera:', err);
      setCameraActive(false);
      setErrorMessage(
        'Camera permission was denied or camera is in use. You can upload an image file instead.'
      );
    }
  }, [facingMode]);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  }, []);

  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
    };
  }, [startCamera, stopCamera]);

  const toggleCameraFacing = () => {
    setFacingMode((prev) => (prev === 'environment' ? 'user' : 'environment'));
  };

  const assignImageToActiveSlot = (dataUrl: string, sizeKb: number, brightness: number) => {
    let note = 'Good lighting';
    if (brightness < 60) note = 'Low brightness: ensure pack is well-lit';
    else if (brightness > 210) note = 'High glare: angle pack away from direct light';

    setSlots((prev) => ({
      ...prev,
      [activeSlot]: {
        ...prev[activeSlot],
        dataUrl,
        sizeKb,
        qualityNote: note,
      },
    }));

    setQualityFeedback(`${slots[activeSlot].label} saved (${sizeKb} KB) · ${note}`);

    // Auto-advance to next empty optional slot
    if (activeSlot === 'front' && !slots.back.dataUrl) {
      setActiveSlot('back');
    } else if (activeSlot === 'back' && !slots.batch.dataUrl) {
      setActiveSlot('batch');
    }
  };

  const handleCaptureFrame = async () => {
    if (!videoRef.current || !cameraActive) return;

    try {
      const { dataUrl, sizeKb, brightness } = await compressImageToBudget(videoRef.current, 1600, 0.82);
      assignImageToActiveSlot(dataUrl, sizeKb, brightness);
    } catch (err: unknown) {
      console.error('[PackCamera] Capture error:', err);
      setErrorMessage('Could not capture frame from video.');
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 15 * 1024 * 1024) {
      setErrorMessage('File size exceeds 15 MB limit. Please select a smaller photo.');
      return;
    }

    try {
      const { dataUrl, sizeKb, brightness } = await compressImageToBudget(file, 1600, 0.82);
      assignImageToActiveSlot(dataUrl, sizeKb, brightness);
    } catch (err: unknown) {
      console.error('[PackCamera] File compression error:', err);
      setErrorMessage('Could not process selected image file.');
    }
  };

  const handleRemoveSlot = (slotKey: 'front' | 'back' | 'batch') => {
    setSlots((prev) => ({
      ...prev,
      [slotKey]: {
        ...prev[slotKey],
        dataUrl: undefined,
        sizeKb: undefined,
        qualityNote: undefined,
      },
    }));
    setActiveSlot(slotKey);
  };

  const handleProceed = () => {
    if (!slots.front.dataUrl) {
      setErrorMessage('Front image is required to extract product identity.');
      return;
    }

    stopCamera();
    onCaptureComplete({
      front: slots.front.dataUrl,
      back: slots.back.dataUrl,
      batch: slots.batch.dataUrl,
    });
  };

  return (
    <div className="tl-stack-default">
      {/* Slot selector tabs */}
      <div className="tl-cluster" style={{ gap: 8, justifyContent: 'space-between' }}>
        {(['front', 'back', 'batch'] as const).map((key) => {
          const s = slots[key];
          const isSelected = activeSlot === key;
          const hasImage = Boolean(s.dataUrl);

          return (
            <button
              key={key}
              type="button"
              data-testid={`slot-${key}`}
              onClick={() => setActiveSlot(key)}
              className="tl-button"
              style={{
                flex: 1,
                padding: '8px 4px',
                fontSize: '12px',
                border: isSelected ? '2px solid var(--color-primary-500)' : '1px solid var(--color-neutral-300)',
                backgroundColor: isSelected ? 'var(--color-primary-50)' : hasImage ? 'var(--color-neutral-100)' : 'transparent',
                fontWeight: isSelected ? 600 : 400,
              }}
            >
              <div>{key === 'front' ? 'Front (Required)' : key === 'back' ? 'Back label' : 'Batch area'}</div>
              <div style={{ fontSize: '10px', color: hasImage ? 'var(--color-primary-700)' : 'var(--color-neutral-500)' }}>
                {hasImage ? '✓ Captured' : s.required ? 'Required' : 'Optional'}
              </div>
            </button>
          );
        })}
      </div>

      {/* Live Viewfinder or Captured Slot Preview */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          aspectRatio: '4 / 3',
          backgroundColor: '#0a0a0a',
          borderRadius: 'var(--radius-default)',
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {slots[activeSlot].dataUrl ? (
          // Captured Preview for active slot
          <div style={{ position: 'relative', width: '100%', height: '100%' }}>
            <img
              src={slots[activeSlot].dataUrl}
              alt={`Captured ${slots[activeSlot].label}`}
              style={{ width: '100%', height: '100%', objectFit: 'contain' }}
            />
            <div
              style={{
                position: 'absolute',
                top: 8,
                right: 8,
                backgroundColor: 'rgba(0, 0, 0, 0.7)',
                color: '#fff',
                padding: '4px 8px',
                borderRadius: '4px',
                fontSize: '11px',
              }}
            >
              {slots[activeSlot].sizeKb} KB
            </div>
            <button
              type="button"
              onClick={() => handleRemoveSlot(activeSlot)}
              style={{
                position: 'absolute',
                bottom: 12,
                left: '50%',
                transform: 'translateX(-50%)',
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                color: '#000',
                padding: '6px 14px',
                borderRadius: '4px',
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Retake {slots[activeSlot].label}
            </button>
          </div>
        ) : cameraActive ? (
          // Live Video Stream
          <>
            <video
              ref={videoRef}
              playsInline
              muted
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
            {/* Viewfinder target framing guide */}
            <div
              style={{
                position: 'absolute',
                inset: '14%',
                border: '2px dashed rgba(255, 255, 255, 0.75)',
                borderRadius: '8px',
                pointerEvents: 'none',
              }}
            />
            <div
              style={{
                position: 'absolute',
                bottom: 8,
                left: '50%',
                transform: 'translateX(-50%)',
                color: '#fff',
                fontSize: '11px',
                backgroundColor: 'rgba(0, 0, 0, 0.65)',
                padding: '4px 10px',
                borderRadius: '12px',
                whiteSpace: 'nowrap',
              }}
            >
              Frame: {slots[activeSlot].label}
            </div>
          </>
        ) : (
          <div className="tl-stack-tight" style={{ textAlign: 'center', color: '#888', padding: 16 }}>
            <CameraIcon size={40} className="tl-mx-auto" />
            <div className="tl-caption">Camera inactive or unavailable.</div>
            <Button variant="secondary" onClick={startCamera}>
              Turn on camera
            </Button>
          </div>
        )}
      </div>

      {/* Quality feedback banner */}
      {qualityFeedback && (
        <div className="tl-caption" style={{ color: 'var(--color-primary-700)', textAlign: 'center' }}>
          {qualityFeedback}
        </div>
      )}

      {/* Error alert */}
      {errorMessage && (
        <div className="tl-callout tl-callout-warning" style={{ fontSize: '13px' }}>
          {errorMessage}
        </div>
      )}

      {/* Camera and Upload Controls */}
      <div className="tl-stack-tight">
        {cameraActive && !slots[activeSlot].dataUrl && (
          <Button variant="primary" fullWidth onClick={handleCaptureFrame} disabled={isProcessing}>
            Capture {slots[activeSlot].label}
          </Button>
        )}

        <div className="tl-cluster" style={{ gap: 8 }}>
          <Button
            variant="secondary"
            style={{ flex: 1 }}
            onClick={() => fileInputRef.current?.click()}
            disabled={isProcessing}
          >
            Upload image file
          </Button>

          {hasMultipleCameras && cameraActive && (
            <Button variant="ghost" onClick={toggleCameraFacing} disabled={isProcessing}>
              Switch camera
            </Button>
          )}
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleFileUpload}
          style={{ display: 'none' }}
        />

        {/* Primary Proceed CTA */}
        <div className="tl-mt-2">
          <Button
            variant="primary"
            fullWidth
            onClick={handleProceed}
            disabled={!slots.front.dataUrl || isProcessing}
          >
            {isProcessing ? 'Reading pack...' : 'Continue with captured photos'}
          </Button>
        </div>
      </div>
    </div>
  );
};
