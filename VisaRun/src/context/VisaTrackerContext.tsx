import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import type {
  VisaTrackerState,
  VisaLimit,
  Citizenship,
  EntryType,
  VisaRunRecord,
} from '../types';
import { getDefaultDayLimit } from '../utils/visaRules';
import { fetchTracker, saveTracker } from '../api/userData';
import {
  isTrackerEmpty,
  isTrackerImported,
  loadLegacyTracker,
  markTrackerImported,
  saveLocalTracker,
} from '../utils/localDataMigration';

interface VisaTrackerContextValue extends VisaTrackerState {
  loading: boolean;
  isLocalMode: boolean;
  error: string | null;
  reload: () => Promise<void>;
  setEntryDate: (date: string) => void;
  setExitDate: (date: string) => void;
  setDayLimit: (limit: VisaLimit) => void;
  setLocation: (location: string) => void;
  setCitizenship: (citizenship: Citizenship) => void;
  setEntryType: (entryType: EntryType) => void;
  addVisaRunRecord: (record: Omit<VisaRunRecord, 'id'>) => void;
  removeVisaRunRecord: (id: string) => void;
  daysUsed: number;
  daysRemaining: number;
  isOverstay: boolean;
  overstayDays: number;
  statusColor: 'success' | 'warning' | 'danger';
}

const defaultState: VisaTrackerState = {
  entryDate: '',
  exitDate: '',
  dayLimit: 45,
  location: 'Vietnam',
  citizenship: 'RU',
  entryType: 'visa-free',
  visaRunHistory: [],
};

function daysBetween(from: string, to: string): number {
  if (!from || !to) return 0;
  const start = new Date(from);
  const end = new Date(to);
  const diff = end.getTime() - start.getTime();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

function normalizeDate(value: string): string {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toISOString().slice(0, 10);
}

const VisaTrackerContext = createContext<VisaTrackerContextValue | null>(null);

export function VisaTrackerProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<VisaTrackerState>(defaultState);
  const [loading, setLoading] = useState(true);
  const [isLocalMode, setIsLocalMode] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const hydratedRef = useRef(false);
  const saveTimerRef = useRef<number | null>(null);
  const localModeRef = useRef(false);

  const persistState = useCallback(async (nextState: VisaTrackerState) => {
    if (localModeRef.current) {
      saveLocalTracker(nextState);
      setError(null);
      return;
    }

    try {
      await saveTracker(nextState);
      setError(null);
    } catch {
      localModeRef.current = true;
      setIsLocalMode(true);
      saveLocalTracker(nextState);
      setError(null);
    }
  }, []);

  const scheduleSave = useCallback(
    (nextState: VisaTrackerState) => {
      if (saveTimerRef.current) {
        window.clearTimeout(saveTimerRef.current);
      }
      saveTimerRef.current = window.setTimeout(() => {
        void persistState(nextState);
      }, 400);
    },
    [persistState],
  );

  const loadFromServer = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      let tracker = (await fetchTracker()).tracker;
      localModeRef.current = false;
      setIsLocalMode(false);

      if (!isTrackerImported() && isTrackerEmpty(tracker)) {
        const legacy = loadLegacyTracker();
        if (!isTrackerEmpty(legacy)) {
          tracker = (await saveTracker(legacy)).tracker;
          markTrackerImported();
        } else {
          markTrackerImported();
        }
      }

      setState(tracker);
      hydratedRef.current = true;
    } catch {
      localModeRef.current = true;
      setIsLocalMode(true);
      setState(loadLegacyTracker());
      hydratedRef.current = true;
      setError(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadFromServer();
    return () => {
      if (saveTimerRef.current) {
        window.clearTimeout(saveTimerRef.current);
      }
    };
  }, [loadFromServer]);

  const updateState = useCallback(
    (updater: (current: VisaTrackerState) => VisaTrackerState) => {
      setState((current) => {
        const next = updater(current);
        if (hydratedRef.current) {
          scheduleSave(next);
        }
        return next;
      });
    },
    [scheduleSave],
  );

  const today = new Date().toISOString().slice(0, 10);
  const referenceDate = state.exitDate || today;
  const daysUsed = state.entryDate ? daysBetween(state.entryDate, referenceDate) : 0;
  const daysRemaining = state.dayLimit - daysUsed;
  const isOverstay = daysRemaining < 0;
  const overstayDays = isOverstay ? Math.abs(daysRemaining) : 0;

  const statusColor = useMemo((): 'success' | 'warning' | 'danger' => {
    if (isOverstay) return 'danger';
    if (daysRemaining <= 7) return 'warning';
    return 'success';
  }, [isOverstay, daysRemaining]);

  const applyProfileRules = (
    patch: Partial<VisaTrackerState>,
    current: VisaTrackerState,
  ): VisaTrackerState => {
    const next = { ...current, ...patch };
    const citizenship = patch.citizenship ?? current.citizenship;
    const entryType = patch.entryType ?? current.entryType;

    if (patch.citizenship !== undefined || patch.entryType !== undefined) {
      next.dayLimit = getDefaultDayLimit(citizenship, entryType);
    }

    return next;
  };

  const value: VisaTrackerContextValue = {
    ...state,
    loading,
    isLocalMode,
    error,
    reload: loadFromServer,
    setEntryDate: (entryDate) =>
      updateState((s) => {
        const normalizedEntry = normalizeDate(entryDate);
        const normalizedExit = normalizeDate(s.exitDate);
        const nextExit =
          normalizedEntry && normalizedExit && normalizedExit < normalizedEntry ? '' : normalizedExit;
        return { ...s, entryDate: normalizedEntry, exitDate: nextExit };
      }),
    setExitDate: (exitDate) =>
      updateState((s) => {
        const normalizedExit = normalizeDate(exitDate);
        const normalizedEntry = normalizeDate(s.entryDate);
        const validExit =
          normalizedExit && normalizedEntry && normalizedExit < normalizedEntry ? '' : normalizedExit;
        return { ...s, exitDate: validExit };
      }),
    setDayLimit: (dayLimit) => updateState((s) => ({ ...s, dayLimit })),
    setLocation: (location) => updateState((s) => ({ ...s, location })),
    setCitizenship: (citizenship) =>
      updateState((s) => applyProfileRules({ citizenship }, s)),
    setEntryType: (entryType) =>
      updateState((s) => applyProfileRules({ entryType }, s)),
    addVisaRunRecord: (record) =>
      updateState((s) => ({
        ...s,
        visaRunHistory: [{ ...record, id: crypto.randomUUID() }, ...s.visaRunHistory],
      })),
    removeVisaRunRecord: (id) =>
      updateState((s) => ({
        ...s,
        visaRunHistory: s.visaRunHistory.filter((r) => r.id !== id),
      })),
    daysUsed,
    daysRemaining: isOverstay ? 0 : daysRemaining,
    isOverstay,
    overstayDays,
    statusColor,
  };

  return (
    <VisaTrackerContext.Provider value={value}>
      {children}
    </VisaTrackerContext.Provider>
  );
}

export function useVisaTracker() {
  const ctx = useContext(VisaTrackerContext);
  if (!ctx) throw new Error('useVisaTracker must be used within VisaTrackerProvider');
  return ctx;
}
