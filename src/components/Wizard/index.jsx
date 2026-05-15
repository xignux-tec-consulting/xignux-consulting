import { motion, AnimatePresence } from 'framer-motion'
import { useTheme } from '../../lib/theme'
import Stepper from './Stepper'
import NavBar from './NavBar'
import Step1_Scope from './steps/Step1_Scope'
import Step2_OutcomeMap from './steps/Step2_OutcomeMap'
import Step3_Outcomes from './steps/Step3_Outcomes'
import Step4_Impact from './steps/Step4_Impact'
import AutoSaveBadge from './fields/AutoSaveBadge'
import useWizardState from './useWizardState'

const TOTAL_STEPS = 6

export default function SROIWizard({ onBackToGraph }) {
  const { th } = useTheme()
  const { state, updateStep, lastSavedAt, forceSave } = useWizardState()
  const currentStep = state.meta.currentStep

  const goNext = () => updateStep('meta', { currentStep: Math.min(currentStep + 1, TOTAL_STEPS) })
  const goPrev = () => updateStep('meta', { currentStep: Math.max(currentStep - 1, 1) })

  const step4Valid = Boolean(state.step4.archetypeId) && state.step4.justification?.trim().length > 0
  const nextDisabled = currentStep === 4 && !step4Valid

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
            {currentStep === 3 && (
              <Step3_Outcomes
                value={state.step3}
                onChange={(p) => updateStep('step3', p)}
                beneficiaryChanges={state.step2.beneficiaryChanges}
                outputs={state.step2.outputs}
                stakeholders={state.step1.stakeholders}
                onSave={forceSave}
                onGoToStep={(n) => updateStep('meta', { currentStep: n })}
              />
            )}
            {currentStep === 4 && (
              <Step4_Impact
                value={state.step4}
                onChange={(p) => updateStep('step4', p)}
                outcomes={state.step3.outcomes}
                inputs={state.step2.inputs}
                onSave={forceSave}
              />
            )}
            {currentStep > 4 && (
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
          nextDisabled={nextDisabled}
        />

      </div>
    </motion.div>
  )
}
