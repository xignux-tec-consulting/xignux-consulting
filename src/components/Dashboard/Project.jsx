import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, TrendingUp, DollarSign, Users, BarChart3, Sparkles } from 'lucide-react'
import {
  ResponsiveContainer, BarChart, Bar, Cell,
  CartesianGrid, XAxis, YAxis, Tooltip,
} from 'recharts'
import { ARCHETYPES } from '../../data/projects'
import { fmtMXN, sroiColor, portfolioTotals } from '../../lib/sroi'

const entry = { initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0 } }

function mkTh(dark) {
  return {
    pageBg:       dark ? 'rgba(10,14,26,0.97)'   : '#F0F4FA',
    cardBg:       dark ? 'rgba(19,25,41,0.85)'    : 'rgba(255,255,255,0.9)',
    cardBorder:   dark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.07)',
    textPrimary:  dark ? '#F5F7FA'                : '#0F172A',
    textSecondary:dark ? '#94A3B8'                : '#475569',
    textMuted:    dark ? '#64748b'                : '#94A3B8',
    tableBorder:  dark ? '#1F2937'                : '#E2E8F0',
    trackBg:      dark ? '#1F2937'                : '#E2E8F0',
    chartGrid:    dark ? '#1F2937'                : '#E2E8F0',
    chartAxis:    dark ? '#94A3B8'                : '#475569',
    tooltipBg:    dark ? '#131929'                : '#ffffff',
    tooltipBorder:dark ? '#1F2937'                : '#E2E8F0',
    tooltipText:  dark ? '#F5F7FA'                : '#0F172A',
    backBtn:      dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)',
    backBtnBorder:dark ? 'rgba(255,255,255,0.1)'  : 'rgba(0,0,0,0.1)',
    crumbText:    dark ? '#94A3B8'                : '#64748b',
    shadow:       dark ? '0 4px 20px -8px rgba(0,0,0,0.5)' : '0 4px 16px -6px rgba(0,0,0,0.1)',
  }
}

function Card({ children, className = '', style = {}, delay = 0, th }) {
  return (
    <motion.div
      {...entry}
      transition={{ duration: 0.4, delay, ease: 'easeOut' }}
      className={`rounded-xl p-5 ${className}`}
      style={{
        background: th.cardBg,
        border: `1px solid ${th.cardBorder}`,
        boxShadow: th.shadow,
        ...style,
      }}
    >
      {children}
    </motion.div>
  )
}

function WaterfallTooltip({ active, payload, th }) {
  if (!active || !payload?.length) return null
  const d = payload[0]?.payload
  if (!d) return null
  return (
    <div style={{
      background: th.tooltipBg,
      border: `1px solid ${th.tooltipBorder}`,
      borderRadius: 8,
      padding: '8px 12px',
      fontSize: 11,
      boxShadow: '0 8px 24px rgba(0,0,0,0.25)',
    }}>
      <div style={{ color: th.textSecondary, marginBottom: 2 }}>{d.label}</div>
      <div style={{ color: th.tooltipText, fontWeight: 600, fontFamily: 'monospace' }}>
        {d.isReduction ? '−' : ''}{fmtMXN(Math.abs(d.value))}
      </div>
      {d.pct !== undefined && (
        <div style={{ color: th.textMuted, fontSize: 10, marginTop: 2 }}>
          {d.isReduction ? `−${d.pct}% del paso anterior` : ''}
        </div>
      )}
    </div>
  )
}

function AdjustmentBar({ label, value, color, th, delay = 0 }) {
  const pct = Math.round(value * 100)
  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.35, delay }}
      className="flex items-center gap-3"
    >
      <span className="text-[11px] w-24 text-right font-medium" style={{ color: th.textSecondary }}>
        {label}
      </span>
      <div className="flex-1 relative">
        <div className="h-2.5 rounded-full overflow-hidden" style={{ background: th.trackBg }}>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.6, delay: delay + 0.15, ease: 'easeOut' }}
            className="h-full rounded-full"
            style={{ background: `linear-gradient(90deg, ${color}88, ${color})` }}
          />
        </div>
      </div>
      <span className="mono text-xs font-semibold w-10 text-right" style={{ color }}>
        {pct}%
      </span>
    </motion.div>
  )
}

export default function ProjectDashboard({ project, projects, onBack, onBackToGraph, onBackToPortfolio, previousView, darkMode = true }) {
  const th = mkTh(darkMode)
  const arch = ARCHETYPES[project.archetype]

  const portfolio = useMemo(() => portfolioTotals(projects), [projects])

  const waterfallData = useMemo(() => {
    const { dw, at, dp, dr } = project.adjustments
    const bruto = project.vBruto
    const afterDW = bruto * (1 - dw)
    const afterAT = afterDW * (1 - at)
    const afterDP = afterAT * (1 - dp)
    const afterDR = afterDP * (1 - dr)

    const redDW = bruto - afterDW
    const redAT = afterDW - afterAT
    const redDP = afterAT - afterDP
    const redDR = afterDP - afterDR

    return [
      { name: 'Bruto',        label: 'Valor Bruto',   base: 0,       value: bruto,  color: '#2E75B6' },
      { name: 'Deadweight',   label: 'Deadweight',    base: afterDW, value: redDW,  color: '#EF4444', isReduction: true, pct: Math.round(dw * 100) },
      { name: 'Attribution',  label: 'Attribution',   base: afterAT, value: redAT,  color: '#F59E0B', isReduction: true, pct: Math.round(at * 100) },
      { name: 'Displacement', label: 'Displacement',  base: afterDP, value: redDP,  color: '#ED7D31', isReduction: true, pct: Math.round(dp * 100) },
      { name: 'Drop-off',     label: 'Drop-off',      base: afterDR, value: redDR,  color: '#A78BFA', isReduction: true, pct: Math.round(dr * 100) },
      { name: 'Neto',         label: 'Valor Ajustado', base: 0,      value: afterDR, color: '#10B981' },
    ]
  }, [project])

  const handleBack = () => {
    if (previousView === 'portfolio' && onBackToPortfolio) onBackToPortfolio()
    else if (onBackToGraph) onBackToGraph()
    else onBack()
  }

  const backLabel = previousView === 'portfolio' ? 'Volver al dashboard' : 'Volver al grafo'

  const kpis = [
    { label: 'Inversión Total',     value: fmtMXN(project.investment),       sub: 'MXN · 2024',  icon: DollarSign, iconColor: '#2E75B6' },
    { label: 'SROI',                value: project.sroi.toFixed(2) + 'x',    sub: 'Retorno social', icon: TrendingUp, iconColor: sroiColor(project.sroi), valueColor: sroiColor(project.sroi) },
    { label: 'Valor Bruto',        value: fmtMXN(project.vBruto),           sub: 'Antes de ajustes', icon: BarChart3, iconColor: '#5B9BD5' },
    { label: 'Valor Ajustado',     value: fmtMXN(project.vAjustado),        sub: `${(project.vAjustado / project.vBruto * 100).toFixed(0)}% del bruto`, icon: Sparkles, iconColor: '#10B981' },
    { label: 'Beneficiarios',       value: project.direct_beneficiaries.toLocaleString('es-MX'), sub: 'personas directas', icon: Users, iconColor: '#F59E0B' },
  ]

  const adjFactors = [
    { label: 'Deadweight',   value: project.adjustments.dw, color: '#EF4444' },
    { label: 'Attribution',  value: project.adjustments.at, color: '#F59E0B' },
    { label: 'Displacement', value: project.adjustments.dp, color: '#ED7D31' },
    { label: 'Drop-off',     value: project.adjustments.dr, color: '#A78BFA' },
  ]

  const combinedAdj = 1 - ((1 - project.adjustments.dw) * (1 - project.adjustments.at) * (1 - project.adjustments.dp) * (1 - project.adjustments.dr))

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="absolute inset-0 overflow-y-auto z-40"
      style={{ background: th.pageBg }}
    >
      <div className="max-w-[1400px] mx-auto px-8 py-8">

        {/* ── Header ── */}
        <motion.header {...entry} transition={{ duration: 0.35 }} className="mb-8">
          <div className="flex items-center gap-2 text-[11px] mono mb-4" style={{ color: th.crumbText }}>
            <button
              onClick={handleBack}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg transition-all hover:scale-[1.03] active:scale-[0.97]"
              style={{ background: th.backBtn, border: `1px solid ${th.backBtnBorder}`, color: th.textSecondary }}
            >
              <ArrowLeft className="w-3.5 h-3.5" /> {backLabel}
            </button>
            <span style={{ color: th.textMuted }}>/</span>
            <span>Portafolio</span>
            <span style={{ color: th.textMuted }}>/</span>
            <span style={{ color: arch.color }}>{arch.name}</span>
            <span style={{ color: th.textMuted }}>/</span>
            <span style={{ color: th.textPrimary, fontWeight: 500 }}>{project.id}</span>
          </div>

          <div className="flex items-end justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[10px] mono px-2.5 py-1 rounded-md font-medium"
                  style={{ background: arch.color + '22', color: arch.color, border: `1px solid ${arch.color}44` }}>
                  {project.id} · Arquetipo {project.archetype}
                </span>
                <span className="text-[10px] mono px-2.5 py-1 rounded-md font-medium"
                  style={{ background: sroiColor(project.sroi) + '22', color: sroiColor(project.sroi), border: `1px solid ${sroiColor(project.sroi)}44` }}>
                  {project.category}
                </span>
              </div>
              <h1 className="text-3xl font-semibold leading-tight" style={{ color: th.textPrimary }}>
                {project.name}
              </h1>
              <p className="text-sm mt-1.5" style={{ color: th.textSecondary }}>
                {arch.name} · {project.region}
              </p>
            </div>
          </div>
        </motion.header>

        {/* ── KPI Cards ── */}
        <div className="grid grid-cols-5 gap-3 mb-5">
          {kpis.map((k, i) => {
            const Icon = k.icon
            return (
              <Card key={k.label} th={th} delay={0.04 * (i + 1)} className="relative overflow-hidden">
                <div className="flex items-start justify-between mb-2">
                  <span className="text-[10px] mono uppercase tracking-wider font-medium" style={{ color: th.textMuted }}>
                    {k.label}
                  </span>
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: k.iconColor + '18' }}>
                    <Icon className="w-3.5 h-3.5" style={{ color: k.iconColor }} />
                  </div>
                </div>
                <div className="text-2xl font-semibold mono" style={{ color: k.valueColor || th.textPrimary }}>
                  {k.value}
                </div>
                <div className="text-[11px] mt-1" style={{ color: th.textSecondary }}>{k.sub}</div>
              </Card>
            )
          })}
        </div>

        {/* ── Outcomes Table + Adjustment Factors ── */}
        <div className="grid grid-cols-12 gap-4 mb-5">

          {/* Outcomes */}
          <Card th={th} className="col-span-8" delay={0.28}>
            <h3 className="text-sm font-semibold mb-1" style={{ color: th.textPrimary }}>Outcomes y proxies</h3>
            <p className="text-[11px] mb-4" style={{ color: th.textMuted }}>Resultados medidos y su valoración económica</p>
            <table className="w-full text-xs">
              <thead>
                <tr style={{ borderBottom: `1px solid ${th.tableBorder}` }}>
                  <th className="text-left py-2.5 font-medium" style={{ color: th.textSecondary }}>Descripción</th>
                  <th className="text-right py-2.5 font-medium" style={{ color: th.textSecondary }}>Cantidad</th>
                  <th className="text-right py-2.5 font-medium" style={{ color: th.textSecondary }}>Proxy ($/ud)</th>
                  <th className="text-right py-2.5 font-medium" style={{ color: th.textSecondary }}>Valor total</th>
                  <th className="text-right py-2.5 font-medium pl-3 w-28" style={{ color: th.textSecondary }}>Peso</th>
                </tr>
              </thead>
              <tbody>
                {project.outcomes.map((o, i) => {
                  const totalGross = project.outcomes.reduce((a, x) => a + x.gross, 0)
                  const pct = (o.gross / totalGross) * 100
                  return (
                    <motion.tr
                      key={i}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: 0.35 + i * 0.06 }}
                      style={{ borderTop: i > 0 ? `1px solid ${th.tableBorder}` : 'none' }}
                    >
                      <td className="py-3 pr-3 leading-snug" style={{ color: th.textPrimary }}>{o.description}</td>
                      <td className="text-right py-3 mono tabular-nums" style={{ color: th.textSecondary }}>
                        {o.qty.toLocaleString('es-MX')}
                      </td>
                      <td className="text-right py-3 mono tabular-nums" style={{ color: th.textSecondary }}>
                        {fmtMXN(o.proxy)}/{o.unit?.replace('MXN/', '') || 'ud'}
                      </td>
                      <td className="text-right py-3 mono tabular-nums font-semibold" style={{ color: th.textPrimary }}>
                        {fmtMXN(o.gross)}
                      </td>
                      <td className="py-3 pl-3">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: th.trackBg }}>
                            <div className="h-full rounded-full" style={{
                              width: `${pct}%`,
                              background: `linear-gradient(90deg, #2E75B6, #5B9BD5)`,
                            }} />
                          </div>
                          <span className="mono text-[10px] w-9 text-right" style={{ color: th.textMuted }}>
                            {pct.toFixed(0)}%
                          </span>
                        </div>
                      </td>
                    </motion.tr>
                  )
                })}
              </tbody>
              <tfoot>
                <tr style={{ borderTop: `2px solid ${th.tableBorder}` }}>
                  <td className="py-2.5 font-semibold text-[11px]" style={{ color: th.textSecondary }}>Total</td>
                  <td />
                  <td />
                  <td className="text-right py-2.5 mono font-semibold" style={{ color: th.textPrimary }}>
                    {fmtMXN(project.vBruto)}
                  </td>
                  <td />
                </tr>
              </tfoot>
            </table>
          </Card>

          {/* Adjustment Factors */}
          <Card th={th} className="col-span-4" delay={0.32}>
            <h3 className="text-sm font-semibold mb-1" style={{ color: th.textPrimary }}>Factores de ajuste</h3>
            <p className="text-[11px] mb-5" style={{ color: th.textMuted }}>Descuentos aplicados al valor bruto</p>

            <div className="space-y-4">
              {adjFactors.map((f, i) => (
                <AdjustmentBar key={f.label} {...f} th={th} delay={0.36 + i * 0.07} />
              ))}
            </div>

            <div className="mt-6 pt-4" style={{ borderTop: `1px solid ${th.tableBorder}` }}>
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-medium" style={{ color: th.textSecondary }}>Factor combinado</span>
                <span className="mono text-sm font-semibold" style={{ color: '#EF4444' }}>
                  −{Math.round(combinedAdj * 100)}%
                </span>
              </div>
              <p className="text-[10px] mt-2 leading-relaxed" style={{ color: th.textMuted }}>
                Del valor bruto de {fmtMXN(project.vBruto)}, se retiene el {Math.round((1 - combinedAdj) * 100)}%
                como valor social ajustado: {fmtMXN(project.vAjustado)}.
              </p>
            </div>
          </Card>
        </div>

        {/* ── Waterfall Chart + Portfolio Comparison ── */}
        <div className="grid grid-cols-12 gap-4 mb-8">

          {/* Waterfall */}
          <Card th={th} className="col-span-8" delay={0.42}>
            <h3 className="text-sm font-semibold mb-1" style={{ color: th.textPrimary }}>Cascada de valor</h3>
            <p className="text-[11px] mb-4" style={{ color: th.textMuted }}>
              Del valor bruto al valor ajustado — cómo cada factor reduce el impacto medido
            </p>
            <div className="h-[280px]">
              <ResponsiveContainer>
                <BarChart data={waterfallData} barCategoryGap="18%">
                  <CartesianGrid strokeDasharray="2 4" stroke={th.chartGrid} vertical={false} />
                  <XAxis
                    dataKey="name"
                    tick={{ fill: th.chartAxis, fontSize: 10 }}
                    stroke={th.chartGrid}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fill: th.chartAxis, fontSize: 10 }}
                    stroke={th.chartGrid}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(v) => fmtMXN(v)}
                  />
                  <Tooltip
                    content={(props) => <WaterfallTooltip {...props} th={th} />}
                    cursor={false}
                  />
                  <Bar dataKey="base" stackId="w" fill="transparent" radius={0} />
                  <Bar dataKey="value" stackId="w" radius={[4, 4, 0, 0]}>
                    {waterfallData.map((d, i) => (
                      <Cell key={i} fill={d.color} fillOpacity={d.isReduction ? 0.75 : 1} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="flex items-center gap-5 mt-3 text-[10px]" style={{ color: th.textMuted }}>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm" style={{ background: '#2E75B6' }} /> Valor bruto
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm" style={{ background: '#EF4444', opacity: 0.75 }} /> Reducciones
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm" style={{ background: '#10B981' }} /> Valor ajustado
              </span>
            </div>
          </Card>

          {/* Portfolio Comparison */}
          <Card th={th} className="col-span-4 flex flex-col" delay={0.46}>
            <h3 className="text-sm font-semibold mb-1" style={{ color: th.textPrimary }}>vs. Portafolio</h3>
            <p className="text-[11px] mb-5" style={{ color: th.textMuted }}>
              Comparación contra el promedio del portafolio completo
            </p>

            <div className="flex-1 flex flex-col justify-center gap-6">
              {/* Project SROI */}
              <div>
                <div className="flex items-baseline justify-between mb-2">
                  <span className="text-[11px] font-medium" style={{ color: th.textSecondary }}>
                    {project.id} — Este proyecto
                  </span>
                  <span className="mono text-lg font-semibold" style={{ color: sroiColor(project.sroi) }}>
                    {project.sroi.toFixed(2)}x
                  </span>
                </div>
                <div className="h-3 rounded-full overflow-hidden" style={{ background: th.trackBg }}>
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min((project.sroi / Math.max(project.sroi, portfolio.sroi, 2)) * 100, 100)}%` }}
                    transition={{ duration: 0.7, delay: 0.55, ease: 'easeOut' }}
                    className="h-full rounded-full"
                    style={{ background: `linear-gradient(90deg, ${sroiColor(project.sroi)}88, ${sroiColor(project.sroi)})` }}
                  />
                </div>
              </div>

              {/* Portfolio average */}
              <div>
                <div className="flex items-baseline justify-between mb-2">
                  <span className="text-[11px] font-medium" style={{ color: th.textSecondary }}>
                    Promedio portafolio
                  </span>
                  <span className="mono text-lg font-semibold" style={{ color: sroiColor(portfolio.sroi) }}>
                    {portfolio.sroi.toFixed(2)}x
                  </span>
                </div>
                <div className="h-3 rounded-full overflow-hidden" style={{ background: th.trackBg }}>
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min((portfolio.sroi / Math.max(project.sroi, portfolio.sroi, 2)) * 100, 100)}%` }}
                    transition={{ duration: 0.7, delay: 0.6, ease: 'easeOut' }}
                    className="h-full rounded-full"
                    style={{ background: `linear-gradient(90deg, ${sroiColor(portfolio.sroi)}88, ${sroiColor(portfolio.sroi)})` }}
                  />
                </div>
              </div>

              {/* Delta */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: 0.7 }}
                className="rounded-lg p-3 text-center"
                style={{
                  background: project.sroi >= portfolio.sroi
                    ? 'rgba(16,185,129,0.08)'
                    : 'rgba(239,68,68,0.08)',
                  border: `1px solid ${project.sroi >= portfolio.sroi ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)'}`,
                }}
              >
                <span className="mono text-xl font-semibold" style={{
                  color: project.sroi >= portfolio.sroi ? '#10B981' : '#EF4444',
                }}>
                  {project.sroi >= portfolio.sroi ? '+' : ''}{(project.sroi - portfolio.sroi).toFixed(2)}x
                </span>
                <div className="text-[10px] mt-1" style={{ color: th.textMuted }}>
                  {project.sroi >= portfolio.sroi
                    ? 'Por encima del promedio'
                    : 'Por debajo del promedio'}
                </div>
              </motion.div>
            </div>

            {/* Context stats */}
            <div className="mt-4 pt-3 grid grid-cols-2 gap-3" style={{ borderTop: `1px solid ${th.tableBorder}` }}>
              <div>
                <div className="text-[10px] mono uppercase" style={{ color: th.textMuted }}>Inversión port.</div>
                <div className="mono text-xs font-semibold mt-0.5" style={{ color: th.textPrimary }}>{fmtMXN(portfolio.inv)}</div>
              </div>
              <div>
                <div className="text-[10px] mono uppercase" style={{ color: th.textMuted }}>Proyectos</div>
                <div className="mono text-xs font-semibold mt-0.5" style={{ color: th.textPrimary }}>{portfolio.count}</div>
              </div>
            </div>
          </Card>
        </div>

      </div>
    </motion.div>
  )
}
