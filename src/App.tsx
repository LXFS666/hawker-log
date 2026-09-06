import HawkerMap from './HawkerMap'
import SignIn from './SignIn'
import { supabase } from './lib/supabase'
import { useSession } from './lib/useSession'

function App() {
  const { session, loading } = useSession()

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
    </div>
  )
}

export default App
