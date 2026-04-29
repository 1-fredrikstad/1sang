'use client';

import { usePWAInstall } from '../../hooks/usePWAInstall';
import { DismissButton } from './DismissButton';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
  AlertDialogCancel,
} from '@/components/ui/alert-dialog';
import { InstallButton } from './InstallButton';
import { XMarkIcon } from '@heroicons/react/24/outline';

export default function InstallPWABanner() {
  const { install, dismiss, close, showInstallButton } = usePWAInstall();

  // Early exit: don't render anything if install prompt shouldn't be shown
  if (!showInstallButton) return null;

  return (
    <AlertDialog
      open={showInstallButton}
      onOpenChange={(open) => {
        // Ensures dialog state stays in sync with hook state
        if (!open) close();
      }}
    >
      <AlertDialogContent size="sm">
        <AlertDialogHeader>
          <div className="flex flex-row">
            <AlertDialogTitle className="leading-tight px-10">
              Installer 1sang som app
            </AlertDialogTitle>

            {/* Manual close icon (alternative to cancel button) */}
            <XMarkIcon
              onClick={() => close()}
              aria-label="Lukk"
              className="text-red-500 h-7 pl-1 hover:cursor-pointer"
            />
          </div>

          <AlertDialogDescription>
            Installer appen for en bedre opplevelse og tilgang offline
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          {/* Primary action: triggers PWA install prompt */}
          <AlertDialogAction asChild>
            <InstallButton onInstall={install} />
          </AlertDialogAction>

          {/* Secondary action: dismiss banner permanently/temporarily */}
          <AlertDialogCancel asChild>
            <DismissButton onDismiss={dismiss} />
          </AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
