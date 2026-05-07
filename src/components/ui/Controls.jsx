import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Eye, EyeOff, RotateCcw, ArrowLeft, Layers } from 'lucide-react'
import { ARCHETYPES } from '../../data/projects'
import { portfolioTotals, fmtMXN, sroiColor } from '../../lib/sroi'

// ─── Popover subcomponents ────────────────────────────────────

function IconButton({ icon, active, onClick, tooltip, children }) {
  return (
    <div className="relative group" data-popover-container>
      <motion.button
        onClick={onClick}
        className="w-9 h-9 rounded-xl flex items-center justify-center transition-colors duration-200"
        style={{
          background: active ? '#1A2035' : undefined,
          color: active ? '#E8ECF2' : '#94A3B8',
        }}
        onMouseEnter={(e) => {
          if (!active) e.currentTarget.style.background = '#1A2035'
        }}
        onMouseLeave={(e) => {
          if (!active) e.currentTarget.style.background = ''
        }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        {icon}
      </motion.button>

      {!children && tooltip && (
        <div
          className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2
                     px-2 py-1 rounded-lg
                     text-[11px] whitespace-nowrap
                     pointer-events-none opacity-0 group-hover:opacity-100
                     transition-opacity duration-150 z-50"
          style={{
            background: '#0F1628',
            border: '1px solid #1E293B',
            color: '#E8ECF2',
          }}
        >
          {tooltip}
        </div>
      )}

      <AnimatePresence>{children}</AnimatePresence>
    </div>
  )
}

function Popover({ children }) {
  return (
    <motion.div
      key="popover"
      initial={{ opacity: 0, y: 8, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 8, scale: 0.96 }}
      transition={{ duration: 0.16, ease: 'easeOut' }}
      className="absolute bottom-full mb-3 left-1/2 -translate-x-1/2 min-w-[230px] rounded-2xl overflow-hidden z-50"
      style={{
        background: '#0F1628',
        border: '1px solid #1E293B',
        boxShadow: '0 12px 40px -8px rgba(0,0,0,0.5)',
      }}
    >
      {children}
    </motion.div>
  )
}

function PopoverHeader({ children }) {
  return (
    <div
      className="px-4 py-2.5 text-[11px] uppercase tracking-[0.18em]"
      style={{ borderBottom: '1px solid #1E293B', color: '#8594A8' }}
    >
      {children}
    </div>
  )
}

function PopoverOption({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className="w-full text-left px-4 py-2.5 text-[13px] flex items-center gap-2.5 transition-colors duration-150"
      style={{
        background: active ? '#1A2035' : 'transparent',
        color: active ? '#E8ECF2' : '#94A3B8',
      }}
      onMouseEnter={(e) => {
        if (!active) {
          e.currentTarget.style.background = '#1A2035'
          e.currentTarget.style.color = '#E8ECF2'
        }
      }}
      onMouseLeave={(e) => {
        if (!active) {
          e.currentTarget.style.background = 'transparent'
          e.currentTarget.style.color = '#94A3B8'
        }
      }}
    >
      <span className="w-1.5 h-1.5 flex-shrink-0 flex items-center justify-center">
        {active && (
          <motion.span
            layoutId="activeGroupOption"
            className="block w-1.5 h-1.5 rounded-full bg-emerald-400"
          />
        )}
      </span>
      {children}
    </button>
  )
}

// ─── BottomControls ───────────────────────────────────────────

export function BottomControls({
  projects, open, setOpen,
  showConnections, setShowConnections,
  groupBy, setGroupBy,
  onResetCamera,
}) {
  const [activePopover, setActivePopover] = useState(null)
  const tot = portfolioTotals(projects)

  useEffect(() => {
    if (!activePopover) return
    const close = (e) => {
      if (!e.target.closest('[data-popover-container]')) setActivePopover(null)
    }
    document.addEventListener('mousedown', close)
    return () => document.removeEventListener('mousedown', close)
  }, [activePopover])

  if (!open) return null

  const groupOptions = [
    { key: 'arquetipo', label: 'Por arquetipo', sub: '5 clusters por tipo' },
    { key: 'sroi',      label: 'Por SROI',      sub: 'anillos por categoría' },
    { key: 'inversión', label: 'Por inversión',  sub: 'radial por monto' },
  ]

  return (
    <motion.div
      initial={{ x: '-50%', y: 20, opacity: 0, scale: 0.97 }}
      animate={{ x: '-50%', y: 0, opacity: 1, scale: 1 }}
      exit={{ x: '-50%', y: 20, opacity: 0, scale: 0.97 }}
      transition={{ type: 'spring', stiffness: 320, damping: 26 }}
      className="fixed bottom-6 rounded-2xl p-1 flex items-center gap-0.5 z-20"
      style={{
        left: '50%',
        background: '#111827',
        border: '1px solid #1E293B',
        boxShadow: '0 12px 40px -8px rgba(0,0,0,0.5)',
      }}
    >
      {/* Stats pasivos */}
      <div className="flex items-center gap-2 px-4 py-2 text-[11px] mono select-none">
        <span style={{ color: '#E8ECF2' }}>{tot.count}</span>
        <span style={{ color: '#8594A8' }}>nodos</span>
        <span style={{ color: '#5A6A80' }}>·</span>
        <span style={{ color: '#E8ECF2' }}>{fmtMXN(tot.inv)}</span>
        <span style={{ color: '#5A6A80' }}>·</span>
        <span style={{ color: '#8594A8' }}>SROI</span>
        <span style={{ color: sroiColor(tot.sroi) }}>{tot.sroi.toFixed(2)}x</span>
      </div>

      {/* Divisor */}
      <div className="w-px h-5 mx-1" style={{ background: '#1E293B' }} />

      {/* Iconos */}
      <div className="flex items-center gap-0.5 pr-0.5">
        {/* Agrupar */}
        <IconButton
          icon={<Layers size={15} />}
          active={activePopover === 'group'}
          onClick={() => setActivePopover(activePopover === 'group' ? null : 'group')}
          tooltip="Agrupar nodos"
        >
          {activePopover === 'group' && (
            <Popover>
              <PopoverHeader>Modo de agrupación</PopoverHeader>
              {groupOptions.map(({ key, label, sub }) => (
                <PopoverOption
                  key={key}
                  active={groupBy === key}
                  onClick={() => { setGroupBy(key); setActivePopover(null) }}
                >
                  <span>{label}</span>
                  <span className="ml-auto text-[10px]" style={{ color: '#8594A8' }}>
                    {sub}
                  </span>
                </PopoverOption>
              ))}
            </Popover>
          )}
        </IconButton>

        {/* Conexiones */}
        <IconButton
          icon={showConnections ? <Eye size={15} /> : <EyeOff size={15} />}
          active={showConnections}
          onClick={() => setShowConnections(!showConnections)}
          tooltip={showConnections ? 'Ocultar conexiones' : 'Mostrar conexiones'}
        />

        {/* Reset cámara */}
        <IconButton
          icon={<RotateCcw size={15} />}
          onClick={onResetCamera}
          tooltip="Reset cámara"
        />
      </div>
    </motion.div>
  )
}

// ─── ArchetypeLegend ──────────────────────────────────────────

export function ArchetypeLegend({ open, onClose }) {
  if (!open) return null
  return (
    <motion.div
      initial={{ x: -20, opacity: 0, scale: 0.96 }}
      animate={{ x: 0, opacity: 1, scale: 1 }}
      exit={{ x: -20, opacity: 0, scale: 0.96 }}
      transition={{ type: 'spring', stiffness: 320, damping: 26 }}
      className="fixed z-30 rounded-2xl px-5 py-4 w-[260px]"
      style={{
        left: '76px',
        top: '50%',
        transform: 'translateY(-50%)',
        background: '#111827',
        border: '1px solid #1E293B',
        boxShadow: '0 12px 40px -8px rgba(0,0,0,0.5)',
      }}
    >
      <div className="flex items-center justify-between mb-2.5">
        <div className="text-[11px] mono uppercase tracking-[0.2em]" style={{ color: '#8594A8' }}>
          Arquetipos
        </div>
        <button
          onClick={onClose}
          className="w-5 h-5 rounded flex items-center justify-center hover:bg-[#1A2035]"
          aria-label="Cerrar"
        >
          <span style={{ color: '#94A3B8', fontSize: 12 }}>&#x2715;</span>
        </button>
      </div>
      <div className="space-y-1.5">
        {Object.entries(ARCHETYPES).map(([k, v]) => (
          <div key={k} className="flex items-center gap-2 text-[11px]">
            <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: v.color }} />
            <span className="mono" style={{ color: '#94A3B8' }}>{k}</span>
            <span style={{ color: '#E8ECF2' }}>{v.name}</span>
            <span className="ml-auto mono text-[10px]" style={{ color: '#8594A8' }}>{v.count}</span>
          </div>
        ))}
      </div>
      <div className="mt-3 pt-2.5" style={{ borderTop: '1px solid #1E293B' }}>
        <div className="text-[11px] mono uppercase tracking-[0.2em] mb-1.5" style={{ color: '#8594A8' }}>
          SROI
        </div>
        <div className="flex items-center gap-3 text-[11px] mono" style={{ color: '#94A3B8' }}>
          <span className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: '#10B981' }} />&gt; 2x
          </span>
          <span className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: '#F59E0B' }} />1–2x
          </span>
          <span className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: '#7F1D1D' }} />&lt; 1x
          </span>
        </div>
      </div>
    </motion.div>
  )
}

// ─── BackChip ─────────────────────────────────────────────────

export function BackChip({ onClick }) {
  return (
    <motion.button
      initial={{ x: '-50%', y: -10, opacity: 0 }}
      animate={{ x: '-50%', y: 0, opacity: 1 }}
      exit={{ x: '-50%', y: -10, opacity: 0 }}
      transition={{ type: 'spring', stiffness: 220, damping: 24 }}
      onClick={onClick}
      className="fixed top-4 left-1/2 rounded-2xl px-4 py-2 text-xs flex items-center gap-2 z-30"
      style={{
        background: '#111827',
        border: '1px solid #1E293B',
        boxShadow: '0 8px 24px -8px rgba(0,0,0,0.4)',
        color: '#E8ECF2',
      }}
    >
      <ArrowLeft className="w-3.5 h-3.5" />
      Volver al portafolio
    </motion.button>
  )
}
