import { useState } from 'react'
import type { FormEvent } from 'react'
import { supabase } from './lib/supabase'

function SignIn() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setStatus('sending')
    setError(null)

    const { error } = await supabase.auth.signInWithOtp({ email })

    if (error) {
      setError(error.message)
      setStatus('error')
      return
    }

    setStatus('sent')
  }

  return (
    <div className="signin-wrapper">
      <div className="signin-card">
        <h1>Hawker Log</h1>
        {status === 'sent' ? (
          <p>Check your email for a sign-in link.</p>
        ) : (
          <form onSubmit={handleSubmit}>
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              inputMode="email"
              autoComplete="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
            />
            <button type="submit" disabled={status === 'sending'}>
              {status === 'sending' ? 'Sending link…' : 'Send sign-in link'}
            </button>
            {error && <p className="signin-error">{error}</p>}
          </form>
        )}
      </div>
    </div>
  )
}

export default SignIn
