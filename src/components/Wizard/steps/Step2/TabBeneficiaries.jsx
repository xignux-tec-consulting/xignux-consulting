import { X } from 'lucide-react'
import { useTheme } from '../../../../lib/theme'
import NumberField from '../../fields/NumberField'
import SelectField from '../../fields/SelectField'
import TextField from '../../fields/TextField'

const BENEFICIARY_ROLES = ['Beneficiario directo', 'Beneficiario indirecto']

export default function TabBeneficiaries({ value, onChange, stakeholders }) {
  const { th } = useTheme()

  const beneficiaries = stakeholders.filter(sh => BENEFICIARY_ROLES.includes(sh.role))

  const outputOptions = value.outputs.map(o => `${o.name} (${o.unit})`)
  const outputByLabel = Object.fromEntries(value.outputs.map(o => [`${o.name} (${o.unit})`, o.id]))
  const outputById    = Object.fromEntries(value.outputs.map(o => [o.id, o]))

  const getBC = (stakeholderId) =>
    value.beneficiaryChanges.find(bc => bc.stakeholderId === stakeholderId) ?? {
      id: crypto.randomUUID(), stakeholderId, outputId: '',
      totalBeneficiaries: '', realBeneficiaries: '', expectedChanges: [''],
    }

  const updateBC = (stakeholderId, partial) => {
    const exists = value.beneficiaryChanges.some(bc => bc.stakeholderId === stakeholderId)
    if (exists) {
      onChange({ beneficiaryChanges: value.beneficiaryChanges.map(bc =>
        bc.stakeholderId === stakeholderId ? { ...bc, ...partial } : bc
      )})
    } else {
      onChange({ beneficiaryChanges: [...value.beneficiaryChanges, { ...getBC(stakeholderId), ...partial }] })
    }
  }

  if (beneficiaries.length === 0) {
    return (
      <p className="text-[12px] text-center py-8" style={{ color: th.textMuted }}>
        Agregue stakeholders con rol <strong>Beneficiario directo</strong> o{' '}
        <strong>Beneficiario indirecto</strong> en el Paso 1 para definir los cambios esperados.
      </p>
    )
  }

  return (
    <div className="space-y-6">
      <p className="text-[12px]" style={{ color: th.textMuted }}>
        Asocie productos a beneficiarios y defina los cambios esperados.
      </p>

      {beneficiaries.map(sh => {
        const bc = getBC(sh.id)
        const selectedLabel = bc.outputId
          ? `${outputById[bc.outputId]?.name} (${outputById[bc.outputId]?.unit})`
          : ''

        return (
          <div key={sh.id} className="rounded-xl overflow-hidden" style={{ border: `1px solid ${th.cardBorder}` }}>
            {/* Header */}
            <div className="flex items-center gap-2 px-4 py-3"
              style={{ background: th.hoverBg, borderBottom: `1px solid ${th.cardBorder}` }}>
              <span className="text-[13px] font-semibold" style={{ color: th.textPrimary }}>{sh.name}</span>
              <span className="text-[10px] font-medium px-2 py-0.5 rounded-full"
                style={{ background: th.accentSoft, color: th.accent, border: `1px solid ${th.accentBorder}` }}>
                {sh.role}
              </span>
            </div>

            <div className="px-4 py-4 space-y-4">
              <SelectField label="Producto asociado" value={selectedLabel}
                onChange={(v) => updateBC(sh.id, { outputId: outputByLabel[v] ?? '' })}
                options={outputOptions} />

              <div className="grid grid-cols-2 gap-3">
                <NumberField label="Cantidad total" value={bc.totalBeneficiaries}
                  onChange={(v) => updateBC(sh.id, { totalBeneficiaries: v })}
                  placeholder="Total beneficiarios" />
                <NumberField label="Cantidad real" value={bc.realBeneficiaries}
                  onChange={(v) => updateBC(sh.id, { realBeneficiaries: v })}
                  placeholder="Realmente beneficiados" />
              </div>

              {/* Expected changes */}
              <div className="space-y-2">
                <label className="text-[11px] uppercase tracking-wider font-medium block"
                  style={{ color: th.textSecondary }}>
                  Cambios esperados
                </label>
                {(bc.expectedChanges || []).map((chg, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <TextField value={chg}
                      onChange={(v) => {
                        const next = [...(bc.expectedChanges || [])]
                        next[idx] = v
                        updateBC(sh.id, { expectedChanges: next })
                      }}
                      placeholder="Describe el cambio esperado..." />
                    <button onClick={() =>
                      updateBC(sh.id, { expectedChanges: (bc.expectedChanges || []).filter((_, i) => i !== idx) })
                    } className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ color: th.textMuted, background: th.hoverBg }}>
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
                <button onClick={() => updateBC(sh.id, { expectedChanges: [...(bc.expectedChanges || []), ''] })}
                  className="px-3 py-1.5 rounded-xl text-[11px] font-medium"
                  style={{ background: th.cardBg, border: `1px solid ${th.cardBorder}`, color: th.textSecondary,
                    cursor: 'pointer' }}>
                  + Agregar cambio
                </button>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
