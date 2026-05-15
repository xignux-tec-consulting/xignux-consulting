const STORAGE_KEY = 'xignux-wizard-v1'

export function getInitialState() {
  return {
    meta: { lastSavedAt: null, version: 1, currentStep: 1 },
    step1: {
      projectName: '',
      description: '',
      startDate: '',
      scopeAnswers: {
        activity: '', audience: '', decision: '',
        reliability: '', responder: '', evaluativeType: '',
      },
      stakeholders: [],
    },
    step2: { inputs: [], activities: [], outputs: [], beneficiaryChanges: [] },
    step3: {
      outcomes: [],
      // [{ id, sourceId, changeText, stakeholderName, outputName, description,
      //    indicator:{name,value,unit,source}, proxy:{name,value,source}, vpnProfile }]
    },
    step4: {
      archetypeId:   null,
      expertMode:    false,
      overrides:     { deadweight: null, attribution: null, displacement: null, dropOff: null },
      justification: '',
    },
    step5: {
      intangibles: { ENGAGEMENT: 0, BRAND: 0, TALENT: 0, SLO: 0, INNOVATION: 0, ENVCO: 0, RESILIENCE: 0 },
      intangibleSources: { ENGAGEMENT: '', BRAND: '', TALENT: '', SLO: '', INNOVATION: '', ENVCO: '', RESILIENCE: '' },
      results: null,
    },
    step6: { exported: false },
  }
}

export function loadWizardState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return {}
    return JSON.parse(raw)
  } catch {
    console.warn('[wizardStorage] Failed to parse saved state — starting fresh.')
    return {}
  }
}

export function saveWizardState(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch { /* silent fail — private browsing or storage quota exceeded */ }
}

export function clearWizardState() {
  try { localStorage.removeItem(STORAGE_KEY) } catch {}
}
