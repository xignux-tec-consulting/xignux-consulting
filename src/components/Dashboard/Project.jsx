import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, LayoutDashboard } from 'lucide-react'
import {
  ResponsiveContainer, LineChart, Line, AreaChart, Area,
  BarChart, Bar, PieChart, Pie, Cell,
  CartesianGrid, XAxis, YAxis, Tooltip, Legend,
} from 'recharts'
import { ARCHETYPES } from '../../data/projects'
import { HISTORY_BY_PROJECT, fmtMXN, sroiColor } from '../../lib/sroi'

const cardEntry = { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 } }

function mkTh(dark) {
  return {
    pageBg:       dark ? 'rgba(10,14,26,0.97)'       : '#F0F4FA',
    cardBg:       dark ? 'rgba(19,25,41,0.85)'        : 'rgba(255,255,255,0.9)',
    cardBorder:   dark ? 'rgba(255,255,255,0.05)'     : 'rgba(0,0,0,0.07)',
    textPrimary:  dark ? '#F5F7FA'                    : '#0F172A',
    textSecondary:dark ? '#94A3B8'                    : '#475569',
    textMuted:    dark ? '#64748b'                    : '#94A3B8',
    tableBorder:  dark ? '#1F2937'                    : '#E2E8F0',
    trackBg:      dark ? '#1F2937'                    : '#E2E8F0',
    chartGrid:    dark ? '#1F2937'                    : '#E2E8F0',
    chartAxis:    dark ? '#94A3B8'                    : '#475569',
    tooltipBg:    dark ? '#131929'                    : '#ffffff',
    tooltipBorder:dark ? '#1F2937'                    : '#E2E8F0',
    tooltipText:  dark ? '#F5F7FA'                    : '#0F172A',
    backBtn:      dark ? 'rgba(255,255,255,0.06)'     : 'rgba(0,0,0,0.05)',
    backBtnBorder:dark ? 'rgba(255,255,255,0.1)'      : 'rgba(0,0,0,0.1)',
    crumbText:    dark ? '#94A3B8'                    : '#64748b',
    shadow:       dark ? '0 4px 20px -8px rgba(0,0,0,0.5)' : '0 4px 16px -6px rgba(0,0,0,0.1)',
  }
}

function Card({ children, className = '', style = {}, delay = 0, th }) {
  return (
    <motion.div
      {...cardEntry}
      transition={{ duration: 0.4, delay, ease: 'easeOut' }}
      whileHover={{ y: -2, boxShadow: '0 8px 32px -8px rgba(46,117,182,0.25)' }}
      className={`rounded-xl p-5 ${className}`}
      style={{
        background: th.cardBg,
        border: `1px solid ${th.cardBorder}`,
        boxShadow: th.shadow,
        transition: 'box-shadow 0.2s, transform 0.2s',
        ...style,
      }}
    >
      {children}
    </motion.div>
  )
}

// Custom tooltip shared across all charts
function ChartTooltip({ active, payload, label, th, formatter }) {
  if (!active || !payload?.length) return null
  return (
    <div style={{
      background: th.tooltipBg,
      border: `1px solid ${th.tooltipBorder}`,
      borderRadius: 8,
      padding: '8px 12px',
      fontSize: 11,
      boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
    }}>
      {label !== undefined && (
        <div style={{ color: th.textSecondary, marginBottom: 4 }}>{label}</div>
      )}
      {payload.map((p, i) => (
        <div key={i} className="flex items-center gap-2">
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: p.color, display: 'inline-block' }} />
          <span style={{ color: th.textSecondary }}>{p.name}: </span>
          <span style={{ color: th.tooltipText, fontWeight: 600 }}>
            {formatter ? formatter(p.value) : p.value}
          </span>
        </div>
      ))}
    </div>
  )
}

export default function ProjectDashboard({ project, projects, onBack, onBackToGraph, onBackToPortfolio, previousView, darkMode = true }) {
  const th = mkTh(darkMode)
  const arch = ARCHETYPES[project.archetype]
  const history = HISTORY_BY_PROJECT(project.id, project.sroi)

  const ttProps = {
    content: (props) => <ChartTooltip {...props} th={th} formatter={(v) => v.toFixed ? v.toFixed(2) + 'x' : v} />,
    cursor: { stroke: '#2E75B6', strokeWidth: 1, strokeDasharray: '3 3' },
  }
  const ttBarProps = {
    content: (props) => <ChartTooltip {...props} th={th} formatter={(v) => v.toFixed ? v.toFixed(2) + 'x' : v} />,
    cursor: { fill: 'rgba(46,117,182,0.08)' },
  }

  const sensitivityData = useMemo(() => {
    const points = []
    for (let pct = 0; pct <= 60; pct += 5) {
      const f = pct / 100
      const baseFactor = (1 - project.adjustments.dp) * (1 - project.adjustments.dr)
      const dwSroi = (project.vBruto * (1 - f) * (1 - project.adjustments.at) * baseFactor) / project.investment
      const atSroi = (project.vBruto * (1 - project.adjustments.dw) * (1 - f) * baseFactor) / project.investment
      const drSroi = (project.vBruto * (1 - project.adjustments.dw) * (1 - project.adjustments.at) * (1 - project.adjustments.dp) * (1 - f)) / project.investment
      points.push({ pct, dw: +dwSroi.toFixed(2), at: +atSroi.toFixed(2), dr: +drSroi.toFixed(2) })
    }
    return points
  }, [project])

  const benchmarkBars = [
    { name: 'Mín. sector',     value: arch.benchmark * 0.5 },
    { name: 'Promedio sector', value: arch.benchmark },
    { name: 'Máx. sector',     value: arch.benchmark * 2.0 },
    { name: project.id,        value: project.sroi },
  ]

  const stakeholderColors = ['#5B9BD5', '#ED7D31', '#10B981', '#F59E0B', '#A78BFA']
  const stakeholderData = project.stakeholders.map((s, i) => ({
    name: s, value: 100 / project.stakeholders.length + (i % 2 === 0 ? 5 : -5),
  }))

  const handleBack = () => {
    if (previousView === 'portfolio' && onBackToPortfolio) onBackToPortfolio()
    else if (onBackToGraph) onBackToGraph()
    else onBack()
  }

  const backLabel = previousView === 'portfolio' ? 'Volver al dashboard' : 'Volver al grafo'

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="absolute inset-0 overflow-y-auto z-40"
      style={{ background: th.pageBg, transition: 'background 0.3s' }}
    >
      <div className="max-w-[1400px] mx-auto px-8 py-8">

        {/* Header / breadcrumb */}
        <motion.header animate={{ opacity: 1, y: 0 }} className="mb-6">
          <div className="flex items-center gap-2 text-[11px] mono mb-3" style={{ color: th.crumbText }}>
            <button
              onClick={handleBack}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg transition hover:scale-105"
              style={{ background: th.backBtn, border: `1px solid ${th.backBtnBorder}`, color: th.textSecondary }}
            >
              <ArrowLeft className="w-3 h-3" /> {backLabel}
            </button>
            <span style={{ color: th.textMuted }}>/</span>
            <span>Portafolio</span>
            <span style={{ color: th.textMuted }}>/</span>
            <span style={{ color: arch.color }}>Arq. {project.archetype}</span>
            <span style={{ color: th.textMuted }}>/</span>
            <span style={{ color: th.textPrimary }}>{project.id}</span>
          </div>
          <div className="flex items-end justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[10px] mono px-2 py-1 rounded" style={{ background: arch.color + '33', color: arch.color, border: `1px solid ${arch.color}55` }}>
                  {project.id} · ARQ {project.archetype}
                </span>
                <span className="text-[10px] mono px-2 py-1 rounded" style={{ background: sroiColor(project.sroi) + '22', color: sroiColor(project.sroi), border: `1px solid ${sroiColor(project.sroi)}55` }}>
                  {project.category}
                </span>
              </div>
              <h1 className="text-3xl font-semibold leading-tight" style={{ color: th.textPrimary }}>{project.name}</h1>
              <div className="text-sm mt-1" style={{ color: th.textSecondary }}>{arch.name}</div>
            </div>
          </div>
        </motion.header>

        {/* KPI row */}
        <div className="grid grid-cols-12 gap-4 mb-4">
          {[
            { l: 'Inversión',              v: fmtMXN(project.investment),       sub: 'MXN · 2024' },
            { l: 'SROI',                   v: project.sroi.toFixed(2) + 'x',    color: sroiColor(project.sroi), sub: 'Valor / Inversión' },
            { l: 'Beneficiarios directos', v: project.direct_beneficiaries.toLocaleString('es-MX'), sub: 'personas' },
            { l: 'Valor social ajustado',  v: fmtMXN(project.vAjustado),        sub: `${(project.vAjustado / project.vBruto * 100).toFixed(0)}% del bruto` },
          ].map((k, i) => (
            <Card key={k.l} th={th} className="col-span-3" delay={0.05 * (i + 1)}>
              <div className="text-[10px] mono uppercase tracking-wider" style={{ color: th.textMuted }}>{k.l}</div>
              <div className="text-3xl font-semibold mt-1 mono" style={{ color: k.color || th.textPrimary }}>{k.v}</div>
              <div className="text-[11px] mt-1.5" style={{ color: th.textSecondary }}>{k.sub}</div>
            </Card>
          ))}
        </div>

        {/* Outcomes table + Stakeholders */}
        <div className="grid grid-cols-12 gap-4 mb-4">
          <Card th={th} className="col-span-8" delay={0.3}>
            <h3 className="text-sm font-semibold mb-3" style={{ color: th.textPrimary }}>Outcomes y proxies</h3>
            <table className="w-full text-xs">
              <thead style={{ color: th.textSecondary }}>
                <tr style={{ borderBottom: `1px solid ${th.tableBorder}` }}>
                  <th className="text-left py-2 font-medium">Descripción</th>
                  <th className="text-right py-2 font-medium">Cantidad</th>
                  <th className="text-right py-2 font-medium">Proxy</th>
                  <th className="text-right py-2 font-medium">Valor bruto</th>
                  <th className="text-right py-2 font-medium pl-3">Contribución</th>
                </tr>
              </thead>
              <tbody>
                {project.outcomes.map((o, i) => {
                  const total = project.outcomes.reduce((a, x) => a + x.gross, 0)
                  const pct = (o.gross / total) * 100
                  return (
                    <tr
                      key={i}
                      style={{ borderTop: `1px solid ${th.tableBorder}` }}
                      className="transition hover:bg-black/[0.03]"
                    >
                      <td className="py-2.5" style={{ color: th.textPrimary }}>{o.description}</td>
                      <td className="text-right py-2.5 mono" style={{ color: th.textSecondary }}>{o.qty.toLocaleString('es-MX')}</td>
                      <td className="text-right py-2.5 mono" style={{ color: th.textSecondary }}>{fmtMXN(o.proxy)}</td>
                      <td className="text-right py-2.5 mono font-semibold" style={{ color: th.textPrimary }}>{fmtMXN(o.gross)}</td>
                      <td className="py-2.5 pl-3">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-1.5 rounded overflow-hidden" style={{ background: th.trackBg }}>
                            <div className="h-full rounded transition-all" style={{ width: `${pct}%`, background: 'linear-gradient(90deg,#2E75B6,#5B9BD5)' }} />
                          </div>
                          <span className="mono text-[10px] w-10 text-right" style={{ color: th.textMuted }}>{pct.toFixed(0)}%</span>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </Card>

          <Card th={th} className="col-span-4" delay={0.35}>
            <h3 className="text-sm font-semibold mb-2" style={{ color: th.textPrimary }}>Stakeholders</h3>
            <div className="h-[200px]">
              <ResponsiveContainer>
                <PieChart>
                  <Pie
                    data={stakeholderData}
                    dataKey="value"
                    innerRadius={45}
                    outerRadius={75}
                    strokeWidth={0}
                    paddingAngle={2}
                  >
                    {stakeholderData.map((d, i) => (
                      <Cell
                        key={i}
                        fill={stakeholderColors[i % stakeholderColors.length]}
                        opacity={0.85}
                        style={{ cursor: 'pointer', outline: 'none' }}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    wrapperStyle={{ pointerEvents: 'none' }}
                    content={(props) => (
                      <ChartTooltip
                        {...props}
                        th={th}
                        formatter={(v) => `${v.toFixed(0)}%`}
                      />
                    )}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-1.5 text-[11px] mt-2">
              {stakeholderData.map((d, i) => (
                <div key={d.name} className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: stakeholderColors[i % stakeholderColors.length] }} />
                  <span style={{ color: th.textSecondary }}>{d.name}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Charts row */}
        <div className="grid grid-cols-12 gap-4 mb-4">
          <Card th={th} className="col-span-6" delay={0.4}>
            <h3 className="text-sm font-semibold mb-1" style={{ color: th.textPrimary }}>Sensibilidad de SROI</h3>
            <div className="text-[11px] mb-3" style={{ color: th.textSecondary }}>Cómo varía el SROI al mover cada ajuste</div>
            <div className="h-[230px]">
              <ResponsiveContainer>
                <LineChart data={sensitivityData}>
                  <CartesianGrid strokeDasharray="2 4" stroke={th.chartGrid} />
                  <XAxis dataKey="pct" tick={{ fill: th.chartAxis, fontSize: 10 }} unit="%" stroke={th.chartGrid} />
                  <YAxis tick={{ fill: th.chartAxis, fontSize: 10 }} stroke={th.chartGrid} />
                  <Tooltip {...ttProps} />
                  <Legend wrapperStyle={{ fontSize: 11, color: th.textSecondary }} />
                  <Line type="monotone" dataKey="dw" name="Deadweight"  stroke="#EF4444" strokeWidth={2} dot={false} activeDot={{ r: 5, fill: '#EF4444', stroke: th.cardBg, strokeWidth: 2 }} />
                  <Line type="monotone" dataKey="at" name="Attribution" stroke="#F59E0B" strokeWidth={2} dot={false} activeDot={{ r: 5, fill: '#F59E0B', stroke: th.cardBg, strokeWidth: 2 }} />
                  <Line type="monotone" dataKey="dr" name="Drop-off"    stroke="#ED7D31" strokeWidth={2} dot={false} activeDot={{ r: 5, fill: '#ED7D31', stroke: th.cardBg, strokeWidth: 2 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card th={th} className="col-span-6" delay={0.45}>
            <h3 className="text-sm font-semibold mb-1" style={{ color: th.textPrimary }}>Comparación con benchmark</h3>
            <div className="text-[11px] mb-3" style={{ color: th.textSecondary }}>Posición frente al rango sectorial · Arq. {project.archetype}</div>
            <div className="h-[230px]">
              <ResponsiveContainer>
                <BarChart data={benchmarkBars} layout="vertical">
                  <CartesianGrid strokeDasharray="2 4" stroke={th.chartGrid} horizontal={false} />
                  <XAxis type="number" tick={{ fill: th.chartAxis, fontSize: 10 }} stroke={th.chartGrid} />
                  <YAxis type="category" dataKey="name" tick={{ fill: th.chartAxis, fontSize: 11 }} stroke={th.chartGrid} width={110} />
                  <Tooltip {...ttBarProps} />
                  <Bar dataKey="value" radius={[0, 6, 6, 0]}>
                    {benchmarkBars.map((b, i) => (
                      <Cell
                        key={i}
                        fill={b.name === project.id ? sroiColor(project.sroi) : '#5B9BD5'}
                        fillOpacity={b.name === project.id ? 1 : 0.45}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>

        {/* History chart */}
        <Card th={th} delay={0.5}>
          <h3 className="text-sm font-semibold mb-3" style={{ color: th.textPrimary }}>Histórico SROI</h3>
          <div className="h-[200px]">
            <ResponsiveContainer>
              <AreaChart data={history}>
                <defs>
                  <linearGradient id="histGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={sroiColor(project.sroi)} stopOpacity={0.4} />
                    <stop offset="100%" stopColor={sroiColor(project.sroi)} stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="2 4" stroke={th.chartGrid} />
                <XAxis dataKey="year" tick={{ fill: th.chartAxis, fontSize: 10 }} stroke={th.chartGrid} />
                <YAxis tick={{ fill: th.chartAxis, fontSize: 10 }} stroke={th.chartGrid} />
                <Tooltip {...ttProps} />
                <Area
                  type="monotone"
                  dataKey="sroi"
                  name="SROI"
                  stroke={sroiColor(project.sroi)}
                  strokeWidth={2}
                  fill="url(#histGrad)"
                  activeDot={{ r: 6, fill: sroiColor(project.sroi), stroke: th.cardBg, strokeWidth: 2 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

      </div>
    </motion.div>
  )
}
