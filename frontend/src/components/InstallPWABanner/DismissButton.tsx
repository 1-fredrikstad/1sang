import { Button } from '@/components/ui/button';

type DismissButtonProps = {
  onDismiss: () => void;
};

export function DismissButton({ onDismiss }: DismissButtonProps) {
  return (
    <Button onClick={onDismiss} variant="secondary">
      Ikke vis igjen
    </Button>
  );
}
