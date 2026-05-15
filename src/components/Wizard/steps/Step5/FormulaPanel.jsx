import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown } from 'lucide-react'
import { useTheme } from '../../../../lib/theme'
import { fmtMXNFull } from '../../../../lib/sroiV12'

export default function FormulaPanel({ result }) {
  const [open, setOpen] = useState(false)
  const { th } = useTheme()
  const { project, outcomes, vaTangible, vaIntangible, vaTotal, factorReclamado: fr, discountRate, archetype } = result

  const stepNum = (n) => n + (vaIntangible > 0 ? 0 : -1)

  return (
    <div className="rounded-xl overflow-hidden" style={{ border: `1px solid ${th.cardBorder}` }}>
      <button type="button" onClick={() => setOpen(o => !o)}
        className="flex items-center justify-between w-full px-4 py-3"
        style={{ background: th.hoverBg, cursor: 'pointer' }}>
        <span className="text-[12px] font-semibold" style={{ color: th.textPrimary }}>
          Fórmula paso a paso
        </span>
        <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDown className="w-4 h-4" style={{ color: th.textMuted }} />
        </motion.div>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="formula"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22 }}
            style={{ overflow: 'hidden' }}
          >
            <div className="px-4 py-4 space-y-4 font-mono text-[11px]"
              style={{ background: th.cardBg, borderTop: `1px solid ${th.cardBorder}` }}>

              {/* Step 1: FR */}
              <div className="space-y-1">
                <p className="font-semibold" style={{ color: th.textSecondary }}>1. Factor Reclamado (FR)</p>
                <p style={{ color: th.textMuted }}>
                  FR = (1−{archetype.deadweight}) × (1−{archetype.attribution}) × (1−{archetype.displacement}) × (1−{archetype.dropOff})
                </p>
                <p style={{ color: th.accent }}>
                  FR = <strong>{fr.toFixed(4)}</strong>
                  <span className="ml-2 text-[10px]" style={{ color: th.textMuted }}>
                    (arquetipo {archetype.id} — {archetype.label})
                  </span>
                </p>
              </div>

              {/* Step 2: VB per outcome */}
              <div className="space-y-1">
                <p className="font-semibold" style={{ color: th.textSecondary }}>2. Valor Bruto por outcome</p>
                <p style={{ color: th.textMuted }}>VB = Cantidad × Proxy × VPN(perfil, r={(discountRate * 100).toFixed(1)}%)</p>
                {outcomes.map((o, i) => (
                  <p key={o.id ?? i} style={{ color: th.textPrimary }}>
                    [{i + 1}] {Number(o.quantity).toLocaleString('es-MX')} × {fmtMXNFull(o.proxyValue)} × {o.vpn.toFixed(4)}
                    {' '}= <span style={{ color: th.textSecondary }}>{fmtMXNFull(o.vb)}</span>
                  </p>
                ))}
              </div>

              {/* Step 3: VA Tangible */}
              <div className="space-y-1">
                <p className="font-semibold" style={{ color: th.textSecondary }}>3. Valor Ajustado tangible</p>
                <p style={{ color: th.textMuted }}>VA = VB × FR</p>
                <p style={{ color: th.textPrimary }}>
                  VA Tang = {fmtMXNFull(outcomes.reduce((s, o) => s + o.vb, 0))} × {fr.toFixed(4)}
                  {' '}= <strong style={{ color: th.accent }}>{fmtMXNFull(vaTangible)}</strong>
                </p>
              </div>

              {/* Step 4: Intangibles (conditional) */}
              {vaIntangible > 0 && (
                <div className="space-y-1">
                  <p className="font-semibold" style={{ color: th.textSecondary }}>4. VA Intangible</p>
                  <p style={{ color: '#10B981' }}>
                    VA Int = <strong>{fmtMXNFull(vaIntangible)}</strong>
                    <span className="ml-2 text-[10px]" style={{ color: th.textMuted }}>(suma de 7 categorías)</span>
                  </p>
                </div>
              )}

              {/* Step 5: SROI */}
              <div className="space-y-1">
                <p className="font-semibold" style={{ color: th.textSecondary }}>
                  {vaIntangible > 0 ? '5' : '4'}. SROI
                </p>
                <p style={{ color: th.textPrimary }}>
                  SROI Tang = {fmtMXNFull(vaTangible)} ÷ {fmtMXNFull(project.investment)}
                  {' '}= <strong style={{ color: th.accent }}>{result.sroiTangible.toFixed(2)}x</strong>
                </p>
                {vaIntangible > 0 && (
                  <p style={{ color: th.textPrimary }}>
                    SROI Total = {fmtMXNFull(vaTotal)} ÷ {fmtMXNFull(project.investment)}
                    {' '}= <strong style={{ color: '#10B981' }}>{result.sroiTotal.toFixed(2)}x</strong>
                  </p>
                )}
                <p style={{ color: th.textMuted }}>
                  Tasa de descuento: {(discountRate * 100).toFixed(1)}% (SHCP social rate)
                </p>
              </div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
