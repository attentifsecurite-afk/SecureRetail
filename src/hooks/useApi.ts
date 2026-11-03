import { useState, useEffect } from 'react';
import api from '../services/api';

// Generic hook for API calls
export function useApi<T>(endpoint: string, options?: { enabled?: boolean }) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await api.get(endpoint);
      setData(response.data.data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (options?.enabled === false) {
      setLoading(false);
      return;
    }

    fetchData();
  }, [endpoint, options?.enabled]);

  return { data, loading, error, refetch: fetchData };
}
