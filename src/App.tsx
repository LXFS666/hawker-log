import { useState } from 'react'
import HawkerMap from './HawkerMap'
import LogVisit from './LogVisit'
import SignIn from './SignIn'
import VisitList from './VisitList'
import { supabase } from './lib/supabase'
import { useHawkerCentres } from './lib/useHawkerCentres'
import { useSession } from './lib/useSession'
import { useVisits } from './lib/useVisits'

type View = 'map' | 'list'

function App() {
  const { session, loading } = useSession()
  const [isLogging, setIsLogging] = useState(false)
  const [view, setView] = useState<View>('map')
  const [onlyVisited, setOnlyVisited] = useState(false)
  const [onlyReorder, setOnlyReorder] = useState(false)

  const { centres, error: centresError } = useHawkerCentres()
  const { visits, error: visitsError, refetch: refetchVisits } = useVisits()

  if (loading) {
    return null
  }

  if (!session) {
    return <SignIn />
  }

  const centreNames = new Map(centres.map((centre) => [centre.id, centre.name]))

  return (
    <div className="app-wrapper">
      <header className="topbar">
        <div className="view-toggle">
          <button
            type="button"
            className={view === 'map' ? 'active' : ''}
            onClick={() => setView('map')}
          >
            Map
          </button>
          <button
            type="button"
            className={view === 'list' ? 'active' : ''}
            onClick={() => setView('list')}
          >
            List
          </button>
        </div>
        {view === 'map' && (
          <label className="topbar-checkbox">
            <input
              type="checkbox"
              checked={onlyVisited}
              onChange={(event) => setOnlyVisited(event.target.checked)}
            />
            Visited
          </label>
        )}
        <label className="topbar-checkbox">
          <input
            type="checkbox"
            checked={onlyReorder}
            onChange={(event) => setOnlyReorder(event.target.checked)}
          />
          Reorder
        </label>
        <button
          type="button"
          className="topbar-signout"
          onClick={() => supabase.auth.signOut()}
        >
          Sign out
        </button>
      </header>

      <main className="main-content">
        {visitsError && (
          <div className="map-error">Failed to load visits: {visitsError}</div>
        )}
        {view === 'map' ? (
          <HawkerMap
            centres={centres}
            centresError={centresError}
            visits={visits}
            onlyVisited={onlyVisited}
            onlyReorder={onlyReorder}
          />
        ) : (
          <VisitList visits={visits} centreNames={centreNames} onlyReorder={onlyReorder} />
        )}
      </main>

      <button
        type="button"
        className="log-visit-fab"
        onClick={() => setIsLogging(true)}
      >
        + Log a visit
      </button>
      {isLogging && (
        <LogVisit
          onClose={() => setIsLogging(false)}
          onSaved={() => {
            refetchVisits()
            setIsLogging(false)
          }}
        />
      )}
    </div>
  )
}

export default App
