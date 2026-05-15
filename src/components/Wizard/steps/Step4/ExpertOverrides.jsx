import { useTheme } from '../../../../lib/theme'
import { ARCHETYPES } from '../../../../lib/sroiV12'

const FACTORS = [
  { key: 'deadweight',   label: 'Deadweight',   helper: '¿Qué habría pasado sin el proyecto? (línea base)' },
  { key: 'attribution',  label: 'Attribution',  helper: '¿Qué parte del cambio se debe a otros actores?' },
  { key: 'displacement', label: 'Displacement', helper: '¿El beneficio desplazó otro beneficio existente?' },
  { key: 'dropOff',      label: 'Drop-off',     helper: '¿El beneficio decae en el tiempo? (adicional al VPN)' },
]

export default function ExpertOverrides({ archetypeId, overrides, onChange, fr, frBase }) {
  const { th } = useTheme()
  const archetype = ARCHETYPES[archetypeId]

  const handleSlider = (key, pct) => {
    onChange({ ...overrides, [key]: pct / 100 })
  }

  const handleReset = (key) => {
    onChange({ ...overrides, [key]: null })
  }

  const hasAnyOverride = FACTORS.some(({ key }) => {
    const ov = overrides[key]
    return ov !== null && Math.abs(ov - archetype[key]) > 0.001
  })

  return (
    <div
      className="rounded-xl p-4 space-y-5"
      style={{ border: `1px solid ${th.cardBorder}`, background: th.cardBg }}
    >
      <p className="text-[10px] uppercase tracking-wider font-medium" style={{ color: th.textMuted }}>
        Solo si tiene evidencia específica para descartar los valores del arquetipo. Usar con cautela — la defensa metodológica se basa en la calibración del v12.10.
      </p>

      {FACTORS.map(({ key, label, helper }) => {
        const archetypeVal = archetype[key]
        const overrideVal  = overrides[key]
        const displayVal   = overrideVal ?? archetypeVal
        const hasOverride  = overrideVal !== null && Math.abs(overrideVal - archetypeVal) > 0.001

        return (
          <div key={key} className="space-y-1.5">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                {hasOverride && (
                  <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: '#EF4444' }} />
                )}
                <span className="text-[12px] font-semibold" style={{ color: th.textPrimary }}>{label}</span>
                <span className="text-[12px] font-mono font-semibold"
                  style={{ color: hasOverride ? th.accent : th.textMuted }}>
                  {(displayVal * 100).toFixed(0)}%
                </span>
              </div>
              {hasOverride && (
                <button type="button" onClick={() => handleReset(key)}
                  className="text-[10px] px-2 py-1 rounded-lg"
                  style={{ border: `1px solid ${th.cardBorder}`, color: th.textMuted, background: 'transparent', cursor: 'pointer' }}>
                  Reset ({(archetypeVal * 100).toFixed(0)}%)
                </button>
              )}
            </div>
            <p className="text-[10px]" style={{ color: th.textMuted }}>{helper}</p>
            <input
              type="range"
              min={0} max={100} step={1}
              value={Math.round(displayVal * 100)}
              onChange={(e) => handleSlider(key, Number(e.target.value))}
              className="w-full"
              style={{ accentColor: th.accent, cursor: 'pointer', height: 4 }}
            />
          </div>
        )
      })}

      {/* FR summary */}
      <div className="pt-3 border-t text-[11px] font-mono" style={{ borderColor: th.cardBorder, color: th.textMuted }}>
        {hasAnyOverride ? (
          <span>
            FR base ({frBase.toFixed(3)}) →{' '}
            FR con overrides: <strong style={{ color: th.accent }}>{fr.toFixed(3)}</strong>
          </span>
        ) : (
          <span>FR resultante con arquetipo: <strong>{fr.toFixed(3)}</strong></span>
        )}
      </div>
    </div>
  )
}
