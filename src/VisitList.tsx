import type { VisitWithStall } from './types'

interface VisitListProps {
  visits: VisitWithStall[]
  centreNames: Map<number, string>
  onlyReorder: boolean
}

function VisitList({ visits, centreNames, onlyReorder }: VisitListProps) {
  const sorted = visits
    .filter((visit) => !onlyReorder || visit.would_reorder)
    .slice()
    .sort((a, b) => b.rating - a.rating)

  if (sorted.length === 0) {
    return <p className="visit-list-empty">No visits logged yet.</p>
  }

  return (
    <ul className="visit-list">
      {sorted.map((visit) => (
        <li key={visit.id} className="visit-list-item">
          <div className="visit-list-main">
            <span className="visit-rating">{visit.rating}★</span>
            <span className="visit-stall-name">{visit.stall.name}</span>
          </div>
          <div className="visit-list-meta">
            {centreNames.get(visit.stall.centre_id) ?? 'Unknown centre'}
            {visit.dish && ` · ${visit.dish}`}
            {visit.would_reorder && ' · Would reorder'}
          </div>
        </li>
      ))}
    </ul>
  )
}

export default VisitList
