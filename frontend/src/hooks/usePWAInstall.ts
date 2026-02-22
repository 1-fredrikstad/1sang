'use client';

import { useState, useEffect } from 'react';

export function usePWAInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isOpenedInApp, setIsOpenedInApp] = useState(false);
  const [isBannerDismissed, setIsBannerDismissed] = useState(false);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    setIsReady(true);

    // Check dismissal
    if (sessionStorage.getItem('pwaBannerDismissed') === 'true') setIsBannerDismissed(true);

    // Check if opened as a standalone app / running as PWA
    const checkStandalone = () => {
      const isStandalone =
        window.matchMedia('(display-mode: standalone)').matches ||
        (window.navigator as any).standalone === true ||
        document.referrer.includes('anroid-app://');

      setIsOpenedInApp(isStandalone);
    };

    checkStandalone();
    const mediaQuery = window.matchMedia('(display-mode: standalone)');
    mediaQuery.addEventListener('change', checkStandalone);

    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    const handleAppInstalled = () => {
      setDeferredPrompt(null);
      setIsOpenedInApp(true);
    };

    window.addEventListener('appinstalled', handleAppInstalled);
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('appinstalled', handleAppInstalled);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      mediaQuery.removeEventListener('change', checkStandalone);
    };
  }, []);

  const install = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const choiceResult = await deferredPrompt.userChoice;

    if (choiceResult.outcome === 'accepted') {
      setDeferredPrompt(null);
      setIsOpenedInApp(true);
    }
  };

  const dismiss = () => {
    sessionStorage.setItem('pwaBannerDismissed', 'true');
    setIsBannerDismissed(true);
  };

  return { deferredPrompt, install, isOpenedInApp, isBannerDismissed, dismiss, isReady };
}
