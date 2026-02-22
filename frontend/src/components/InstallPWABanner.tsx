'use client';

import { usePWAInstall } from '../hooks/usePWAInstall';

export default function InstallPWAButton() {
  const { deferredPrompt, install, isOpenedInApp, isBannerDismissed, dismiss, isReady } =
    usePWAInstall();

  // Hide banner if app is opened standalone or dismissed
  if (isOpenedInApp || isBannerDismissed || !isReady) return null;
  if (!deferredPrompt) return null;

  return (
    <main className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-white rounded-lg p-4 flex flex-col items-center z-50 max-w-md w-full">
      <section className="flex justify-around items-center w-full mb-2">
        {deferredPrompt ? (
          <>
            <span className="text-gray-700">Installer 1sang som app</span>
            <button
              onClick={install}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg cursor-pointer"
            >
              Installer
            </button>
          </>
        ) : (
          // TODO: How to install on browsers not Chromium? I'm not confident in this, want to check on iOS device
          <span className="text-gray-700 text-sm">
            For å installere appen, bruk "Legg til på Hjem-skjerm"
          </span>
        )}
      </section>

      <button onClick={dismiss} className="mt-2 text-gray-500 hover:gray-700">
        Ikke vis igjen
      </button>
    </main>
  );
}
