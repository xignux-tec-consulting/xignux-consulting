import { motion } from 'framer-motion'
import { useTheme } from '../../lib/theme'

const TOTAL_STEPS = 6

export default function NavBar({ step, onPrev, onNext, onSave, nextDisabled = false }) {
  const { th } = useTheme()
  const isFirst = step === 1
  const isLast  = step === TOTAL_STEPS

  return (
    <div className="flex items-center justify-end gap-3 pt-2">
      <motion.button
        onClick={onPrev}
        disabled={isFirst}
        whileTap={!isFirst ? { scale: 0.97 } : {}}
        className="px-5 py-2.5 rounded-xl text-[12px] font-semibold"
        style={{
          background: th.cardBg,
          border: `1px solid ${th.cardBorder}`,
          color: isFirst ? th.textMuted : th.textPrimary,
          cursor: isFirst ? 'not-allowed' : 'pointer',
          boxShadow: th.shadow,
          opacity: isFirst ? 0.5 : 1,
        }}
      >
        Anterior
      </motion.button>

      <motion.button
        onClick={onSave}
        whileTap={{ scale: 0.97 }}
        className="px-5 py-2.5 rounded-xl text-[12px] font-semibold"
        style={{
          background: th.cardBg,
          border: `1px solid ${th.cardBorder}`,
          color: th.textSecondary,
          boxShadow: th.shadow,
          cursor: 'pointer',
        }}
      >
        Guardar
      </motion.button>

      <motion.button
        onClick={!nextDisabled ? onNext : undefined}
        disabled={nextDisabled}
        whileTap={!nextDisabled ? { scale: 0.97 } : {}}
        className="px-5 py-2.5 rounded-xl text-[12px] font-semibold"
        style={{
          background:  nextDisabled ? th.hoverBg : th.accent,
          color:       nextDisabled ? th.textMuted : '#fff',
          boxShadow:   nextDisabled ? 'none' : '0 2px 10px -2px rgba(232,82,14,0.4)',
          cursor:      nextDisabled ? 'not-allowed' : 'pointer',
          opacity:     nextDisabled ? 0.6 : 1,
          border:      'none',
        }}
      >
        {isLast ? 'Finalizar' : 'Siguiente'}
      </motion.button>
    </div>
  )
}
