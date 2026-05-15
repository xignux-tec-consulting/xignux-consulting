// ============================================================
// SECTION 1 — CONSTANTES DEL MODELO v12.10
// ============================================================

export const DISCOUNT_RATES = {
  SHCP_DEFAULT: 0.10,       // Tasa social SHCP, base del modelo
  GREEN_BOOK_UK: 0.035,     // Sensibilidad internacional
}

// 6 perfiles de VPN del Excel. Cada perfil define n (años) y DO (drop-off anual).
// VPN = Σ_{t=1..n} [(1-DO)^(t-1) / (1+r)^t]
export const VPN_PROFILES = {
  SINGLE_SHOT: {
    id: 'SINGLE_SHOT',
    label: 'Beneficio único (single-shot)',
    description: 'Outcome que ocurre una sola vez sin persistencia (premios, capacitaciones únicas, eventos)',
    n: 1,
    dropOff: 0,
  },
  ENERGY_10YR: {
    id: 'ENERGY_10YR',
    label: 'Energía 10 años (DO 5%)',
    description: 'Ahorro energético doméstico con erosión leve por degradación de equipo',
    n: 10,
    dropOff: 0.05,
  },
  CFE_SUBSIDY_10YR: {
    id: 'CFE_SUBSIDY_10YR',
    label: 'Subsidio CFE 10 años (DO 0%)',
    description: 'Ahorro al erario por reducción de subsidio (no se degrada)',
    n: 10,
    dropOff: 0,
  },
  REFORESTATION_10YR: {
    id: 'REFORESTATION_10YR',
    label: 'Reforestación 10 años (DO 20%)',
    description: 'Captura de carbono con alta mortalidad de árboles jóvenes',
    n: 10,
    dropOff: 0.20,
  },
  RESTORATION_5YR: {
    id: 'RESTORATION_5YR',
    label: 'Restauración 5 años (DO 0%)',
    description: 'Mantenimiento de área protegida, sin degradación significativa',
    n: 5,
    dropOff: 0,
  },
  URBAN_5YR: {
    id: 'URBAN_5YR',
    label: 'Reforestación urbana 5 años (DO 20%)',
    description: 'Arbolado urbano, mayor mortalidad por estrés ambiental',
    n: 5,
    dropOff: 0.20,
  },
}

// 8 arquetipos con sus ajustes (DW/Attr/Disp/Drop) ya calibrados en el Excel.
// FR = (1-DW) × (1-Attr) × (1-Disp) × (1-Drop)
export const ARCHETYPES = {
  A: {
    id: 'A',
    label: 'Educación',
    description: 'Programas educativos generales: cátedras, premios, becas, eventos académicos',
    deadweight: 0.28,
    attribution: 0.32,
    displacement: 0.05,
    dropOff: 0.25,
  },
  A_STEM: {
    id: 'A_STEM',
    label: 'Educación STEM',
    description: 'Programas STEM con foco en innovación tecnológica (P01, P02)',
    deadweight: 0.18,
    attribution: 0.32,
    displacement: 0.05,
    dropOff: 0.25,
  },
  B: {
    id: 'B',
    label: 'Eventos Comunitarios',
    description: 'Carreras, gamings, actividades de awareness — alto deadweight',
    deadweight: 0.55,
    attribution: 0.28,
    displacement: 0.05,
    dropOff: 0.50,
  },
  C: {
    id: 'C',
    label: 'Energía / Vivienda',
    description: 'Programas con beneficio energético/habitacional directo',
    deadweight: 0,
    attribution: 0.18,
    displacement: 0.05,
    dropOff: 0.05,
  },
  C_R: {
    id: 'C_R',
    label: 'Energía / Vivienda — Ahorro recurrente',
    description: 'Subsidios o ahorros que no degradan en el tiempo',
    deadweight: 0,
    attribution: 0.18,
    displacement: 0.05,
    dropOff: 0,
  },
  D: {
    id: 'D',
    label: 'Reforestación',
    description: 'Plantación general con mortalidad y attribution moderada',
    deadweight: 0.12,
    attribution: 0.42,
    displacement: 0.10,
    dropOff: 0.20,
  },
  D_R: {
    id: 'D_R',
    label: 'Reforestación — Restauración persistente',
    description: 'Restauración de ecosistemas en áreas protegidas',
    deadweight: 0.12,
    attribution: 0.42,
    displacement: 0,
    dropOff: 0.10,
  },
  E: {
    id: 'E',
    label: 'Asistencia Alimentaria',
    description: 'Apoyo alimentario directo, sin degradación',
    deadweight: 0.18,
    attribution: 0.22,
    displacement: 0.12,
    dropOff: 0,
  },
}

// 7 categorías de valor intangible del Excel
export const INTANGIBLE_CATEGORIES = {
  ENGAGEMENT: { id: 'ENGAGEMENT', label: 'Engagement de empleados',    description: 'Compromiso, motivación y retención del talento interno' },
  BRAND:      { id: 'BRAND',      label: 'Brand equity',               description: 'Valor de marca, reputación corporativa, visibilidad' },
  TALENT:     { id: 'TALENT',     label: 'Atracción de talento',       description: 'Employability premium, costo evitado de recruitment' },
  SLO:        { id: 'SLO',        label: 'Licencia social',            description: 'Social License to Operate, aceptación comunitaria' },
  INNOVATION: { id: 'INNOVATION', label: 'Innovación',                 description: 'Capacidades técnicas nuevas, IP, transferencia tecnológica' },
  ENVCO:      { id: 'ENVCO',      label: 'Co-beneficios ambientales',  description: 'Biodiversidad, agua, suelo, beneficios no contabilizados como carbono' },
  RESILIENCE: { id: 'RESILIENCE', label: 'Resiliencia comunitaria',    description: 'Capacidad de respuesta ante choques, capital social' },
}

// ============================================================
// SECTION 2 — FUNCIONES NÚCLEO
// ============================================================

/**
 * VPN = Σ_{t=1..n} [(1-DO)^(t-1) / (1+r)^t]
 */
export function computeVPN(n, dropOff, discountRate = DISCOUNT_RATES.SHCP_DEFAULT) {
  if (n === 1 && dropOff === 0) return 1
  let sum = 0
  for (let t = 1; t <= n; t++) {
    sum += Math.pow(1 - dropOff, t - 1) / Math.pow(1 + discountRate, t)
  }
  return sum
}

export function vpnForProfile(profileId, discountRate = DISCOUNT_RATES.SHCP_DEFAULT) {
  const profile = VPN_PROFILES[profileId]
  if (!profile) throw new Error(`VPN profile no encontrado: ${profileId}`)
  return computeVPN(profile.n, profile.dropOff, discountRate)
}

/**
 * FR = (1-DW) × (1-Attr) × (1-Disp) × (1-Drop)
 */
export function factorReclamado(archetypeId, overrides = null) {
  const a = ARCHETYPES[archetypeId]
  if (!a) throw new Error(`Arquetipo no encontrado: ${archetypeId}`)
  const adj = overrides || a
  return (1 - adj.deadweight) * (1 - adj.attribution) * (1 - adj.displacement) * (1 - adj.dropOff)
}

/** VB = Cantidad × Proxy × VPN */
export function valorBruto(quantity, proxyValue, vpn) {
  return quantity * proxyValue * vpn
}

/** VA = VB × FR */
export function valorAjustado(vb, fr) {
  return vb * fr
}

// ============================================================
// SECTION 3 — CÁLCULO POR PROYECTO
// ============================================================

/**
 * @param {Object} project {
 *   id, name, investment, archetypeId, archetypeOverrides?,
 *   outcomes: [{ id, description, quantity, proxyValue, vpnProfile }],
 *   intangibles?: { ENGAGEMENT, BRAND, TALENT, SLO, INNOVATION, ENVCO, RESILIENCE }
 * }
 */
export function computeProjectSROI(project, options = {}) {
  const discountRate = options.discountRate ?? DISCOUNT_RATES.SHCP_DEFAULT
  const fr = factorReclamado(project.archetypeId, project.archetypeOverrides)

  const outcomes = (project.outcomes || []).map(o => {
    const vpn = vpnForProfile(o.vpnProfile, discountRate)
    const vb  = valorBruto(o.quantity, o.proxyValue, vpn)
    const va  = valorAjustado(vb, fr)
    return { ...o, vpn, vb, fr, va }
  })

  const vaTangible   = outcomes.reduce((acc, o) => acc + o.va, 0)
  const vaIntangible = sumIntangibles(project.intangibles)
  const vaTotal      = vaTangible + vaIntangible

  return {
    project,
    outcomes,
    vaTangible,
    vaIntangible,
    vaTotal,
    sroiTangible: project.investment > 0 ? vaTangible   / project.investment : 0,
    sroiTotal:    project.investment > 0 ? vaTotal       / project.investment : 0,
    archetype:       ARCHETYPES[project.archetypeId],
    factorReclamado: fr,
    discountRate,
  }
}

export function sumIntangibles(intangibles) {
  if (!intangibles) return 0
  return Object.values(intangibles).reduce((acc, v) => acc + (Number(v) || 0), 0)
}

// ============================================================
// SECTION 4 — AGREGACIÓN PORTAFOLIO
// ============================================================

export function portfolioSROI(projectResults) {
  const investment   = projectResults.reduce((a, r) => a + r.project.investment, 0)
  const vaTangible   = projectResults.reduce((a, r) => a + r.vaTangible,        0)
  const vaIntangible = projectResults.reduce((a, r) => a + r.vaIntangible,      0)
  const vaTotal      = vaTangible + vaIntangible
  return {
    count: projectResults.length,
    investment,
    vaTangible,
    vaIntangible,
    vaTotal,
    sroiTangible: investment > 0 ? vaTangible / investment : 0,
    sroiTotal:    investment > 0 ? vaTotal    / investment : 0,
  }
}

// ============================================================
// SECTION 5 — SENSIBILIDAD (5 escenarios del Excel)
// ============================================================

export const SENSITIVITY_SCENARIOS = {
  PESSIMISTIC_30: { id: 'PESSIMISTIC_30', label: 'Pesimista −30% VB',      vbMultiplier: 0.70, discountRate: null },
  PESSIMISTIC_10: { id: 'PESSIMISTIC_10', label: 'Pesimista −10% VB',      vbMultiplier: 0.90 },
  BASE:           { id: 'BASE',           label: '🎯 Base v12.10',          vbMultiplier: 1.00 },
  OPTIMISTIC_10:  { id: 'OPTIMISTIC_10',  label: 'Optimista +10% VB',      vbMultiplier: 1.10 },
  OPTIMISTIC_30:  { id: 'OPTIMISTIC_30',  label: 'Optimista +30% VB',      vbMultiplier: 1.30 },
  GREEN_BOOK:     { id: 'GREEN_BOOK',     label: 'Internacional r=3.5%',   vbMultiplier: 1.00, discountRate: 0.035 },
}

export function applyScenario(project, scenarioId, options = {}) {
  const scenario = SENSITIVITY_SCENARIOS[scenarioId]
  if (!scenario) throw new Error(`Escenario no encontrado: ${scenarioId}`)

  const baseResult = computeProjectSROI(project, {
    discountRate: scenario.discountRate ?? options.discountRate ?? DISCOUNT_RATES.SHCP_DEFAULT,
  })

  const m = scenario.vbMultiplier
  const adjustedOutcomes = baseResult.outcomes.map(o => ({ ...o, vb: o.vb * m, va: o.va * m }))
  const vaTangible   = baseResult.vaTangible * m
  const vaIntangible = baseResult.vaIntangible   // intangibles no se multiplican
  const vaTotal      = vaTangible + vaIntangible

  return {
    ...baseResult,
    scenario,
    outcomes:     adjustedOutcomes,
    vaTangible,
    vaIntangible,
    vaTotal,
    sroiTangible: project.investment > 0 ? vaTangible / project.investment : 0,
    sroiTotal:    project.investment > 0 ? vaTotal    / project.investment : 0,
  }
}

// ============================================================
// SECTION 6 — FORMATTERS
// ============================================================

export { fmtMXN, fmtMXNFull, sroiColor, sroiCategory } from './sroi'

// ============================================================
// VALIDACIÓN — solo en desarrollo (Vite remueve el bloque en prod)
// ============================================================

if (import.meta.env?.DEV) {
  console.group('[sroiV12] Validación contra Excel v12.10')

  const VPN_EXPECTED = {
    SINGLE_SHOT:       1.000,
    ENERGY_10YR:       5.128,
    CFE_SUBSIDY_10YR:  6.145,
    REFORESTATION_10YR: 3.195,
    RESTORATION_5YR:   3.791,
    URBAN_5YR:         2.655,
  }
  Object.entries(VPN_EXPECTED).forEach(([id, expected]) => {
    const actual = vpnForProfile(id)
    const ok = Math.abs(actual - expected) < 0.01
    console.log(`  VPN[${id}] = ${actual.toFixed(3)} (esperado ${expected}) ${ok ? '✓' : '✗ FAIL'}`)
  })

  const FR_EXPECTED = {
    A:     0.349,
    A_STEM: 0.397,
    B:     0.154,
    C:     0.740,
    C_R:   0.779,
    D:     0.367,
    D_R:   0.459,
    E:     0.563,
  }
  Object.entries(FR_EXPECTED).forEach(([id, expected]) => {
    const actual = factorReclamado(id)
    const ok = Math.abs(actual - expected) < 0.01
    console.log(`  FR[${id}] = ${actual.toFixed(3)} (esperado ${expected}) ${ok ? '✓' : '✗ FAIL'}`)
  })

  console.groupEnd()
}
