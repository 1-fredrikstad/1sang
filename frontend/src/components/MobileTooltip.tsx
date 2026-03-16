import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import React, { useState } from 'react';

export default function MobileTooltip({
  trigger,
  children,
}: {
  trigger: React.ReactNode;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [isTouch] = useState(() => 'ontouchstart' in window);

  return (
    <Tooltip open={open} onOpenChange={setOpen}>
      <TooltipTrigger
        asChild
        onClick={() => isTouch && setOpen((prev) => !prev)} // toggle on mobile
      >
        {trigger}
      </TooltipTrigger>
      <TooltipContent side="top" className="w-36">
        {children}
      </TooltipContent>
    </Tooltip>
  );
}
