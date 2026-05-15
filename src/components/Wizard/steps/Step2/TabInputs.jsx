import { useState } from 'react'
import { Pencil, Trash2, Sparkles } from 'lucide-react'
import { useTheme } from '../../../../lib/theme'
import TextField from '../../fields/TextField'
import NumberField from '../../fields/NumberField'
import SelectField from '../../fields/SelectField'
import { fmtMXN } from '../../../../lib/sroi'

const INPUT_TYPES = ['Monetario', 'En especie', 'Tiempo/Voluntariado']

const TYPE_CHIPS = {
  'Monetario':           { label: 'MONETARIO', bg: 'rgba(232,82,14,0.10)',  color: '#E8520E' },
  'En especie':          { label: 'EN ESPECIE', bg: 'rgba(59,130,246,0.10)', color: '#3B82F6' },
  'Tiempo/Voluntariado': { label: 'TIEMPO',     bg: 'rgba(16,185,129,0.10)', color: '#10B981' },
}

const EMPTY = { stakeholderId: '', type: '', description: '', quantity: '', unitValue: '' }

export default function TabInputs({ value, onChange, stakeholders, onGoToStep1 }) {
  const { th } = useTheme()
  const [form, setForm]           = useState(EMPTY)
  const [editingId, setEditingId] = useState(null)

  const setF = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const isValid = form.stakeholderId && form.description.trim() &&
    Number(form.quantity) > 0 && Number(form.unitValue) > 0

  const handleSubmit = () => {
    if (!isValid) return
    if (editingId) {
      onChange({ inputs: value.inputs.map(i => i.id === editingId ? { id: editingId, ...form } : i) })
      setEditingId(null)
    } else {
      onChange({ inputs: [...value.inputs, { ...form, id: crypto.randomUUID() }] })
    }
    setForm(EMPTY)
  }

  const startEdit = (inp) => {
    setForm({ stakeholderId: inp.stakeholderId, type: inp.type, description: inp.description,
      quantity: inp.quantity, unitValue: inp.unitValue })
    setEditingId(inp.id)
  }

  const cancelEdit = () => { setForm(EMPTY); setEditingId(null) }

  const deleteInput = (id) => {
    if (editingId === id) cancelEdit()
    onChange({ inputs: value.inputs.filter(i => i.id !== id) })
  }

  const grouped = stakeholders
    .map(sh => ({ sh, items: value.inputs.filter(i => i.stakeholderId === sh.id) }))
    .filter(g => g.items.length > 0)

  const total = value.inputs.reduce((sum, i) => sum + Number(i.quantity) * Number(i.unitValue), 0)

  return (
    <div className="space-y-5">
      <p className="text-[12px]" style={{ color: th.textMuted }}>
        Registre todos los recursos invertidos en el proyecto. Asocie cada insumo al stakeholder que lo aporta.
      </p>

      {/* Add / edit form */}
      <div className="rounded-xl p-4 space-y-4" style={{ background: th.hoverBg, border: `1px solid ${th.cardBorder}` }}>
        <span className="text-[11px] uppercase tracking-wider font-medium" style={{ color: th.textSecondary }}>
          {editingId ? 'Editar insumo' : 'Agregar insumo'}
        </span>

        {stakeholders.length === 0 ? (
          <div className="flex items-center gap-3">
            <p className="text-[12px]" style={{ color: th.textMuted }}>Agregue stakeholders en el Paso 1 primero.</p>
            <button onClick={onGoToStep1}
              className="px-3 py-1.5 rounded-xl text-[11px] font-semibold"
              style={{ background: th.accent, color: '#fff' }}>
              Ir al Paso 1
            </button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <SelectField label="Stakeholder que aporta *"
                value={stakeholders.find(sh => sh.id === form.stakeholderId)?.name || ''}
                onChange={(v) => setF('stakeholderId', stakeholders.find(sh => sh.name === v)?.id || '')}
                options={stakeholders.map(sh => sh.name)} />
              <SelectField label="Tipo de insumo" value={form.type}
                onChange={(v) => setF('type', v)} options={INPUT_TYPES} />
              <TextField label="Descripción del recurso *" value={form.description}
                onChange={(v) => setF('description', v)}
                placeholder="Ej: Salón de capacitación, horas voluntariado..." />
              <div className="grid grid-cols-2 gap-3">
                <NumberField label="Cantidad *" value={form.quantity}
                  onChange={(v) => setF('quantity', v)} placeholder="0" />
                <NumberField label="Valor unitario *" value={form.unitValue}
                  onChange={(v) => setF('unitValue', v)} prefix="$" placeholder="0" />
              </div>
            </div>
            <div className="flex items-center justify-end gap-2">
              {editingId && (
                <button onClick={cancelEdit} className="px-4 py-2 rounded-xl text-[12px] font-medium"
                  style={{ background: th.cardBg, border: `1px solid ${th.cardBorder}`, color: th.textSecondary }}>
                  Cancelar
                </button>
              )}
              <button onClick={handleSubmit} disabled={!isValid}
                className="px-4 py-2 rounded-xl text-[12px] font-semibold"
                style={{ background: isValid ? th.accent : th.trackBg, color: isValid ? '#fff' : th.textMuted,
                  cursor: isValid ? 'pointer' : 'not-allowed',
                  boxShadow: isValid ? '0 2px 8px -2px rgba(232,82,14,0.4)' : 'none' }}>
                {editingId ? 'Actualizar' : '+ Agregar insumo'}
              </button>
            </div>
          </>
        )}
      </div>

      {/* Grouped list */}
      {grouped.map(({ sh, items }) => {
        const subtotal = items.reduce((s, i) => s + Number(i.quantity) * Number(i.unitValue), 0)
        return (
          <div key={sh.id} className="rounded-xl overflow-hidden" style={{ border: `1px solid ${th.cardBorder}` }}>
            <div className="flex items-center justify-between px-4 py-3"
              style={{ background: th.hoverBg, borderBottom: `1px solid ${th.cardBorder}` }}>
              <div className="flex items-center gap-2">
                <span className="text-[13px] font-semibold" style={{ color: th.textPrimary }}>{sh.name}</span>
                <span className="text-[10px] font-medium px-2 py-0.5 rounded-full"
                  style={{ background: th.accentSoft, color: th.accent, border: `1px solid ${th.accentBorder}` }}>
                  {sh.role}
                </span>
              </div>
              <span className="text-[12px] font-semibold mono" style={{ color: th.textPrimary }}>
                Subtotal: {fmtMXN(subtotal)}
              </span>
            </div>
            {items.map((inp, idx) => {
              const chip = TYPE_CHIPS[inp.type] || TYPE_CHIPS['Monetario']
              return (
                <div key={inp.id} className="flex items-center gap-3 px-4 py-3"
                  style={{ borderBottom: idx < items.length - 1 ? `1px solid ${th.cardBorder}` : 'none',
                    background: editingId === inp.id ? th.accentSoft : 'transparent' }}>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full flex-shrink-0"
                    style={{ background: chip.bg, color: chip.color }}>{chip.label}</span>
                  <span className="flex-1 text-[12px] min-w-0 truncate" style={{ color: th.textPrimary }}>{inp.description}</span>
                  <span className="text-[11px] mono flex-shrink-0" style={{ color: th.textSecondary }}>
                    {inp.quantity} × ${Number(inp.unitValue).toLocaleString('es-MX')}
                  </span>
                  <span className="text-[12px] font-semibold mono flex-shrink-0" style={{ color: th.textPrimary }}>
                    {fmtMXN(Number(inp.quantity) * Number(inp.unitValue))}
                  </span>
                  <button onClick={() => startEdit(inp)} className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ color: th.textMuted, background: th.hoverBg }}>
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => deleteInput(inp.id)} className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ color: '#EF4444', background: 'rgba(239,68,68,0.08)' }}>
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              )
            })}
          </div>
        )
      })}

      {/* Investment total */}
      {value.inputs.length > 0 && (
        <div className="flex justify-end">
          <span className="text-[14px] font-semibold" style={{ color: th.textPrimary }}>
            Inversión Total:{' '}
            <span className="mono" style={{ color: th.accent }}>{fmtMXN(total)}</span>
          </span>
        </div>
      )}

      {/* Orion stub */}
      <div className="space-y-1">
        <button onClick={() => console.log('[Orion] validate inputs', value.inputs)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-[12px] font-semibold"
          style={{ border: `1px solid ${th.accentBorder}`, color: th.accent, background: 'transparent', cursor: 'pointer' }}>
          <Sparkles className="w-3.5 h-3.5" />
          Validar con Orion
        </button>
        <p className="text-[10px]" style={{ color: th.textMuted }}>
          Orion revisará cantidades, valores y completitud de los insumos.
        </p>
      </div>
    </div>
  )
}
