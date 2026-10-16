import { useEffect, useState } from 'react';

export function useCountdown(expiresAt) {
  const [remainingMs, setRemainingMs] = useState(() =>
    Math.max(0, new Date(expiresAt).getTime() - Date.now()),
  );

  useEffect(() => {
    const update = () =>
      setRemainingMs(Math.max(0, new Date(expiresAt).getTime() - Date.now()));
    update();
    const interval = window.setInterval(update, 1000);
    return () => window.clearInterval(interval);
  }, [expiresAt]);

  return {
    remainingMs,
    isExpired: remainingMs === 0,
    seconds: Math.floor(remainingMs / 1000),
  };
}
