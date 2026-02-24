'use client';

import { usePWAInstall } from '../../hooks/usePWAInstall';
import { Banner } from './Banner';
import { DismissButton } from './DismissButton';
import { InstallButton } from './InstallButton';

export default function InstallPWAButton() {
  const { install, dismiss, showInstallButton, showFallback, isIOS, isSafari, isAndroid } =
    usePWAInstall();

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

        {/* TODO: Ensure methods of installations are correct*/ }
        {showFallback && (
          <span className="text-gray-700 text-sm">
            {isIOS && (
              <>
                På iOS (Safari): trykk på <strong>Del</strong> (share-ikonet), velg{' '}
                <strong>Legg til på Hjem-skjerm</strong>.
              </>
            )}

            {isSafari && !isIOS && (
              <>
                På macOS (Safari): åpne <strong>Del</strong>-menyen og velg{' '}
                <strong>Legg til på Hjem-skjerm</strong> eller bruk{' '}
                <strong>Arkiv → Legg til på Hjem-skjerm</strong>.
              </>
            )}

            {isAndroid && (
              <>
                På Android (Chrome/Edge): åpne nettleserens meny (⋮) og velg{' '}
                <strong>Installer app</strong> eller <strong>Legg til på Hjem-skjerm</strong>.
              </>
            )}

            {!isIOS && !isSafari && !isAndroid && (
              <>
                Åpne nettleserens meny og se etter <strong>Installer</strong> eller{' '}
                <strong>Legg til på Hjem-skjerm</strong>. Følg nettleserens instruksjoner.
              </>
            )}
          </span>
        )}
      </section>

      <DismissButton onDismiss={dismiss} />
    </Banner>
  );
}
