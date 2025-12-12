import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '@/lib/utils';

interface NewsIndicatorProps {
  news: string;
  className?: string;
}

export function NewsIndicator({ news, className }: NewsIndicatorProps) {
  const [showTooltip, setShowTooltip] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });
  const buttonRef = useRef<HTMLButtonElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (showTooltip && buttonRef.current && tooltipRef.current) {
      const updatePosition = () => {
        if (!buttonRef.current || !tooltipRef.current) return;

        const buttonRect = buttonRef.current.getBoundingClientRect();
        const tooltipRect = tooltipRef.current.getBoundingClientRect();
        const tooltipWidth = tooltipRect.width || 256; // w-64 = 256px
        const tooltipHeight = tooltipRect.height || 100;
        const margin = 8;
      
        // Position tooltip above the button, centered
        let left = buttonRect.left + buttonRect.width / 2 - tooltipWidth / 2;
        let top = buttonRect.top - tooltipHeight - margin;

        // Adjust if tooltip would go off screen horizontally
        if (left < margin) {
          left = margin;
        } else if (left + tooltipWidth > window.innerWidth - margin) {
          left = window.innerWidth - tooltipWidth - margin;
        }

        // If tooltip would go above viewport, show below instead
        if (top < margin) {
          top = buttonRect.bottom + margin;
        }

        // If tooltip would go below viewport, adjust to fit
        if (top + tooltipHeight > window.innerHeight - margin) {
          top = Math.max(margin, window.innerHeight - tooltipHeight - margin);
        }

        setTooltipPosition({ top, left });
      };

      // Initial positioning
      updatePosition();

      // Update position after a brief delay to ensure tooltip is rendered and measured
      const timeoutId = setTimeout(updatePosition, 0);

      // Update on scroll/resize
      window.addEventListener('scroll', updatePosition, true);
      window.addEventListener('resize', updatePosition);

      return () => {
        clearTimeout(timeoutId);
        window.removeEventListener('scroll', updatePosition, true);
        window.removeEventListener('resize', updatePosition);
      };
    }
  }, [showTooltip]);

  if (!news || news.trim() === '') {
    return null;
  }

  return (
    <>
      <div className={cn('relative inline-flex', className)}>
        <button
          ref={buttonRef}
          onMouseEnter={() => setShowTooltip(true)}
          onMouseLeave={() => setShowTooltip(false)}
          onClick={(e) => e.stopPropagation()}
          className="text-yellow-400 hover:text-yellow-300 transition-colors"
          aria-label="Player news"
        >
          <svg
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </button>
      </div>
      {showTooltip &&
        createPortal(
          <div
            ref={tooltipRef}
            className="fixed z-[9999] w-64 max-w-[calc(100vw-16px)] max-h-[calc(100vh-16px)] overflow-y-auto rounded-lg border border-dark-border bg-[#2A2A35] p-3 shadow-lg"
            style={{
              top: `${tooltipPosition.top}px`,
              left: `${tooltipPosition.left}px`,
            }}
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
          >
            <div className="text-sm text-white whitespace-normal break-words">
              {news}
            </div>
          </div>,
          document.body
        )}
    </>
  );
}
