'use client';

import { usePWAInstall } from '../../hooks/usePWAInstall';
import { Banner } from './Banner';
import { DismissButton } from './DismissButton';
import { InstallButton } from './InstallButton';

export default function InstallPWAButton() {
  const { install, dismiss, showInstallButton, showFallback } = usePWAInstall();

  // --- Render checks ---
  if (typeof window === 'undefined') return null;
  if (!showInstallButton && !showFallback) return null;

  return (
    <Banner>
      <section className="flex justify-around items-center w-full mb-2">
        {showInstallButton && (
          <>
            <span className="text-gray-700">Installer 1sang som app</span>
            <InstallButton onInstall={install} />
          </>
        )}

        {showFallback && (
          // TODO: Text on how to install on browsers not Chromium? I'm not confident in this, want to check on iOS device
          <span className="text-gray-700 text-sm">
            For å installere appen, bruk &quot;Legg til på Hjem-skjerm&quot;
          </span>
        )}
      </section>

      <DismissButton onDismiss={dismiss} />
    </Banner>
  );
}
