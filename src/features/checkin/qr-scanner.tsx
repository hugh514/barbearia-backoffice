'use client';

import { useEffect, useRef, useState } from 'react';
import { Camera, CameraOff } from 'lucide-react';
import { Button } from '@/components/ui/button';

// BarcodeDetector é nativo no Chromium; tipagem mínima local.
interface BarcodeDetectorLike {
  detect: (source: CanvasImageSource) => Promise<{ rawValue: string }[]>;
}
type BarcodeDetectorCtor = new (opts?: {
  formats?: string[];
}) => BarcodeDetectorLike;

/** Scanner de QR via câmera. Chama onScan com o valor lido. */
export function QrScanner({ onScan }: { onScan: (value: string) => void }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [active, setActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const supported =
    typeof window !== 'undefined' && 'BarcodeDetector' in window;

  useEffect(() => {
    if (!active) return;
    let stream: MediaStream | null = null;
    let raf = 0;
    let stopped = false;

    (async () => {
      try {
        const Detector = (
          window as unknown as { BarcodeDetector: BarcodeDetectorCtor }
        ).BarcodeDetector;
        const detector = new Detector({ formats: ['qr_code'] });
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' },
        });
        if (stopped) return;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }
        const tick = async () => {
          if (stopped || !videoRef.current) return;
          try {
            const codes = await detector.detect(videoRef.current);
            if (codes.length > 0) {
              onScan(codes[0].rawValue);
              setActive(false);
              return;
            }
          } catch {
            // ignora frames sem leitura
          }
          raf = requestAnimationFrame(tick);
        };
        raf = requestAnimationFrame(tick);
      } catch {
        setError('Não foi possível acessar a câmera.');
        setActive(false);
      }
    })();

    return () => {
      stopped = true;
      cancelAnimationFrame(raf);
      stream?.getTracks().forEach((t) => t.stop());
    };
  }, [active, onScan]);

  if (!supported) {
    return (
      <p className="text-xs text-muted-foreground">
        Leitura por câmera indisponível neste navegador. Use a entrada manual.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {active ? (
        <>
          <video
            ref={videoRef}
            className="aspect-square w-full rounded-lg bg-black object-cover"
            muted
            playsInline
          />
          <Button variant="outline" onClick={() => setActive(false)}>
            <CameraOff className="size-4" />
            Parar câmera
          </Button>
        </>
      ) : (
        <Button variant="outline" onClick={() => setActive(true)}>
          <Camera className="size-4" />
          Escanear QR
        </Button>
      )}
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
