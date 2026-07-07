import { useLayoutEffect, useRef, useState, type ReactElement } from 'react';
import { useLocation, useOutlet } from 'react-router-dom';
import { getRouteIndex } from '../config/navConfig';

const TRANSITION_MS = 520;

export { TRANSITION_MS as PAGE_TRANSITION_MS };

interface PageLayer {
  pathname: string;
  outlet: ReactElement | null;
  phase: 'idle' | 'enter' | 'exit';
}

function makeLayer(
  pathname: string,
  outlet: ReactElement | null,
  phase: PageLayer['phase'],
): PageLayer {
  return { pathname, outlet, phase };
}

// Старая страница уходит вверх, новая поднимается снизу
export function PageTransition() {
  const location = useLocation();
  const outlet = useOutlet();

  const prevPathRef = useRef(location.pathname);
  const prevOutletRef = useRef(outlet);
  const isTransitioningRef = useRef(false);

  const [layers, setLayers] = useState<PageLayer[]>([
    makeLayer(location.pathname, outlet as ReactElement | null, 'idle'),
  ]);

  useLayoutEffect(() => {
    const prevPath = prevPathRef.current;
    const outletNode = outlet as ReactElement | null;

    // Во время анимации игнорируем повторный рендер outlet (VisaDataPage так сбрасывала переход)
    if (location.pathname === prevPath) {
      if (!isTransitioningRef.current) {
        setLayers([makeLayer(location.pathname, outletNode, 'idle')]);
        prevOutletRef.current = outlet;
      }
      return;
    }

    const prevIndex = getRouteIndex(prevPath);
    const nextIndex = getRouteIndex(location.pathname);

    if (prevIndex !== nextIndex) {
      isTransitioningRef.current = true;

      setLayers([
        makeLayer(prevPath, prevOutletRef.current as ReactElement | null, 'exit'),
        makeLayer(location.pathname, outletNode, 'enter'),
      ]);

      prevPathRef.current = location.pathname;
      prevOutletRef.current = outlet;

      const timer = window.setTimeout(() => {
        isTransitioningRef.current = false;
        setLayers([makeLayer(location.pathname, outletNode, 'idle')]);
      }, TRANSITION_MS);

      return () => window.clearTimeout(timer);
    }

    isTransitioningRef.current = false;
    setLayers([makeLayer(location.pathname, outletNode, 'idle')]);
    prevPathRef.current = location.pathname;
    prevOutletRef.current = outlet;
  }, [location.pathname, outlet]);

  const isActive = layers.length > 1;

  return (
    <div className={`page-transition${isActive ? ' page-transition--active' : ''}`}>
      {layers.map((layer) => (
        <div
          key={`${layer.pathname}-${layer.phase}`}
          className={`page-layer page-layer--${layer.phase}`}
        >
          {layer.outlet}
        </div>
      ))}
    </div>
  );
}
