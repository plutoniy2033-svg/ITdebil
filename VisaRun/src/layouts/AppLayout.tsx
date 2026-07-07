import { CloudBackground } from '../components/CloudBackground';
import { PageTransition } from '../components/PageTransition';
import { Sidebar } from '../components/Sidebar';
import { BottomNav } from '../components/BottomNav';
import { SidebarProvider } from '../context/SidebarContext';

export function AppLayout() {
  return (
    <SidebarProvider>
      <CloudBackground />
      <div className="app-layout">
        <Sidebar />
        <div className="app-layout__main">
          <main className="app-layout__content">
            <PageTransition />
          </main>
          <BottomNav />
        </div>
      </div>
    </SidebarProvider>
  );
}