"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Camera, CameraOff, Loader2, QrCode, X } from "lucide-react";

type QrScannerProps = {
  onScan: (memberId: string) => void;
};

type ScanState = "idle" | "starting" | "scanning" | "error";

export function QrScanner({ onScan }: QrScannerProps) {
  const [open, setOpen] = useState(false);
  const [state, setState] = useState<ScanState>("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef<number>(0);
  const onScanRef = useRef(onScan);
  onScanRef.current = onScan;

  const stopCamera = useCallback(() => {
    cancelAnimationFrame(rafRef.current);
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  }, []);

  const startCamera = useCallback(async () => {
    setState("starting");
    setErrorMsg("");

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment", width: { ideal: 1280 }, height: { ideal: 720 } },
      });
      streamRef.current = stream;

      if (!videoRef.current) return;
      videoRef.current.srcObject = stream;
      await videoRef.current.play();
      setState("scanning");
    } catch {
      setState("error");
      setErrorMsg("Accès à la caméra refusé. Autorise l'accès dans les paramètres du navigateur.");
    }
  }, []);

  // Boucle de décodage
  useEffect(() => {
    if (state !== "scanning") return;

    type JsQrFn = (data: Uint8ClampedArray, width: number, height: number, opts?: { inversionAttempts: string }) => { data: string } | null;
    let decode: JsQrFn | null = null;

    import("jsqr").then((mod) => {
      // jsqr exporte la fonction directement ET en .default
      decode = (typeof mod === "function" ? mod : mod.default) as JsQrFn;

      function tick() {
        const video = videoRef.current;
        const canvas = canvasRef.current;
        if (!video || !canvas || video.readyState !== video.HAVE_ENOUGH_DATA) {
          rafRef.current = requestAnimationFrame(tick);
          return;
        }

        const ctx = canvas.getContext("2d", { willReadFrequently: true });
        if (!ctx) return;

        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const result = decode?.(imageData.data, imageData.width, imageData.height, {
          inversionAttempts: "dontInvert",
        });

        if (result?.data) {
          const raw = result.data.trim();
          const UUID_RE = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i;
          // Accept bare UUID or a URL containing /m/<uuid> (portail) or any path with uuid
          const match = UUID_RE.exec(raw);
          if (match) {
            stopCamera();
            setOpen(false);
            onScanRef.current(match[0]);
            return;
          }
        }

        rafRef.current = requestAnimationFrame(tick);
      }

      rafRef.current = requestAnimationFrame(tick);
    });

    return () => cancelAnimationFrame(rafRef.current);
  }, [state, stopCamera]);

  function openScanner() {
    setOpen(true);
    startCamera();
  }

  function closeScanner() {
    stopCamera();
    setOpen(false);
    setState("idle");
    setErrorMsg("");
  }

  return (
    <>
      <button
        type="button"
        onClick={openScanner}
        className="inline-flex h-14 items-center justify-center gap-2 rounded-md border border-line bg-white px-5 text-sm font-semibold text-neutral-700 shadow-sm transition hover:bg-neutral-50"
      >
        <QrCode size={20} />
        Scanner QR
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="relative w-full max-w-sm overflow-hidden rounded-xl bg-ink shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.08em] text-white/50">Pointage QR</p>
                <h2 className="mt-0.5 text-lg font-semibold text-white">Scanner la carte membre</h2>
              </div>
              <button
                type="button"
                onClick={closeScanner}
                className="flex size-9 items-center justify-center rounded-md border border-white/15 bg-white/10 text-white transition hover:bg-white/20"
                aria-label="Fermer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Viewfinder */}
            <div className="relative aspect-square w-full bg-black">
              <video
                ref={videoRef}
                className="size-full object-cover"
                muted
                playsInline
              />
              <canvas ref={canvasRef} className="hidden" />

              {/* Cadre de scan */}
              {state === "scanning" && (
                <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                  <div className="relative size-56">
                    {/* Coins */}
                    <span className="absolute left-0 top-0 h-7 w-7 border-l-2 border-t-2 border-mint" />
                    <span className="absolute right-0 top-0 h-7 w-7 border-r-2 border-t-2 border-mint" />
                    <span className="absolute bottom-0 left-0 h-7 w-7 border-b-2 border-l-2 border-mint" />
                    <span className="absolute bottom-0 right-0 h-7 w-7 border-b-2 border-r-2 border-mint" />
                    {/* Ligne de scan animée */}
                    <span className="scan-line absolute left-1 right-1 h-0.5 bg-mint/70" />
                  </div>
                </div>
              )}

              {/* States overlay */}
              {state === "starting" && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/60">
                  <Loader2 className="animate-spin text-mint" size={32} />
                  <p className="text-sm font-semibold text-white">Ouverture caméra...</p>
                </div>
              )}

              {state === "error" && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-black/80 p-6 text-center">
                  <CameraOff className="text-danger" size={36} />
                  <p className="text-sm leading-6 text-white">{errorMsg}</p>
                  <button
                    type="button"
                    onClick={() => startCamera()}
                    className="inline-flex h-10 items-center gap-2 rounded-md bg-white px-4 text-sm font-semibold text-ink"
                  >
                    <Camera size={16} />
                    Réessayer
                  </button>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-5 py-4">
              <p className="text-center text-sm leading-5 text-white/55">
                Place le QR code de la carte membre dans le cadre pour valider le passage automatiquement.
              </p>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes scanLine {
          0%, 100% { top: 8px; }
          50% { top: calc(100% - 10px); }
        }
        .scan-line { animation: scanLine 2s ease-in-out infinite; }
      `}</style>
    </>
  );
}
