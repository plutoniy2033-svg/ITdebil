import { Routes, Route } from 'react-router-dom';
import { AppLayout } from './layouts/AppLayout';
import { TrackerPage } from './pages/TrackerPage';
import { CheckpointsPage } from './pages/CheckpointsPage';
import { CheckpointDetailPage } from './pages/CheckpointDetailPage';
import { EVisaPage } from './pages/EVisaPage';
import { ToursPage } from './pages/ToursPage';
import { CommunityPage } from './pages/CommunityPage';
import { SettingsPage } from './pages/SettingsPage';

export default function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route index element={<TrackerPage />} />
        <Route path="checkpoints" element={<CheckpointsPage />} />
        <Route path="checkpoints/:id" element={<CheckpointDetailPage />} />
        <Route path="e-visa" element={<EVisaPage />} />
        <Route path="tours" element={<ToursPage />} />
        <Route path="community" element={<CommunityPage />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>
    </Routes>
  );
}
