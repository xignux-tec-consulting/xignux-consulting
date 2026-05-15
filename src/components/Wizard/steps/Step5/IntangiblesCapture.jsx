import { useTheme } from '../../../../lib/theme'
import { INTANGIBLE_CATEGORIES, fmtMXN, sumIntangibles } from '../../../../lib/sroiV12'
import NumberField from '../../fields/NumberField'
import TextField from '../../fields/TextField'

export default function IntangiblesCapture({ intangibles, intangibleSources, onChange }) {
  const { th } = useTheme()

  const handleValue = (id, raw) => {
    onChange({ intangibles: { ...intangibles, [id]: Number(raw) || 0 } })
  }

  const handleSource = (id, val) => {
    onChange({ intangibleSources: { ...intangibleSources, [id]: val } })
  }

  const total = sumIntangibles(intangibles)
  const activeCount = Object.values(intangibles).filter(v => Number(v) > 0).length

  return (
    <div className="space-y-4">
      <div>
        <p className="text-[14px] font-semibold" style={{ color: th.textPrimary }}>
          Valor intangible — 7 categorías
        </p>
        <p className="text-[12px] mt-0.5" style={{ color: th.textMuted }}>
          Capture estimados de valor intangible respaldados por evidencia. Todos opcionales.
          Cada valor se suma directamente al VA Total para calcular el SROI Total.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {Object.values(INTANGIBLE_CATEGORIES).map(cat => {
          const val = Number(intangibles[cat.id]) || 0
          const active = val > 0
          return (
            <div key={cat.id} className="rounded-xl p-4 space-y-3 transition-all"
              style={{
                background: active ? th.accentSoft : th.cardBg,
                border: `1px solid ${active ? th.accentBorder : th.cardBorder}`,
              }}>
              <div>
                <p className="text-[12px] font-semibold" style={{ color: th.textPrimary }}>
                  {cat.label}
                </p>
                <p className="text-[10px] mt-0.5" style={{ color: th.textMuted }}>
                  {cat.description}
                </p>
              </div>
              <NumberField
                label="Valor MXN"
                value={val || ''}
                onChange={(v) => handleValue(cat.id, v)}
                prefix="$"
                placeholder="0"
              />
              {active && (
                <TextField
                  label="Fuente / evidencia"
                  value={intangibleSources[cat.id] || ''}
                  onChange={(v) => handleSource(cat.id, v)}
                  placeholder="Ej: Encuesta interna Gallup Q12, n=340"
                />
              )}
            </div>
          )
        })}
      </div>

      {total > 0 && (
        <div className="flex items-center justify-between p-4 rounded-xl"
          style={{ background: 'rgba(16,185,129,0.10)', border: '1px solid rgba(16,185,129,0.25)' }}>
          <div>
            <p className="text-[10px] uppercase tracking-wider font-medium" style={{ color: '#10B981' }}>
              VA Intangible total
            </p>
            <p className="text-[10px] mt-0.5" style={{ color: th.textMuted }}>
              {activeCount} de 7 categorías capturadas
            </p>
          </div>
          <p className="text-[20px] font-semibold font-mono" style={{ color: '#10B981' }}>
            {fmtMXN(total)}
          </p>
        </div>
      )}
    </div>
  )
}
