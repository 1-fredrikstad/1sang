type DismissButtonProps = {
  onDismiss: () => void;
};

export function DismissButton({ onDismiss }: DismissButtonProps) {
  return (
    <button onClick={onDismiss} className="mt-2 text-gray-500 hover:gray-700">
      Ikke vis igjen
    </button>
  );
}
