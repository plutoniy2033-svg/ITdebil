import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import type { Checkpoint } from '../types';
import { useNavigate } from 'react-router-dom';

// Fix default marker icons broken by Vite bundler
import iconUrl from 'leaflet/dist/images/marker-icon.png';
import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png';
import shadowUrl from 'leaflet/dist/images/marker-shadow.png';

const defaultIcon = L.icon({
  iconUrl,
  iconRetinaUrl,
  shadowUrl,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});
L.Marker.prototype.options.icon = defaultIcon;

interface CheckpointMapProps {
  checkpoints: Checkpoint[];
  selectedId?: string;
  height?: string;
}

function FitBounds({ checkpoints }: { checkpoints: Checkpoint[] }) {
  const map = useMap();

  useEffect(() => {
    if (checkpoints.length === 0) return;
    const bounds = L.latLngBounds(checkpoints.map((c) => [c.lat, c.lng]));
    map.fitBounds(bounds, { padding: [40, 40] });
  }, [checkpoints, map]);

  return null;
}

export function CheckpointMap({ checkpoints, selectedId, height = '320px' }: CheckpointMapProps) {
  const navigate = useNavigate();
  const center: [number, number] = [16.0, 107.0];

  return (
    <div className="checkpoint-map" style={{ height }}>
      <MapContainer center={center} zoom={6} scrollWheelZoom className="checkpoint-map__container">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <FitBounds checkpoints={checkpoints} />
        {checkpoints.map((cp) => (
          <Marker
            key={cp.id}
            position={[cp.lat, cp.lng]}
            eventHandlers={{
              click: () => navigate(`/checkpoints/${cp.id}`),
            }}
          >
            <Popup>
              <strong>{cp.name}</strong>
              <br />
              {cp.nameLocal}
            </Popup>
          </Marker>
        ))}
        {selectedId && (
          <SelectedMarker checkpoints={checkpoints} selectedId={selectedId} />
        )}
      </MapContainer>
    </div>
  );
}

function SelectedMarker({
  checkpoints,
  selectedId,
}: {
  checkpoints: Checkpoint[];
  selectedId: string;
}) {
  const map = useMap();
  const cp = checkpoints.find((c) => c.id === selectedId);

  useEffect(() => {
    if (cp) {
      map.setView([cp.lat, cp.lng], 10);
    }
  }, [cp, map]);

  return null;
}
