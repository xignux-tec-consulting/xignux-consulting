import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { useTheme } from '../../../../lib/theme'
import { computeProjectSROI } from '../../../../lib/sroiV12'

export default function TornadoChart({ project, baseResult }) {
  const { th } = useTheme()
  const base = baseResult.sroiTotal

  const variables = useMemo(() => {
    if (!base) return []
    const inv = project.investment

    const sr = (p, opts) => { try { return computeProjectSROI(p, opts).sroiTotal } catch { return base } }

    const rows = [
      {
        label: 'Inversión total',
        up:   sr({ ...project, investment: inv * 1.10 }),
        down: sr({ ...project, investment: inv * 0.90 }),
      },
      {
        label: 'Valor bruto (proxies)',
        up:   sr({ ...project, outcomes: project.outcomes.map(o => ({ ...o, proxyValue: o.proxyValue * 1.10 })) }),
        down: sr({ ...project, outcomes: project.outcomes.map(o => ({ ...o, proxyValue: o.proxyValue * 0.90 })) }),
      },
      {
        label: 'Tasa descuento (r)',
        up:   sr(project, { discountRate: 0.11 }),
        down: sr(project, { discountRate: 0.09 }),
      },
      {
        label: 'Factor Reclamado (FR)',
        up:   (baseResult.vaTangible * 1.10 + baseResult.vaIntangible) / inv,
        down: (baseResult.vaTangible * 0.90 + baseResult.vaIntangible) / inv,
      },
      ...(baseResult.vaIntangible > 0 ? [{
        label: 'Intangibles',
        up:   (baseResult.vaTangible + baseResult.vaIntangible * 1.10) / inv,
        down: (baseResult.vaTangible + baseResult.vaIntangible * 0.90) / inv,
      }] : []),
    ]

    return rows
      .map(v => {
        const sroiHigh   = Math.max(v.up, v.down)
        const sroiLow    = Math.min(v.up, v.down)
        const rightDelta = sroiHigh - base   // SROI gain above base
        const leftDelta  = base - sroiLow    // SROI loss below base
        const totalSwing = sroiHigh - sroiLow
        return { ...v, sroiHigh, sroiLow, rightDelta, leftDelta, totalSwing }
      })
      .sort((a, b) => b.totalSwing - a.totalSwing)
  }, [project, baseResult, base])

  if (!base) {
    return (
      <p className="text-[12px] py-3 text-center" style={{ color: th.textMuted }}>
        Sensibilidad no calculable — verifique la inversión y los outcomes.
      </p>
    )
  }

  const maxDelta = Math.max(...variables.flatMap(v => [v.rightDelta, v.leftDelta]), 0.01)
  const HALF_PCT = 44  // max % of bar zone each side can occupy

  return (
    <div className="space-y-2">
      <p className="text-[11px]" style={{ color: th.textMuted }}>
        Qué variables mueven más el SROI Total ante un cambio de ±10%. Ordenadas de mayor a menor sensibilidad.
      </p>

      <div className="space-y-1.5">
        {variables.map((v, i) => {
          const leftPct  = (v.leftDelta  / maxDelta) * HALF_PCT
          const rightPct = (v.rightDelta / maxDelta) * HALF_PCT
          const swingPct = ((v.totalSwing / base) * 100).toFixed(1)

          return (
            <div key={v.label} className="flex items-center gap-2" style={{ height: 32 }}>
              {/* Variable label */}
              <span className="text-[11px] flex-shrink-0 text-right truncate"
                style={{ width: 148, color: th.textPrimary }}>
                {v.label}
              </span>

              {/* Bar zone */}
              <div className="flex-1 relative rounded" style={{ height: 22, background: th.hoverBg }}>
                {/* Center line */}
                <div style={{
                  position: 'absolute', left: '50%', top: 0, bottom: 0,
                  width: 1, background: th.cardBorder,
                }} />
                {/* Left bar — SROI-decreasing side (rojo) */}
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${leftPct}%` }}
                  transition={{ duration: 0.5, delay: i * 0.06 }}
                  style={{
                    position: 'absolute', right: '50%', top: 3, bottom: 3,
                    background: '#7F1D1D', opacity: 0.85, borderRadius: '3px 0 0 3px',
                  }}
                />
                {/* Right bar — SROI-increasing side (verde) */}
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${rightPct}%` }}
                  transition={{ duration: 0.5, delay: i * 0.06 }}
                  style={{
                    position: 'absolute', left: '50%', top: 3, bottom: 3,
                    background: '#10B981', opacity: 0.85, borderRadius: '0 3px 3px 0',
                  }}
                />
              </div>

              {/* Swing label */}
              <span className="text-[10px] font-mono flex-shrink-0" style={{ width: 44, color: th.textMuted }}>
                ±{swingPct}%
              </span>
            </div>
          )
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 pt-1">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-sm" style={{ background: '#7F1D1D', opacity: 0.85 }} />
          <span className="text-[10px]" style={{ color: th.textMuted }}>SROI disminuye</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-sm" style={{ background: '#10B981', opacity: 0.85 }} />
          <span className="text-[10px]" style={{ color: th.textMuted }}>SROI aumenta</span>
        </div>
      </div>

      <p className="text-[10px]" style={{ color: th.textMuted }}>
        Las variables superiores son las más sensibles. Justifíquelas con la mayor solidez metodológica.
      </p>
    </div>
  )
}
