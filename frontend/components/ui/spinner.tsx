import { cn } from '@/lib/utils';
import { SunIcon } from '@/src/components/icons/Icons';
import { AnimatePresence, motion } from 'framer-motion';

interface SpinnerProps extends React.ComponentProps<'svg'> {
  message?: string;
}

function Spinner({ className, message, ...props }: SpinnerProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 fixed inset-0">
      <SunIcon
        role="status"
        aria-label="Loading"
        className={cn(
          'size-9 animate-[spin_4s_linear_infinite] origin-center allow-animation opacity-90',
          className
        )}
        {...props}
      />
      <AnimatePresence mode="wait">
        {message && (
          <motion.p
            key={message}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.1 }}
            className="text-md opacity-90 loading-dots allow-animation"
          >
            {message}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}

export { Spinner };
