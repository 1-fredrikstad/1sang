'use client';

import { useState, useEffect } from 'react';

const DISMISSED_KEY = 'pwaBannerDismissed';

interface IBeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function usePWAInstall() {
  const [promptEvent, setPromptEvent] = useState<IBeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const [supportsPrompt, setSupportsPrompt] = useState<boolean>(false);
  const [isReady, setIsReady] = useState(false);

  // --- Render checks ---

  // Only render when component is ready
  useEffect(() => {
    setIsReady(true); // Client is ready
  }, []);

  useEffect(() => {
    // --- Initial checks ---

    // Browser support
    setSupportsPrompt('onbeforeinstallprompt' in window);

    // Banner dismissal
    if (localStorage.getItem(DISMISSED_KEY) === 'true') setIsDismissed(true);

    // Standalone / PWA installed or running
    const checkStandalone = () => {
      const isStandalone =
        window.matchMedia('(display-mode: standalone)').matches ||
        (window.navigator as any).standalone === true ||
        document.referrer.includes('android-app://');

      setIsInstalled(isStandalone);
    };

    checkStandalone();

    // --- Event handlers ---

    // Install prompt
    const handleBeforeInstallPrompt = (e: IBeforeInstallPromptEvent) => {
      e.preventDefault();
      setPromptEvent(e);
    };

    // App installed
    const handleAppInstalled = () => {
      setPromptEvent(null);
      setIsInstalled(true);
    };

    // Display-mode changes
    const mediaQuery = window.matchMedia('(display-mode: standalone)');
    mediaQuery.addEventListener('change', checkStandalone);

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt as any);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt as any);
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

  const isIOS =
    typeof window !== 'undefined' && /iphone|ipad|ipod/i.test(window.navigator.userAgent);

  const showFallback = (isIOS || !supportsPrompt) && !isInstalled && !isDismissed;

  return {
    install,
    dismiss,
    showInstallButton,
    showFallback,
    isReady,
  };
}
