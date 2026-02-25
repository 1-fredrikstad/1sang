'use client';

import { usePWAInstall } from '../../hooks/usePWAInstall';
import { Banner } from './Banner';
import { DismissButton } from './DismissButton';
import { InstallButton } from './InstallButton';

export default function InstallPWABanner() {
  const { install, dismiss, showInstallButton } = usePWAInstall();

  // --- Render checks ---
  if (!showInstallButton) return null;

  return (
    <Banner>
      <section className="flex justify-around items-center w-full mb-2">
        <span className="text-black">Installer Sanger under Liljen som app</span>
        <InstallButton onInstall={install} />
      </section>

      <DismissButton onDismiss={dismiss} />
    </Banner>
  );
}
