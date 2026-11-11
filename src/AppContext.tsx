import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { createEmptyData, DataResource, loadResources, getSession, setSession as persistSession, clearSession } from './data/dataService';
import { AppData, Account } from './types';
import { colors, radius, spacing } from './theme';

interface AppContextValue {
  data: AppData;
  setData: (d: AppData) => void;
  session: Account | null;
  setSession: (acc: Account) => Promise<void>;
  logout: () => Promise<void>;
  loading: boolean;
  /** Load only the API resources requested by the active feature. */
  requestResources: (resources: DataResource[]) => Promise<boolean>;
}

const AppContext = createContext<AppContextValue>({} as AppContextValue);

export function AppProvider({ children }: { children: ReactNode }) {
  const [loading, setLoading]       = useState(true);
  const [data, setDataRaw]          = useState<AppData>(createEmptyData());
  const [session, setSessionRaw]    = useState<Account | null>(null);
  const [loadError, setLoadError]   = useState('');

  async function initialize() {
    setLoading(true);
    setLoadError('');
    try {
      const s = await getSession();
      setSessionRaw(s);
      setDataRaw(createEmptyData());
    } catch (error) {
      setDataRaw(createEmptyData());
      setLoadError(error instanceof Error ? error.message : 'Unable to connect to the API.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    // Load session first, then data — ensures session is never dropped
    // due to a race between the two reads.
    void initialize();
  }, []);

  function setData(d: AppData) {
    setDataRaw(d);
  }

  async function requestResources(resources: DataResource[]): Promise<boolean> {
    try {
      const requested = await loadResources(resources);
      setDataRaw(current => ({ ...current, ...requested }));
      return true;
    } catch {
      return false;
    }
  }

  async function setSession(acc: Account) {
    await persistSession(acc);
    setSessionRaw(acc);
  }

  async function logout() {
    await clearSession();
    setSessionRaw(null);
    setDataRaw(createEmptyData());
  }

  if (loading) {
    return <View style={styles.state}><ActivityIndicator color={colors.teal} /><Text style={styles.stateText}>Loading from the API...</Text></View>;
  }

  if (loadError) {
    return (
      <View style={styles.state}>
        <Text style={styles.errorTitle}>Unable to load application data</Text>
        <Text style={styles.stateText}>{loadError}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={() => void initialize()}>
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <AppContext.Provider value={{ data, setData, session, setSession, logout, loading, requestResources }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  return useContext(AppContext);
}

const styles = StyleSheet.create({
  state: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.lg, backgroundColor: colors.white },
  errorTitle: { color: colors.navy, fontSize: 18, fontWeight: '700', marginBottom: spacing.sm },
  stateText: { color: colors.textMuted, textAlign: 'center', marginTop: spacing.sm },
  retryButton: { marginTop: spacing.lg, paddingHorizontal: spacing.lg, paddingVertical: spacing.sm, borderRadius: radius.md, backgroundColor: colors.teal },
  retryText: { color: colors.white, fontWeight: '700' },
});
