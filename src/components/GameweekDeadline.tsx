import { useEffect, useState } from 'react';
import { getBootstrapData } from '@/services/api';
import type { Event } from '@/types/fpl';

interface GameweekDeadlineProps {
  cooldown?: number; // Cooldown in milliseconds (default: 5 minutes)
}

export function GameweekDeadline({ cooldown = 5 * 60 * 1000 }: GameweekDeadlineProps) {
  const [deadline, setDeadline] = useState<{ gameweek: number; deadline: string; deadlineTime: Date } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<string>('');

  // Fetch deadline data
  useEffect(() => {
    let intervalId: number | null = null;

    const fetchDeadline = async () => {
      try {
        setLoading(true);
        setError(null);
        const bootstrap = await getBootstrapData();
        
        // Find the next gameweek (is_next === true)
        const nextEvent = bootstrap.events.find((event: Event) => event.is_next);
        
        if (nextEvent) {
          const deadlineTime = new Date(nextEvent.deadline_time);
          setDeadline({
            gameweek: nextEvent.id,
            deadline: nextEvent.deadline_time,
            deadlineTime,
          });
        } else {
          // If no next event, find the current event
          const currentEvent = bootstrap.events.find((event: Event) => event.is_current);
          if (currentEvent) {
            const deadlineTime = new Date(currentEvent.deadline_time);
            setDeadline({
              gameweek: currentEvent.id,
              deadline: currentEvent.deadline_time,
              deadlineTime,
            });
          }
        }
      } catch (err) {
        console.error('Error fetching deadline:', err);
        setError(err instanceof Error ? err : new Error('Failed to fetch deadline'));
      } finally {
        setLoading(false);
      }
    };

    // Initial fetch
    fetchDeadline();

    // Set up interval to refresh after cooldown
    intervalId = setInterval(() => {
      fetchDeadline();
    }, cooldown);

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [cooldown]);

  // Update time remaining every second
  useEffect(() => {
    if (!deadline) return;

    const updateTimeRemaining = () => {
      const now = new Date();
      const diff = deadline.deadlineTime.getTime() - now.getTime();
      
      if (diff <= 0) {
        setTimeRemaining('Deadline passed');
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      if (days > 0) {
        setTimeRemaining(`${days}d ${hours}h ${minutes}m`);
      } else if (hours > 0) {
        setTimeRemaining(`${hours}h ${minutes}m ${seconds}s`);
      } else if (minutes > 0) {
        setTimeRemaining(`${minutes}m ${seconds}s`);
      } else {
        setTimeRemaining(`${seconds}s`);
      }
    };

    // Update immediately
    updateTimeRemaining();

    // Update every second
    const timeInterval = setInterval(updateTimeRemaining, 1000);

    return () => {
      clearInterval(timeInterval);
    };
  }, [deadline]);

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-xs text-slate-400">
        <span>Loading deadline...</span>
      </div>
    );
  }

  if (error || !deadline) {
    return null;
  }

  const formatDeadline = (date: Date): string => {
    return new Intl.DateTimeFormat('en-GB', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
      timeZoneName: 'short',
    }).format(date);
  };

  return (
    <div className="flex items-center gap-2 text-xs">
      <span className="text-slate-400">GW{deadline.gameweek} Deadline:</span>
      <span className="font-medium text-white">{formatDeadline(deadline.deadlineTime)}</span>
      {timeRemaining && (
        <>
          <span className="text-slate-500">•</span>
          <span className={timeRemaining.includes('s') && !timeRemaining.includes('m') ? 'font-semibold text-red-400' : 'text-violet-400'}>
            {timeRemaining}
          </span>
        </>
      )}
    </div>
  );
}
