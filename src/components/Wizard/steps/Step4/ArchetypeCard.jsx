import { useTheme } from '../../../../lib/theme'
import { factorReclamado } from '../../../../lib/sroiV12'

const ADJ_COLS = [
  { key: 'deadweight',   short: 'DW'   },
  { key: 'attribution',  short: 'ATTR' },
  { key: 'displacement', short: 'DISP' },
  { key: 'dropOff',      short: 'DROP' },
]

function frBadge(fr) {
  if (fr >= 0.50) return { bg: 'rgba(16,185,129,0.15)',  color: '#10B981', border: '1px solid rgba(16,185,129,0.30)' }
  if (fr >= 0.30) return { bg: 'rgba(245,158,11,0.15)',  color: '#F59E0B', border: '1px solid rgba(245,158,11,0.30)' }
  return             { bg: 'rgba(127,29,29,0.15)',    color: '#7F1D1D', border: '1px solid rgba(127,29,29,0.30)' }
}

export default function ArchetypeCard({ archetype, selected, onClick }) {
  const { th } = useTheme()
  const fr     = factorReclamado(archetype.id)
  const badge  = frBadge(fr)

  return (
    <button
      type="button"
      onClick={onClick}
      className="text-left rounded-xl p-4 w-full transition-all"
      style={{
        border:     `${selected ? 2 : 1}px solid ${selected ? th.accent : th.cardBorder}`,
        background: selected ? th.accentSoft : th.cardBg,
        boxShadow:  selected ? `0 0 0 3px ${th.accentBorder}` : 'none',
        cursor:     'pointer',
      }}
    >
      {/* ID + label + FR badge */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="min-w-0">
          <span className="text-[10px] font-mono uppercase tracking-widest block" style={{ color: th.textMuted }}>
            {archetype.id}
          </span>
          <span className="text-[13px] font-semibold leading-tight" style={{ color: th.textPrimary }}>
            {archetype.label}
          </span>
        </div>
        <span className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded-full flex-shrink-0"
          style={{ background: badge.bg, color: badge.color, border: badge.border }}>
          FR {fr.toFixed(2)}
        </span>
      </div>

      {/* Description */}
      <p className="text-[11px] leading-snug mb-3 line-clamp-2" style={{ color: th.textMuted }}>
        {archetype.description}
      </p>

      {/* Adjustment grid */}
      <div className="grid grid-cols-4 gap-2 pt-2" style={{ borderTop: `1px solid ${th.cardBorder}` }}>
        {ADJ_COLS.map(({ key, short }) => (
          <div key={key} className="text-center">
            <p className="text-[9px] uppercase tracking-wider font-medium" style={{ color: th.textMuted }}>{short}</p>
            <p className="text-[12px] font-semibold font-mono"
              style={{ color: selected ? th.accent : th.textPrimary }}>
              {(archetype[key] * 100).toFixed(0)}%
            </p>
          </div>
        ))}
      </div>
    </button>
  )
}
