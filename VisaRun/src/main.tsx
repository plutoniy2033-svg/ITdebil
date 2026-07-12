import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { LanguageProvider } from './context/LanguageContext';
import { AuthProvider } from './context/AuthContext';
import { VisaTrackerProvider } from './context/VisaTrackerContext';
import { SettingsProvider } from './context/SettingsContext';
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
            <VisaTrackerProvider>
              <SettingsProvider>
                <DeadlineReminderSync />
                <App />
              </SettingsProvider>
            </VisaTrackerProvider>
          </AuthGate>
        </AuthProvider>
      </LanguageProvider>
    </BrowserRouter>
  </StrictMode>,
);
