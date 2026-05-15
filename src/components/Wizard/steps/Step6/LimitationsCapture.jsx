import { useTheme } from '../../../../lib/theme'

const PLACEHOLDERS = [
  'Ej: El análisis usa supuestos sobre tasa de uso de los paneles instalados, basado en encuestas internas no validadas externamente.',
  'Ej: La estimación de brand uplift es indirecta (Interbrand benchmarks sectoriales) — no se midió impacto real en ventas.',
  'Ej: El drop-off del 20% asumido para reforestación se basa en literatura SEMARNAT — no se hizo seguimiento longitudinal del proyecto.',
  'Ej: La attribution del 32% es industry standard, podría variar significativamente en el caso de XIGNUX.',
  'Ej: No se realizaron encuestas de seguimiento a beneficiarios — los outcomes son proyectados, no verificados ex-post.',
]

export default function LimitationsCapture({ limitations, onChange }) {
  const { th } = useTheme()

  const items = limitations.length > 0 ? limitations : ['']

  const update = (idx, val) => {
    const next = [...items]
    next[idx] = val
    onChange({ knownLimitations: next })
  }

  const remove = (idx) => {
    const next = items.filter((_, i) => i !== idx)
    onChange({ knownLimitations: next.length > 0 ? next : [''] })
  }

  const add = () => onChange({ knownLimitations: [...items, ''] })

  return (
    <div className="rounded-2xl p-6 space-y-4"
      style={{ background: th.cardBg, border: `1px solid ${th.cardBorder}`, boxShadow: th.shadow }}>

      <div>
        <p className="text-[14px] font-semibold" style={{ color: th.textPrimary }}>
          Limitaciones reconocidas
        </p>
        <p className="text-[12px] mt-1" style={{ color: th.textMuted }}>
          Reconocer limitaciones es clave para defender la metodología. Reconocer lo que{' '}
          <em>no</em> se midió es una fortaleza, no una debilidad.
        </p>
      </div>

      <div className="space-y-2">
        {items.map((val, idx) => (
          <div key={idx} className="flex items-start gap-2">
            <span className="flex-shrink-0 w-5 h-5 rounded-md flex items-center justify-center mt-2"
              style={{ background: th.hoverBg, border: `1px solid ${th.cardBorder}` }}>
              <span className="text-[9px] font-semibold" style={{ color: th.textMuted }}>{idx + 1}</span>
            </span>
            <textarea
              rows={2}
              value={val}
              onChange={e => update(idx, e.target.value)}
              placeholder={PLACEHOLDERS[idx % PLACEHOLDERS.length]}
              className="flex-1 rounded-xl px-3 py-2 text-[12px] resize-none leading-relaxed"
              style={{
                background: th.inputBg,
                border: `1px solid ${th.inputBorder}`,
                color: th.textPrimary,
                outline: 'none',
                fontFamily: 'inherit',
              }}
              onFocus={e => (e.target.style.borderColor = th.accent)}
              onBlur={e => (e.target.style.borderColor = th.inputBorder)}
            />
            {items.length > 1 && (
              <button
                type="button"
                onClick={() => remove(idx)}
                className="flex-shrink-0 mt-2 w-7 h-7 rounded-lg flex items-center justify-center"
                style={{
                  background: 'rgba(127,29,29,0.10)',
                  border: '1px solid rgba(127,29,29,0.20)',
                  color: '#7F1D1D',
                  cursor: 'pointer',
                }}
              >
                ×
              </button>
            )}
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={add}
        className="w-full py-2 rounded-xl text-[12px] font-medium"
        style={{
          background: 'transparent',
          border: `1px dashed ${th.cardBorder}`,
          color: th.textSecondary,
          cursor: 'pointer',
        }}
      >
        + Agregar limitación
      </button>
    </div>
  )
}
