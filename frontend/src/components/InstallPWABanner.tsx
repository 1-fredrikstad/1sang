'use client';

import { usePWAInstall } from '../hooks/usePWAInstall';

export default function InstallPWAButton() {
  const { isInstallable, install, isInstalled } = usePWAInstall();

  if (isInstalled) return null;

  return (
    <main className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-white rounded-lg p-4 flex items-center justify-around z-50 max-w-md w-full">
      {isInstallable && (
        <>
          <span className="text-gray-700">Installer 1sang som app</span>
          <button
            onClick={install}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg cursor-pointer"
          >
            Installer
          </button>
        </>
      )}

      {!isInstallable && !isInstalled && (
        <span className="text-gray-700 text-sm">For å installere appen, (hva enn safari brukere må gjøre)</span>
      )}
    </main>
  );
}
