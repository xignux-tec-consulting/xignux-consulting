import { useState, useEffect, useRef } from 'react'
import { loadWizardState, saveWizardState, clearWizardState, getInitialState } from '../../lib/wizardStorage'

function deepMerge(base, override) {
  const result = { ...base }
  for (const key of Object.keys(override)) {
    const ov = override[key]
    const bv = base[key]
    const bothObjects =
      ov !== null && typeof ov === 'object' && !Array.isArray(ov) &&
      bv !== null && typeof bv === 'object' && !Array.isArray(bv)
    result[key] = bothObjects ? deepMerge(bv, ov) : ov
  }
  return result
}

export default function useWizardState() {
  const [state, setState]           = useState(() => deepMerge(getInitialState(), loadWizardState()))
  const [lastSavedAt, setLastSavedAt] = useState(() => loadWizardState()?.meta?.lastSavedAt ?? null)
  const isFirstRender                 = useRef(true)

  useEffect(() => {
    if (isFirstRender.current) { isFirstRender.current = false; return }
    const timer = setTimeout(() => {
      const now = new Date().toISOString()
      saveWizardState({ ...state, meta: { ...state.meta, lastSavedAt: now } })
      setLastSavedAt(now)
    }, 500)
    return () => clearTimeout(timer)
  }, [state])

  const updateStep = (stepKey, partialData) =>
    setState((s) => ({ ...s, [stepKey]: { ...s[stepKey], ...partialData } }))

  const forceSave = () => {
    const now = new Date().toISOString()
    saveWizardState({ ...state, meta: { ...state.meta, lastSavedAt: now } })
    setLastSavedAt(now)
  }

  const resetWizard = () => {
    clearWizardState()
    setState(getInitialState())
    setLastSavedAt(null)
  }

  return { state, setState, updateStep, resetWizard, lastSavedAt, forceSave }
}
