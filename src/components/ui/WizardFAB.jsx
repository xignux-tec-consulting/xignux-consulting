import { motion, AnimatePresence } from 'framer-motion'
import { Plus } from 'lucide-react'
import { useTheme } from '../../lib/theme'

export default function WizardFAB({ onClick, visible }) {
  const { th } = useTheme()

  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          key="wizard-fab"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{ type: 'spring', stiffness: 300, damping: 24 }}
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.95 }}
          onClick={onClick}
          className="fixed left-5 bottom-5 md:left-[88px] z-[60] w-14 h-14 rounded-full flex items-center justify-center group"
          style={{
            background: th.accent,
            boxShadow: '0 8px 32px -4px rgba(232,82,14,0.4)',
            outline: `2px solid ${th.cardBorder}`,
          }}
          aria-label="Crear nuevo análisis SROI"
        >
          <Plus className="w-6 h-6 text-white" />

          {/* Tooltip — CSS group-hover only, no framer-motion needed */}
          <span
            className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 whitespace-nowrap
                       text-[11px] px-3 py-1 rounded-lg pointer-events-none
                       opacity-0 group-hover:opacity-100 transition-opacity duration-150"
            style={{
              background: th.cardBg,
              border: `1px solid ${th.cardBorder}`,
              color: th.textPrimary,
              boxShadow: th.shadow,
            }}
          >
            Crear nuevo análisis SROI
          </span>
        </motion.button>
      )}
    </AnimatePresence>
  )
}
