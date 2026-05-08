import { useState } from 'react'
import { Target, Lightbulb, Calendar, ChevronRight } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { CAUSA_RAIZ, SOLUCIONES_CREATIVAS, PLAN_IMPLEMENTACION } from '../../data/analysis'
import { fmtMXN } from '../../lib/sroi'
import { useTheme } from '../../lib/theme'

const PESO_COLORS = { ALTO: '#EF4444', 'MEDIO-ALTO': '#ED7D31', MEDIO: '#F59E0B' }
const PHASE_COLORS = ['#10B981', '#F59E0B', '#E8520E']

function Card({ children, className = '', style = {} }) {
  const { th } = useTheme()
  return (
    <div
      className={`rounded-2xl p-5 ${className}`}
      style={{
        background: th.cardBg,
        border: `1px solid ${th.cardBorder}`,
        boxShadow: th.shadow,
        ...style,
      }}
    >
      {children}
    </div>
  )
}

function SectionHeader({ icon: Icon, children }) {
  const { th } = useTheme()
  return (
    <div className="flex items-center gap-2 mb-4">
      <Icon className="w-4.5 h-4.5" style={{ color: th.accent }} />
      <h2 className="text-lg font-semibold" style={{ color: th.textPrimary }}>{children}</h2>
    </div>
  )
}

export default function OptimizeDashboard({ onBackToGraph }) {
  const { th } = useTheme()
  const [expandedCausa, setExpandedCausa] = useState(null)
  const plan = PLAN_IMPLEMENTACION

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="absolute inset-0 overflow-y-auto md:pl-[72px]"
      style={{ background: th.pageBg }}
    >
      <div className="max-w-[1440px] mx-auto px-4 md:px-8 pt-20 pb-12">

        {/* Header */}
        <header className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-3xl font-semibold leading-tight" style={{ color: th.textPrimary }}>
              Optimizacion del Portafolio
            </h1>
            <p className="text-sm mt-1.5" style={{ color: th.textSecondary }}>
              SROI actual: <span className="mono font-semibold" style={{ color: '#7F1D1D' }}>0.97x</span>
              {' '} &rarr; {' '}
              Objetivo: <span className="mono font-semibold" style={{ color: '#10B981' }}>1.45-1.65x</span>
            </p>
          </div>
        </header>

        {/* Causa Raiz */}
        <section className="mb-8">
          <SectionHeader icon={Target}>Causa Raiz</SectionHeader>
          <div className="space-y-3">
            {CAUSA_RAIZ.map((c) => {
              const isOpen = expandedCausa === c.id
              const pesoColor = PESO_COLORS[c.peso] || '#F59E0B'
              return (
                <Card key={c.id}>
                  <button
                    onClick={() => setExpandedCausa(isOpen ? null : c.id)}
                    className="w-full flex items-center justify-between text-left"
                  >
                    <div className="flex items-center gap-3">
                      <ChevronRight
                        className="w-4 h-4 transition-transform flex-shrink-0"
                        style={{ color: th.textMuted, transform: isOpen ? 'rotate(90deg)' : 'none' }}
                      />
                      <span className="text-sm font-medium" style={{ color: th.textPrimary }}>{c.driver}</span>
                    </div>
                    <span
                      className="text-[10px] mono px-2 py-0.5 rounded-md font-semibold flex-shrink-0 ml-3"
                      style={{ background: pesoColor + '18', color: pesoColor, border: `1px solid ${pesoColor}44` }}
                    >
                      {c.peso}
                    </span>
                  </button>
                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div className="pt-4 pl-7 space-y-2 text-xs" style={{ color: th.textSecondary }}>
                          <p><strong style={{ color: th.textPrimary }}>Explicacion:</strong> {c.explicacion}</p>
                          <p><strong style={{ color: th.textPrimary }}>Implicacion:</strong> {c.implicacion}</p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </Card>
              )
            })}
          </div>
        </section>

        {/* Soluciones Creativas */}
        <section className="mb-8">
          <SectionHeader icon={Lightbulb}>Soluciones Creativas</SectionHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {SOLUCIONES_CREATIVAS.map((s) => (
              <Card key={s.id} style={{ borderLeft: `3px solid ${th.accent}` }}>
                <div className="flex items-center gap-2 mb-2">
                  <span
                    className="text-[10px] mono px-1.5 py-0.5 rounded-md font-semibold"
                    style={{ background: th.accentSoft, color: th.accent, border: `1px solid ${th.accentBorder}` }}
                  >
                    {s.id}
                  </span>
                  <h3 className="text-sm font-semibold" style={{ color: th.textPrimary }}>{s.nombre}</h3>
                </div>
                <p className="text-xs leading-relaxed mb-3" style={{ color: th.textSecondary }}>{s.descripcion}</p>
                <div className="flex gap-4 text-[11px] mb-2">
                  <span style={{ color: th.textMuted }}>
                    Inversion: <span className="mono font-semibold" style={{ color: th.textPrimary }}>{s.inversion}</span>
                  </span>
                  <span style={{ color: th.textMuted }}>
                    Impacto: <span className="mono font-semibold" style={{ color: '#10B981' }}>{s.impacto}</span>
                  </span>
                </div>
                <p className="text-[10px] leading-relaxed" style={{ color: th.textMuted }}>{s.conexion}</p>
              </Card>
            ))}
          </div>
        </section>

        {/* Plan de Implementacion */}
        <section>
          <SectionHeader icon={Calendar}>Plan de Implementacion</SectionHeader>

          {/* Summary bar */}
          <Card className="mb-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-xs">
                <div>
                  <span style={{ color: th.textMuted }}>SROI </span>
                  <span className="mono font-semibold" style={{ color: '#7F1D1D' }}>{plan.resumen.sroiActual}x</span>
                  <span style={{ color: th.textMuted }}> &rarr; </span>
                  <span className="mono font-semibold" style={{ color: '#10B981' }}>{plan.resumen.sroiObjetivo}x</span>
                </div>
                <div>
                  <span style={{ color: th.textMuted }}>Inversion: </span>
                  <span className="mono font-semibold" style={{ color: th.textPrimary }}>{plan.resumen.inversionPlan}</span>
                </div>
                <div>
                  <span style={{ color: th.textMuted }}>ROI del plan: </span>
                  <span className="mono font-semibold" style={{ color: th.accent }}>{plan.resumen.roiPlan}</span>
                </div>
              </div>
              <span className="text-[10px] mono px-2 py-1 rounded-lg" style={{ background: 'rgba(16,185,129,0.08)', color: '#10B981', border: '1px solid rgba(16,185,129,0.2)' }}>
                {plan.resumen.mejora}
              </span>
            </div>
          </Card>

          {/* Phase cards */}
          <div className="space-y-4">
            {plan.fases.map((fase, fi) => {
              const phaseColor = PHASE_COLORS[fi] || '#E8520E'
              return (
                <Card key={fase.id}>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-4">
                    <div className="flex items-center gap-3">
                      <span
                        className="text-[10px] mono px-2 py-1 rounded-lg font-semibold"
                        style={{ background: phaseColor + '18', color: phaseColor, border: `1px solid ${phaseColor}44` }}
                      >
                        Fase {fase.id}
                      </span>
                      <h3 className="text-sm font-semibold" style={{ color: th.textPrimary }}>{fase.nombre}</h3>
                    </div>
                    <div className="flex gap-4 text-[11px]">
                      <span style={{ color: th.textMuted }}>
                        Meses <span className="mono font-semibold" style={{ color: th.textPrimary }}>{fase.meses}</span>
                      </span>
                      <span style={{ color: th.textMuted }}>
                        Presupuesto <span className="mono font-semibold" style={{ color: th.textPrimary }}>{fase.presupuesto}</span>
                      </span>
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr style={{ color: th.textMuted, borderBottom: `1px solid ${th.cardBorder}` }}>
                        <th className="text-left py-2 px-2 font-medium w-16">ID</th>
                        <th className="text-left py-2 px-2 font-medium">Accion</th>
                        <th className="text-left py-2 px-2 font-medium">KPI</th>
                        <th className="text-right py-2 px-2 font-medium w-28">Presupuesto</th>
                      </tr>
                    </thead>
                    <tbody>
                      {fase.acciones.map((a) => (
                        <tr key={a.id} style={{ borderBottom: `1px solid ${th.tableBorder}` }}>
                          <td className="py-2.5 px-2 mono text-[10px]" style={{ color: phaseColor }}>{a.id}</td>
                          <td className="py-2.5 px-2 font-medium" style={{ color: th.textPrimary }}>{a.accion}</td>
                          <td className="py-2.5 px-2" style={{ color: th.textSecondary }}>{a.kpi}</td>
                          <td className="py-2.5 px-2 mono text-right font-semibold" style={{ color: th.textPrimary }}>
                            {a.presupuesto === 0 ? '--' : fmtMXN(a.presupuesto)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  </div>
                </Card>
              )
            })}
          </div>
        </section>

      </div>
    </motion.div>
  )
}
