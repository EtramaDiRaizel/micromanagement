'use client';

import { StatusConfig } from '@/types';

interface StatusButtonProps {
  config: StatusConfig;
  isActive: boolean;
  onClick: () => void;
  disabled?: boolean;
}

export default function StatusButton({ config, isActive, onClick, disabled = false }: StatusButtonProps) {
  return (
    <button
      type="button"
      aria-pressed={isActive}
      disabled={disabled}
      onClick={onClick}
      data-status={config.id}
      className={`status-option ${isActive ? 'is-active' : ''} ${disabled ? 'is-disabled' : ''}`}
    >
      <span className="status-option-icon">{config.emoji}</span>
      <span className="status-option-copy">
        <span className="status-option-label">{config.label}</span>
      </span>
      <span className="status-option-check" aria-hidden="true">{isActive ? '✓' : ''}</span>
    </button>
  );
}
