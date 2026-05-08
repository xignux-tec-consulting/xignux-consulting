import { useState } from 'react'
import { Target, Lightbulb, Calendar, ChevronRight } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { CAUSA_RAIZ, SOLUCIONES_CREATIVAS, PLAN_IMPLEMENTACION } from '../../data/analysis'
import { fmtMXN } from '../../lib/sroi'

const PESO_COLORS = { ALTO: '#EF4444', 'MEDIO-ALTO': '#ED7D31', MEDIO: '#F59E0B' }
const PHASE_COLORS = ['#10B981', '#F59E0B', '#E8520E']

function Card({ children, className = '', style = {} }) {
  return (
    <div
      className={`rounded-2xl p-5 ${className}`}
      style={{
        background: '#FFFFFF',
        border: '1px solid #E5E0DA',
        boxShadow: '0 2px 12px -4px rgba(0,0,0,0.06)',
        ...style,
      }}
    >
      {children}
    </div>
  )
}

function SectionHeader({ icon: Icon, children }) {
  return (
    <div className="flex items-center gap-2 mb-4">
      <Icon className="w-4.5 h-4.5" style={{ color: '#E8520E' }} />
      <h2 className="text-lg font-semibold" style={{ color: '#1A1A1A' }}>{children}</h2>
    </div>
  )
}

export default function OptimizeDashboard({ onBackToGraph }) {
  const [expandedCausa, setExpandedCausa] = useState(null)
  const plan = PLAN_IMPLEMENTACION

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="absolute inset-0 overflow-y-auto"
      style={{ background: '#F8F6F3' }}
    >
      <div className="max-w-[1440px] mx-auto px-8 pt-20 pb-12">

        {/* Header */}
        <header className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-3xl font-semibold leading-tight" style={{ color: '#1A1A1A' }}>
              Optimizacion del Portafolio
            </h1>
            <p className="text-sm mt-1.5" style={{ color: '#666666' }}>
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
                        style={{ color: '#999999', transform: isOpen ? 'rotate(90deg)' : 'none' }}
                      />
                      <span className="text-sm font-medium" style={{ color: '#1A1A1A' }}>{c.driver}</span>
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
                        <div className="pt-4 pl-7 space-y-2 text-xs" style={{ color: '#666666' }}>
                          <p><strong style={{ color: '#1A1A1A' }}>Explicacion:</strong> {c.explicacion}</p>
                          <p><strong style={{ color: '#1A1A1A' }}>Implicacion:</strong> {c.implicacion}</p>
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
          <div className="grid grid-cols-2 gap-4">
            {SOLUCIONES_CREATIVAS.map((s) => (
              <Card key={s.id} style={{ borderLeft: '3px solid #E8520E' }}>
                <div className="flex items-center gap-2 mb-2">
                  <span
                    className="text-[10px] mono px-1.5 py-0.5 rounded-md font-semibold"
                    style={{ background: 'rgba(232,82,14,0.08)', color: '#E8520E', border: '1px solid rgba(232,82,14,0.25)' }}
                  >
                    {s.id}
                  </span>
                  <h3 className="text-sm font-semibold" style={{ color: '#1A1A1A' }}>{s.nombre}</h3>
                </div>
                <p className="text-xs leading-relaxed mb-3" style={{ color: '#666666' }}>{s.descripcion}</p>
                <div className="flex gap-4 text-[11px] mb-2">
                  <span style={{ color: '#999999' }}>
                    Inversion: <span className="mono font-semibold" style={{ color: '#1A1A1A' }}>{s.inversion}</span>
                  </span>
                  <span style={{ color: '#999999' }}>
                    Impacto: <span className="mono font-semibold" style={{ color: '#10B981' }}>{s.impacto}</span>
                  </span>
                </div>
                <p className="text-[10px] leading-relaxed" style={{ color: '#999999' }}>{s.conexion}</p>
              </Card>
            ))}
          </div>
        </section>

        {/* Plan de Implementacion */}
        <section>
          <SectionHeader icon={Calendar}>Plan de Implementacion</SectionHeader>

          {/* Summary bar */}
          <Card className="mb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-6 text-xs">
                <div>
                  <span style={{ color: '#999999' }}>SROI </span>
                  <span className="mono font-semibold" style={{ color: '#7F1D1D' }}>{plan.resumen.sroiActual}x</span>
                  <span style={{ color: '#999999' }}> &rarr; </span>
                  <span className="mono font-semibold" style={{ color: '#10B981' }}>{plan.resumen.sroiObjetivo}x</span>
                </div>
                <div>
                  <span style={{ color: '#999999' }}>Inversion: </span>
                  <span className="mono font-semibold" style={{ color: '#1A1A1A' }}>{plan.resumen.inversionPlan}</span>
                </div>
                <div>
                  <span style={{ color: '#999999' }}>ROI del plan: </span>
                  <span className="mono font-semibold" style={{ color: '#E8520E' }}>{plan.resumen.roiPlan}</span>
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
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <span
                        className="text-[10px] mono px-2 py-1 rounded-lg font-semibold"
                        style={{ background: phaseColor + '18', color: phaseColor, border: `1px solid ${phaseColor}44` }}
                      >
                        Fase {fase.id}
                      </span>
                      <h3 className="text-sm font-semibold" style={{ color: '#1A1A1A' }}>{fase.nombre}</h3>
                    </div>
                    <div className="flex gap-4 text-[11px]">
                      <span style={{ color: '#999999' }}>
                        Meses <span className="mono font-semibold" style={{ color: '#1A1A1A' }}>{fase.meses}</span>
                      </span>
                      <span style={{ color: '#999999' }}>
                        Presupuesto <span className="mono font-semibold" style={{ color: '#1A1A1A' }}>{fase.presupuesto}</span>
                      </span>
                    </div>
                  </div>

                  <table className="w-full text-xs">
                    <thead>
                      <tr style={{ color: '#999999', borderBottom: '1px solid #E5E0DA' }}>
                        <th className="text-left py-2 px-2 font-medium w-16">ID</th>
                        <th className="text-left py-2 px-2 font-medium">Accion</th>
                        <th className="text-left py-2 px-2 font-medium">KPI</th>
                        <th className="text-right py-2 px-2 font-medium w-28">Presupuesto</th>
                      </tr>
                    </thead>
                    <tbody>
                      {fase.acciones.map((a) => (
                        <tr key={a.id} style={{ borderBottom: '1px solid #F0EDE8' }}>
                          <td className="py-2.5 px-2 mono text-[10px]" style={{ color: phaseColor }}>{a.id}</td>
                          <td className="py-2.5 px-2 font-medium" style={{ color: '#1A1A1A' }}>{a.accion}</td>
                          <td className="py-2.5 px-2" style={{ color: '#666666' }}>{a.kpi}</td>
                          <td className="py-2.5 px-2 mono text-right font-semibold" style={{ color: '#1A1A1A' }}>
                            {a.presupuesto === 0 ? '--' : fmtMXN(a.presupuesto)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </Card>
              )
            })}
          </div>
        </section>

      </div>
    </motion.div>
  )
}
