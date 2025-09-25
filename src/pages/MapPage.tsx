import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GoogleMap, Marker as GMarker, useJsApiLoader } from '@react-google-maps/api';

// Fix for default icon issues with Webpack
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

function DraggableMarker({ onLocationSelect }: { onLocationSelect: (lat: number, lng: number) => void }) {
  const [position, setPosition] = useState<[number, number] | null>(null);
  const map = useMapEvents({
    click: (e) => {
      setPosition([e.latlng.lat, e.latlng.lng]);
      onLocationSelect(e.latlng.lat, e.latlng.lng);
    },
    locationfound: (e: any) => {
      setPosition([e.latlng.lat, e.latlng.lng]);
      onLocationSelect(e.latlng.lat, e.latlng.lng);
      map.flyTo(e.latlng, map.getZoom());
      const radius = e.accuracy;
      const circle = L.circle(e.latlng, radius);
      map.addLayer(circle);
    },
  });

  useEffect(() => {
    map.locate();
  }, [map]);

  return position === null ? null : (
    <Marker 
      draggable={true}
      position={position}
      eventHandlers={{
        dragend: (event) => {
          const marker = event.target;
          const newPosition = marker.getLatLng();
          setPosition([newPosition.lat, newPosition.lng]);
          onLocationSelect(newPosition.lat, newPosition.lng);
        },
      }}
    >
      <Popup>Drag to select location</Popup>
    </Marker>
  );
}

export default function MapPage() {
  const navigate = useNavigate();
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string | undefined;
  const defaultPosition: [number, number] = [51.505, -0.09]; // Default to London

  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: apiKey || '',
  });

  const handleLocationSelect = (lat: number, lng: number) => {
    localStorage.setItem('selectedLat', lat.toString());
    localStorage.setItem('selectedLng', lng.toString());
    navigate('/report');
  };

  if (apiKey && isLoaded) {
    const center = useMemo(() => ({ lat: defaultPosition[0], lng: defaultPosition[1] }), []);
    return (
      <div className="h-screen w-screen">
        <GoogleMap
          center={center}
          zoom={13}
          mapContainerStyle={{ width: '100%', height: '100%' }}
          onClick={(e) => {
            if (e.latLng) {
              handleLocationSelect(e.latLng.lat(), e.latLng.lng());
            }
          }}
        >
          <GMarker
            position={center}
            draggable
            onDragEnd={(e) => {
              const lat = e.latLng?.lat();
              const lng = e.latLng?.lng();
              if (lat !== undefined && lng !== undefined) {
                handleLocationSelect(lat, lng);
              }
            }}
          />
        </GoogleMap>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen">
      <MapContainer center={defaultPosition} zoom={13} scrollWheelZoom={false} className="h-full w-full">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <DraggableMarker onLocationSelect={handleLocationSelect} />
      </MapContainer>
    </div>
  );
}
