import { createContext, useContext, useState, useEffect, useMemo, type ReactNode } from 'react';
import type {
  VisaTrackerState,
  VisaLimit,
  Citizenship,
  EntryType,
  VisaRunRecord,
} from '../types';
import { getDefaultDayLimit } from '../utils/visaRules';

interface VisaTrackerContextValue extends VisaTrackerState {
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

const STORAGE_KEY = 'visarun-tracker';

const defaultState: VisaTrackerState = {
  entryDate: '',
  exitDate: '',
  dayLimit: 45,
  location: 'Vietnam',
  citizenship: 'RU',
  entryType: 'visa-free',
  visaRunHistory: [],
};

function loadState(): VisaTrackerState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        ...defaultState,
        ...parsed,
        visaRunHistory: parsed.visaRunHistory ?? [],
      };
    }
  } catch {
    /* ignore corrupt data */
  }
  return defaultState;
}

function daysBetween(from: string, to: string): number {
  if (!from || !to) return 0;
  const start = new Date(from);
  const end = new Date(to);
  const diff = end.getTime() - start.getTime();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

const VisaTrackerContext = createContext<VisaTrackerContextValue | null>(null);

export function VisaTrackerProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<VisaTrackerState>(loadState);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

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
    setEntryDate: (entryDate) => setState((s) => ({ ...s, entryDate })),
    setExitDate: (exitDate) => setState((s) => ({ ...s, exitDate })),
    setDayLimit: (dayLimit) => setState((s) => ({ ...s, dayLimit })),
    setLocation: (location) => setState((s) => ({ ...s, location })),
    setCitizenship: (citizenship) =>
      setState((s) => applyProfileRules({ citizenship }, s)),
    setEntryType: (entryType) =>
      setState((s) => applyProfileRules({ entryType }, s)),
    addVisaRunRecord: (record) =>
      setState((s) => ({
        ...s,
        visaRunHistory: [
          { ...record, id: crypto.randomUUID() },
          ...s.visaRunHistory,
        ],
      })),
    removeVisaRunRecord: (id) =>
      setState((s) => ({
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
