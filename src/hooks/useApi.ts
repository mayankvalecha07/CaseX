import { useState, useEffect, useCallback, useRef } from 'react';

export interface UseApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  isRetrying: boolean;
  lastUpdated: string | null;
}

export interface UseApiOptions {
  autoFetch?: boolean;
  retryCount?: number;
  onSuccess?: (data: any) => void;
  onError?: (err: string) => void;
}

/**
 * useApi Hook
 * Handles asynchronous API requests with loading, error, retry,
 * and AbortController request cancellation.
 */
export function useApi<T>(
  apiFn: (signal?: AbortSignal) => Promise<T>,
  options: UseApiOptions = {}
) {
  const { autoFetch = true } = options;

  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    loading: autoFetch,
    error: null,
    isRetrying: false,
    lastUpdated: null
  });

  const abortControllerRef = useRef<AbortController | null>(null);

  const execute = useCallback(
    async (isRetry: boolean = false) => {
      // Abort previous in-flight request if any
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      const controller = new AbortController();
      abortControllerRef.current = controller;

      setState(prev => ({
        ...prev,
        loading: true,
        error: null,
        isRetrying: isRetry
      }));

      try {
        const result = await apiFn(controller.signal);
        setState({
          data: result,
          loading: false,
          error: null,
          isRetrying: false,
          lastUpdated: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
        });
        if (options.onSuccess) {
          options.onSuccess(result);
        }
        return result;
      } catch (err: any) {
        if (err.name === 'AbortError') {
          // Request was aborted deliberately
          return null;
        }

        const errorMessage =
          err instanceof Error
            ? err.message
            : typeof err === 'string'
            ? err
            : 'An unexpected network error occurred while communicating with the remote server.';

        setState(prev => ({
          ...prev,
          loading: false,
          error: errorMessage,
          isRetrying: false
        }));

        if (options.onError) {
          options.onError(errorMessage);
        }
        return null;
      }
    },
    [apiFn, options]
  );

  useEffect(() => {
    if (autoFetch) {
      execute(false);
    }

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [execute, autoFetch]);

  const retry = useCallback(() => {
    return execute(true);
  }, [execute]);

  return {
    ...state,
    refetch: execute,
    retry,
    setData: (dataOrUpdater: T | ((prev: T | null) => T)) => {
      setState(prev => ({
        ...prev,
        data: typeof dataOrUpdater === 'function' ? (dataOrUpdater as any)(prev.data) : dataOrUpdater
      }));
    }
  };
}
