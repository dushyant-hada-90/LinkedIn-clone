import { useState, useCallback } from 'react';
import { connectionsApi } from '../lib/api';

export interface IcebreakerOption {
  tone: string;
  message: string;
}

export interface IcebreakerData {
  greeting: string;
  options: IcebreakerOption[];
  sharedInterests: string[];
}

export function useIcebreaker() {
  const [data, setData] = useState<IcebreakerData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generate = useCallback(async (userId: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await connectionsApi.getIcebreaker(userId);
      setData(res.data);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to generate icebreaker');
    } finally {
      setLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setData(null);
    setError(null);
  }, []);

  return { data, loading, error, generate, reset };
}
