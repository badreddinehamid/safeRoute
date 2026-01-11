/**
 * Map component for displaying trajectories using Leaflet
 */

import { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import type { Trajectory } from '../types/contract';
import { unscaleCoordinate } from '../utils/contract';

// Fix for default marker icons in Leaflet with Vite
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

const DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

interface TrajectoryMapProps {
  trajectories: Trajectory[];
  onPathDrawn?: (path: Array<{ latitude: number; longitude: number }>) => void;
  drawingMode?: boolean;
}

/**
 * Component to update map bounds when trajectories change
 */
function MapUpdater({ trajectories }: { trajectories: Trajectory[] }) {
  const map = useMap();

  useEffect(() => {
    if (trajectories.length === 0) return;

    const bounds = L.latLngBounds([]);

    trajectories.forEach((trajectory) => {
      trajectory.coordinates.forEach((coord) => {
        const lat = unscaleCoordinate(coord.latitude);
        const lng = unscaleCoordinate(coord.longitude);
        bounds.extend([lat, lng]);
      });
    });

    if (bounds.isValid()) {
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [map, trajectories]);

  return null;
}

/**
 * Component to render trajectory markers
 */
function TrajectoryMarkers({ trajectories }: { trajectories: Trajectory[] }) {
  const map = useMap();
  const markersRef = useRef<L.CircleMarker[]>([]);

  useEffect(() => {
    // Clear existing markers
    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current = [];

    // Add markers for each trajectory
    trajectories
      .filter((trajectory) => trajectory.accepted !== false && trajectory.coordinates.length > 0)
      .forEach((trajectory, idx) => {
        const startCoord = trajectory.coordinates[0];
        const endCoord = trajectory.coordinates[trajectory.coordinates.length - 1];
        const colors = ['#00A6FF', '#0A2540', '#1F4F7A', '#28A745'];
        const color = colors[idx % colors.length];

        // Start marker
        const startMarker = L.circleMarker(
          [unscaleCoordinate(startCoord.latitude), unscaleCoordinate(startCoord.longitude)],
          {
            radius: 10,
            fillColor: color,
            color: '#FFFFFF',
            weight: 3,
            opacity: 1,
            fillOpacity: 0.9,
          }
        ).addTo(map);
        markersRef.current.push(startMarker);

        // End marker (only if different from start)
        if (trajectory.coordinates.length > 1) {
          const endMarker = L.circleMarker(
            [unscaleCoordinate(endCoord.latitude), unscaleCoordinate(endCoord.longitude)],
            {
              radius: 10,
              fillColor: color,
              color: '#FFFFFF',
              weight: 3,
              opacity: 1,
              fillOpacity: 0.9,
            }
          ).addTo(map);
          markersRef.current.push(endMarker);
        }
      });

    return () => {
      markersRef.current.forEach((marker) => marker.remove());
    };
  }, [map, trajectories]);

  return null;
}

/**
 * Drawing handler for interactive path drawing
 */
function DrawingHandler({
  onPathDrawn,
  enabled,
}: {
  onPathDrawn?: (path: Array<{ latitude: number; longitude: number }>) => void;
  enabled: boolean;
}) {
  const map = useMap();
  const drawingRef = useRef<L.Polyline | null>(null);
  const pathRef = useRef<Array<{ latitude: number; longitude: number }>>([]);
  const markersRef = useRef<L.Marker[]>([]);

  useEffect(() => {
    // Clear any existing drawing when disabled
    if (!enabled) {
      if (drawingRef.current) {
        drawingRef.current.remove();
        drawingRef.current = null;
      }
      markersRef.current.forEach((marker) => marker.remove());
      markersRef.current = [];
      pathRef.current = [];
      return;
    }

    if (!onPathDrawn) return;

    const handleMapClick = (e: L.LeafletMouseEvent) => {
      e.originalEvent.stopPropagation();
      const { lat, lng } = e.latlng;
      pathRef.current.push({ latitude: lat, longitude: lng });

      // Add a marker at the clicked point
      const marker = L.marker([lat, lng], {
        icon: L.divIcon({
          className: 'custom-marker',
          html: `<div style="background-color: #3b82f6; width: 12px; height: 12px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>`,
          iconSize: [12, 12],
          iconAnchor: [6, 6],
        }),
      }).addTo(map);
      markersRef.current.push(marker);

      // Update or create polyline
      if (drawingRef.current) {
        drawingRef.current.remove();
      }

      if (pathRef.current.length > 1) {
        const latlngs = pathRef.current.map((p) => [p.latitude, p.longitude] as [number, number]);
        drawingRef.current = L.polyline(latlngs, {
          color: '#3b82f6',
          weight: 3,
          opacity: 0.7,
        }).addTo(map);
      }
    };

    const handleKeyPress = (e: KeyboardEvent) => {
      // Only handle if drawing mode is active and we're not in an input field
      if (!enabled) return;
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if (e.key === 'Enter' && pathRef.current.length > 0) {
        e.preventDefault();
        if (onPathDrawn) {
          onPathDrawn([...pathRef.current]);
        }
        // Clear drawing
        pathRef.current = [];
        if (drawingRef.current) {
          drawingRef.current.remove();
          drawingRef.current = null;
        }
        markersRef.current.forEach((marker) => marker.remove());
        markersRef.current = [];
      } else if (e.key === 'Escape') {
        e.preventDefault();
        pathRef.current = [];
        if (drawingRef.current) {
          drawingRef.current.remove();
          drawingRef.current = null;
        }
        markersRef.current.forEach((marker) => marker.remove());
        markersRef.current = [];
      }
    };

    // Add click handler
    map.on('click', handleMapClick);
    window.addEventListener('keydown', handleKeyPress);

    return () => {
      map.off('click', handleMapClick);
      window.removeEventListener('keydown', handleKeyPress);
      if (drawingRef.current) {
        drawingRef.current.remove();
        drawingRef.current = null;
      }
      markersRef.current.forEach((marker) => marker.remove());
      markersRef.current = [];
    };
  }, [map, enabled, onPathDrawn]);

  return null;
}

export default function TrajectoryMap({
  trajectories,
  onPathDrawn,
  drawingMode = false,
}: TrajectoryMapProps) {
  // Default center (can be adjusted based on your use case)
  const defaultCenter: [number, number] = [40.7128, -74.006]; // New York City

  return (
    <div className="w-full h-full relative">
      <MapContainer
        center={defaultCenter}
        zoom={13}
        style={{ height: '100%', width: '100%', cursor: drawingMode ? 'crosshair' : 'default' }}
        scrollWheelZoom={true}
        doubleClickZoom={!drawingMode}
        dragging={!drawingMode}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Render trajectories - Only show accepted trajectories */}
        {trajectories
          .filter((trajectory) => trajectory.accepted !== false) // Only show accepted trajectories
          .map((trajectory, idx) => {
            const latlngs = trajectory.coordinates.map((coord) => [
              unscaleCoordinate(coord.latitude),
              unscaleCoordinate(coord.longitude),
            ]) as [number, number][];

            // Use gradient of SafeRoute brand colors for different trajectories
            const colors = [
              '#00A6FF', // Accent blue
              '#0A2540', // Primary blue
              '#1F4F7A', // Secondary blue
              '#28A745', // Success green
            ];
            const color = colors[idx % colors.length];

            return (
              <Polyline
                key={trajectory.index}
                positions={latlngs}
                pathOptions={{
                  color: color,
                  weight: 4,
                  opacity: 0.85,
                  lineCap: 'round',
                  lineJoin: 'round',
                }}
              />
            );
          })}

        <MapUpdater trajectories={trajectories} />
        <TrajectoryMarkers trajectories={trajectories} />
        <DrawingHandler onPathDrawn={onPathDrawn} enabled={drawingMode} />
      </MapContainer>

      {drawingMode && (
        <div className="absolute top-4 left-4 bg-white p-3 rounded-card shadow-card z-[1000] border-2 border-brand-accent">
          <p className="text-sm font-semibold text-brand-primary mb-2">✏️ Drawing Mode Active</p>
          <p className="text-xs text-neutral-dark mt-1 mb-2">
            Click on the map to add points to your trajectory
          </p>
          <div className="space-y-1">
            <p className="text-xs text-neutral-dark">
              <kbd className="px-1.5 py-0.5 bg-neutral-light rounded text-xs font-mono">Enter</kbd> to confirm path
            </p>
            <p className="text-xs text-neutral-dark">
              <kbd className="px-1.5 py-0.5 bg-neutral-light rounded text-xs font-mono">Esc</kbd> to cancel
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

