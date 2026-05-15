import { useTheme } from '../../../../lib/theme'
import TextField from '../../fields/TextField'
import TextArea from '../../fields/TextArea'
import NumberField from '../../fields/NumberField'

export default function OutcomeEditor({ outcome, onChange, onSave, onDelete }) {
  const { th } = useTheme()

  const ind = outcome.indicator ?? { name: '', value: '', unit: '', source: '' }
  const prx = outcome.proxy    ?? { name: '', value: '', source: '' }

  const grossValue = (Number(ind.value) || 0) * (Number(prx.value) || 0)

  const setInd = (partial) => onChange({ indicator: { ...ind, ...partial } })
  const setPrx = (partial) => onChange({ proxy:    { ...prx, ...partial } })

  const labelStyle = { color: th.textSecondary }
  const sectionLabelCls = 'text-[10px] uppercase tracking-widest font-medium block mb-2'

  return (
    <div className="space-y-5 px-4 pt-3 pb-5">

      {/* Description */}
      <div>
        <label className={sectionLabelCls} style={labelStyle}>Descripción del outcome</label>
        <TextArea
          value={outcome.description ?? ''}
          onChange={(v) => onChange({ description: v })}
          placeholder="Describe brevemente cómo este cambio genera valor…"
          rows={2}
        />
      </div>

      {/* Indicator */}
      <div>
        <label className={sectionLabelCls} style={labelStyle}>Indicador de medición</label>
        <div className="grid grid-cols-2 gap-3">
          <TextField
            label="Nombre del indicador"
            value={ind.name}
            onChange={(v) => setInd({ name: v })}
            placeholder="p.ej. Horas productivas recuperadas"
          />
          <TextField
            label="Unidad"
            value={ind.unit}
            onChange={(v) => setInd({ unit: v })}
            placeholder="p.ej. horas/año"
          />
          <NumberField
            label="Valor del indicador"
            value={ind.value}
            onChange={(v) => setInd({ value: v })}
            placeholder="0"
          />
          <TextField
            label="Fuente"
            value={ind.source}
            onChange={(v) => setInd({ source: v })}
            placeholder="Encuesta, informe OIT, etc."
          />
        </div>
      </div>

      {/* Proxy */}
      <div>
        <label className={sectionLabelCls} style={labelStyle}>Proxy financiero</label>
        <div className="grid grid-cols-2 gap-3">
          <TextField
            label="Nombre del proxy"
            value={prx.name}
            onChange={(v) => setPrx({ name: v })}
            placeholder="p.ej. Salario mínimo diario IMSS"
          />
          <NumberField
            label="Valor del proxy (MXN)"
            value={prx.value}
            onChange={(v) => setPrx({ value: v })}
            placeholder="0"
            prefix="$"
          />
          <div className="col-span-2">
            <TextField
              label="Fuente"
              value={prx.source}
              onChange={(v) => setPrx({ source: v })}
              placeholder="DOF, INEGI, estudio académico, etc."
            />
          </div>
        </div>
      </div>

      {/* Gross value preview */}
      {grossValue > 0 && (
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-medium" style={{ color: th.textMuted }}>
            Valor bruto estimado:
          </span>
          <span
            className="px-3 py-1 rounded-full text-[11px] font-semibold"
            style={{ background: th.accentSoft, color: th.accent, border: `1px solid ${th.accentBorder}` }}
          >
            {grossValue.toLocaleString('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 })}
          </span>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-between pt-2 border-t" style={{ borderColor: th.cardBorder }}>
        <button
          onClick={onDelete}
          className="text-[11px] font-medium px-3 py-1.5 rounded-xl"
          style={{ color: '#EF4444', background: 'transparent', border: `1px solid #EF444433`, cursor: 'pointer' }}
        >
          Eliminar outcome
        </button>
        <button
          onClick={onSave}
          className="px-4 py-2 rounded-xl text-[12px] font-semibold"
          style={{ background: th.accent, color: '#fff', boxShadow: '0 2px 10px -2px rgba(232,82,14,0.4)', cursor: 'pointer' }}
        >
          Listo ✓
        </button>
      </div>
    </div>
  )
}
