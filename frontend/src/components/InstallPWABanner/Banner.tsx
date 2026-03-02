type BannerProps = {
  children: React.ReactNode;
};

export function Banner({ children }: BannerProps) {
  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-white rounded-lg p-4 flex flex-col items-center z-50 max-w-md w-full">
      {children}
    </div>
  );
}
