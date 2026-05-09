export const HISTORY_BY_PROJECT = (id, currentSroi) => {
  const years = [2020, 2021, 2022, 2023, 2024]
  const seedHash = id.split('').reduce((a, c) => a + c.charCodeAt(0), 0)
  const noise = (i) => ((Math.sin(seedHash + i * 1.7) + 1) / 2) * 0.35
  return years.map((y, i) => {
    const t = i / (years.length - 1)
    const trend = currentSroi * (0.55 + 0.45 * t)
    const v = +(trend + (noise(i) - 0.17) * currentSroi * 0.4).toFixed(2)
    return { year: y, sroi: Math.max(0.01, v) }
  })
}

export const portfolioTotals = (projects) => {
  const inv = projects.reduce((a, p) => a + p.investment, 0)
  const adj = projects.reduce((a, p) => a + (p.vTotal || p.vAjustado), 0)
  const sroi = adj / inv
  const dist = { ALTO: 0, MEDIO: 0, BAJO: 0 }
  projects.forEach((p) => { dist[p.category] = (dist[p.category] || 0) + 1 })
  return { inv, adj, sroi, dist, count: projects.length }
}

export const recomputeProject = (p, newAdj) => {
  const a = { ...p.adjustments, ...newAdj }
  const frNoDrop = (1 - a.dw) * (1 - a.at) * (1 - a.dp)
  const frFull = frNoDrop * (1 - a.dr)

  let vAjustado = 0
  for (const o of p.outcomes) {
    const gross = o.qty * o.proxy * (o.pvFactor || 1)
    const fr = (o.pvFactor || 1) > 1 ? frNoDrop : frFull
    vAjustado += gross * fr
  }
  vAjustado = Math.round(vAjustado)

  const vTotal = vAjustado + (p.vIntangible || 0)
  const sroi = +(vTotal / p.investment).toFixed(4)
  let category = 'BAJO'
  if (sroi > 2) category = 'ALTO'
  else if (sroi >= 1) category = 'MEDIO'

  return { ...p, adjustments: a, vAjustado, vTotal, sroi, category }
}

export const fmtMXN = (n) => {
  if (n >= 1_000_000) return '$' + (n / 1_000_000).toFixed(2) + 'M'
  if (n >= 1_000) return '$' + (n / 1_000).toFixed(0) + 'K'
  return '$' + n.toLocaleString('es-MX')
}

export const fmtMXNFull = (n) =>
  '$' + Math.round(n).toLocaleString('es-MX') + ' MXN'

export const sroiColor = (sroi) => {
  if (sroi > 2) return '#10B981'
  if (sroi >= 1) return '#F59E0B'
  return '#7F1D1D'
}

export const sroiCategory = (sroi) =>
  sroi > 2 ? 'ALTO' : sroi >= 1 ? 'MEDIO' : 'BAJO'
