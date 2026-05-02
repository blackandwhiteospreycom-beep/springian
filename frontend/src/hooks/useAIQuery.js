import { useState, useCallback } from 'react';
import { aiAPI } from '../api/ai';

/**
 * useAIQuery — Hook for natural language data queries (non-streaming)
 *
 * Usage:
 *   const { result, isLoading, error, executeQuery } = useAIQuery();
 */
export function useAIQuery() {
  const [result, setResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const executeQuery = useCallback(async (prompt) => {
    if (!prompt?.trim()) return;

    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await aiAPI.query(prompt);
      if (response.success) {
        setResult(response.data);
        return response.data;
      } else {
        setError(response.error || 'Query failed');
      }
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Query failed');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setResult(null);
    setError(null);
    setIsLoading(false);
  }, []);

  return { result, isLoading, error, executeQuery, reset };
}
