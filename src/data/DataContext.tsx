import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { api } from '../api';
import type { AppState, ResourceName } from '../types';

const EMPTY_STATE: AppState = {
  sites: [],
  agents: [],
  evenements: [],
  rondes: [],
  alarmes: [],
  cameras: [],
  indicateurs: [],
};

interface DataContextValue {
  state: AppState;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  create: (resource: ResourceName, body: unknown) => Promise<void>;
  update: (resource: ResourceName, id: string, body: unknown) => Promise<void>;
  remove: (resource: ResourceName, id: string) => Promise<void>;
  testCamera: (id: string) => Promise<{ ok: boolean; message: string; ms: number; statut: string }>;
}

const DataContext = createContext<DataContextValue | null>(null);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AppState>(EMPTY_STATE);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const inFlight = useRef(false);

  const refresh = useCallback(async () => {
    if (inFlight.current) return;
    inFlight.current = true;
    try {
      const next = await api.state();
      setState(next);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur de chargement des données');
    } finally {
      inFlight.current = false;
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
    const timer = setInterval(refresh, 30_000);
    return () => clearInterval(timer);
  }, [refresh]);

  const create = useCallback(
    async (resource: ResourceName, body: unknown) => {
      await api.create(resource, body);
      await refresh();
    },
    [refresh],
  );

  const update = useCallback(
    async (resource: ResourceName, id: string, body: unknown) => {
      await api.update(resource, id, body);
      await refresh();
    },
    [refresh],
  );

  const remove = useCallback(
    async (resource: ResourceName, id: string) => {
      await api.remove(resource, id);
      await refresh();
    },
    [refresh],
  );

  const testCamera = useCallback(
    async (id: string) => {
      const result = await api.testCamera(id);
      await refresh();
      return result;
    },
    [refresh],
  );

  return (
    <DataContext.Provider value={{ state, loading, error, refresh, create, update, remove, testCamera }}>
      {children}
    </DataContext.Provider>
  );
};

export function useData(): DataContextValue {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useData doit être utilisé dans un DataProvider');
  return ctx;
}
