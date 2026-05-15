import { useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, CheckCircle2, AlertCircle } from 'lucide-react'
import { useTheme } from '../../../../lib/theme'
import Card from '../../fields/Card'
import OutcomeEditor from './OutcomeEditor'
import { vpnForProfile, fmtMXN } from '../../../../lib/sroiV12'

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

export default function OutcomeCard({
  item, outcome, isOpen, isNew,
  onToggle, onCreateClick, onChange, onSave, onCancel, onDelete,
}) {
  const { th } = useTheme()
  const cardRef = useRef(null)
  const evidenced = isEvidenced(outcome)

  useEffect(() => {
    if (isOpen && cardRef.current) {
      cardRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
    }
  }, [isOpen])

  const vb = outcome?.vpnProfile && Number(outcome.indicator?.value) > 0 && Number(outcome.proxy?.value) > 0
    ? Number(outcome.indicator.value) * Number(outcome.proxy.value) * vpnForProfile(outcome.vpnProfile)
    : null

  return (
    <div ref={cardRef}>
      <Card className="overflow-hidden">

        {/* Header — always visible */}
        <button
          type="button"
          onClick={onToggle}
          className="w-full flex items-center gap-3 px-4 py-3 text-left"
          style={{ background: th.hoverBg, cursor: 'pointer' }}
        >
          <div className="flex-1 min-w-0 space-y-0.5">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[14px] font-semibold leading-snug" style={{ color: th.textPrimary }}>
                {item.changeText}
              </span>
              {evidenced ? (
                <span className="flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full flex-shrink-0"
                  style={{ background: 'rgba(16,185,129,0.12)', color: '#10B981', border: '1px solid rgba(16,185,129,0.2)' }}>
                  <CheckCircle2 className="w-3 h-3" />
                  Evidenciado
                </span>
              ) : (
                <span className="flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full flex-shrink-0"
                  style={{ background: 'rgba(245,158,11,0.12)', color: '#F59E0B', border: '1px solid rgba(245,158,11,0.2)' }}>
                  <AlertCircle className="w-3 h-3" />
                  Pendiente
                </span>
              )}
            </div>
            <p className="text-[11px]" style={{ color: th.textMuted }}>
              {item.stakeholderName}
              {item.outputName !== '—' && ` · ${item.outputName}`}
            </p>
          </div>

          {/* VB pill — only when evidenced */}
          {vb !== null && (
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full flex-shrink-0"
              style={{ background: th.accentSoft, color: th.accent, border: `1px solid ${th.accentBorder}` }}>
              {fmtMXN(vb)}
            </span>
          )}

          <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.2 }} className="flex-shrink-0">
            <ChevronDown className="w-4 h-4" style={{ color: th.textMuted }} />
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
                {!outcome?.id ? (
                  // No outcome created yet — show prompt
                  <div className="px-5 py-5 space-y-3">
                    <p className="text-[12px]" style={{ color: th.textMuted }}>
                      Aún no se ha evidenciado este cambio.
                    </p>
                    <button
                      type="button"
                      onClick={onCreateClick}
                      className="px-4 py-2 rounded-xl text-[12px] font-semibold"
                      style={{ background: th.accent, color: '#fff', boxShadow: '0 2px 10px -2px rgba(232,82,14,0.4)', cursor: 'pointer' }}
                    >
                      + Crear outcome
                    </button>
                  </div>
                ) : (
                  <OutcomeEditor
                    outcome={outcome}
                    onChange={onChange}
                    onSave={onSave}
                    onCancel={onCancel}
                    onDelete={onDelete}
                    isNew={isNew}
                  />
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
    </div>
  )
}
