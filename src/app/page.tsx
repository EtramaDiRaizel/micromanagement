'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import UserStatusBlock from '@/components/UserStatusBlock';
import LoadingSpinner from '@/components/LoadingSpinner';
import { UserStatus, StatusType } from '@/types';

function DashboardContent() {
  const [users, setUsers] = useState<UserStatus[]>([]);
  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    const frameId = window.requestAnimationFrame(() => {
      setIsDarkMode(window.localStorage.getItem('theme') === 'dark');
    });
    return () => window.cancelAnimationFrame(frameId);
  }, []);

  function toggleDarkMode() {
    setIsDarkMode((current) => {
      const next = !current;
      window.localStorage.setItem('theme', next ? 'dark' : 'light');
      return next;
    });
  }

  useEffect(() => {
    let active = true;

    async function fetchStatus() {
      try {
        const res = await fetch('/api/status');
        const data = await res.json();

        if (!active) return;

        if (data.success && data.data?.users) {
          setUsers(data.data.users);
          setError(null);
        } else if (!data.success) {
          setError(data.error || 'Failed to fetch status');
        }
      } catch (err) {
        if (active) {
          console.error('Failed to fetch status:', err);
        }
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    }

    fetchStatus();
    const intervalId = setInterval(fetchStatus, 5000);
    return () => {
      active = false;
      clearInterval(intervalId);
    };
  }, []);

  const handleStatusChange = useCallback(async (userId: string, status: StatusType) => {
    const userToUpdate = users.find(u => u.userId === userId);
    if (updatingUserId || status === userToUpdate?.currentStatus) return;

    setUpdatingUserId(userId);
    setError(null);

    try {
      const res = await fetch('/api/status', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, status }),
      });
      const data = await res.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to update status');
      }

      setUsers(prev => prev.map(u => u.userId === userId ? data.data : u));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update status');
    } finally {
      setUpdatingUserId(null);
    }
  }, [updatingUserId, users]);

  if (isLoading) {
    return (
      <div className="app-loading">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <main className={`app-shell ${isDarkMode ? 'dark-mode' : ''}`}>
      <button
        type="button"
        className="theme-toggle"
        aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
        aria-pressed={isDarkMode}
        onClick={toggleDarkMode}
      >
        {isDarkMode ? '☀' : '☾'}
      </button>
      <div className="app-content">
        {error && (
          <div className="error-banner">
            {error}
          </div>
        )}

        {users.length === 0 && !error && (
          <div className="empty-state">
            No users found in the database.
          </div>
        )}

        {users.map((user, index) => (
          <div className="user-block" key={user.userId}>
            <UserStatusBlock
              displayName={user.displayName}
              currentStatus={user.currentStatus}
              statusUpdatedAt={user.statusUpdatedAt}
              onStatusChange={(status) => handleStatusChange(user.userId, status)}
              isUpdating={updatingUserId === user.userId}
            />
            {index < users.length - 1 && <div className="user-divider" aria-hidden="true" />}
          </div>
        ))}
      </div>
    </main>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={
      <div className="app-loading">
        <LoadingSpinner />
      </div>
    }>
      <DashboardContent />
    </Suspense>
  );
}
