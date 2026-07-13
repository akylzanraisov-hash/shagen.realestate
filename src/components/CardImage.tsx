import type { LucideIcon } from 'lucide-react';

interface CardImageProps {
  icon: LucideIcon;
  label?: string;
  height?: string;
  overlay?: boolean;
  overlayContent?: React.ReactNode;
}

export default function CardImage({ icon: Icon, label, height = '220px', overlay = false, overlayContent }: CardImageProps) {
  return (
    <div
      className="relative w-full overflow-hidden flex items-center justify-center"
      style={{
        height,
        background: 'linear-gradient(135deg, #10151C 0%, #0E1420 60%, #10151C 100%)',
        border: '1px solid rgba(217,163,74,0.12)',
      }}
    >
      {/* subtle grid */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            'linear-gradient(rgba(217,163,74,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(217,163,74,0.03) 1px, transparent 1px)',
          backgroundSize: '32px 32px',
        }}
      />
      <div className="flex flex-col items-center gap-3 relative">
        <div
          className="w-14 h-14 rounded-full flex items-center justify-center"
          style={{ border: '1.5px solid rgba(217,163,74,0.3)' }}
        >
          <Icon size={26} strokeWidth={1.2} style={{ color: 'rgba(217,163,74,0.6)' }} />
        </div>
        {label && (
          <span
            className="uppercase font-semibold text-center"
            style={{ fontSize: '10px', letterSpacing: '0.14em', color: 'rgba(217,163,74,0.4)' }}
          >
            {label}
          </span>
        )}
      </div>
      {overlay && (
        <div
          className="absolute inset-0"
          style={{ background: 'linear-gradient(to top, rgba(10,13,18,0.85) 0%, rgba(10,13,18,0.2) 60%, transparent 100%)' }}
        />
      )}
      {overlayContent && (
        <div className="absolute bottom-3 left-4 right-4">{overlayContent}</div>
      )}
    </div>
  );
}
