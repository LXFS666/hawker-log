import { MapContainer, Marker, Popup, TileLayer } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import './lib/leaflet-icon-fix'
import { useHawkerCentres } from './lib/useHawkerCentres'

const SINGAPORE_CENTER: [number, number] = [1.3521, 103.8198]

function HawkerMap() {
  const { centres, error } = useHawkerCentres()

  return (
    <div className="map-wrapper">
      {error && (
        <div className="map-error">Failed to load hawker centres: {error}</div>
      )}
      <MapContainer
        center={SINGAPORE_CENTER}
        zoom={12}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {centres.map((centre) => (
          <Marker key={centre.id} position={[centre.lat, centre.lng]}>
            <Popup>
              <strong>{centre.name}</strong>
              {centre.address && (
                <>
                  <br />
                  {centre.address}
                </>
              )}
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  )
}

export default HawkerMap
