import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { useTheme } from '../../../../lib/theme'
import { applyScenario, fmtMXN, sroiColor } from '../../../../lib/sroiV12'

const SCENARIO_ORDER = ['PESSIMISTIC_30', 'PESSIMISTIC_10', 'BASE', 'OPTIMISTIC_10', 'OPTIMISTIC_30', 'GREEN_BOOK']

const WHAT_CHANGES = {
  PESSIMISTIC_30: 'Reducción 30% en VB',
  PESSIMISTIC_10: 'Reducción 10% en VB',
  BASE:           'r = 10% SHCP, proxies actuales',
  OPTIMISTIC_10:  'Incremento 10% en VB',
  OPTIMISTIC_30:  'Incremento 30% en VB',
  GREEN_BOOK:     'Tasa Green Book UK (r=3.5%)',
}

const BAR_COLORS = {
  PESSIMISTIC_30: '#7F1D1D',
  PESSIMISTIC_10: '#F59E0B',
  BASE:           null, // uses th.accent
  OPTIMISTIC_10:  '#059669',
  OPTIMISTIC_30:  '#10B981',
  GREEN_BOOK:     '#3B82F6',
}

export default function ScenariosTable({ project, scenarios }) {
  const { th } = useTheme()

  const badCount  = scenarios.filter(s => s.sroiTotal < 1.0).length
  const allOk     = badCount === 0
  const maxSroi   = Math.max(...scenarios.map(s => s.sroiTotal), 1)
  const CHART_H   = 88  // px — chart area height
  const breakPct  = (1.0 / maxSroi) * 100  // % from bottom for break-even line

  return (
    <div className="space-y-3">
      <p className="text-[11px]" style={{ color: th.textMuted }}>
        ¿Qué pasa con el SROI si los supuestos generales cambian? Cada escenario modifica VB total o tasa de descuento.
      </p>

      {/* Table */}
      <div style={{ overflowX: 'auto' }}>
        <table className="w-full text-left" style={{ minWidth: 500 }}>
          <thead style={{ background: th.hoverBg, borderBottom: `1px solid ${th.cardBorder}` }}>
            <tr>
              {['Escenario', 'Qué cambia', 'VA Tangible', 'SROI Tang', 'SROI Total', 'Veredicto'].map(h => (
                <th key={h} className="px-3 py-2 text-[10px] uppercase tracking-wider font-medium whitespace-nowrap"
                  style={{ color: th.textMuted }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {scenarios.map((sc, i) => {
              const isBase  = sc.id === 'BASE'
              const color   = sroiColor(sc.sroiTotal)
              const ok      = sc.sroiTotal >= 1.0
              return (
                <tr key={sc.id} style={{
                  background:    isBase ? th.accentSoft : (i % 2 === 0 ? th.cardBg : th.hoverBg),
                  borderBottom: `1px solid ${th.cardBorder}`,
                }}>
                  <td className="px-3 py-2 text-[12px] whitespace-nowrap"
                    style={{ color: th.textPrimary, fontWeight: isBase ? 600 : 400 }}>
                    {sc.scenario.label}
                  </td>
                  <td className="px-3 py-2 text-[11px]" style={{ color: th.textMuted }}>
                    {WHAT_CHANGES[sc.id]}
                  </td>
                  <td className="px-3 py-2 text-[11px] font-mono whitespace-nowrap" style={{ color: th.textSecondary }}>
                    {fmtMXN(sc.vaTangible)}
                  </td>
                  <td className="px-3 py-2 text-[11px] font-mono whitespace-nowrap"
                    style={{ color: sroiColor(sc.sroiTangible) }}>
                    {sc.sroiTangible.toFixed(2)}x
                  </td>
                  <td className="px-3 py-2 text-[12px] font-mono font-semibold whitespace-nowrap" style={{ color }}>
                    {sc.sroiTotal.toFixed(2)}x
                  </td>
                  <td className="px-3 py-2">
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full whitespace-nowrap"
                      style={{
                        background: ok ? 'rgba(16,185,129,0.15)' : 'rgba(127,29,29,0.15)',
                        color:      ok ? '#10B981' : '#7F1D1D',
                        border:    `1px solid ${ok ? 'rgba(16,185,129,0.30)' : 'rgba(127,29,29,0.30)'}`,
                      }}>
                      {ok ? '✓ Crea valor' : '✗ Destruye valor'}
                    </span>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Footer message */}
      <div className="p-3 rounded-xl text-[12px]" style={{
        background: allOk ? 'rgba(16,185,129,0.10)' : 'rgba(245,158,11,0.10)',
        border:    `1px solid ${allOk ? 'rgba(16,185,129,0.25)' : 'rgba(245,158,11,0.25)'}`,
        color:      allOk ? '#10B981' : '#F59E0B',
      }}>
        {allOk
          ? '✓ Robusto: SROI Total ≥ 1.0x en 6 de 6 escenarios. El proyecto crea valor incluso bajo supuestos pesimistas.'
          : `⚠ Sensible: SROI Total cae bajo 1.0x en ${badCount} de 6 escenarios. Requiere supuestos optimistas para crear valor.`
        }
      </div>

      {/* Mini column chart */}
      <div className="space-y-1">
        <p className="text-[10px] uppercase tracking-wider font-medium" style={{ color: th.textMuted }}>
          Distribución visual
        </p>
        {/* Value labels row */}
        <div className="flex gap-1">
          {scenarios.map(sc => (
            <div key={sc.id} className="flex-1 text-center">
              <span className="text-[9px] font-mono font-semibold"
                style={{ color: BAR_COLORS[sc.id] ?? th.accent }}>
                {sc.sroiTotal.toFixed(2)}x
              </span>
            </div>
          ))}
        </div>
        {/* Bar chart */}
        <div className="relative flex items-end gap-1" style={{ height: CHART_H }}>
          {/* Break-even line */}
          <div className="absolute inset-x-0 flex items-center pointer-events-none"
            style={{ bottom: `${breakPct}%`, borderTop: `1px dashed ${th.cardBorder}` }}>
            <span className="absolute right-0 -top-3 text-[8px]" style={{ color: th.textMuted }}>
              Break-even
            </span>
          </div>
          {/* Columns */}
          {scenarios.map((sc, i) => {
            const barH   = Math.max(4, (sc.sroiTotal / maxSroi) * CHART_H)
            const color  = BAR_COLORS[sc.id] ?? th.accent
            const isBase = sc.id === 'BASE'
            return (
              <div key={sc.id} className="flex-1 flex flex-col justify-end" style={{ height: '100%' }}>
                <motion.div
                  className="w-full rounded-t"
                  initial={{ height: 0 }}
                  animate={{ height: barH }}
                  transition={{ duration: 0.5, delay: i * 0.05 }}
                  style={{ background: color, opacity: isBase ? 1 : 0.72 }}
                />
              </div>
            )
          })}
        </div>
        {/* X-axis labels */}
        <div className="flex gap-1">
          {scenarios.map(sc => (
            <div key={sc.id} className="flex-1 text-center">
              <span className="text-[8px]" style={{ color: th.textMuted }}>
                {sc.id === 'BASE' ? 'Base' : sc.id === 'GREEN_BOOK' ? 'GB' : sc.scenario.label.replace(/[^0-9±%−]/g, ' ').trim().slice(0, 6)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
