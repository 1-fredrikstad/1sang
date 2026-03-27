type SubmitButtonProps = {
  submitLabel: string;
};

export default function SubmitButton({ submitLabel }: SubmitButtonProps) {
  return (
    <button
      type="submit"
      className="disabled:opacity-50 self-center font-bold py-2 px-4 rounded-sm cursor-pointer bg-secondary"
    >
      {submitLabel}
    </button>
  );
}
