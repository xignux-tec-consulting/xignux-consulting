import { motion } from 'framer-motion'
import { useTheme } from '../../../lib/theme'

export default function TabBar({ tabs, activeTab, onChange }) {
  const { th } = useTheme()
  return (
    <div
      className="flex items-center px-6 border-b"
      style={{ borderColor: th.cardBorder }}
    >
      {tabs.map(({ id, label }) => {
        const active = activeTab === id
        return (
          <button
            key={id}
            onClick={() => onChange(id)}
            className="relative py-3 mr-5 text-[12px] font-medium transition-colors whitespace-nowrap"
            style={{ color: active ? th.accent : th.textMuted }}
          >
            {label}
            {active && (
              <motion.div
                layoutId="tab-underline"
                className="absolute left-0 right-0 h-0.5"
                style={{ background: th.accent, bottom: -1 }}
                transition={{ type: 'spring', stiffness: 380, damping: 30 }}
              />
            )}
          </button>
        )
      })}
    </div>
  )
}
