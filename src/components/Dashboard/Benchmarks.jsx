import { useMemo } from 'react'
import { PROJECTS, ARCHETYPES } from '../../data/projects'
import { MONTE_CARLO, PAYBACK, CAPITAL_HUMANO, INTANGIBLES } from '../../data/analysis'
import { fmtMXN, sroiColor } from '../../lib/sroi'
import {
  ResponsiveContainer, BarChart, Bar, Cell, CartesianGrid,
  XAxis, YAxis, Tooltip, ReferenceLine,
} from 'recharts'
import { TrendingUp } from 'lucide-react'
import { motion } from 'framer-motion'
import { useTheme } from '../../lib/theme'

function Card({ children, className = '' }) {
  const { th } = useTheme()
  return (
    <div
      className={`rounded-2xl p-5 ${className}`}
      style={{ background: th.cardBg, border: `1px solid ${th.cardBorder}`, boxShadow: th.shadow }}
    >
      {children}
    </div>
  )
}

function Section({ title, sub, children }) {
  const { th } = useTheme()
  return (
    <Card>
      <div className="mb-4">
        <h2 className="text-sm font-semibold tracking-wide" style={{ color: th.textPrimary }}>{title}</h2>
        {sub && <p className="text-[11px] mt-0.5" style={{ color: th.textMuted }}>{sub}</p>}
      </div>
      {children}
    </Card>
  )
}

function paybackColor(y) {
  if (y < 1) return '#10B981'
  if (y < 2) return '#F59E0B'
  if (y <= 3) return '#ED7D31'
  return '#EF4444'
}

export default function BenchmarksDashboard({ projects, onBackToGraph }) {
  const { th } = useTheme()

  const ttBar = useMemo(() => ({
    contentStyle: { background: th.tooltipBg, border: `1px solid ${th.tooltipBorder}`, borderRadius: 10, fontSize: 11, padding: '8px 12px' },
    itemStyle: { color: th.textPrimary },
    labelStyle: { color: th.textMuted, marginBottom: 4 },
    cursor: { fill: 'rgba(232,82,14,0.06)' },
  }), [th])

  const projectMap = useMemo(() => Object.fromEntries((projects || PROJECTS).map((p) => [p.id, p])), [projects])

  const mcData = useMemo(() => {
    const pct = MONTE_CARLO.percentiles
    return Object.entries(pct).map(([k, v]) => ({ name: k.toUpperCase(), sroi: v }))
  }, [])

  const intangibleMax = useMemo(() => Math.max(...INTANGIBLES.map((i) => i.rangoAlto)), [])

  const sortedPayback = useMemo(() => [...PAYBACK].sort((a, b) => a.payback - b.payback), [])

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="absolute inset-0 overflow-y-auto pl-16"
      style={{ background: th.pageBg }}
    >
      <div className="max-w-[1440px] mx-auto px-4 md:px-8 pt-20 pb-8 space-y-6">

        {/* Header */}
        <header>
          <h1 className="text-2xl font-semibold" style={{ color: th.textPrimary }}>Benchmarks y Simulacion</h1>
          <p className="text-xs mt-0.5" style={{ color: th.textMuted }}>Comparativos sectoriales, Monte Carlo, payback y capas complementarias</p>
        </header>

        {/* 1 - Archetype Benchmark Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {Object.entries(ARCHETYPES).map(([k, arch]) => {
            const pp = (projects || PROJECTS).filter((p) => p.archetype === k)
            if (!pp.length) return null
            return (
              <Card key={k}>
                <div className="h-1 rounded-full mb-3" style={{ background: arch.color }} />
                <h3 className="text-xs font-semibold mb-1" style={{ color: th.textPrimary }}>Arq. {k} - {arch.name}</h3>
                <div className="flex gap-4 text-[10px] mono mb-3" style={{ color: th.textMuted }}>
                  <span>Low {arch.benchmarkLow}x</span>
                  <span>Mid {arch.benchmarkMid}x</span>
                  <span>High {arch.benchmarkHigh}x</span>
                </div>
                <div className="space-y-2">
                  {pp.map((p) => {
                    const pos = p.sroi < arch.benchmarkLow ? 'BAJO' : p.sroi > arch.benchmarkHigh ? 'SOBRE' : 'DENTRO'
                    const posColor = pos === 'BAJO' ? '#EF4444' : pos === 'SOBRE' ? '#5B9BD5' : '#10B981'
                    const pct = Math.min(100, (p.sroi / arch.benchmarkHigh) * 100)
                    return (
                      <div key={p.id}>
                        <div className="flex items-center justify-between text-[11px] mb-1">
                          <span style={{ color: th.textPrimary }}>{p.id} {p.name}</span>
                          <span className="flex items-center gap-2">
                            <span className="mono font-semibold" style={{ color: sroiColor(p.sroi) }}>{p.sroi.toFixed(2)}x</span>
                            <span className="text-[9px] px-1 py-0.5 rounded" style={{ background: posColor + '1a', color: posColor }}>{pos}</span>
                          </span>
                        </div>
                        <div className="h-1.5 rounded-full overflow-hidden" style={{ background: th.trackBg }}>
                          <div className="h-full rounded-full" style={{ width: `${pct}%`, background: arch.color }} />
                        </div>
                      </div>
                    )
                  })}
                </div>
              </Card>
            )
          })}
        </div>

        {/* 2 - Monte Carlo */}
        <Section title="Simulacion Monte Carlo (1,000 iteraciones)" sub={`Variacion VB +/-${MONTE_CARLO.variacion.vb * 100}%, FR +/-${MONTE_CARLO.variacion.fr * 100}%`}>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4 text-center">
            <div>
              <div className="text-[10px] mono uppercase tracking-widest" style={{ color: th.textMuted }}>Media</div>
              <div className="text-xl font-semibold mono" style={{ color: th.textPrimary }}>{MONTE_CARLO.media.toFixed(2)}x</div>
            </div>
            <div>
              <div className="text-[10px] mono uppercase tracking-widest" style={{ color: th.textMuted }}>StdDev</div>
              <div className="text-xl font-semibold mono" style={{ color: th.textPrimary }}>{MONTE_CARLO.stdDev}</div>
            </div>
            <div>
              <div className="text-[10px] mono uppercase tracking-widest" style={{ color: th.textMuted }}>P(SROI &gt; 1.0)</div>
              <div className="text-xl font-semibold mono" style={{ color: '#F59E0B' }}>{(MONTE_CARLO.probSroiMayor1 * 100).toFixed(1)}%</div>
            </div>
          </div>
          <div className="h-[220px]">
            <ResponsiveContainer>
              <BarChart data={mcData} margin={{ top: 8, right: 24, left: -16, bottom: 0 }}>
                <CartesianGrid strokeDasharray="2 4" stroke={th.chartGrid} />
                <XAxis dataKey="name" tick={{ fill: th.textSecondary, fontSize: 10 }} stroke={th.chartGrid} />
                <YAxis tick={{ fill: th.textSecondary, fontSize: 10 }} stroke={th.chartGrid} domain={[0.7, 1.2]} />
                <Tooltip {...ttBar} formatter={(v) => v.toFixed(2) + 'x'} />
                <Bar dataKey="sroi" name="SROI" radius={[6, 6, 0, 0]}
                  activeBar={{ stroke: 'rgba(0,0,0,0.15)', strokeWidth: 2, fillOpacity: 1 }}
                >
                  {mcData.map((d, i) => (
                    <Cell key={i} fill={d.sroi >= 1 ? '#10B981' : '#F59E0B'} fillOpacity={0.8} />
                  ))}
                </Bar>
                <ReferenceLine y={1} stroke="#EF4444" strokeDasharray="4 4" label={{ value: 'Break-even 1.0x', fill: '#EF4444', fontSize: 10 }} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Section>

        {/* 3 - Payback Periods */}
        <Section title="Periodos de Payback" sub="Ordenados por velocidad de recuperacion (ascendente)">
          <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr style={{ color: th.textMuted, borderBottom: `1px solid ${th.cardBorder}` }}>
                <th className="text-left py-2.5 px-2 font-medium">Proyecto</th>
                <th className="text-right py-2.5 px-2 font-medium">Payback (anios)</th>
                <th className="text-left py-2.5 px-2 font-medium">Interpretacion</th>
              </tr>
            </thead>
            <tbody>
              {sortedPayback.map((row) => {
                const p = projectMap[row.id]
                const c = paybackColor(row.payback)
                return (
                  <tr key={row.id} style={{ borderBottom: `1px solid ${th.cardBorder}` }}>
                    <td className="py-2.5 px-2 font-medium" style={{ color: th.textPrimary }}>
                      {row.id}{p ? ` - ${p.name}` : ''}
                    </td>
                    <td className="py-2.5 px-2 text-right">
                      <span className="mono font-semibold px-2 py-0.5 rounded-md" style={{ background: c + '1a', color: c }}>
                        {row.payback.toFixed(2)}
                      </span>
                    </td>
                    <td className="py-2.5 px-2" style={{ color: th.textSecondary }}>{row.interpretacion}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          </div>
        </Section>

        {/* 4 - Capital Humano */}
        <Section title="Capital Humano" sub={CAPITAL_HUMANO.nota}>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4 text-center">
            <div>
              <div className="text-[10px] mono uppercase tracking-widest" style={{ color: th.textMuted }}>Empleados</div>
              <div className="text-xl font-semibold mono" style={{ color: th.textPrimary }}>{CAPITAL_HUMANO.empleados.toLocaleString('es-MX')}</div>
            </div>
            <div>
              <div className="text-[10px] mono uppercase tracking-widest" style={{ color: th.textMuted }}>Participaciones</div>
              <div className="text-xl font-semibold mono" style={{ color: th.textPrimary }}>{CAPITAL_HUMANO.participacionesVoluntarias.toLocaleString('es-MX')}</div>
            </div>
            <div>
              <div className="text-[10px] mono uppercase tracking-widest" style={{ color: th.textMuted }}>Horas voluntariado</div>
              <div className="text-xl font-semibold mono" style={{ color: th.textPrimary }}>{CAPITAL_HUMANO.horasVoluntariado.toLocaleString('es-MX')}</div>
            </div>
          </div>
          <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr style={{ color: th.textMuted, borderBottom: `1px solid ${th.cardBorder}` }}>
                <th className="text-left py-2.5 px-2 font-medium">Escenario</th>
                <th className="text-right py-2.5 px-2 font-medium">Empleados Expuestos</th>
                <th className="text-right py-2.5 px-2 font-medium">Rotacion Base</th>
                <th className="text-right py-2.5 px-2 font-medium">Reduccion Atribuible</th>
                <th className="text-right py-2.5 px-2 font-medium">Costo Reemplazo</th>
                <th className="text-right py-2.5 px-2 font-medium">Ahorro Anual</th>
              </tr>
            </thead>
            <tbody>
              {CAPITAL_HUMANO.escenarios.map((e) => {
                const c = e.label === 'Conservador' ? '#EF4444' : e.label === 'Base' ? '#F59E0B' : '#10B981'
                return (
                  <tr key={e.label} style={{ borderBottom: `1px solid ${th.cardBorder}` }}>
                    <td className="py-2.5 px-2 font-semibold" style={{ color: c }}>{e.label}</td>
                    <td className="py-2.5 px-2 mono text-right" style={{ color: th.textPrimary }}>{e.empleadosExpuestos.toLocaleString('es-MX')}</td>
                    <td className="py-2.5 px-2 mono text-right" style={{ color: th.textPrimary }}>{(e.rotacionBase * 100).toFixed(0)}%</td>
                    <td className="py-2.5 px-2 mono text-right" style={{ color: th.textPrimary }}>{(e.reduccionAtribuible * 100).toFixed(1)}%</td>
                    <td className="py-2.5 px-2 mono text-right" style={{ color: th.textPrimary }}>{fmtMXN(e.costoReemplazo)}</td>
                    <td className="py-2.5 px-2 mono text-right font-semibold" style={{ color: c }}>{fmtMXN(e.ahorro)}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          </div>
        </Section>

        {/* 5 - Intangibles */}
        <Section title="Valor intangible no capturado ($144M-$533M MXN)" sub="Categorias excluidas del SROI numerico por falta de proxy verificable">
          <div className="space-y-3">
            {INTANGIBLES.map((item) => {
              const lowPct = (item.rangoBajo / intangibleMax) * 100
              const highPct = (item.rangoAlto / intangibleMax) * 100
              return (
                <div key={item.categoria}>
                  <div className="flex items-center justify-between text-[11px] mb-1">
                    <span style={{ color: th.textPrimary }}>{item.categoria}</span>
                    <span className="mono" style={{ color: th.textMuted }}>
                      {fmtMXN(item.rangoBajo)} - {fmtMXN(item.rangoAlto)}
                    </span>
                  </div>
                  <div className="relative h-3 rounded-full overflow-hidden" style={{ background: th.trackBg }}>
                    <div
                      className="absolute top-0 h-full rounded-full"
                      style={{ left: `${lowPct}%`, width: `${highPct - lowPct}%`, background: `linear-gradient(90deg, ${th.accent}66, ${th.accent})` }}
                    />
                    <div
                      className="absolute top-0 h-full rounded-full opacity-30"
                      style={{ left: 0, width: `${lowPct}%`, background: th.accent }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </Section>

      </div>
    </motion.div>
  )
}
