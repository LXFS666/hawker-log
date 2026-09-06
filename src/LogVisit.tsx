import { useEffect, useState } from 'react'
import { supabase } from './lib/supabase'
import { useHawkerCentres } from './lib/useHawkerCentres'
import type { HawkerCentre, Stall } from './types'

type Step = 'centre' | 'stall' | 'details'

function todayISO() {
  return new Date().toISOString().slice(0, 10)
}

interface LogVisitProps {
  onClose: () => void
  onSaved: () => void
}

function LogVisit({ onClose, onSaved }: LogVisitProps) {
  const { centres, error: centresError } = useHawkerCentres()

  const [step, setStep] = useState<Step>('centre')
  const [selectedCentre, setSelectedCentre] = useState<HawkerCentre | null>(null)

  const [stalls, setStalls] = useState<Stall[]>([])
  const [stallsError, setStallsError] = useState<string | null>(null)
  const [selectedStallId, setSelectedStallId] = useState<number | null>(null)
  const [newStallName, setNewStallName] = useState('')

  const [rating, setRating] = useState(0)
  const [dish, setDish] = useState('')
  const [wouldReorder, setWouldReorder] = useState(false)
  const [notes, setNotes] = useState('')
  const [visitedOn, setVisitedOn] = useState(todayISO())

  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  useEffect(() => {
    if (!selectedCentre) return
    const centreId = selectedCentre.id

    async function loadStalls() {
      setStallsError(null)
      const { data, error } = await supabase
        .from('stalls')
        .select('id, centre_id, name, unit_no, cuisine')
        .eq('centre_id', centreId)
        .order('name')
      if (error) {
        setStallsError(error.message)
        return
      }
      setStalls(data ?? [])
    }
    loadStalls()
  }, [selectedCentre])

  function chooseCentre(centre: HawkerCentre) {
    setSelectedCentre(centre)
    setSelectedStallId(null)
    setNewStallName('')
    setStep('stall')
  }

  function canContinueFromStall() {
    return selectedStallId !== null || newStallName.trim().length > 0
  }

  async function handleSubmit() {
    if (!selectedCentre || rating < 1) return

    setSubmitting(true)
    setSubmitError(null)

    try {
      let stallId = selectedStallId

      if (stallId === null) {
        const { data, error } = await supabase
          .from('stalls')
          .insert({ centre_id: selectedCentre.id, name: newStallName.trim() })
          .select('id')
          .single()
        if (error) throw error
        stallId = data.id
      }

      const { error: visitError } = await supabase.from('visits').insert({
        stall_id: stallId,
        visited_on: visitedOn,
        rating,
        dish: dish.trim() || null,
        would_reorder: wouldReorder,
        notes: notes.trim() || null,
      })
      if (visitError) throw visitError

      onSaved()
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : String(err))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="sheet-backdrop" onClick={onClose}>
      <div className="sheet" onClick={(event) => event.stopPropagation()}>
        <div className="sheet-header">
          <h2>Log a visit</h2>
          <button type="button" className="sheet-close" onClick={onClose}>
            ✕
          </button>
        </div>

        {step === 'centre' && (
          <div className="sheet-body">
            {centresError && <p className="signin-error">{centresError}</p>}
            <p className="sheet-label">Which hawker centre?</p>
            <div className="option-list">
              {centres.map((centre) => (
                <button
                  key={centre.id}
                  type="button"
                  className="option-button"
                  onClick={() => chooseCentre(centre)}
                >
                  {centre.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 'stall' && selectedCentre && (
          <div className="sheet-body">
            <p className="sheet-label">{selectedCentre.name} — which stall?</p>
            {stallsError && <p className="signin-error">{stallsError}</p>}
            <div className="option-list">
              {stalls.map((stall) => (
                <button
                  key={stall.id}
                  type="button"
                  className={
                    'option-button' + (selectedStallId === stall.id ? ' selected' : '')
                  }
                  onClick={() => {
                    setSelectedStallId(stall.id)
                    setNewStallName('')
                  }}
                >
                  {stall.name}
                </button>
              ))}
            </div>
            <p className="sheet-label">Or add a new stall</p>
            <input
              type="text"
              placeholder="Stall name"
              value={newStallName}
              onChange={(event) => {
                setNewStallName(event.target.value)
                setSelectedStallId(null)
              }}
            />
            <div className="sheet-actions">
              <button type="button" onClick={() => setStep('centre')}>
                Back
              </button>
              <button
                type="button"
                disabled={!canContinueFromStall()}
                onClick={() => setStep('details')}
              >
                Continue
              </button>
            </div>
          </div>
        )}

        {step === 'details' && (
          <div className="sheet-body">
            <p className="sheet-label">Rating</p>
            <div className="rating-picker">
              {[1, 2, 3, 4, 5].map((value) => (
                <button
                  key={value}
                  type="button"
                  className={'rating-button' + (rating >= value ? ' selected' : '')}
                  onClick={() => setRating(value)}
                >
                  {value}
                </button>
              ))}
            </div>

            <label htmlFor="dish">Dish</label>
            <input
              id="dish"
              type="text"
              value={dish}
              onChange={(event) => setDish(event.target.value)}
              placeholder="e.g. char kway teow"
            />

            <label className="reorder-label">
              <input
                type="checkbox"
                checked={wouldReorder}
                onChange={(event) => setWouldReorder(event.target.checked)}
              />
              Would order again
            </label>

            <label htmlFor="visited-on">Date</label>
            <input
              id="visited-on"
              type="date"
              value={visitedOn}
              onChange={(event) => setVisitedOn(event.target.value)}
            />

            <label htmlFor="notes">Notes (optional)</label>
            <textarea
              id="notes"
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              rows={3}
            />

            {submitError && <p className="signin-error">{submitError}</p>}

            <div className="sheet-actions">
              <button type="button" onClick={() => setStep('stall')} disabled={submitting}>
                Back
              </button>
              <button
                type="button"
                disabled={rating < 1 || submitting}
                onClick={handleSubmit}
              >
                {submitting ? 'Saving…' : 'Save visit'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default LogVisit
