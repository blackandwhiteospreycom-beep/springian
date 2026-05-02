import { useState, useEffect, useCallback } from 'react';
import { aiAPI } from '../api/ai';

/**
 * useAISuggest — Hook for getting AI suggestions in a specific context
 *
 * Usage:
 *   const { suggestions, isLoading, error, fetchSuggestions } = useAISuggest(entityType, entityId);
 */
export function useAISuggest(entityType = null, entityId = null) {
  const [suggestions, setSuggestions] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchSuggestions = useCallback(async (contextOverride = null) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await aiAPI.suggest(contextOverride, entityType, entityId);
      if (response.success) {
        setSuggestions(response.data);
        return response.data;
      } else {
        setError(response.error || 'Failed to get suggestions');
      }
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Failed to get suggestions');
    } finally {
      setIsLoading(false);
    }
  }, [entityType, entityId]);

  const reset = useCallback(() => {
    setSuggestions(null);
    setError(null);
  }, []);

  return { suggestions, isLoading, error, fetchSuggestions, reset };
}
