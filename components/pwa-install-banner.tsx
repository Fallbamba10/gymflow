"use client";

import { useEffect, useState } from "react";
import { Share, X } from "lucide-react";

export function PwaInstallBanner() {
  const [show, setShow] = useState(false);
  const [isIos, setIsIos] = useState(false);

  useEffect(() => {
    // Ne pas afficher si déjà en mode standalone (déjà installée)
    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      ("standalone" in navigator && (navigator as { standalone?: boolean }).standalone === true);

    if (isStandalone) return;

    // Ne pas réafficher si déjà fermé cette semaine
    const dismissed = localStorage.getItem("pwa-banner-dismissed");
    if (dismissed && Date.now() - Number(dismissed) < 7 * 86400000) return;

    const ua = navigator.userAgent;
    const ios = /iphone|ipad|ipod/i.test(ua) && !/crios|fxios/i.test(ua);
    setIsIos(ios);

    // Sur Android/Desktop : écouter l'événement beforeinstallprompt
    if (!ios) {
      const handler = (e: Event) => {
        e.preventDefault();
        (window as Window & { __deferredInstall?: Event }).__deferredInstall = e;
        setShow(true);
      };
      window.addEventListener("beforeinstallprompt", handler);
      return () => window.removeEventListener("beforeinstallprompt", handler);
    }

    // Sur iOS : afficher après 3s sur les pages clés
    const timer = setTimeout(() => setShow(true), 3000);
    return () => clearTimeout(timer);
  }, []);

  function dismiss() {
    localStorage.setItem("pwa-banner-dismissed", String(Date.now()));
    setShow(false);
  }

  async function install() {
    const deferred = (window as Window & { __deferredInstall?: BeforeInstallPromptEvent }).__deferredInstall;
    if (deferred) {
      deferred.prompt();
      const { outcome } = await deferred.userChoice;
      if (outcome === "accepted") {
        setShow(false);
        return;
      }
    }
    dismiss();
  }

  if (!show) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-line bg-white px-4 pb-[env(safe-area-inset-bottom)] pt-4 shadow-[0_-4px_24px_rgba(0,0,0,0.08)] md:bottom-6 md:left-1/2 md:right-auto md:w-[400px] md:-translate-x-1/2 md:rounded-xl md:border md:shadow-lg">
      <div className="flex items-start gap-3">
        <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-ink">
          <svg viewBox="0 0 512 512" className="size-6" fill="none">
            <rect width="512" height="512" rx="96" fill="#171717"/>
            <path d="M128 278h256v62H128z" fill="#1E8A6A"/>
            <path d="M92 184h72v156H92zM348 184h72v156h-72z" fill="#F7F7F2"/>
            <path d="M194 126h124v62H194z" fill="#D7932F"/>
          </svg>
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-sm">Installer GymFlow</p>
          {isIos ? (
            <p className="mt-0.5 text-xs leading-5 text-neutral-500">
              Appuie sur <Share size={12} className="inline-block align-middle" /> puis <strong>« Sur l'écran d'accueil »</strong> pour accéder en un geste.
            </p>
          ) : (
            <p className="mt-0.5 text-xs leading-5 text-neutral-500">
              Ajoute l'app à ton écran d'accueil pour un accès rapide sans navigateur.
            </p>
          )}
        </div>
        <button onClick={dismiss} className="shrink-0 text-neutral-400 hover:text-neutral-700">
          <X size={18} />
        </button>
      </div>

      {!isIos && (
        <div className="mt-3 flex gap-2">
          <button
            onClick={install}
            className="flex-1 rounded-lg bg-ink py-2.5 text-sm font-semibold text-white transition hover:bg-neutral-800"
          >
            Installer
          </button>
          <button
            onClick={dismiss}
            className="flex-1 rounded-lg border border-line py-2.5 text-sm font-semibold text-neutral-700 transition hover:bg-neutral-50"
          >
            Plus tard
          </button>
        </div>
      )}
    </div>
  );
}

// Type pour l'API BeforeInstallPrompt
interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}
