import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { loadData, saveData, getSession, setSession as persistSession, clearSession } from './data/dataService';
import { AppData, Account } from './types';

interface AppContextValue {
  data: AppData;
  setData: (d: AppData) => void;
  session: Account | null;
  setSession: (acc: Account) => Promise<void>;
  logout: () => Promise<void>;
  loading: boolean;
  /** Re-load data from storage (or seed). Resolves true on success, false on error. */
  refreshData: () => Promise<boolean>;
}

const AppContext = createContext<AppContextValue>({} as AppContextValue);

export function AppProvider({ children }: { children: ReactNode }) {
  const [loading, setLoading]       = useState(true);
  const [data, setDataRaw]          = useState<AppData | null>(null);
  const [session, setSessionRaw]    = useState<Account | null>(null);

  useEffect(() => {
    // Load session first, then data — ensures session is never dropped
    // due to a race between the two reads.
    (async () => {
      try {
        const s = await getSession();   // read persisted login
        const d = await loadData();     // read app data (or seed)
        // Re-hydrate session name from live accounts so seed changes are picked up
        if (s) {
          const liveAcc = d.accounts?.find((a: Account) => a.id === s.id);
          setSessionRaw(liveAcc ? { ...s, name: liveAcc.name } : s);
        }
        setDataRaw(d);
      } catch {
        const d = await loadData();
        setDataRaw(d);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  function setData(d: AppData) {
    setDataRaw(d);
    saveData(d);          // fire-and-forget — no need to await in UI
  }

  async function refreshData(): Promise<boolean> {
    try {
      const d = await loadData();
      setDataRaw(d);
      return true;
    } catch {
      return false;
    }
  }

  async function setSession(acc: Account) {
    await persistSession(acc);   // write to AsyncStorage FIRST
    setSessionRaw(acc);          // then update React state
  }

  async function logout() {
    await clearSession();
    setSessionRaw(null);
  }

  if (loading || !data) return null;

  return (
    <AppContext.Provider value={{ data, setData, session, setSession, logout, loading, refreshData }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  return useContext(AppContext);
}
