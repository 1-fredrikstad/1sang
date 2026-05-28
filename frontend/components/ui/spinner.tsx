import { cn } from '@/lib/utils';
import { SunIcon } from '@heroicons/react/24/outline';
import { useDelayedLoading } from '@/src/hooks/useDelayedLoading';
interface SpinnerProps extends React.ComponentProps<'svg'> {
  message?: string;
  isLoading?: boolean;
}

export function Spinner({ className, message, isLoading = true, ...props }: SpinnerProps) {
  const show = useDelayedLoading(isLoading);

  if (!show) return null;

  return (
    <div className="flex flex-col items-center justify-center gap-3 fixed inset-0 bg-background">
      <SunIcon
        role="status"
        aria-label="Loading"
        className={cn(
          'size-9 animate-[spin_4s_linear_infinite] origin-center allow-animation opacity-90',
          className
        )}
        {...props}
      />
      {message && (
        <p className="text-md opacity-90 allow-animation">
          <span>{message}</span>
          <span className="loading-dots inline-block w-[1.5ch] text-left" />
        </p>
      )}
    </div>
  );
}
