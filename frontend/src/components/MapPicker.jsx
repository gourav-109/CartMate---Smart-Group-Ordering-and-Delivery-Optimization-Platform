import React, { useEffect, useRef, useState } from 'react';
import { MapPin, Navigation, Crosshair, Check } from 'lucide-react';

const NIT_CAMPUS_PRESETS = [
  { name: 'Hostel 1, NIT Jamshedpur', lat: 22.7780, lng: 86.1438 },
  { name: 'Hostel 4 Canteen, NIT Jamshedpur', lat: 22.7790, lng: 86.1450 },
  { name: 'Hostel 9, NIT Jamshedpur', lat: 22.7765, lng: 86.1425 },
  { name: 'Outer Circle Main Gate, NIT JSR', lat: 22.7770, lng: 86.1420 },
  { name: 'Computer Center & Library, NIT JSR', lat: 22.7785, lng: 86.1442 },
  { name: 'Adityapur Local Market, Jamshedpur', lat: 22.7820, lng: 86.1490 }
];

export const MapPicker = ({ initialLat = 22.7780, initialLng = 86.1438, initialLocality = 'Hostel 1, NIT Jamshedpur', onLocationSelect }) => {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);

  const [currentLat, setCurrentLat] = useState(initialLat);
  const [currentLng, setCurrentLng] = useState(initialLng);
  const [locName, setLocName] = useState(initialLocality);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [mapReady, setMapReady] = useState(false);

  useEffect(() => {
    // If Leaflet is loaded
    if (window.L && mapContainerRef.current && !mapInstanceRef.current) {
      const map = window.L.map(mapContainerRef.current).setView([currentLat, currentLng], 16);

      window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
      }).addTo(map);

      // Custom Cartmate Pin Icon
      const pinIcon = window.L.divIcon({
        className: 'custom-map-marker',
        html: `<div style="background:#f8cb46; color:#0f172a; border:2px solid #000; border-radius:50%; width:28px; height:28px; display:flex; align-items:center; justify-content:center; font-weight:800; font-size:14px; box-shadow:0 3px 10px rgba(0,0,0,0.5);">📍</div>`,
        iconSize: [28, 28],
        iconAnchor: [14, 28]
      });

      const marker = window.L.marker([currentLat, currentLng], {
        draggable: true,
        icon: pinIcon
      }).addTo(map);

      marker.on('dragend', (event) => {
        const position = event.target.getLatLng();
        updateCoords(position.lat, position.lng);
      });

      map.on('click', (event) => {
        const { lat, lng } = event.latlng;
        marker.setLatLng([lat, lng]);
        updateCoords(lat, lng);
      });

      mapInstanceRef.current = map;
      markerRef.current = marker;
      setMapReady(true);
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  const updateCoords = (lat, lng, nameOverride = null) => {
    const roundedLat = Math.round(lat * 10000) / 10000;
    const roundedLng = Math.round(lng * 10000) / 10000;
    setCurrentLat(roundedLat);
    setCurrentLng(roundedLng);

    let chosenName = nameOverride;
    if (!chosenName) {
      // Find nearest preset if close
      const matchedPreset = NIT_CAMPUS_PRESETS.find(
        (p) => Math.abs(p.lat - roundedLat) < 0.0015 && Math.abs(p.lng - roundedLng) < 0.0015
      );
      chosenName = matchedPreset ? matchedPreset.name : locName || `NIT Jamshedpur Locality (${roundedLat}, ${roundedLng})`;
    }

    setLocName(chosenName);

    if (onLocationSelect) {
      onLocationSelect({
        localityName: chosenName,
        lat: roundedLat,
        lng: roundedLng
      });
    }
  };

  const handleSelectPreset = (preset) => {
    if (mapInstanceRef.current && markerRef.current) {
      mapInstanceRef.current.setView([preset.lat, preset.lng], 16);
      markerRef.current.setLatLng([preset.lat, preset.lng]);
    }
    updateCoords(preset.lat, preset.lng, preset.name);
  };

  const handleDetectGPS = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser');
      return;
    }
    setGpsLoading(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const name = `Live GPS (${Math.round(latitude * 1000) / 1000}, ${Math.round(longitude * 1000) / 1000})`;
        if (mapInstanceRef.current && markerRef.current) {
          mapInstanceRef.current.setView([latitude, longitude], 16);
          markerRef.current.setLatLng([latitude, longitude]);
        }
        updateCoords(latitude, longitude, name);
        setGpsLoading(false);
      },
      (error) => {
        console.error('GPS error:', error);
        alert('Could not access your location. Defaulting to NIT Jamshedpur Campus.');
        setGpsLoading(false);
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  return (
    <div style={{ background: 'var(--bg-dark)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '1rem', marginTop: '0.5rem', marginBottom: '1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.9rem', fontWeight: '700', color: 'var(--blinkit-yellow)' }}>
          <MapPin size={16} /> Interactive Locality & Map Pin (NIT Jamshedpur)
        </div>

        <button
          type="button"
          onClick={handleDetectGPS}
          disabled={gpsLoading}
          className="btn-secondary"
          style={{ padding: '0.35rem 0.75rem', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
          title="Detect Current GPS Location"
        >
          <Navigation size={13} style={{ color: 'var(--blinkit-yellow)' }} />
          {gpsLoading ? 'Detecting GPS...' : 'Detect My Live Location'}
        </button>
      </div>

      {/* Interactive Leaflet Map Container */}
      <div
        ref={mapContainerRef}
        style={{
          width: '100%',
          height: '210px',
          borderRadius: '10px',
          overflow: 'hidden',
          border: '1px solid var(--border-color)',
          zIndex: 1
        }}
      />

      {/* Campus Landmark Chips */}
      <div style={{ marginTop: '0.75rem' }}>
        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.4rem', fontWeight: '600' }}>
          🏫 Quick NIT Jamshedpur Campus Landmarks (Click to pin):
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
          {NIT_CAMPUS_PRESETS.map((preset) => {
            const isSelected = Math.abs(preset.lat - currentLat) < 0.0005 && Math.abs(preset.lng - currentLng) < 0.0005;
            return (
              <button
                key={preset.name}
                type="button"
                onClick={() => handleSelectPreset(preset)}
                style={{
                  fontSize: '0.74rem',
                  padding: '0.3rem 0.6rem',
                  borderRadius: '20px',
                  background: isSelected ? 'rgba(248, 203, 70, 0.25)' : 'var(--bg-card)',
                  color: isSelected ? 'var(--blinkit-yellow)' : 'var(--text-main)',
                  border: isSelected ? '1px solid var(--blinkit-yellow)' : '1px solid var(--border-color)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.2rem'
                }}
              >
                {isSelected && <Check size={11} />} {preset.name.replace(', NIT Jamshedpur', '')}
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Coordinates & Locality Banner */}
      <div style={{ marginTop: '0.75rem', paddingTop: '0.6rem', borderTop: '1px dashed var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem', color: 'var(--text-muted)', flexWrap: 'wrap', gap: '0.4rem' }}>
        <div>
          Selected: <strong style={{ color: 'var(--text-main)' }}>{locName}</strong>
        </div>
        <div style={{ fontFamily: 'monospace', fontSize: '0.75rem', color: 'var(--accent-blue)' }}>
          [{currentLng}, {currentLat}]
        </div>
      </div>
    </div>
  );
};
