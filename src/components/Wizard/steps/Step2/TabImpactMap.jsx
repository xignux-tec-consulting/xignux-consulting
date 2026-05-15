import { ChevronRight } from 'lucide-react'
import { useTheme } from '../../../../lib/theme'
import { fmtMXN } from '../../../../lib/sroi'

export default function TabImpactMap({ value, stakeholders }) {
  const { th } = useTheme()

  const shById = Object.fromEntries(stakeholders.map(sh => [sh.id, sh]))

  const totalInv = value.inputs.reduce((s, i) => s + Number(i.quantity) * Number(i.unitValue), 0)
  const totalBen = value.beneficiaryChanges.reduce((s, bc) => s + (Number(bc.realBeneficiaries) || 0), 0)

  const inputsByStakeholder = stakeholders
    .map(sh => ({ sh, items: value.inputs.filter(i => i.stakeholderId === sh.id) }))
    .filter(g => g.items.length > 0)
    .map(({ sh, items }) => {
      const sub = items.reduce((s, i) => s + Number(i.quantity) * Number(i.unitValue), 0)
      return `${sh.name}: ${fmtMXN(sub)}`
    })

  const allChanges = value.beneficiaryChanges
    .flatMap(bc => bc.expectedChanges || [])
    .filter(Boolean)

  const cols = [
    { title: 'INSUMOS',           items: inputsByStakeholder },
    { title: 'ACTIVIDADES',       items: value.activities.map(a => a.name) },
    { title: 'PRODUCTOS',         items: value.outputs.map(o => `${o.name} (${o.quantity} ${o.unit})`) },
    { title: 'BENEFICIARIOS',     items: value.beneficiaryChanges.map(bc =>
        `${shById[bc.stakeholderId]?.name ?? '?'}: ${bc.realBeneficiaries || 0}`) },
    { title: 'CAMBIOS ESPERADOS', items: allChanges },
  ]

  return (
    <div className="space-y-6">
      {/* Desktop: 5-column chain */}
      <div className="hidden md:flex items-start gap-2">
        {cols.map((col, i) => (
          <div key={col.title} className="flex items-start gap-2 flex-1 min-w-0">
            <div className="flex-1 rounded-xl p-4 min-h-[140px] space-y-2"
              style={{ background: th.hoverBg, border: `1px solid ${th.cardBorder}` }}>
              <p className="text-[10px] uppercase tracking-widest font-medium" style={{ color: th.textMuted }}>
                {col.title}
              </p>
              {col.items.length > 0
                ? col.items.map((item, j) => (
                    <p key={j} className="text-[11px]" style={{ color: th.textPrimary }}>{item}</p>
                  ))
                : <p className="text-[12px]" style={{ color: th.textMuted }}>—</p>
              }
            </div>
            {i < cols.length - 1 && (
              <ChevronRight className="w-4 h-4 mt-10 flex-shrink-0" style={{ color: th.textMuted, opacity: 0.45 }} />
            )}
          </div>
        ))}
      </div>

      {/* Mobile: stacked */}
      <div className="flex flex-col gap-3 md:hidden">
        {cols.map((col, i) => (
          <div key={col.title}>
            <div className="rounded-xl p-4 space-y-2" style={{ background: th.hoverBg, border: `1px solid ${th.cardBorder}` }}>
              <p className="text-[10px] uppercase tracking-widest font-medium" style={{ color: th.textMuted }}>{col.title}</p>
              {col.items.length > 0
                ? col.items.map((item, j) => <p key={j} className="text-[11px]" style={{ color: th.textPrimary }}>{item}</p>)
                : <p className="text-[12px]" style={{ color: th.textMuted }}>—</p>}
            </div>
            {i < cols.length - 1 && (
              <div className="flex justify-center py-1">
                <ChevronRight className="w-4 h-4 rotate-90" style={{ color: th.textMuted, opacity: 0.45 }} />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Footer metrics */}
      <div className="grid grid-cols-3 gap-4 pt-4 border-t" style={{ borderColor: th.cardBorder }}>
        {[
          { label: 'Inversión Total',       val: fmtMXN(totalInv) },
          { label: 'Beneficiarios totales', val: totalBen.toLocaleString('es-MX') },
          { label: 'Tipos de Output',       val: String(value.outputs.length) },
        ].map(({ label, val }) => (
          <div key={label} className="text-center">
            <p className="text-[10px] uppercase tracking-wider font-medium" style={{ color: th.textMuted }}>{label}</p>
            <p className="text-[18px] font-semibold mono" style={{ color: th.textPrimary }}>{val}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
