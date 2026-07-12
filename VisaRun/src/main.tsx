import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { LanguageProvider } from './context/LanguageContext';
import { AuthProvider } from './context/AuthContext';
import { VisaTrackerProvider } from './context/VisaTrackerContext';
import { SettingsProvider } from './context/SettingsContext';
import { NotificationProvider } from './context/NotificationContext';
import { ChecklistProvider } from './context/ChecklistContext';
import { DeadlineReminderSync } from './components/DeadlineReminderSync';
import { AuthGate } from './components/AuthGate';
import 'leaflet/dist/leaflet.css';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <LanguageProvider>
        <AuthProvider>
          <AuthGate>
            <NotificationProvider>
              <VisaTrackerProvider>
                <SettingsProvider>
                  <ChecklistProvider>
                    <DeadlineReminderSync />
                    <App />
                  </ChecklistProvider>
                </SettingsProvider>
              </VisaTrackerProvider>
            </NotificationProvider>
          </AuthGate>
        </AuthProvider>
      </LanguageProvider>
    </BrowserRouter>
  </StrictMode>,
);
