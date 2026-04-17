import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { Box, Typography, Card, CardContent } from '@mui/material';

// Fix Leaflet's default marker icon issue in React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

const createCustomIcon = (color) => {
  return new L.Icon({
    iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-${color}.png`,
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  });
};

const icons = {
  active: createCustomIcon('green'),
  blocked: createCustomIcon('red'),
  inactive: createCustomIcon('grey')
};

// Component to handle auto-centering when markers change
const AutoCenter = ({ markers }) => {
  const map = useMap();
  useEffect(() => {
    if (markers.length > 0) {
      const bounds = L.latLngBounds(markers.map(m => [m.lat, m.lng]));
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 14 });
    }
  }, [markers, map]);
  return null;
};

export default function GlobalMap({ devices = [] }) {
  const [markers, setMarkers] = useState([]);

  useEffect(() => {
    // Map devices to valid lat/lng markers
    const mapped = devices
      .filter(d => d.location && typeof d.location.lastKnownLatitude === 'number' && typeof d.location.lastKnownLongitude === 'number')
      .map(d => ({
        id: d.imei,
        lat: d.location.lastKnownLatitude,
        lng: d.location.lastKnownLongitude,
        status: d.status || 'active',
        model: d.deviceModel || 'Unknown Device',
        os: d.deviceOS || 'Unknown OS',
        region: d.location.region || 'Unknown Region'
      }));
    setMarkers(mapped);
  }, [devices]);

  return (
    <Card sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.05)', border: '1px solid #F3F4F6', overflow: 'hidden' }}>
      <Box sx={{ p: 2.5, borderBottom: '1px solid #F3F4F6', bgcolor: '#fff' }}>
        <Typography sx={{ fontWeight: 800, color: '#1A1A2E', fontSize: '1.05rem' }}>
          Live Fleet Deployment
        </Typography>
        <Typography variant="caption" sx={{ color: '#9CA3AF' }}>
          {markers.length} devices actively broadcasting location
        </Typography>
      </Box>
      <CardContent sx={{ p: 0, height: 400, position: 'relative' }}>
        {markers.length === 0 ? (
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', bgcolor: '#F9FAFB' }}>
            <Typography sx={{ color: '#9CA3AF', fontWeight: 600 }}>No geographic data available yet.</Typography>
          </Box>
        ) : (
          <MapContainer 
            center={[20, 0]} 
            zoom={2} 
            style={{ height: '100%', width: '100%', zIndex: 1 }}
            scrollWheelZoom={false}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
            />
            {markers.map((marker) => (
              <Marker 
                key={marker.id} 
                position={[marker.lat, marker.lng]}
                icon={icons[marker.status] || icons.active}
              >
                <Popup>
                  <Box sx={{ minWidth: 150 }}>
                    <Typography sx={{ fontWeight: 800, fontSize: '0.85rem', mb: 0.5 }}>{marker.model}</Typography>
                    <Typography sx={{ fontSize: '0.75rem', color: '#6B7280' }}>IMEI: {marker.id}</Typography>
                    <Typography sx={{ fontSize: '0.75rem', color: '#6B7280' }}>OS: {marker.os}</Typography>
                    <Typography sx={{ fontSize: '0.8rem', mt: 1, color: marker.status === 'active' ? '#10B981' : marker.status === 'blocked' ? '#EF4444' : '#9CA3AF', fontWeight: 700, textTransform: 'capitalize' }}>
                      Status: {marker.status}
                    </Typography>
                  </Box>
                </Popup>
              </Marker>
            ))}
            <AutoCenter markers={markers} />
          </MapContainer>
        )}
      </CardContent>
    </Card>
  );
}
