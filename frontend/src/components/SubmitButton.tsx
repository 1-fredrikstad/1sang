import { Button } from '@/components/ui/button';

type SubmitButtonProps = {
  submitLabel: string;
  disabled?: boolean;
};

export default function SubmitButton({ submitLabel, disabled = false }: SubmitButtonProps) {
  return (
    <Button
      type="submit"
      variant="default"
      disabled={disabled}
      className="disabled:opacity-50 cursor-pointer hover:bg-btn-hover disabled:cursor-not-allowed"
    >
      {submitLabel}
    </Button>
  );
}
