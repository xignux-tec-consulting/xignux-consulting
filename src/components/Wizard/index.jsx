import { motion, AnimatePresence } from 'framer-motion'
import { useTheme } from '../../lib/theme'
import Stepper from './Stepper'
import NavBar from './NavBar'
import Step1_Scope from './steps/Step1_Scope'
import Step2_OutcomeMap from './steps/Step2_OutcomeMap'
import AutoSaveBadge from './fields/AutoSaveBadge'
import useWizardState from './useWizardState'

const TOTAL_STEPS = 6

export default function SROIWizard({ onBackToGraph }) {
  const { th } = useTheme()
  const { state, updateStep, lastSavedAt, forceSave } = useWizardState()
  const currentStep = state.meta.currentStep

  const goNext = () => updateStep('meta', { currentStep: Math.min(currentStep + 1, TOTAL_STEPS) })
  const goPrev = () => updateStep('meta', { currentStep: Math.max(currentStep - 1, 1) })

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="absolute inset-0 overflow-y-auto md:pl-[72px]"
      style={{ background: th.pageBg }}
    >
      <div className="max-w-[1440px] mx-auto px-4 md:px-8 pt-20 pb-8 space-y-6">

        <AutoSaveBadge lastSavedAt={lastSavedAt} />

        <Stepper currentStep={currentStep} />

        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
          >
            {currentStep === 1 && (
              <Step1_Scope
                value={state.step1}
                onChange={(p) => updateStep('step1', p)}
                onSave={forceSave}
              />
            )}
            {currentStep === 2 && (
              <Step2_OutcomeMap
                value={state.step2}
                onChange={(p) => updateStep('step2', p)}
                stakeholders={state.step1.stakeholders}
                onSave={forceSave}
                onGoToStep1={() => updateStep('meta', { currentStep: 1 })}
              />
            )}
            {currentStep > 2 && (
              <div
                className="rounded-2xl p-8 min-h-[360px] flex items-center justify-center"
                style={{ background: th.cardBg, border: `1px solid ${th.cardBorder}`, boxShadow: th.shadow }}
              >
                <div className="text-center space-y-2">
                  <p className="text-[12px] font-medium uppercase tracking-widest" style={{ color: th.accent }}>
                    Paso {currentStep} de {TOTAL_STEPS}
                  </p>
                  <p className="text-[14px] font-semibold" style={{ color: th.textPrimary }}>
                    Contenido próximamente
                  </p>
                  <p className="text-[11px]" style={{ color: th.textMuted }}>
                    Este paso se implementará en la siguiente iteración.
                  </p>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        <NavBar
          step={currentStep}
          onPrev={goPrev}
          onNext={goNext}
          onSave={forceSave}
        />

      </div>
    </motion.div>
  )
}
