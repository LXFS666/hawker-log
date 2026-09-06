import { useMemo } from 'react'
import L from 'leaflet'
import { MapContainer, Marker, Popup, TileLayer } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import type { HawkerCentre, VisitWithStall } from './types'

const SINGAPORE_CENTER: [number, number] = [1.3521, 103.8198]
const UNVISITED_COLOR = '#9ca3af'

function ratingColor(avg: number) {
  const clamped = Math.max(1, Math.min(5, avg))
  const hue = ((clamped - 1) / 4) * 120
  return `hsl(${hue}, 65%, 42%)`
}

function centreIcon(color: string) {
  return L.divIcon({
    className: 'centre-marker-icon',
    html: `<span style="background:${color}"></span>`,
    iconSize: [22, 22],
    iconAnchor: [11, 11],
    popupAnchor: [0, -12],
  })
}

interface CentreVisitData {
  visits: VisitWithStall[]
  avgRating: number
}

interface HawkerMapProps {
  centres: HawkerCentre[]
  centresError: string | null
  visits: VisitWithStall[]
  onlyVisited: boolean
  onlyReorder: boolean
}

function HawkerMap({ centres, centresError, visits, onlyVisited, onlyReorder }: HawkerMapProps) {
  const centreData = useMemo(() => {
    const map = new Map<number, CentreVisitData>()
    for (const visit of visits) {
      const centreId = visit.stall.centre_id
      const entry = map.get(centreId)
      if (entry) {
        entry.visits.push(visit)
      } else {
        map.set(centreId, { visits: [visit], avgRating: 0 })
      }
    }
    for (const entry of map.values()) {
      entry.avgRating =
        entry.visits.reduce((sum, visit) => sum + visit.rating, 0) / entry.visits.length
    }
    return map
  }, [visits])

  const visibleCentres = onlyVisited
    ? centres.filter((centre) => centreData.has(centre.id))
    : centres

  return (
    <div className="map-wrapper">
      {centresError && (
        <div className="map-error">Failed to load hawker centres: {centresError}</div>
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
        {visibleCentres.map((centre) => {
          const data = centreData.get(centre.id)
          const color = data ? ratingColor(data.avgRating) : UNVISITED_COLOR
          const shownVisits = data
            ? data.visits
                .filter((visit) => !onlyReorder || visit.would_reorder)
                .slice()
                .sort((a, b) => b.visited_on.localeCompare(a.visited_on))
            : []

          return (
            <Marker
              key={centre.id}
              position={[centre.lat, centre.lng]}
              icon={centreIcon(color)}
            >
              <Popup>
                <strong>{centre.name}</strong>
                {centre.address && (
                  <>
                    <br />
                    {centre.address}
                  </>
                )}
                <br />
                {data ? (
                  <>
                    Average rating: {data.avgRating.toFixed(1)} ({data.visits.length} visit
                    {data.visits.length === 1 ? '' : 's'})
                    <ul className="popup-visit-list">
                      {shownVisits.length === 0 && <li>No visits match the current filter.</li>}
                      {shownVisits.map((visit) => (
                        <li key={visit.id}>
                          {visit.rating}★ {visit.stall.name}
                          {visit.dish && ` — ${visit.dish}`}
                          {visit.would_reorder && ' (would reorder)'}
                          <br />
                          <small>{visit.visited_on}</small>
                        </li>
                      ))}
                    </ul>
                  </>
                ) : (
                  'No visits logged here yet.'
                )}
              </Popup>
            </Marker>
          )
        })}
      </MapContainer>
    </div>
  )
}

export default HawkerMap
