import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTheme } from '../../lib/theme'
import Stepper from './Stepper'
import NavBar from './NavBar'

const TOTAL_STEPS = 6

export default function SROIWizard({ onBackToGraph }) {
  const { th } = useTheme()
  const [currentStep, setCurrentStep] = useState(1)

  const goNext = () => setCurrentStep((s) => Math.min(s + 1, TOTAL_STEPS))
  const goPrev = () => setCurrentStep((s) => Math.max(s - 1, 1))
  const handleSave = () => { /* placeholder — persistencia en paso siguiente */ }

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="absolute inset-0 overflow-y-auto md:pl-[72px]"
      style={{ background: th.pageBg }}
    >
      <div className="max-w-[1440px] mx-auto px-4 md:px-8 pt-20 pb-8 space-y-6">

        {/* Progress bar across steps */}
        <Stepper currentStep={currentStep} />

        {/* Step content placeholder — fade between steps */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="rounded-2xl p-8 min-h-[360px] flex items-center justify-center"
            style={{
              background: th.cardBg,
              border: `1px solid ${th.cardBorder}`,
              boxShadow: th.shadow,
            }}
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
          </motion.div>
        </AnimatePresence>

        {/* Bottom navigation */}
        <NavBar
          step={currentStep}
          onPrev={goPrev}
          onNext={goNext}
          onSave={handleSave}
        />

      </div>
    </motion.div>
  )
}
