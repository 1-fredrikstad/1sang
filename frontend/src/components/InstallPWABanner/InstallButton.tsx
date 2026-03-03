type InstallButtonProps = {
  onInstall: () => void;
};

export function InstallButton({ onInstall }: InstallButtonProps) {
  return (
    <button
      onClick={onInstall}
      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg cursor-pointer"
    >
      Installer
    </button>
  );
}
