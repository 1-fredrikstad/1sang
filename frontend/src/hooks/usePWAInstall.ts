'use client';

import { useState, useEffect } from 'react';
import ls from 'localstorage-slim';

const DISMISSED_KEY = 'pwaBannerDismissed';
const DISMISSED_TTL = 7 * 24 * 60 * 60; // 7 days

interface IBeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

interface NavigatorStandalone extends Navigator {
  standalone?: boolean;
}

export function usePWAInstall() {
  const [promptEvent, setPromptEvent] = useState<IBeforeInstallPromptEvent | null>(null);

  const [isInstalled, setIsInstalled] = useState(false);

  const [isDismissed, setIsDismissed] = useState(false);

  // --- Initial checks ---

  useEffect(() => {
    // Banner dismissed in ls
    const dismissed = ls.get(DISMISSED_KEY); // Returns NULL if 7 days has passed, TRUE if not
    setIsDismissed(!!dismissed);

    // Standalone / PWA installed or running
    const checkStandalone = () => {
      setIsInstalled(
        window.matchMedia('(display-mode: standalone)').matches ||
          (window.navigator as NavigatorStandalone).standalone === true ||
          document.referrer.includes('android-app://')
      );
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
    ls.set(DISMISSED_KEY, true, { ttl: DISMISSED_TTL });
    setIsDismissed(true);
  };

  // --- Derived boolean ---

  const showInstallButton = !!promptEvent && !isInstalled && !isDismissed;
  return {
    install,
    dismiss,
    showInstallButton,
  };
}
