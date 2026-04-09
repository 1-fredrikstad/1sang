import { Button } from '@/components/ui/button';

type InstallButtonProps = {
  onInstall: () => void;
};

export function InstallButton({ onInstall }: InstallButtonProps) {
  return (
    <Button onClick={onInstall} className="cursor-pointer">
      Installer
    </Button>
  );
}
