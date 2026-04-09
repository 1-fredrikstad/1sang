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
import { useState } from 'react';

export default function InstallPWABanner() {
  const { install, dismiss, showInstallButton } = usePWAInstall();
  const [isOpen, setIsOpen] = useState(true);

  // --- Render checks ---
  if (!showInstallButton || !isOpen) return null;

  return (
    <AlertDialog open={showInstallButton} onOpenChange={setIsOpen}>
      <AlertDialogContent size="sm">
        <AlertDialogHeader>
          <div className="flex flex-row">
            <AlertDialogTitle className="leading-tight px-10">
              Installer Sanger under Liljen som app
            </AlertDialogTitle>
            <XMarkIcon
              onClick={() => setIsOpen(false)}
              aria-label="Lukk"
              className="text-red-500 h-7 pl-1 hover:cursor-pointer"
            />
          </div>
          <AlertDialogDescription>
            Installer appen for bedre opplevelse og offline tilgang!
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogAction asChild>
            <InstallButton onInstall={install} />
          </AlertDialogAction>
          <AlertDialogCancel asChild>
            <DismissButton onDismiss={dismiss} />
          </AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
