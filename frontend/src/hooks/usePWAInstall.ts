'use client';

import { useState, useEffect } from 'react';

const DISMISSED_KEY = 'pwaBannerDismissed';

interface IBeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

interface NavigatorStandalone extends Navigator {
  standalone?: boolean;
}

export function usePWAInstall() {
  const [promptEvent, setPromptEvent] = useState<IBeforeInstallPromptEvent | null>(null);
  const [supportsPrompt, setSupportsPrompt] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return 'onbeforeinstallprompt' in window;
  });
  const [isInstalled, setIsInstalled] = useState(false);
  const [isDismissed, setIsDismissed] = useState(() => {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem(DISMISSED_KEY) === 'true';
  });

  // --- Initial checks ---

  const isIOS =
    typeof window !== 'undefined' &&
    (/iphone|ipad|ipod/i.test(window.navigator.userAgent) ||
      // iPadOS 13+ reports as Mac; detect via userAgent string + touch support
      (/MacIntel/.test(window.navigator.userAgent) && (navigator as any).maxTouchPoints > 1));

  const isSafari =
    typeof window !== 'undefined' &&
    /Safari/.test(window.navigator.userAgent) &&
    !/Chrome|CriOS|Chromium|Edg|OPR|FxiOS/.test(window.navigator.userAgent);
  const isAndroid = typeof window !== 'undefined' && /android/i.test(window.navigator.userAgent);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Standalone / PWA installed or running
    const checkStandalone = () => {
      const isStandalone =
        window.matchMedia('(display-mode: standalone)').matches ||
        (window.navigator as NavigatorStandalone).standalone === true ||
        document.referrer.includes('android-app://');

      setIsInstalled(isStandalone);
    };

    checkStandalone();

    // --- Event handlers ---

    // Install prompt
    const handleBeforeInstallPrompt = (e: IBeforeInstallPromptEvent) => {
      e.preventDefault();
      setPromptEvent(e);
      setSupportsPrompt(true);
    };

    // App installed
    const handleAppInstalled = () => {
      setPromptEvent(null);
      setIsInstalled(true);
    };

    // Display-mode changes
    const mediaQuery = window.matchMedia('(display-mode: standalone)');
    mediaQuery.addEventListener('change', checkStandalone);

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt as EventListener);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt as EventListener);
      window.removeEventListener('appinstalled', handleAppInstalled);
      mediaQuery.removeEventListener('change', checkStandalone);
    };
  }, []);

  // --- Actions ---

  const install = async () => {
    if (!promptEvent) return;

    promptEvent.prompt();
    const choiceResult = await promptEvent.userChoice;

    if (choiceResult.outcome === 'accepted') {
      setPromptEvent(null);
      setIsInstalled(true);
    }
  };

  const dismiss = () => {
    localStorage.setItem(DISMISSED_KEY, 'true');
    setIsDismissed(true);
  };

  // --- Derived booleans ---
  const showInstallButton = !!promptEvent && !isInstalled && !isDismissed;

  // Show fallback when the beforeinstallprompt flow is not available (non-Chromium),
  // or when running Safari/iOS where the browser provides an alternate install UX.
  const showFallback =
    !showInstallButton && !isInstalled && !isDismissed && (isIOS || !supportsPrompt || isSafari);

  return {
    install,
    dismiss,
    showInstallButton,
    showFallback,
    // platform hints for UI
    isIOS,
    isSafari,
    isAndroid,
    supportsPrompt,
  };
}
