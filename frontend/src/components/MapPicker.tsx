import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

// Fix leafet default icon issue
let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

interface MapPickerProps {
  onLocationSelect: (venue: string, address: string) => void;
}

const LocationMarker = ({ position, onSelect }: { position: [number, number] | null, onSelect: (lat: number, lng: number) => void }) => {
  useMapEvents({
    click(e) {
      onSelect(e.latlng.lat, e.latlng.lng);
    },
  });

  return position === null ? null : (
    <Marker position={position}></Marker>
  );
};

const LocateControl = ({ onLocate }: { onLocate: (lat: number, lng: number) => void }) => {
  const map = useMap();
  
  const handleLocate = (e: React.MouseEvent) => {
    e.preventDefault();
    map.locate({ setView: true, maxZoom: 16 });
  };

  useEffect(() => {
    map.on('locationfound', (e) => {
      onLocate(e.latlng.lat, e.latlng.lng);
    });
  }, [map, onLocate]);

  return (
    <button 
      onClick={handleLocate}
      style={{
        position: 'absolute',
        bottom: '20px',
        left: '10px',
        zIndex: 1000,
        background: 'white',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-sm)',
        padding: '8px 12px',
        cursor: 'pointer',
        boxShadow: 'var(--shadow-md)',
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        fontWeight: '600',
        fontSize: '13px',
        color: 'var(--color-text-primary)'
      }}
      title="Beni Bul"
    >
      📍 Konumumu Bul
    </button>
  );
};

const MapPicker = ({ onLocationSelect }: MapPickerProps) => {
  const [position, setPosition] = useState<[number, number] | null>(null);
  const [fetchedAddress, setFetchedAddress] = useState('');
  const [fetchedVenue, setFetchedVenue] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSelect = async (lat: number, lng: number) => {
    setPosition([lat, lng]);
    setLoading(true);
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`);
      const data = await res.json();
      if (data && data.address) {
        const road = data.address.road || '';
        const suburb = data.address.suburb || data.address.neighbourhood || '';
        const city = data.address.city || data.address.town || data.address.village || data.address.county || data.address.province || '';
        const state = data.address.state || '';
        const name = data.name || '';
        
        let addr = `${road} ${suburb}`.trim();
        if (!addr) addr = data.display_name.split(',')[0];
        
        const fullAddress = `${addr}\n${city}${state ? ', ' + state : ''}`.trim();
        const venueName = name || 'Seçilen Konum';
        
        setFetchedAddress(fullAddress);
        setFetchedVenue(venueName);
      }
    } catch (err) {
      console.error('Error fetching address:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div style={{ height: '300px', width: '100%', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--color-border)' }}>
        <MapContainer center={[41.0082, 28.9784]} zoom={11} scrollWheelZoom={true} style={{ height: '100%', width: '100%' }}>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <LocationMarker position={position} onSelect={handleSelect} />
          <LocateControl onLocate={handleSelect} />
        </MapContainer>
      </div>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <label style={{ fontSize: '12px', fontWeight: 'bold' }}>Bulunan Mekan</label>
        <input 
          type="text" 
          value={fetchedVenue} 
          onChange={(e) => setFetchedVenue(e.target.value)}
          placeholder={loading ? "Aranıyor..." : "Mekan adı"} 
          style={{ padding: '8px', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)' }} 
        />
        
        <label style={{ fontSize: '12px', fontWeight: 'bold' }}>Bulunan Adres</label>
        <textarea 
          value={fetchedAddress} 
          onChange={(e) => setFetchedAddress(e.target.value)}
          placeholder={loading ? "Aranıyor..." : "Adres detayı"} 
          rows={3}
          style={{ padding: '8px', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)' }} 
        />
        
        <button 
          className="btn-primary" 
          style={{ width: '100%', marginTop: '8px' }}
          onClick={() => onLocationSelect(fetchedVenue, fetchedAddress)}
          disabled={!fetchedAddress}
        >
          Haritayı Davetiyeye Ekle
        </button>
      </div>
    </div>
  );
};

export default MapPicker;
