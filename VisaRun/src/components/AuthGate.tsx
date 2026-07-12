import type { ReactNode } from 'react';
import { useAuth } from '../context/AuthContext';
import { SplashScreen } from './SplashScreen';
import { AuthPage } from '../pages/AuthPage';

export function AuthGate({ children }: { children: ReactNode }) {
  const { status } = useAuth();

  if (status === 'loading') {
    return <SplashScreen />;
  }

  if (status === 'unauthenticated') {
    return <AuthPage />;
  }

  return <>{children}</>;
}
