'use client';

interface HitMeUpButtonProps {
  isActive: boolean;
  onClick: () => void;
  disabled?: boolean;
}

export default function HitMeUpButton({ isActive, onClick, disabled = false }: HitMeUpButtonProps) {
  return (
    <button
      type="button"
      aria-pressed={isActive}
      disabled={disabled}
      onClick={onClick}
      className={`
        w-full min-h-[64px] rounded-2xl flex flex-col items-center justify-center px-4 py-3 
        transition-all duration-300 transform font-bold uppercase tracking-wide
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer active:scale-95'}
        ${isActive
          ? 'bg-gradient-to-r from-red-500 to-orange-400 text-white ring-4 ring-red-500/50 animate-pulse scale-[1.02]'
          : 'bg-gradient-to-r from-red-600 to-orange-500 text-white hover:brightness-110'
        }
      `}
    >
      <div className="flex items-center gap-2 text-lg">
        <span className="text-2xl">🔥</span>
        <span>HIT ME</span>
        <span className="text-2xl">🔥</span>
      </div>
      {isActive && (
        <span className="text-xs text-white/90 mt-1 flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-white animate-ping" />
          ACTIVE
        </span>
      )}
    </button>
  );
}
