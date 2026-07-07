import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { LanguageProvider } from './context/LanguageContext';
import { VisaTrackerProvider } from './context/VisaTrackerContext';
import { SettingsProvider } from './context/SettingsContext';
import 'leaflet/dist/leaflet.css';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <LanguageProvider>
        <VisaTrackerProvider>
          <SettingsProvider>
            <App />
          </SettingsProvider>
        </VisaTrackerProvider>
      </LanguageProvider>
    </BrowserRouter>
  </StrictMode>,
);
