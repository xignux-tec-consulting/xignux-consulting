import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown } from 'lucide-react'
import { useTheme } from '../../../../lib/theme'
import { applyScenario } from '../../../../lib/sroiV12'
import ScenariosTable from './ScenariosTable'
import TornadoChart from './TornadoChart'

const SCENARIO_ORDER = ['PESSIMISTIC_30', 'PESSIMISTIC_10', 'BASE', 'OPTIMISTIC_10', 'OPTIMISTIC_30', 'GREEN_BOOK']

export default function SensitivityPanel({ project, baseResult }) {
  const [open, setOpen] = useState(false)
  const { th } = useTheme()

  const scenarios = useMemo(
    () => SCENARIO_ORDER.map(id => ({ id, ...applyScenario(project, id) })),
    [project]
  )

  const pessimistic = scenarios[0]?.sroiTotal ?? 0
  const optimistic  = scenarios[4]?.sroiTotal ?? 0

  return (
    <div className="rounded-xl overflow-hidden" style={{ border: `1px solid ${th.cardBorder}` }}>
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="flex items-center justify-between w-full px-4 py-3"
        style={{ background: th.hoverBg, cursor: 'pointer' }}
      >
        <span className="text-[12px] font-semibold" style={{ color: th.textPrimary }}>
          🎯 Análisis de Sensibilidad
        </span>
        <div className="flex items-center gap-2">
          <span className="text-[10px]" style={{ color: th.textMuted }}>
            5 escenarios + tornado chart
          </span>
          <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}>
            <ChevronDown className="w-4 h-4" style={{ color: th.textMuted }} />
          </motion.div>
        </div>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="sensitivity"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22 }}
            style={{ overflow: 'hidden' }}
          >
            <div className="p-4 space-y-6"
              style={{ background: th.cardBg, borderTop: `1px solid ${th.cardBorder}` }}>

              {/* Sub-sección 1+2 — Escenarios stress-test + mini chart */}
              <div className="space-y-2">
                <p className="text-[11px] font-semibold uppercase tracking-wider"
                  style={{ color: th.textSecondary }}>
                  Escenarios stress-test
                </p>
                <ScenariosTable project={project} scenarios={scenarios} />
              </div>

              {/* Sub-sección 3 — Tornado chart */}
              <div className="space-y-2">
                <p className="text-[11px] font-semibold uppercase tracking-wider"
                  style={{ color: th.textSecondary }}>
                  Tornado chart — variables más sensibles
                </p>
                <TornadoChart project={project} baseResult={baseResult} />
              </div>

              {/* Sub-sección 4 — Resumen ejecutivo del rango */}
              <div className="p-4 rounded-xl space-y-2"
                style={{ background: th.accentSoft, border: `1px solid ${th.accentBorder}` }}>
                <p className="text-[10px] uppercase tracking-wider font-medium" style={{ color: th.textMuted }}>
                  Rango de SROI Total
                </p>
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                  <span className="text-[13px] font-mono font-semibold" style={{ color: '#7F1D1D' }}>
                    {pessimistic.toFixed(2)}x
                  </span>
                  <span className="text-[11px]" style={{ color: th.textMuted }}>Pesimista ─────</span>
                  <span className="text-[17px] font-semibold font-mono" style={{ color: th.accent }}>
                    🎯 {baseResult.sroiTotal.toFixed(2)}x
                  </span>
                  <span className="text-[11px]" style={{ color: th.textMuted }}>───── Optimista</span>
                  <span className="text-[13px] font-mono font-semibold" style={{ color: '#10B981' }}>
                    {optimistic.toFixed(2)}x
                  </span>
                </div>
                <p className="text-[11px]" style={{ color: th.textMuted }}>
                  Rango construido con escenarios ±30%. El SROI Total más probable está en torno
                  a <strong style={{ color: th.textPrimary }}>{baseResult.sroiTotal.toFixed(2)}x</strong>.
                </p>
              </div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
