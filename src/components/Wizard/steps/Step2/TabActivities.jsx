import { useState, useRef, useEffect } from 'react'
import { Zap, Package, X, ChevronDown } from 'lucide-react'
import { useTheme } from '../../../../lib/theme'
import TextField from '../../fields/TextField'
import NumberField from '../../fields/NumberField'

function ActivityMultiSelect({ activities, selected, onChange, th }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    const close = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', close)
    return () => document.removeEventListener('mousedown', close)
  }, [])

  const toggle = (id) =>
    onChange(selected.includes(id) ? selected.filter(i => i !== id) : [...selected, id])

  const label = selected.length === 0 ? 'Seleccionar actividades...'
    : selected.length === 1 ? (activities.find(a => a.id === selected[0])?.name ?? '1 actividad')
    : `${selected.length} actividades`

  return (
    <div ref={ref} className="relative flex flex-col gap-1.5">
      <label className="text-[11px] uppercase tracking-wider font-medium" style={{ color: th.textSecondary }}>
        Actividades asociadas
      </label>
      <button type="button" onClick={() => activities.length > 0 && setOpen(o => !o)}
        className="w-full flex items-center justify-between rounded-xl px-3 py-2.5 text-[13px] text-left outline-none"
        style={{ background: th.inputBg, border: `1px solid ${th.inputBorder}`,
          color: selected.length ? th.textPrimary : th.textMuted,
          cursor: activities.length === 0 ? 'not-allowed' : 'pointer' }}>
        <span className="truncate">{activities.length === 0 ? 'Agregue actividades primero' : label}</span>
        <ChevronDown className="w-3.5 h-3.5 flex-shrink-0 ml-2" style={{ color: th.textMuted }} />
      </button>
      {open && (
        <div className="absolute z-20 top-full left-0 right-0 mt-1 rounded-xl overflow-hidden max-h-48 overflow-y-auto"
          style={{ background: th.cardBg, border: `1px solid ${th.cardBorder}`,
            boxShadow: '0 8px 24px -4px rgba(0,0,0,0.14)' }}>
          {activities.map(a => (
            <label key={a.id} className="flex items-center gap-2.5 px-3 py-2.5 cursor-pointer"
              style={{ borderBottom: `1px solid ${th.cardBorder}` }}
              onMouseDown={(e) => { e.preventDefault(); toggle(a.id) }}>
              <input type="checkbox" readOnly checked={selected.includes(a.id)}
                className="flex-shrink-0" style={{ accentColor: '#E8520E' }} />
              <span className="text-[12px] font-medium" style={{ color: th.textPrimary }}>{a.name}</span>
              {a.description && (
                <span className="text-[11px]" style={{ color: th.textMuted }}>{a.description}</span>
              )}
            </label>
          ))}
        </div>
      )}
    </div>
  )
}

const EMPTY_ACT = { name: '', description: '' }
const EMPTY_OUT = { name: '', unit: '', quantity: '', activityIds: [] }

export default function TabActivities({ value, onChange }) {
  const { th } = useTheme()
  const [actForm, setActForm] = useState(EMPTY_ACT)
  const [outForm, setOutForm] = useState(EMPTY_OUT)

  const actValid = actForm.name.trim().length > 0
  const outValid = outForm.name.trim().length > 0 && outForm.unit.trim().length > 0

  const addActivity = () => {
    if (!actValid) return
    onChange({ activities: [...value.activities, { ...actForm, id: crypto.randomUUID() }] })
    setActForm(EMPTY_ACT)
  }

  const removeActivity = (id) =>
    onChange({
      activities: value.activities.filter(a => a.id !== id),
      outputs: value.outputs.map(o => ({ ...o, activityIds: o.activityIds.filter(aid => aid !== id) })),
    })

  const addOutput = () => {
    if (!outValid) return
    onChange({ outputs: [...value.outputs, { ...outForm, quantity: Number(outForm.quantity) || 0, id: crypto.randomUUID() }] })
    setOutForm(EMPTY_OUT)
  }

  const removeOutput = (id) => onChange({ outputs: value.outputs.filter(o => o.id !== id) })

  return (
    <div className="space-y-6">
      {/* Activities */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4" style={{ color: th.accent }} />
          <span className="text-[13px] font-semibold" style={{ color: th.textPrimary }}>Actividades</span>
        </div>
        <div className="rounded-xl p-4 space-y-3" style={{ background: th.hoverBg, border: `1px solid ${th.cardBorder}` }}>
          <div className="grid grid-cols-1 md:grid-cols-[1fr_1fr_auto] gap-3 items-end">
            <TextField label="Nombre *" value={actForm.name}
              onChange={(v) => setActForm(f => ({ ...f, name: v }))}
              placeholder="Ej. Talleres de capacitación..." />
            <TextField label="Descripción (opcional)" value={actForm.description}
              onChange={(v) => setActForm(f => ({ ...f, description: v }))}
              placeholder="Descripción breve..." />
            <button onClick={addActivity} disabled={!actValid}
              className="h-[42px] px-4 rounded-xl text-[12px] font-semibold whitespace-nowrap"
              style={{ background: actValid ? th.accent : th.trackBg, color: actValid ? '#fff' : th.textMuted,
                cursor: actValid ? 'pointer' : 'not-allowed' }}>
              + Agregar
            </button>
          </div>
          {value.activities.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-1">
              {value.activities.map(a => (
                <div key={a.id} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full"
                  style={{ background: th.accentSoft, border: `1px solid ${th.accentBorder}` }}>
                  <span className="text-[12px] font-medium" style={{ color: th.accent }}>{a.name}</span>
                  {a.description && (
                    <span className="text-[11px]" style={{ color: th.textSecondary }}>— {a.description}</span>
                  )}
                  <button onClick={() => removeActivity(a.id)} style={{ color: th.textMuted }}>
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Outputs */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Package className="w-4 h-4" style={{ color: th.accent }} />
          <span className="text-[13px] font-semibold" style={{ color: th.textPrimary }}>Productos (Outputs)</span>
        </div>
        <div className="rounded-xl p-4 space-y-3" style={{ background: th.hoverBg, border: `1px solid ${th.cardBorder}` }}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <TextField label="Nombre del producto *" value={outForm.name}
              onChange={(v) => setOutForm(f => ({ ...f, name: v }))}
              placeholder="Ej. Beneficiarios capacitados..." />
            <TextField label="Unidad de medida *" value={outForm.unit}
              onChange={(v) => setOutForm(f => ({ ...f, unit: v }))}
              placeholder="viviendas, árboles, beneficiarios..." />
            <NumberField label="Cantidad" value={outForm.quantity}
              onChange={(v) => setOutForm(f => ({ ...f, quantity: v }))} placeholder="0" />
            <ActivityMultiSelect activities={value.activities} selected={outForm.activityIds}
              onChange={(ids) => setOutForm(f => ({ ...f, activityIds: ids }))} th={th} />
          </div>
          <div className="flex justify-end">
            <button onClick={addOutput} disabled={!outValid}
              className="px-4 py-2 rounded-xl text-[12px] font-semibold"
              style={{ background: outValid ? th.accent : th.trackBg, color: outValid ? '#fff' : th.textMuted,
                cursor: outValid ? 'pointer' : 'not-allowed',
                boxShadow: outValid ? '0 2px 8px -2px rgba(232,82,14,0.4)' : 'none' }}>
              + Agregar producto
            </button>
          </div>
        </div>

        {value.outputs.length > 0 && (
          <div className="space-y-2">
            {value.outputs.map(out => {
              const linked = value.activities.filter(a => out.activityIds.includes(a.id))
              return (
                <div key={out.id} className="flex items-center gap-3 px-4 py-3 rounded-xl"
                  style={{ background: th.cardBg, border: `1px solid ${th.cardBorder}` }}>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-medium" style={{ color: th.textPrimary }}>{out.name}</p>
                    <p className="text-[11px] mono" style={{ color: th.textSecondary }}>
                      {out.unit} × {out.quantity}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {linked.map(a => (
                      <span key={a.id} className="text-[10px] font-medium px-2 py-0.5 rounded-full"
                        style={{ background: th.hoverBg, color: th.textSecondary, border: `1px solid ${th.cardBorder}` }}>
                        {a.name}
                      </span>
                    ))}
                  </div>
                  <button onClick={() => removeOutput(out.id)}
                    className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ color: '#EF4444', background: 'rgba(239,68,68,0.08)' }}>
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
