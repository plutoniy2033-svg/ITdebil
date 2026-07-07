import { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { getRouteIndex } from '../config/navConfig';
import { CloudSvg } from './CloudSvg';

interface SkyTheme {
  id: string;
  skyTop: string;
  skyMid: string;
  skyBottom: string;
  accentGlow: string;
}

const themes: SkyTheme[] = [
  {
    id: 'tracker',
    skyTop: '#6eb5e8',
    skyMid: '#a8d4f0',
    skyBottom: '#e8f4fc',
    accentGlow: 'rgba(255, 255, 255, 0.35)',
  },
  {
    id: 'checkpoints',
    skyTop: '#5ec4b8',
    skyMid: '#9de0d8',
    skyBottom: '#e0f7f4',
    accentGlow: 'rgba(255, 255, 255, 0.32)',
  },
  {
    id: 'evisa',
    skyTop: '#7a94d4',
    skyMid: '#b0c4e8',
    skyBottom: '#e8eef8',
    accentGlow: 'rgba(255, 255, 255, 0.34)',
  },
  {
    id: 'tours',
    skyTop: '#d4a86a',
    skyMid: '#e8cfa0',
    skyBottom: '#faf3e6',
    accentGlow: 'rgba(255, 255, 255, 0.3)',
  },
  {
    id: 'community',
    skyTop: '#9a84d4',
    skyMid: '#c4b4e8',
    skyBottom: '#f0ecf8',
    accentGlow: 'rgba(255, 255, 255, 0.33)',
  },
  {
    id: 'settings',
    skyTop: '#8aa0b8',
    skyMid: '#b8c8d8',
    skyBottom: '#eef2f6',
    accentGlow: 'rgba(255, 255, 255, 0.28)',
  },
];

const TRANSITION_MS = 520;

function resolveTheme(pathname: string): SkyTheme {
  if (pathname.startsWith('/checkpoints')) return themes[1];
  if (pathname.startsWith('/e-visa')) return themes[2];
  if (pathname.startsWith('/tours')) return themes[3];
  if (pathname.startsWith('/community')) return themes[4];
  if (pathname.startsWith('/settings')) return themes[5];
  return themes[0];
}

function themeToStyle(theme: SkyTheme): React.CSSProperties {
  return {
    '--sky-top': theme.skyTop,
    '--sky-mid': theme.skyMid,
    '--sky-bottom': theme.skyBottom,
  } as React.CSSProperties;
}

export function CloudBackground() {
  const { pathname } = useLocation();
  const theme = resolveTheme(pathname);
  const routeIndex = getRouteIndex(pathname);

  const prevThemeRef = useRef(theme);
  const [outgoingTheme, setOutgoingTheme] = useState<SkyTheme | null>(null);
  const [skyTransitioning, setSkyTransitioning] = useState(false);

  // Два слоя неба: старое уходит, новое появляется — цвет меняется плавно
  useEffect(() => {
    if (theme.id === prevThemeRef.current.id) return;

    setOutgoingTheme(prevThemeRef.current);
    setSkyTransitioning(true);
    prevThemeRef.current = theme;

    const timer = window.setTimeout(() => {
      setOutgoingTheme(null);
      setSkyTransitioning(false);
    }, TRANSITION_MS);

    return () => window.clearTimeout(timer);
  }, [theme]);

  // Цвет подложки плавно догоняет низ неба
  useEffect(() => {
    document.documentElement.style.setProperty('--sky-bottom', theme.skyBottom);
    document.documentElement.style.backgroundColor = theme.skyBottom;
    document.body.style.backgroundColor = theme.skyBottom;
  }, [theme.skyBottom]);

  return (
    <div
      className="cloud-bg"
      data-theme={theme.id}
      style={
        {
          '--route-offset': routeIndex,
          '--accent-glow': theme.accentGlow,
        } as React.CSSProperties
      }
      aria-hidden
    >
      <div
        className={`cloud-bg__sky cloud-bg__sky--active${skyTransitioning ? ' cloud-bg__sky--fade-in' : ''}`}
        style={themeToStyle(theme)}
      />
      {outgoingTheme && (
        <div
          className="cloud-bg__sky cloud-bg__sky--fade-out"
          style={themeToStyle(outgoingTheme)}
        />
      )}

      <div className="cloud-bg__layer cloud-bg__layer--far">
        <div className="cloud-bg__glow cloud-bg__glow--1" />
        <div className="cloud-bg__glow cloud-bg__glow--2" />
        <CloudSvg variant="stratus" className="cloud-item cloud-item--1" depth="far" />
        <CloudSvg variant="cumulus-b" className="cloud-item cloud-item--2" depth="far" />
        <CloudSvg variant="cumulus-c" className="cloud-item cloud-item--6" depth="far" />
      </div>

      <div className="cloud-bg__layer cloud-bg__layer--mid">
        <CloudSvg variant="cumulus-a" className="cloud-item cloud-item--3" depth="mid" />
        <CloudSvg variant="cumulus-b" className="cloud-item cloud-item--4" depth="mid" />
        <CloudSvg variant="stratus" className="cloud-item cloud-item--7" depth="mid" />
        <CloudSvg variant="cumulus-c" className="cloud-item cloud-item--8" depth="mid" />
      </div>

      <div className="cloud-bg__layer cloud-bg__layer--near">
        <CloudSvg variant="cumulus-c" className="cloud-item cloud-item--5" depth="near" />
        <CloudSvg variant="cumulus-a" className="cloud-item cloud-item--9" depth="near" />
      </div>
    </div>
  );
}
