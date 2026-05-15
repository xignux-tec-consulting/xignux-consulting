import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, CheckCircle2, AlertCircle } from 'lucide-react'
import { useTheme } from '../../../lib/theme'
import SectionHeader from '../fields/SectionHeader'
import Card from '../fields/Card'
import OutcomeEditor from './Step3/OutcomeEditor'

function StatusBadge({ isEvidenced }) {
  const { th } = useTheme()
  if (isEvidenced) {
    return (
      <span className="flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full"
        style={{ background: '#10B98120', color: '#10B981', border: '1px solid #10B98133' }}>
        <CheckCircle2 className="w-3 h-3" />
        Evidenciado
      </span>
    )
  }
  return (
    <span className="flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full"
      style={{ background: '#F59E0B20', color: '#F59E0B', border: '1px solid #F59E0B33' }}>
      <AlertCircle className="w-3 h-3" />
      Pendiente
    </span>
  )
}

function isEvidenced(outcome) {
  return !!(
    outcome?.description?.trim() &&
    outcome?.indicator?.name?.trim() &&
    outcome?.indicator?.value &&
    outcome?.proxy?.value
  )
}

export default function Step3_Outcomes({ value, onChange, beneficiaryChanges, outputs, stakeholders, onSave, onGoToStep }) {
  const { th } = useTheme()
  const [expandedId, setExpandedId] = useState(null)
  const expandedRef = useRef(null)

  // Flatten all expected changes from Step 2 into items
  const shById  = Object.fromEntries(stakeholders.map(sh => [sh.id, sh]))
  const outById = Object.fromEntries(outputs.map(o  => [o.id,  o]))

  const changeItems = beneficiaryChanges.flatMap(bc =>
    (bc.expectedChanges || [])
      .filter(Boolean)
      .map((chg, idx) => ({
        sourceId:        `${bc.id}__${idx}`,
        bcId:            bc.id,
        changeText:      chg,
        stakeholderName: shById[bc.stakeholderId]?.name  ?? '?',
        outputName:      outById[bc.outputId]?.name       ?? '—',
      }))
  )

  const activeSourceIds = new Set(changeItems.map(c => c.sourceId))

  // Upsert helpers
  const getOutcome = (sourceId) =>
    value.outcomes.find(o => o.beneficiaryChangeId === sourceId)

  const upsertOutcome = (sourceId, changeItem, partial) => {
    const exists = value.outcomes.some(o => o.beneficiaryChangeId === sourceId)
    if (exists) {
      onChange({ outcomes: value.outcomes.map(o =>
        o.beneficiaryChangeId === sourceId ? { ...o, ...partial } : o
      )})
    } else {
      onChange({ outcomes: [
        ...value.outcomes,
        {
          id:                 crypto.randomUUID(),
          beneficiaryChangeId: sourceId,
          changeText:          changeItem.changeText,
          stakeholderName:     changeItem.stakeholderName,
          outputName:          changeItem.outputName,
          description:         '',
          indicator:           { name: '', value: '', unit: '', source: '' },
          proxy:               { name: '', value: '', source: '' },
          ...partial,
        },
      ]})
    }
  }

  const deleteOutcome = (sourceId) => {
    onChange({ outcomes: value.outcomes.filter(o => o.beneficiaryChangeId !== sourceId) })
    if (expandedId === sourceId) setExpandedId(null)
  }

  // Smooth scroll to expanded card
  useEffect(() => {
    if (expandedId && expandedRef.current) {
      expandedRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
    }
  }, [expandedId])

  // Progress counters
  const evidencedCount = changeItems.filter(c => isEvidenced(getOutcome(c.sourceId))).length
  const total = changeItems.length

  if (changeItems.length === 0) {
    return (
      <div className="space-y-5">
        <SectionHeader
          stepNumber={3}
          title="Evidenciar Outcomes y Darles Valor"
          subtitle="Define indicadores y proxies financieros para cada cambio esperado."
        />
        <Card className="p-8">
          <div className="text-center space-y-2">
            <p className="text-[13px] font-medium" style={{ color: th.textPrimary }}>
              No hay cambios esperados definidos
            </p>
            <p className="text-[12px]" style={{ color: th.textMuted }}>
              Regresa al Paso 2 → Beneficiarios y Cambios para agregar cambios esperados.
            </p>
            <button
              onClick={() => onGoToStep(2)}
              className="mt-3 px-4 py-2 rounded-xl text-[12px] font-semibold"
              style={{ background: th.accent, color: '#fff', cursor: 'pointer' }}
            >
              Ir al Paso 2 →
            </button>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <SectionHeader
        stepNumber={3}
        title="Evidenciar Outcomes y Darles Valor"
        subtitle="Para cada cambio esperado, define un indicador de medición y un proxy financiero."
      />

      {/* Progress */}
      <div className="flex items-center gap-3">
        <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: th.hoverBg }}>
          <motion.div
            className="h-full rounded-full"
            style={{ background: th.accent }}
            animate={{ width: total > 0 ? `${(evidencedCount / total) * 100}%` : '0%' }}
            transition={{ duration: 0.4 }}
          />
        </div>
        <span className="text-[11px] font-medium flex-shrink-0" style={{ color: th.textMuted }}>
          {evidencedCount}/{total} evidenciados
        </span>
      </div>

      {/* Outcome cards */}
      <div className="space-y-3">
        {changeItems.map((item) => {
          const outcome   = getOutcome(item.sourceId) ?? {}
          const evidenced = isEvidenced(outcome)
          const isOpen    = expandedId === item.sourceId

          return (
            <div
              key={item.sourceId}
              ref={isOpen ? expandedRef : undefined}
            >
            <Card className="overflow-hidden">
              {/* Card header / toggle */}
              <button
                onClick={() => setExpandedId(isOpen ? null : item.sourceId)}
                className="w-full flex items-center gap-3 px-4 py-3 text-left"
                style={{ background: th.hoverBg, cursor: 'pointer' }}
              >
                <div className="flex-1 min-w-0 space-y-0.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[12px] font-semibold truncate" style={{ color: th.textPrimary }}>
                      {item.changeText}
                    </span>
                    <StatusBadge isEvidenced={evidenced} />
                  </div>
                  <p className="text-[10px]" style={{ color: th.textMuted }}>
                    {item.stakeholderName}
                    {item.outputName !== '—' && ` · ${item.outputName}`}
                  </p>
                </div>
                {/* Gross value preview */}
                {evidenced && outcome.indicator?.value && outcome.proxy?.value && (
                  <span
                    className="text-[11px] font-semibold px-2 py-0.5 rounded-full flex-shrink-0"
                    style={{ background: th.accentSoft, color: th.accent, border: `1px solid ${th.accentBorder}` }}
                  >
                    {((Number(outcome.indicator.value) || 0) * (Number(outcome.proxy.value) || 0))
                      .toLocaleString('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 })}
                  </span>
                )}
                <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
                  <ChevronDown className="w-4 h-4 flex-shrink-0" style={{ color: th.textMuted }} />
                </motion.div>
              </button>

              {/* Accordion body */}
              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    key="body"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.22, ease: 'easeOut' }}
                    style={{ overflow: 'hidden' }}
                  >
                    <div style={{ borderTop: `1px solid ${th.cardBorder}` }}>
                      <OutcomeEditor
                        outcome={outcome}
                        onChange={(partial) => upsertOutcome(item.sourceId, item, partial)}
                        onSave={() => { onSave(); setExpandedId(null) }}
                        onDelete={() => deleteOutcome(item.sourceId)}
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </Card>
            </div>
          )
        })}
      </div>

      {/* Orphaned outcomes warning */}
      {value.outcomes.some(o => !activeSourceIds.has(o.beneficiaryChangeId)) && (
        <div
          className="rounded-xl px-4 py-3 flex items-start gap-2 text-[11px]"
          style={{ background: '#F59E0B15', border: '1px solid #F59E0B33', color: '#F59E0B' }}
        >
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <span>
            Algunos outcomes ya no tienen un cambio esperado asociado (fueron eliminados en el Paso 2).
            Se ignorarán en el cálculo SROI.
          </span>
        </div>
      )}
    </div>
  )
}
