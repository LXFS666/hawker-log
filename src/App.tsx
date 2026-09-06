import { useState } from 'react'
import HawkerMap from './HawkerMap'
import LogVisit from './LogVisit'
import SignIn from './SignIn'
import { supabase } from './lib/supabase'
import { useSession } from './lib/useSession'

function App() {
  const { session, loading } = useSession()
  const [isLogging, setIsLogging] = useState(false)

  if (loading) {
    return null
  }

  if (!session) {
    return <SignIn />
  }

  return (
    <div className="app-wrapper">
      <button
        type="button"
        className="signout-button"
        onClick={() => supabase.auth.signOut()}
      >
        Sign out
      </button>
      <HawkerMap />
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
          onSaved={() => setIsLogging(false)}
        />
      )}
    </div>
  )
}

export default App
