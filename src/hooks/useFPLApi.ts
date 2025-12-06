import { useState, useCallback } from 'react';
import {
  getBootstrapData,
  getFixtures,
  type BootstrapData,
  type Fixture,
} from '@/services/api';

export function useFPLApi() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchBootstrapData = useCallback(async (): Promise<BootstrapData> => {
    setLoading(true);
    setError(null);
    try {
      const data = await getBootstrapData();
      return data;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to fetch bootstrap data');
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchFixtures = useCallback(async (): Promise<Fixture[]> => {
    setLoading(true);
    setError(null);
    try {
      const data = await getFixtures();
      return data;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to fetch fixtures');
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    fetchBootstrapData,
    fetchFixtures,
    loading,
    error,
  };
}

