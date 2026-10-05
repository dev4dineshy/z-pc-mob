/**
 * useRefresh — reusable pull-to-refresh hook for PeopleConnect screens.
 *
 * Usage:
 *   const { refreshing, onRefresh, errorMsg, clearError } = useRefresh();
 *
 * - Calls `refreshData()` from AppContext (reloads local data from storage).
 * - Guards against duplicate concurrent refreshes.
 * - Sets `errorMsg` on failure; the caller can render a toast/banner and
 *   call `clearError()` when done.
 * - Always clears `refreshing` regardless of success or failure.
 */

import { useState, useCallback, useRef } from 'react';
import { useApp } from '../AppContext';

export interface UseRefreshResult {
  refreshing: boolean;
  onRefresh: () => void;
  errorMsg: string | null;
  clearError: () => void;
}

export function useRefresh(): UseRefreshResult {
  const { refreshData } = useApp();
  const [refreshing, setRefreshing] = useState(false);
  const [errorMsg, setErrorMsg]     = useState<string | null>(null);
  // Ref-based guard — prevents a second gesture firing while one is in flight
  const inFlight = useRef(false);

  const onRefresh = useCallback(() => {
    if (inFlight.current) return;
    inFlight.current = true;
    setRefreshing(true);
    setErrorMsg(null);

    refreshData().then((ok) => {
      if (!ok) {
        setErrorMsg('Could not refresh. Pull down to try again.');
      }
    }).finally(() => {
      setRefreshing(false);
      inFlight.current = false;
    });
  }, [refreshData]);

  const clearError = useCallback(() => setErrorMsg(null), []);

  return { refreshing, onRefresh, errorMsg, clearError };
}
