import { CloudBackground } from '../components/CloudBackground';
import { PageTransition } from '../components/PageTransition';
import { Sidebar } from '../components/Sidebar';
import { BottomNav } from '../components/BottomNav';
import { SyncStatusBanner } from '../components/SyncStatusBanner';
import { NotificationBell } from '../components/NotificationBell';
import { SidebarProvider } from '../context/SidebarContext';

export function AppLayout() {
  return (
    <SidebarProvider>
      <CloudBackground />
      <div className="app-layout">
        <Sidebar />
        <div className="app-layout__main">
          <div className="app-layout__topbar">
            <SyncStatusBanner />
            <NotificationBell />
          </div>
          <main className="app-layout__content">
            <PageTransition />
          </main>
          <BottomNav />
        </div>
      </div>
    </SidebarProvider>
  );
}
