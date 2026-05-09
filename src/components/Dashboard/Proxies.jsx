import { useState, useMemo } from 'react'
import { ArrowUpDown } from 'lucide-react'
import { motion } from 'framer-motion'
import { ARCHETYPES } from '../../data/projects'
import { EXTERNALIDADES_NEGATIVAS, EXTERNALIDADES_POSITIVAS } from '../../data/analysis'
import { fmtMXN } from '../../lib/sroi'
import { useTheme } from '../../lib/theme'

function Card({ children, className = '', style = {} }) {
  const { th } = useTheme()
  return (
    <div
      className={`rounded-2xl p-5 ${className}`}
      style={{ background: th.cardBg, border: `1px solid ${th.cardBorder}`, boxShadow: th.shadow, ...style }}
    >
      {children}
    </div>
  )
}

function KpiChip({ label, value, sub, color }) {
  const { th } = useTheme()
  return (
    <Card className="flex flex-col gap-1">
      <span className="text-[10px] mono uppercase tracking-widest" style={{ color: th.textMuted }}>{label}</span>
      <span className="text-2xl font-semibold mono leading-tight" style={{ color: color || th.textPrimary }}>{value}</span>
      {sub && <span className="text-[11px]" style={{ color: th.textSecondary }}>{sub}</span>}
    </Card>
  )
}

function SortHeader({ label, sortKey, currentKey, currentDir, onSort }) {
  const { th } = useTheme()
  return (
    <th
      onClick={() => onSort(sortKey)}
      className="text-left py-2.5 px-2 font-medium cursor-pointer transition select-none"
      style={{ color: th.textMuted }}
    >
      <span className="inline-flex items-center gap-1">{label} <ArrowUpDown className="w-3 h-3 opacity-40" /></span>
    </th>
  )
}

export default function ProxiesDashboard({ projects, onBackToGraph }) {
  const { th } = useTheme()
  const [sortKey, setSortKey] = useState('gross')
  const [sortDir, setSortDir] = useState('desc')

  const allOutcomes = useMemo(() => {
    const rows = []
    projects.forEach((p) => {
      p.outcomes.forEach((o) => {
        rows.push({ projectId: p.id, projectName: p.name, archetype: p.archetype, ...o })
      })
    })
    return rows
  }, [projects])

  const totalVBruto = useMemo(() => projects.reduce((a, p) => a + p.vBruto, 0), [projects])
  const totalVAjustado = useMemo(() => projects.reduce((a, p) => a + p.vTotal, 0), [projects])

  const uniqueProxies = useMemo(() => {
    const set = new Set()
    allOutcomes.forEach((o) => { if (o.proxy !== 0) set.add(o.proxy) })
    return set.size
  }, [allOutcomes])

  const sortedOutcomes = useMemo(() => {
    const arr = [...allOutcomes]
    arr.sort((a, b) => {
      const av = a[sortKey], bv = b[sortKey]
      if (typeof av === 'string') return sortDir === 'asc' ? av.localeCompare(bv) : bv.localeCompare(av)
      return sortDir === 'asc' ? av - bv : bv - av
    })
    return arr
  }, [allOutcomes, sortKey, sortDir])

  const toggleSort = (key) => {
    if (sortKey === key) setSortDir((d) => d === 'asc' ? 'desc' : 'asc')
    else { setSortKey(key); setSortDir('desc') }
  }

  const archetypeAdj = useMemo(() => {
    const seen = {}
    projects.forEach((p) => {
      if (seen[p.archetype]) return
      const a = p.adjustments
      const fr = (1 - a.dw) * (1 - a.at) * (1 - a.dp) * (1 - a.dr)
      seen[p.archetype] = { key: p.archetype, ...ARCHETYPES[p.archetype], ...a, fr }
    })
    return Object.values(seen).sort((a, b) => b.fr - a.fr)
  }, [projects])

  const extNegTotal = EXTERNALIDADES_NEGATIVAS.reduce((a, e) => a + e.valor, 0)
  const extPosTotal = EXTERNALIDADES_POSITIVAS.reduce((a, e) => a + e.valor, 0)

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 overflow-y-auto md:pl-[72px]"
      style={{ background: th.pageBg }}
    >
      <div className="max-w-[1440px] mx-auto px-4 md:px-8 pt-20 pb-8">

        {/* Header */}
        <header className="mb-6">
          <div className="text-[10px] mono uppercase tracking-[0.25em] mb-1" style={{ color: th.textMuted }}>XIGNUX · Portafolio RSC</div>
          <h1 className="text-3xl font-semibold leading-tight" style={{ color: th.textPrimary }}>Base de Proxies</h1>
        </header>

        {/* KPI row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <KpiChip label="Total proxies" value={allOutcomes.length} sub={`Across ${projects.length} proyectos`} />
          <KpiChip label="Valor bruto total" value={fmtMXN(totalVBruto)} sub="Suma de outcomes" color="#E8520E" />
          <KpiChip label="Valor ajustado total" value={fmtMXN(totalVAjustado)} sub="Post factores de ajuste" color="#10B981" />
          <KpiChip label="Proxies unicos" value={uniqueProxies} sub="Valores de proxy distintos" />
        </div>

        {/* Full proxy table */}
        <Card className="mb-6">
          <h2 className="text-sm font-semibold tracking-wide mb-4" style={{ color: th.textPrimary }}>Tabla completa de outcomes</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr style={{ borderBottom: `1px solid ${th.tableBorder}` }}>
                  <SortHeader label="Proyecto" sortKey="projectId" currentKey={sortKey} currentDir={sortDir} onSort={toggleSort} />
                  <SortHeader label="Outcome" sortKey="description" currentKey={sortKey} currentDir={sortDir} onSort={toggleSort} />
                  <SortHeader label="Qty" sortKey="qty" currentKey={sortKey} currentDir={sortDir} onSort={toggleSort} />
                  <SortHeader label="Proxy ($)" sortKey="proxy" currentKey={sortKey} currentDir={sortDir} onSort={toggleSort} />
                  <SortHeader label="PV Factor" sortKey="pvFactor" currentKey={sortKey} currentDir={sortDir} onSort={toggleSort} />
                  <SortHeader label="Valor Bruto ($)" sortKey="gross" currentKey={sortKey} currentDir={sortDir} onSort={toggleSort} />
                  <th className="text-left py-2.5 px-2 font-medium" style={{ color: th.textMuted }}>% del Total</th>
                </tr>
              </thead>
              <tbody>
                {sortedOutcomes.map((o, i) => {
                  const arch = ARCHETYPES[o.archetype]
                  const pct = totalVBruto !== 0 ? ((o.gross / totalVBruto) * 100) : 0
                  const isNeg = o.gross < 0
                  return (
                    <tr key={`${o.projectId}-${i}`} style={{ borderBottom: `1px solid ${th.tableBorder}`, borderLeft: `3px solid ${arch.color}` }}>
                      <td className="py-2.5 px-2 mono text-[11px]" style={{ color: th.textMuted }}>{o.projectId}</td>
                      <td className="py-2.5 px-2 max-w-[280px]" style={{ color: isNeg ? '#EF4444' : th.textPrimary }}>{o.description}</td>
                      <td className="py-2.5 px-2 mono" style={{ color: isNeg ? '#EF4444' : th.textPrimary }}>{o.qty.toLocaleString('es-MX')}</td>
                      <td className="py-2.5 px-2 mono" style={{ color: isNeg ? '#EF4444' : th.textPrimary }}>{fmtMXN(Math.abs(o.proxy))}</td>
                      <td className="py-2.5 px-2 mono" style={{ color: th.textSecondary }}>{o.pvFactor.toFixed(2)}</td>
                      <td className="py-2.5 px-2 mono font-semibold" style={{ color: isNeg ? '#EF4444' : th.textPrimary }}>{fmtMXN(o.gross)}</td>
                      <td className="py-2.5 px-2 mono" style={{ color: isNeg ? '#EF4444' : th.textSecondary }}>{pct.toFixed(1)}%</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Adjustments by Archetype */}
        <Card className="mb-6">
          <h2 className="text-sm font-semibold tracking-wide mb-1" style={{ color: th.textPrimary }}>Factores de ajuste por arquetipo</h2>
          <p className="text-[11px] mb-4" style={{ color: th.textMuted }}>FR = (1-DW)(1-AT)(1-DP)(1-DR) — proporcion del valor bruto que se retiene</p>
          <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr style={{ borderBottom: `1px solid ${th.tableBorder}`, color: th.textMuted }}>
                <th className="text-left py-2.5 px-2 font-medium">Arquetipo</th>
                <th className="text-right py-2.5 px-2 font-medium">Deadweight</th>
                <th className="text-right py-2.5 px-2 font-medium">Attribution</th>
                <th className="text-right py-2.5 px-2 font-medium">Displacement</th>
                <th className="text-right py-2.5 px-2 font-medium">Drop-off</th>
                <th className="text-right py-2.5 px-2 font-medium">Factor Retencion</th>
              </tr>
            </thead>
            <tbody>
              {archetypeAdj.map((a, i) => {
                const isBest = i === 0
                return (
                  <tr key={a.key} style={{ borderBottom: `1px solid ${th.tableBorder}`, borderLeft: `3px solid ${a.color}` }}>
                    <td className="py-2.5 px-2 font-medium" style={{ color: th.textPrimary }}>
                      <span className="mono text-[10px] px-1.5 py-0.5 rounded-md mr-2" style={{ background: a.color + '22', color: a.color }}>{a.key}</span>
                      {a.name}
                    </td>
                    <td className="py-2.5 px-2 mono text-right" style={{ color: th.textSecondary }}>{(a.dw * 100).toFixed(0)}%</td>
                    <td className="py-2.5 px-2 mono text-right" style={{ color: th.textSecondary }}>{(a.at * 100).toFixed(0)}%</td>
                    <td className="py-2.5 px-2 mono text-right" style={{ color: th.textSecondary }}>{(a.dp * 100).toFixed(0)}%</td>
                    <td className="py-2.5 px-2 mono text-right" style={{ color: th.textSecondary }}>{(a.dr * 100).toFixed(0)}%</td>
                    <td className="py-2.5 px-2 mono text-right font-semibold" style={{ color: isBest ? '#10B981' : th.textPrimary }}>
                      {(a.fr * 100).toFixed(1)}%{isBest ? ' (max)' : ''}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          </div>
        </Card>

        {/* Externalidades */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <Card>
            <h2 className="text-sm font-semibold tracking-wide mb-4" style={{ color: '#EF4444' }}>Externalidades negativas</h2>
            <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr style={{ borderBottom: `1px solid ${th.tableBorder}`, color: th.textMuted }}>
                  <th className="text-left py-2 px-2 font-medium">Proyecto</th>
                  <th className="text-left py-2 px-2 font-medium">Externalidad</th>
                  <th className="text-right py-2 px-2 font-medium">Valor</th>
                </tr>
              </thead>
              <tbody>
                {EXTERNALIDADES_NEGATIVAS.map((e, i) => (
                  <tr key={i} style={{ borderBottom: `1px solid ${th.tableBorder}` }}>
                    <td className="py-2 px-2 mono" style={{ color: th.textMuted }}>{e.proyecto}</td>
                    <td className="py-2 px-2" style={{ color: th.textPrimary }}>{e.externalidad}</td>
                    <td className="py-2 px-2 mono text-right font-semibold" style={{ color: '#EF4444' }}>{fmtMXN(e.valor)}</td>
                  </tr>
                ))}
                <tr style={{ borderTop: `2px solid ${th.tableBorder}` }}>
                  <td colSpan={2} className="py-2.5 px-2 font-semibold" style={{ color: th.textPrimary }}>Total</td>
                  <td className="py-2.5 px-2 mono text-right font-semibold" style={{ color: '#EF4444' }}>{fmtMXN(extNegTotal)}</td>
                </tr>
              </tbody>
            </table>
            </div>
          </Card>

          <Card>
            <h2 className="text-sm font-semibold tracking-wide mb-4" style={{ color: '#10B981' }}>Externalidades positivas</h2>
            <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr style={{ borderBottom: `1px solid ${th.tableBorder}`, color: th.textMuted }}>
                  <th className="text-left py-2 px-2 font-medium">Proyecto</th>
                  <th className="text-left py-2 px-2 font-medium">Externalidad</th>
                  <th className="text-right py-2 px-2 font-medium">Valor</th>
                </tr>
              </thead>
              <tbody>
                {EXTERNALIDADES_POSITIVAS.map((e, i) => (
                  <tr key={i} style={{ borderBottom: `1px solid ${th.tableBorder}` }}>
                    <td className="py-2 px-2 mono" style={{ color: th.textMuted }}>{e.proyecto}</td>
                    <td className="py-2 px-2" style={{ color: th.textPrimary }}>{e.externalidad}</td>
                    <td className="py-2 px-2 mono text-right font-semibold" style={{ color: '#10B981' }}>{fmtMXN(e.valor)}</td>
                  </tr>
                ))}
                <tr style={{ borderTop: `2px solid ${th.tableBorder}` }}>
                  <td colSpan={2} className="py-2.5 px-2 font-semibold" style={{ color: th.textPrimary }}>Total</td>
                  <td className="py-2.5 px-2 mono text-right font-semibold" style={{ color: '#10B981' }}>{fmtMXN(extPosTotal)}</td>
                </tr>
              </tbody>
            </table>
            </div>
          </Card>
        </div>

      </div>
    </motion.div>
  )
}
