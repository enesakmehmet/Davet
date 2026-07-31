import { useEffect, useState } from 'react';
import { MapContainer, Marker, TileLayer, useMap, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

const defaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = defaultIcon;

type Coordinates = [number, number];

export type SelectedMapLocation = {
  mapQuery: string;
  venueName?: string;
  venueCity?: string;
};

interface MapPickerProps {
  /** Önceden kaydedilmiş "enlem,boylam" değeri. Eski metin tabanlı konumlar da çalışmaya devam eder. */
  value?: string;
  onLocationSelect: (location: SelectedMapLocation) => void;
}

const parseCoordinates = (value?: string): Coordinates | null => {
  const match = String(value || '').trim().match(/^(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)$/);
  if (!match) return null;
  const lat = Number(match[1]);
  const lng = Number(match[2]);
  return Number.isFinite(lat) && Number.isFinite(lng) && Math.abs(lat) <= 90 && Math.abs(lng) <= 180
    ? [lat, lng]
    : null;
};

const MapClickHandler = ({ onSelect }: { onSelect: (lat: number, lng: number) => void }) => {
  useMapEvents({
    click(event) {
      onSelect(event.latlng.lat, event.latlng.lng);
    },
  });
  return null;
};

const RecenterMap = ({ position }: { position: Coordinates | null }) => {
  const map = useMap();
  useEffect(() => {
    if (position) map.setView(position, Math.max(map.getZoom(), 16));
  }, [map, position]);
  return null;
};

const LocateControl = ({ onLocate }: { onLocate: (lat: number, lng: number) => void }) => {
  const map = useMap();

  useEffect(() => {
    const handleLocationFound = (event: L.LocationEvent) => onLocate(event.latlng.lat, event.latlng.lng);
    map.on('locationfound', handleLocationFound);
    return () => { map.off('locationfound', handleLocationFound); };
  }, [map, onLocate]);

  return (
    <button
      type="button"
      className="map-locate-btn"
      onClick={() => map.locate({ setView: true, maxZoom: 16 })}
      title="Konumumu bul"
    >
      Konumumu bul
    </button>
  );
};

const MapPicker = ({ value, onLocationSelect }: MapPickerProps) => {
  const [status, setStatus] = useState('Haritada bir noktaya tıklayarak mekanı seçin.');
  // Seçilen konum ana formdaki value'dan türetilir; böylece editörden gelen güncellemeler
  // ek bir state senkronizasyonuna ihtiyaç duymadan haritaya hemen yansır.
  const position = parseCoordinates(value);

  const handleSelect = async (lat: number, lng: number) => {
    const mapQuery = `${lat.toFixed(6)},${lng.toFixed(6)}`;
    setStatus('Konum davetiyeye eklendi. Adres bilgisi alınıyor…');
    // Koordinatı hemen kaydet: ters adres araması başarısız olsa bile davetiye doğru noktayı gösterir.
    onLocationSelect({ mapQuery });

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
      );
      const data = await response.json();
      const address = data?.address || {};
      const venueName = data?.name || address.amenity || address.tourism || address.shop || address.building;
      const venueCity = address.city || address.town || address.village || address.county || address.province || address.state;
      onLocationSelect({ mapQuery, venueName, venueCity });
      setStatus(data?.display_name ? `Seçilen konum: ${data.display_name}` : 'Konum davetiyeye eklendi.');
    } catch {
      setStatus('Konum davetiyeye eklendi. Mekan adını isterseniz yukarıdan düzenleyebilirsiniz.');
    }
  };

  return (
    <div className="map-picker">
      <div className="map-picker-head">
        <strong>Haritadan mekan seçin</strong>
        <span>İğneyi seçtiğiniz noktaya bırakın; davetiyedeki harita anında güncellenir.</span>
      </div>
      <div className="map-picker-canvas">
        <MapContainer center={position || [39.0, 35.0]} zoom={position ? 16 : 6} scrollWheelZoom style={{ height: '100%', width: '100%' }}>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <MapClickHandler onSelect={handleSelect} />
          <RecenterMap position={position} />
          <LocateControl onLocate={handleSelect} />
          {position && <Marker position={position} />}
        </MapContainer>
      </div>
      <p className="map-picker-status" aria-live="polite">{status}</p>
    </div>
  );
};

export default MapPicker;
