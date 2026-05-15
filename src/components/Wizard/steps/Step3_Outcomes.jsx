import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Info, ChevronDown, AlertCircle } from 'lucide-react'
import { useTheme } from '../../../lib/theme'
import SectionHeader from '../fields/SectionHeader'
import Card from '../fields/Card'
import OutcomeCard from './Step3/OutcomeCard'

function isEvidenced(o) {
  return !!(
    o?.id &&
    o.description?.trim() &&
    o.indicator?.name?.trim() &&
    Number(o.indicator?.value) > 0 &&
    o.indicator?.source?.trim() &&
    o.proxy?.name?.trim() &&
    Number(o.proxy?.value) > 0 &&
    o.proxy?.source?.trim() &&
    o.vpnProfile
  )
}

// backward-compat: old outcomes stored link as `beneficiaryChangeId`
const getSrcId = (o) => o.sourceId ?? o.beneficiaryChangeId

export default function Step3_Outcomes({
  value, onChange, beneficiaryChanges, outputs, stakeholders, onSave, onGoToStep,
}) {
  const { th } = useTheme()
  const [expandedId, setExpandedId] = useState(null)
  const [creatingId, setCreatingId] = useState(null)
  const [orphansOpen, setOrphansOpen] = useState(false)

  const shById  = Object.fromEntries((stakeholders || []).map(sh => [sh.id, sh]))
  const outById = Object.fromEntries((outputs      || []).map(o  => [o.id,  o]))

  const changeItems = (beneficiaryChanges || []).flatMap(bc =>
    (bc.expectedChanges || [])
      .filter(Boolean)
      .map((chg, idx) => ({
        sourceId:        `${bc.id}__${idx}`,
        changeText:      chg,
        stakeholderName: shById[bc.stakeholderId]?.name ?? '?',
        outputName:      outById[bc.outputId]?.name      ?? '—',
      }))
  )

  const activeSourceIds = new Set(changeItems.map(c => c.sourceId))

  const outcomes = value?.outcomes ?? []

  const getOutcome = (srcId) => outcomes.find(o => getSrcId(o) === srcId)

  const upsertOutcome = (srcId, item, partial) => {
    const exists = outcomes.some(o => getSrcId(o) === srcId)
    if (exists) {
      onChange({ outcomes: outcomes.map(o =>
        getSrcId(o) === srcId ? { ...o, ...partial } : o
      )})
    } else {
      onChange({ outcomes: [
        ...outcomes,
        {
          id:              crypto.randomUUID(),
          sourceId:        srcId,
          changeText:      item.changeText,
          stakeholderName: item.stakeholderName,
          outputName:      item.outputName,
          description:     '',
          indicator:       { name: '', value: '', unit: '', source: '' },
          proxy:           { name: '', value: '', source: '' },
          vpnProfile:      '',
          ...partial,
        },
      ]})
    }
  }

  const deleteOutcome = (srcId) => {
    onChange({ outcomes: outcomes.filter(o => getSrcId(o) !== srcId) })
    if (expandedId === srcId) setExpandedId(null)
    if (creatingId === srcId) setCreatingId(null)
  }

  const handleCreateClick = (item) => {
    upsertOutcome(item.sourceId, item, {})
    setExpandedId(item.sourceId)
    setCreatingId(item.sourceId)
  }

  const handleSave = (srcId) => {
    onSave()
    setExpandedId(null)
    setCreatingId(null)
  }

  const handleCancel = (srcId) => {
    deleteOutcome(srcId)
  }

  const orphans       = outcomes.filter(o => !activeSourceIds.has(getSrcId(o)))
  const evidencedCount = changeItems.filter(c => isEvidenced(getOutcome(c.sourceId))).length
  const total         = changeItems.length

  // ── Empty state ──────────────────────────────────────────────────────────
  if (total === 0) {
    return (
      <div className="space-y-5">
        <SectionHeader stepNumber={3}
          title="Evidenciar Outcomes y Darles Valor"
          subtitle="Para cada cambio esperado del Paso 2, defina un indicador medible, un proxy financiero conservador, y un perfil de Valor Presente Neto."
        />
        <Card className="p-8">
          <div className="text-center space-y-3">
            <p className="text-[13px] font-medium" style={{ color: th.textPrimary }}>
              No hay cambios esperados definidos.
            </p>
            <p className="text-[12px]" style={{ color: th.textMuted }}>
              Vuelva al Paso 2 → Beneficiarios y Cambios para agregarlos.
            </p>
            <button onClick={() => onGoToStep(2)}
              className="px-4 py-2 rounded-xl text-[12px] font-medium"
              style={{ border: `1px solid ${th.accent}`, color: th.accent, background: 'transparent', cursor: 'pointer' }}>
              Ir a Paso 2
            </button>
          </div>
        </Card>
      </div>
    )
  }

  // ── Main view ─────────────────────────────────────────────────────────────
  return (
    <div className="space-y-5">
      <SectionHeader stepNumber={3}
        title="Evidenciar Outcomes y Darles Valor"
        subtitle="Para cada cambio esperado del Paso 2, defina un indicador medible, un proxy financiero conservador, y un perfil de Valor Presente Neto."
      />

      {/* Methodology banner */}
      <div className="flex items-start gap-3 p-3 rounded-xl"
        style={{ background: th.accentSoft, border: `1px solid ${th.accentBorder}` }}>
        <Info className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: th.accent }} />
        <p className="text-[12px]" style={{ color: th.textPrimary }}>
          El Valor Bruto se calcula con la metodología SROI v12.10:{' '}
          <span className="font-mono font-semibold">VB = Cantidad × Proxy × VPN</span>.
          Los ajustes (deadweight, attribution, etc.) se aplican en el Paso 4 según el arquetipo del proyecto.
        </p>
      </div>

      {/* Progress bar */}
      <div className="flex items-center gap-3">
        <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: th.hoverBg }}>
          <motion.div
            className="h-full rounded-full"
            style={{ background: th.accent }}
            animate={{ width: `${(evidencedCount / total) * 100}%` }}
            transition={{ duration: 0.4 }}
          />
        </div>
        <span className="text-[11px] font-medium flex-shrink-0" style={{ color: th.textMuted }}>
          {evidencedCount}/{total} evidenciados
        </span>
      </div>

      {/* Change cards */}
      <div className="space-y-3">
        {changeItems.map(item => {
          const outcome = getOutcome(item.sourceId)
          const isOpen  = expandedId === item.sourceId
          const isNew   = creatingId === item.sourceId
          return (
            <OutcomeCard
              key={item.sourceId}
              item={item}
              outcome={outcome}
              isOpen={isOpen}
              isNew={isNew}
              onToggle={() => setExpandedId(isOpen ? null : item.sourceId)}
              onCreateClick={() => handleCreateClick(item)}
              onChange={(partial) => upsertOutcome(item.sourceId, item, partial)}
              onSave={() => handleSave(item.sourceId)}
              onCancel={() => handleCancel(item.sourceId)}
              onDelete={() => deleteOutcome(item.sourceId)}
            />
          )
        })}
      </div>

      {/* Orphans section — collapsible */}
      {orphans.length > 0 && (
        <Card className="overflow-hidden">
          <button
            type="button"
            onClick={() => setOrphansOpen(o => !o)}
            className="w-full flex items-center gap-3 px-4 py-3 text-left"
            style={{ background: 'rgba(245,158,11,0.08)', cursor: 'pointer' }}
          >
            <AlertCircle className="w-4 h-4 flex-shrink-0" style={{ color: '#F59E0B' }} />
            <span className="text-[12px] font-semibold flex-1" style={{ color: '#F59E0B' }}>
              ⚠ Outcomes sin cambio asociado ({orphans.length})
            </span>
            <motion.div animate={{ rotate: orphansOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
              <ChevronDown className="w-4 h-4" style={{ color: '#F59E0B' }} />
            </motion.div>
          </button>
          <AnimatePresence initial={false}>
            {orphansOpen && (
              <motion.div
                key="orphans"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.18 }}
                style={{ overflow: 'hidden' }}
              >
                <div className="px-4 py-3 space-y-3"
                  style={{ borderTop: '1px solid rgba(245,158,11,0.2)' }}>
                  {orphans.map(o => (
                    <div key={o.id} className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <p className="text-[12px] font-medium" style={{ color: th.textPrimary }}>
                          {o.changeText || '(cambio eliminado)'}
                        </p>
                        {o.description && (
                          <p className="text-[11px] mt-0.5 line-clamp-1" style={{ color: th.textMuted }}>
                            {o.description}
                          </p>
                        )}
                      </div>
                      <button
                        onClick={() => onChange({ outcomes: outcomes.filter(x => x.id !== o.id) })}
                        className="px-3 py-1.5 rounded-xl text-[11px] font-medium flex-shrink-0"
                        style={{ color: '#7F1D1D', border: '1px solid rgba(127,29,29,0.3)', background: 'transparent', cursor: 'pointer' }}>
                        Eliminar
                      </button>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </Card>
      )}
    </div>
  )
}
