// ============================================================
// wizardProjectMapper.js — Bidirectional wizard ↔ portfolio
// ============================================================
// NOTE: Uses sroiV12.ARCHETYPES (not data/projects ARCHETYPES/ADJUSTMENTS)

import { computeProjectSROI, ARCHETYPES as V12_ARCHETYPES } from './sroiV12'

// Map sroiV12 archetype IDs → data/projects canonical archetype IDs
// C_R and D_R are variants that map to C and D respectively
const ARCHETYPE_CANONICAL = {
  A_STEM: 'A_STEM',
  A:      'A',
  B:      'B',
  C:      'C',
  C_R:    'C',
  D:      'D',
  D_R:    'D',
  E:      'E',
}

// Wizard uses UPPERCASE keys; project shape uses lowercase keys
const INTANGIBLE_KEY_MAP = {
  ENGAGEMENT: 'engage',
  BRAND:      'brand',
  TALENT:     'talent',
  SLO:        'slo',
  INNOVATION: 'innov',
  ENVCO:      'envCo',
  RESILIENCE: 'resil',
}

function classifyQuadrant(sroi, dq) {
  if (sroi >= 2 && dq >= 4) return 'JOYA'
  if (sroi >= 2)            return 'ESTRELLA'
  if (sroi >= 1)            return 'CONSOLIDADO'
  if (sroi >= 0.5)          return 'SEMILLA'
  return 'RECONSIDERAR'
}

function sroiCategory(sroi) {
  if (sroi >= 2)   return 'ALTO'
  if (sroi >= 1)   return 'MEDIO'
  if (sroi >= 0.5) return 'BAJO'
  return 'MUY BAJO'
}

/**
 * Convert a completed wizard state into a project object (data/projects.js shape).
 * @param {Object} wizardState  — full wizard state from useWizardState
 * @param {string|null} projectId — pass existing ID to update, null to create new
 */
export function wizardStateToProject(wizardState, projectId = null) {
  const { step1, step2, step3, step4, step5 } = wizardState

  const id = projectId || `WIZ_${Date.now().toString(36)}`
  const archetypeV12Id = step4?.archetypeId || 'A'
  const archetypeId    = ARCHETYPE_CANONICAL[archetypeV12Id] || 'A'

  // Investment = sum of (quantity × unitValue) across all inputs
  const investment = (step2?.inputs || []).reduce((sum, inp) => {
    const qty = Number(inp.quantity) || 0
    const uv  = Number(inp.unitValue) || 0
    const flat = Number(inp.value) || 0
    return sum + (qty * uv || flat)
  }, 0)

  // Adjustments: expert overrides when expertMode, else archetype defaults
  const v12arch    = V12_ARCHETYPES[archetypeV12Id] || V12_ARCHETYPES['A']
  const overrides  = step4?.overrides || {}
  const expertMode = Boolean(step4?.expertMode)

  const adjustments = {
    dw: (expertMode && overrides.deadweight   != null) ? overrides.deadweight   : v12arch.deadweight,
    at: (expertMode && overrides.attribution  != null) ? overrides.attribution  : v12arch.attribution,
    dp: (expertMode && overrides.displacement != null) ? overrides.displacement : v12arch.displacement,
    dr: (expertMode && overrides.dropOff      != null) ? overrides.dropOff      : v12arch.dropOff,
  }

  // Raw outcomes from step3 (only those with valid indicator and proxy)
  const rawOutcomes = (step3?.outcomes || [])
    .filter(o => Number(o.indicator?.value) > 0 && Number(o.proxy?.value) > 0)
    .map(o => {
      const qty   = Number(o.indicator?.value) || 0
      const proxy = Number(o.proxy?.value) || 0
      return {
        description: (o.description || o.changeText || '').trim(),
        qty,
        proxy,
        pvFactor: 1,
        unit: o.indicator?.unit || 'MXN/unidad',
        gross: qty * proxy,
      }
    })

  // Intangibles: UPPERCASE (wizard) → lowercase (project)
  const wizIntangibles = step5?.intangibles || {}
  const intangibles = {}
  Object.entries(INTANGIBLE_KEY_MAP).forEach(([wizKey, projKey]) => {
    intangibles[projKey] = Number(wizIntangibles[wizKey]) || 0
  })

  // Compute SROI via sroiV12 (uses sroiV12 ARCHETYPES, not data/projects)
  let vBruto    = rawOutcomes.reduce((s, o) => s + o.gross, 0)
  let vAjustado = 0, vIntangible = 0, vTotal = 0, sroiVal = 0

  try {
    const result = computeProjectSROI({
      id,
      investment,
      archetypeId: archetypeV12Id,
      archetypeOverrides: expertMode ? {
        deadweight:   adjustments.dw,
        attribution:  adjustments.at,
        displacement: adjustments.dp,
        dropOff:      adjustments.dr,
      } : null,
      outcomes: rawOutcomes.map((o, i) => ({
        id:          `o${i}`,
        description: o.description,
        quantity:    o.qty,
        proxyValue:  o.proxy,
        vpnProfile:  'SINGLE_SHOT',
      })),
      intangibles: {
        ENGAGEMENT: Number(wizIntangibles.ENGAGEMENT) || 0,
        BRAND:      Number(wizIntangibles.BRAND)      || 0,
        TALENT:     Number(wizIntangibles.TALENT)     || 0,
        SLO:        Number(wizIntangibles.SLO)        || 0,
        INNOVATION: Number(wizIntangibles.INNOVATION) || 0,
        ENVCO:      Number(wizIntangibles.ENVCO)      || 0,
        RESILIENCE: Number(wizIntangibles.RESILIENCE) || 0,
      },
    })
    vAjustado   = result.vaTangible
    vIntangible = result.vaIntangible
    vTotal      = result.vaTotal
    sroiVal     = result.sroiTotal
  } catch (e) {
    console.warn('[wizardProjectMapper] computeProjectSROI failed:', e.message)
    const fr = (1 - adjustments.dw) * (1 - adjustments.at) * (1 - adjustments.dp) * (1 - adjustments.dr)
    vAjustado   = vBruto * fr
    vIntangible = Object.values(intangibles).reduce((s, v) => s + v, 0)
    vTotal      = vAjustado + vIntangible
    sroiVal     = investment > 0 ? vTotal / investment : 0
  }

  const data_quality = 2
  const quadrant     = classifyQuadrant(sroiVal, data_quality)

  return {
    id,
    name:                (step1?.projectName || '').trim() || 'Proyecto sin nombre',
    archetype:           archetypeId,
    investment,
    sroi:                sroiVal,
    vBruto,
    vAjustado,
    vIntangible,
    vTotal,
    category:            sroiCategory(sroiVal),
    direct_beneficiaries: rawOutcomes.reduce((s, o) => s + o.qty, 0),
    region:              'MX',
    adjustments,
    quadrant,
    composite_score:     2.0,
    strategic_score:     2,
    data_quality,
    scalability:         2,
    risk:                3,
    potential:           3,
    intangibles,
    outcomes:            rawOutcomes,
    stakeholders:        (step1?.stakeholders || []).map(s => (s.name || s)).filter(Boolean),
    strategic_action:    '',
    strategic_partner:   '',
  }
}

/**
 * Convert a project (data/projects.js shape) back into wizard state.
 * NOTE: round-trip is NOT bit-exact — loses activity/output granularity.
 * @param {Object} project
 */
export function projectToWizardState(project) {
  const archetypeV12 = project.archetype  // A_STEM, A, B, C, D, E

  return {
    meta: { lastSavedAt: null, version: 1, currentStep: 1 },

    step1: {
      projectName:  project.name,
      description:  '',
      startDate:    '',
      scopeAnswers: {
        activity: '', audience: '', decision: '',
        reliability: '', responder: '', evaluativeType: '',
      },
      stakeholders: project.stakeholders.map((s, i) => ({
        id:          `s${i}`,
        name:        typeof s === 'string' ? s : (s.name || ''),
        type:        'beneficiario',
        description: '',
      })),
    },

    step2: {
      inputs: [{
        id:          'i0',
        description: 'Inversión total',
        quantity:    1,
        unitValue:   project.investment,
        unit:        'MXN',
        value:       project.investment,
      }],
      activities: [],
      outputs: [],
      beneficiaryChanges: project.outcomes.map((o, i) => ({
        id:              `bc${i}`,
        stakeholderName: project.stakeholders[0] || '',
        outputName:      '',
        changeText:      o.description,
      })),
    },

    step3: {
      outcomes: project.outcomes.map((o, i) => ({
        id:              `o${i}`,
        sourceId:        `bc${i}`,
        changeText:      o.description,
        stakeholderName: project.stakeholders[0] || '',
        outputName:      '',
        description:     o.description,
        indicator: {
          name:   'Cantidad',
          value:  o.qty,
          unit:   o.unit || 'unidades',
          source: '',
        },
        proxy: {
          name:   'Proxy financiero',
          value:  o.proxy,
          source: '',
        },
        vpnProfile: 'SINGLE_SHOT',
      })),
    },

    step4: {
      archetypeId:   archetypeV12,
      expertMode:    true,
      overrides: {
        deadweight:   project.adjustments.dw,
        attribution:  project.adjustments.at,
        displacement: project.adjustments.dp,
        dropOff:      project.adjustments.dr,
      },
      justification: `Cargado desde portafolio (${project.id})`,
    },

    step5: {
      intangibles: {
        ENGAGEMENT: project.intangibles.engage  || 0,
        BRAND:      project.intangibles.brand   || 0,
        TALENT:     project.intangibles.talent  || 0,
        SLO:        project.intangibles.slo     || 0,
        INNOVATION: project.intangibles.innov   || 0,
        ENVCO:      project.intangibles.envCo   || 0,
        RESILIENCE: project.intangibles.resil   || 0,
      },
      intangibleSources: {
        ENGAGEMENT: '', BRAND: '', TALENT: '', SLO: '', INNOVATION: '', ENVCO: '', RESILIENCE: '',
      },
      results: null,
    },

    step6: {
      exportedAt:         null,
      certificationNotes: '',
      knownLimitations:   [],
    },
  }
}
