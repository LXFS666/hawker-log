import { useEffect, useState } from 'react'
import { MapContainer, Marker, Popup, TileLayer } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import './lib/leaflet-icon-fix'
import { supabase } from './lib/supabase'
import type { HawkerCentre } from './types'

const SINGAPORE_CENTER: [number, number] = [1.3521, 103.8198]

function HawkerMap() {
  const [centres, setCentres] = useState<HawkerCentre[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadCentres() {
      try {
        const { data, error } = await supabase
          .from('hawker_centres')
          .select('id, name, address, lat, lng')
        if (error) {
          setError(error.message)
          return
        }
        setCentres(data ?? [])
      } catch (err) {
        setError(err instanceof Error ? err.message : String(err))
      }
    }
    loadCentres()
  }, [])

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
