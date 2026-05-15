import { useTheme } from '../../../../lib/theme'
import { fmtMXN, fmtMXNFull, sroiColor, sroiCategory } from '../../../../lib/sroiV12'

export default function HeadlineResults({ result }) {
  const { th } = useTheme()
  const { sroiTangible, sroiTotal, vaTangible, vaIntangible, vaTotal, project } = result
  const tangColor = sroiColor(sroiTangible)
  const totalColor = sroiColor(sroiTotal)

  const maxVal = Math.max(project.investment, vaTotal, 1)
  const invPct  = Math.min(100, (project.investment / maxVal) * 100)
  const tangPct = Math.min(100, (vaTangible        / maxVal) * 100)
  const totalPct = Math.min(100, (vaTotal           / maxVal) * 100)

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* SROI Tangible */}
        <div className="rounded-2xl p-5 relative overflow-hidden"
          style={{ background: th.cardBg, border: `1px solid ${th.cardBorder}`, boxShadow: th.shadow }}>
          <div className="absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl" style={{ background: th.accent }} />
          <div className="pl-3">
            <p className="text-[10px] uppercase tracking-widest font-medium mb-1" style={{ color: th.textMuted }}>
              SROI Tangible
            </p>
            <div className="flex items-end gap-2 mb-2">
              <span className="text-[36px] font-semibold leading-none font-mono" style={{ color: tangColor }}>
                {sroiTangible.toFixed(2)}
              </span>
              <span className="text-[18px] font-semibold mb-1" style={{ color: th.textSecondary }}>x</span>
            </div>
            <span className="inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full"
              style={{ background: `${tangColor}22`, color: tangColor, border: `1px solid ${tangColor}44` }}>
              {sroiCategory(sroiTangible)}
            </span>
            <p className="text-[11px] mt-2" style={{ color: th.textMuted }}>
              VA Tangible: {fmtMXNFull(vaTangible)}
            </p>
          </div>
        </div>

        {/* SROI Total */}
        <div className="rounded-2xl p-5 relative overflow-hidden"
          style={{ background: th.cardBg, border: `1px solid ${th.cardBorder}`, boxShadow: th.shadow }}>
          <div className="absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl" style={{ background: '#10B981' }} />
          <div className="pl-3">
            <p className="text-[10px] uppercase tracking-widest font-medium mb-1" style={{ color: th.textMuted }}>
              SROI Total (con intangibles)
            </p>
            <div className="flex items-end gap-2 mb-2">
              <span className="text-[36px] font-semibold leading-none font-mono" style={{ color: totalColor }}>
                {sroiTotal.toFixed(2)}
              </span>
              <span className="text-[18px] font-semibold mb-1" style={{ color: th.textSecondary }}>x</span>
            </div>
            <span className="inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full"
              style={{ background: `${totalColor}22`, color: totalColor, border: `1px solid ${totalColor}44` }}>
              {sroiCategory(sroiTotal)}
            </span>
            <p className="text-[11px] mt-2" style={{ color: th.textMuted }}>
              VA Total: {fmtMXNFull(vaTotal)}
              {vaIntangible > 0 && (
                <span> ({fmtMXN(vaIntangible)} intangibles)</span>
              )}
            </p>
          </div>
        </div>
      </div>

      {/* Stacked bar chart */}
      <div className="rounded-xl p-4 space-y-3"
        style={{ background: th.cardBg, border: `1px solid ${th.cardBorder}` }}>
        <p className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: th.textMuted }}>
          Descomposición del valor
        </p>
        {[
          { label: 'Inversión',               pct: invPct,   color: th.textMuted,    value: project.investment },
          { label: 'VA Tangible',             pct: tangPct,  color: th.accent,       value: vaTangible },
          { label: 'VA Total (+ intangibles)', pct: totalPct, color: '#10B981',       value: vaTotal },
        ].map(({ label, pct, color, value }) => (
          <div key={label} className="space-y-1">
            <div className="flex justify-between items-center">
              <span className="text-[11px]" style={{ color: th.textSecondary }}>{label}</span>
              <span className="text-[11px] font-mono" style={{ color }}>{fmtMXN(value)}</span>
            </div>
            <div className="h-2 rounded-full w-full" style={{ background: th.hoverBg }}>
              <div className="h-full rounded-full transition-all duration-500"
                style={{ width: `${pct}%`, background: color }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
