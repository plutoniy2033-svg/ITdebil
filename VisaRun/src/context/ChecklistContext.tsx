import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { VISA_RUN_CHECKLIST } from '../data/visaRunChecklist';

interface ChecklistContextValue {
  checkedIds: Set<string>;
  toggleItem: (id: string) => void;
  resetChecklist: () => void;
  requiredTotal: number;
  requiredDone: number;
  progressPercent: number;
  isReady: boolean;
  isChecked: (id: string) => boolean;
}

const STORAGE_KEY = 'visarun-checklist';

const ChecklistContext = createContext<ChecklistContextValue | null>(null);

function loadCheckedIds(): Set<string> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return new Set();
    const parsed = JSON.parse(raw) as string[];
    return new Set(Array.isArray(parsed) ? parsed : []);
  } catch {
    return new Set();
  }
}

export function ChecklistProvider({ children }: { children: ReactNode }) {
  const [checkedIds, setCheckedIds] = useState<Set<string>>(loadCheckedIds);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...checkedIds]));
  }, [checkedIds]);

  const toggleItem = useCallback((id: string) => {
    setCheckedIds((current) => {
      const next = new Set(current);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const resetChecklist = useCallback(() => {
    setCheckedIds(new Set());
  }, []);

  const requiredItems = useMemo(
    () => VISA_RUN_CHECKLIST.filter((item) => item.required),
    [],
  );

  const requiredDone = useMemo(
    () => requiredItems.filter((item) => checkedIds.has(item.id)).length,
    [checkedIds, requiredItems],
  );

  const requiredTotal = requiredItems.length;
  const progressPercent = requiredTotal > 0 ? Math.round((requiredDone / requiredTotal) * 100) : 0;
  const isReady = requiredTotal > 0 && requiredDone === requiredTotal;

  const value = useMemo(
    () => ({
      checkedIds,
      toggleItem,
      resetChecklist,
      requiredTotal,
      requiredDone,
      progressPercent,
      isReady,
      isChecked: (id: string) => checkedIds.has(id),
    }),
    [checkedIds, toggleItem, resetChecklist, requiredTotal, requiredDone, progressPercent, isReady],
  );

  return <ChecklistContext.Provider value={value}>{children}</ChecklistContext.Provider>;
}

export function useChecklist() {
  const ctx = useContext(ChecklistContext);
  if (!ctx) throw new Error('useChecklist must be used within ChecklistProvider');
  return ctx;
}
