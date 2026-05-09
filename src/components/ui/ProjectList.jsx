import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { ARCHETYPES } from '../../data/projects'
import { sroiColor, fmtMXN } from '../../lib/sroi'
import { useTheme } from '../../lib/theme'

export default function ProjectList({ projects, selectedId, onSelect }) {
  const { th } = useTheme()
  const [open, setOpen] = useState(false)

  const sorted = useMemo(() => [...projects].sort((a, b) => b.sroi - a.sroi), [projects])

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.25 }}
      className="absolute z-20 md:left-[84px] left-3"
      style={{ top: 120 }}
    >
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium transition-all"
        style={{
          background: th.cardBg,
          border: `1px solid ${th.cardBorder}`,
          color: th.textPrimary,
          backdropFilter: 'blur(12px)',
          boxShadow: th.shadow,
        }}
      >
        <span className="w-2 h-2 rounded-full" style={{ background: th.accent }} />
        {projects.length} Proyectos
        {open ? <ChevronUp className="w-3.5 h-3.5" style={{ color: th.textMuted }} /> : <ChevronDown className="w-3.5 h-3.5" style={{ color: th.textMuted }} />}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0, y: -8 }}
            animate={{ opacity: 1, height: 'auto', y: 4 }}
            exit={{ opacity: 0, height: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden rounded-xl"
            style={{
              background: th.cardBg,
              border: `1px solid ${th.cardBorder}`,
              backdropFilter: 'blur(16px)',
              boxShadow: th.shadow,
              maxHeight: 'calc(100vh - 220px)',
            }}
          >
            <div className="overflow-y-auto" style={{ maxHeight: 'calc(100vh - 220px)' }}>
              {sorted.map((p) => {
                const active = selectedId === p.id
                const arch = ARCHETYPES[p.archetype]
                return (
                  <button
                    key={p.id}
                    onClick={() => onSelect(p.id)}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-left transition-all hover:bg-[rgba(232,82,14,0.06)]"
                    style={{
                      background: active ? 'rgba(232,82,14,0.1)' : 'transparent',
                      borderBottom: `1px solid ${th.tableBorder}`,
                      minWidth: 220,
                    }}
                  >
                    <span
                      className="w-2 h-2 rounded-full flex-shrink-0"
                      style={{ background: arch?.color || '#888' }}
                    />
                    <span className="mono text-[10px] flex-shrink-0" style={{ color: th.textMuted, width: 24 }}>
                      {p.id}
                    </span>
                    <span
                      className="text-[11px] font-medium truncate flex-1"
                      style={{ color: active ? th.accent : th.textPrimary, maxWidth: 140 }}
                    >
                      {p.name}
                    </span>
                    <span
                      className="mono text-[11px] font-semibold flex-shrink-0"
                      style={{ color: sroiColor(p.sroi) }}
                    >
                      {p.sroi.toFixed(2)}x
                    </span>
                  </button>
                )
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
