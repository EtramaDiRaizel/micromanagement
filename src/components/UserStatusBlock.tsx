'use client';

import { useState, useEffect } from 'react';
import { StatusType } from '@/types';
import { STATUSES, getStatusConfig } from '@/lib/statuses';
import StatusButton from './StatusButton';

interface UserStatusBlockProps {
  displayName: string;
  currentStatus: StatusType;
  statusUpdatedAt: string;
  onStatusChange: (status: StatusType) => void;
  isUpdating: boolean;
}

function timeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return 'just now';
  
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes} minute${diffInMinutes === 1 ? '' : 's'} ago`;
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours} hour${diffInHours === 1 ? '' : 's'} ago`;
  
  const diffInDays = Math.floor(diffInHours / 24);
  return `${diffInDays} day${diffInDays === 1 ? '' : 's'} ago`;
}

export default function UserStatusBlock({ displayName, currentStatus, statusUpdatedAt, onStatusChange, isUpdating }: UserStatusBlockProps) {
  const [, setTick] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setTick((t) => t + 1);
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const currentConfig = getStatusConfig(currentStatus);
  const availabilityStatuses = STATUSES.filter(s => s.id === 'available' || s.id === 'not_available');
  const intentStatuses = STATUSES.filter(s => !['available', 'not_available'].includes(s.id));
  const timeText = timeAgo(statusUpdatedAt);
  const isAvailable = currentStatus === 'available';

  return (
    <section className="status-card">
      <div className="user-card-header">
        <div>
          <h2>{displayName}</h2>
        </div>
        <span className={`presence-pill ${isAvailable ? 'is-available' : ''}`}>
          <span className="presence-dot" />
          {isAvailable ? 'Available' : 'Away'}
        </span>
      </div>

      {currentConfig && (
        <div className="status-summary">
          <div className={`status-symbol ${isAvailable ? 'is-available' : ''}`} aria-hidden="true">
            {currentConfig.emoji}
          </div>
          <div>
            <p className="status-summary-label">{currentConfig.label}</p>
            <p className="status-summary-time">Updated {timeText}</p>
          </div>
        </div>
      )}

      <div className="availability-panel">
        <div className="section-heading">
          <p className="section-title">Availability</p>
          {isUpdating && <span className="saving-label">Saving...</span>}
        </div>
        <div className="availability-grid">
          {availabilityStatuses.map(status => (
            <StatusButton
              key={status.id}
              config={status}
              isActive={currentStatus === status.id}
              onClick={() => onStatusChange(status.id)}
              disabled={isUpdating}
            />
          ))}
        </div>
      </div>

      <div className="intent-panel">
        <div className="section-heading">
          <p className="section-title">Right now</p>
        </div>
        <div className="intent-list">
          {intentStatuses.map(status => (
            <StatusButton
              key={status.id}
              config={status}
              isActive={currentStatus === status.id}
              onClick={() => onStatusChange(status.id)}
              disabled={isUpdating}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
