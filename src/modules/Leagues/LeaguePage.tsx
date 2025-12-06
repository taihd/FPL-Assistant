import { useEffect } from 'react';
import { useAppContext } from '@/context/AppContext';

export function LeaguePage() {
  const { setScreen } = useAppContext();

  useEffect(() => {
    setScreen('leagues');
  }, [setScreen]);

  return (
    <div>
      <h1 className="mb-6 text-3xl font-bold text-slate-900">Leagues</h1>
      <div className="rounded-lg bg-white p-6 shadow-sm">
        <p className="text-slate-600">Leagues module coming soon...</p>
      </div>
    </div>
  );
}

