import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

interface SidebarContextValue {
  collapsed: boolean;
  toggleCollapsed: () => void;
}

const SidebarContext = createContext<SidebarContextValue | null>(null);

const STORAGE_KEY = 'visarun-sidebar-collapsed';

export function SidebarProvider({ children }: { children: ReactNode }) {
  const [collapsed, setCollapsed] = useState(() => {
    try {
      return localStorage.getItem(STORAGE_KEY) === 'true';
    } catch {
      return false;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, String(collapsed));
    } catch {
      // localStorage может быть недоступен — игнорируем
    }
  }, [collapsed]);

  const toggleCollapsed = useCallback(() => {
    setCollapsed((value) => !value);
  }, []);

  const value = useMemo(
    () => ({ collapsed, toggleCollapsed }),
    [collapsed, toggleCollapsed],
  );

  return <SidebarContext.Provider value={value}>{children}</SidebarContext.Provider>;
}

export function useSidebar() {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error('useSidebar must be used within SidebarProvider');
  }
  return context;
}
