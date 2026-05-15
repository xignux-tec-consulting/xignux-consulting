import { Check, Compass, Map, Search, Zap, Calculator, FileText } from 'lucide-react'
import { motion } from 'framer-motion'
import { useTheme } from '../../lib/theme'

const STEPS = [
  { label: 'Alcance y Stakeholders', Icon: Compass },
  { label: 'Mapa de Outcomes',       Icon: Map },
  { label: 'Evidenciar Outcomes',    Icon: Search },
  { label: 'Establecer Impacto',     Icon: Zap },
  { label: 'Calcular SROI',          Icon: Calculator },
  { label: 'Reportar y Certificar',  Icon: FileText },
]

export default function Stepper({ currentStep }) {
  const { th } = useTheme()

  return (
    <div
      className="rounded-2xl px-6 py-5"
      style={{ background: th.cardBg, border: `1px solid ${th.cardBorder}`, boxShadow: th.shadow }}
    >
      <div className="flex items-start">
        {STEPS.map(({ label, Icon }, i) => {
          const stepNum = i + 1
          const isDone   = stepNum < currentStep
          const isActive = stepNum === currentStep

          return (
            <div key={i} className="flex items-start flex-1 last:flex-none">
              {/* Step node */}
              <div className="flex flex-col items-center gap-1.5 flex-shrink-0">
                <motion.div
                  className="w-9 h-9 rounded-full flex items-center justify-center"
                  animate={{
                    boxShadow: isActive ? `0 0 0 3px ${th.accentBorder}` : '0 0 0 0px transparent',
                  }}
                  transition={{ duration: 0.25 }}
                  style={{
                    background: isActive || isDone ? th.accentSoft : th.hoverBg,
                    border: `1.5px solid ${isActive || isDone ? th.accent : th.cardBorder}`,
                  }}
                >
                  {isDone
                    ? <Check className="w-3.5 h-3.5" style={{ color: th.accent }} />
                    : <Icon  className="w-3.5 h-3.5" style={{ color: isActive ? th.accent : th.textMuted }} />
                  }
                </motion.div>

                <span
                  className="text-[10px] font-medium text-center leading-tight"
                  style={{
                    color: isActive ? th.textPrimary : isDone ? th.accent : th.textMuted,
                    maxWidth: 72,
                  }}
                >
                  {label}
                </span>
              </div>

              {/* Connector line */}
              {i < STEPS.length - 1 && (
                <div
                  className="flex-1 mx-2 mt-[17px]"
                  style={{
                    height: 1.5,
                    background: isDone ? th.accent : th.cardBorder,
                    transition: 'background 0.3s',
                  }}
                />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
