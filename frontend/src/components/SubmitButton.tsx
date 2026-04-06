import { Button } from '@/components/ui/button';

type SubmitButtonProps = {
  submitLabel: string;
};

export default function SubmitButton({ submitLabel }: SubmitButtonProps) {
  return (
    <Button
      type="submit"
      variant="default"
      className="disabled:opacity-50 cursor-pointer hover:bg-white/95"
    >
      {submitLabel}
    </Button>
  );
}
