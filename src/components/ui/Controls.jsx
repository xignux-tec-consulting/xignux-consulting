import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Eye, EyeOff, RotateCcw, ArrowLeft, Layers } from 'lucide-react'
import { ARCHETYPES } from '../../data/projects'
import { portfolioTotals, fmtMXN, sroiColor } from '../../lib/sroi'

function IconButton({ icon, active, onClick, tooltip, children }) {
  return (
    <div className="relative group" data-popover-container>
      <motion.button
        onClick={onClick}
        className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors duration-200 ${
          active ? 'bg-black/[0.06]' : 'hover:bg-black/[0.04]'
        }`}
        style={{ color: active ? '#E8520E' : '#666666' }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        {icon}
      </motion.button>

      {!children && tooltip && (
        <div
          className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2
                     px-2 py-1 rounded-lg
                     text-[10px] whitespace-nowrap
                     pointer-events-none opacity-0 group-hover:opacity-100
                     transition-opacity duration-150 z-50"
          style={{
            background: '#1A1A1A',
            color: '#FFFFFF',
            border: '1px solid #333',
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
        background: '#FFFFFF',
        border: '1px solid #E5E0DA',
        boxShadow: '0 20px 60px -12px rgba(0,0,0,0.15)',
      }}
    >
      {children}
    </motion.div>
  )
}

function PopoverHeader({ children }) {
  return (
    <div
      className="px-4 py-2.5 text-[10px] uppercase tracking-[0.18em]"
      style={{ color: '#999999', borderBottom: '1px solid #E5E0DA' }}
    >
      {children}
    </div>
  )
}

function PopoverOption({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left px-4 py-2.5 text-[13px] flex items-center gap-2.5 transition-colors duration-150 ${
        active ? 'bg-black/[0.03]' : 'hover:bg-black/[0.02]'
      }`}
      style={{ color: active ? '#1A1A1A' : '#666666' }}
    >
      <span className="w-1.5 h-1.5 flex-shrink-0 flex items-center justify-center">
        {active && (
          <motion.span
            layoutId="activeGroupOption"
            className="block w-1.5 h-1.5 rounded-full"
            style={{ background: '#E8520E' }}
          />
        )}
      </span>
      {children}
    </button>
  )
}

export function GroupByPills({ groupBy, setGroupBy }) {
  const options = [
    { key: 'sroi',      label: 'SROI' },
    { key: 'arquetipo', label: 'Arquetipo' },
    { key: 'inversion', label: 'Inversión' },
  ]

  return (
    <motion.div
      initial={{ y: -12, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: -12, opacity: 0 }}
      transition={{ type: 'spring', stiffness: 320, damping: 26 }}
      className="fixed z-20 flex items-center gap-0.5 p-1 rounded-full"
      style={{
        top: '72px',
        left: '76px',
        background: 'rgba(255,255,255,0.95)',
        border: '1px solid #E5E0DA',
        boxShadow: '0 2px 12px -4px rgba(0,0,0,0.08)',
      }}
    >
      {options.map(({ key, label }) => {
        const active = groupBy === key
        return (
          <motion.button
            key={key}
            onClick={() => setGroupBy(key)}
            className="relative px-4 py-1.5 rounded-full text-[12px] font-medium"
            style={{ color: active ? '#fff' : '#666666' }}
            whileTap={{ scale: 0.96 }}
          >
            {active && (
              <motion.div
                layoutId="groupby-pill"
                className="absolute inset-0 rounded-full"
                style={{
                  background: '#E8520E',
                  boxShadow: '0 2px 10px -2px rgba(232,82,14,0.4)',
                }}
                transition={{ type: 'spring', stiffness: 380, damping: 32 }}
              />
            )}
            <span className="relative z-10">{label}</span>
          </motion.button>
        )
      })}
    </motion.div>
  )
}

export function BottomControls({
  projects, open, setOpen,
  showConnections, setShowConnections,
  onResetCamera,
}) {
  const tot = portfolioTotals(projects)

  if (!open) return null

  return (
    <motion.div
      initial={{ x: '-50%', y: 20, opacity: 0, scale: 0.97 }}
      animate={{ x: '-50%', y: 0, opacity: 1, scale: 1 }}
      exit={{ x: '-50%', y: 20, opacity: 0, scale: 0.97 }}
      transition={{ type: 'spring', stiffness: 320, damping: 26 }}
      className="fixed bottom-6 rounded-2xl p-1 flex items-center gap-0.5 z-20"
      style={{
        left: '50%',
        background: 'rgba(255,255,255,0.95)',
        border: '1px solid #E5E0DA',
        boxShadow: '0 8px 32px -8px rgba(0,0,0,0.12)',
      }}
    >
      <div className="flex items-center gap-2 px-4 py-2 text-[11px] mono select-none">
        <span style={{ color: '#1A1A1A' }}>{tot.count}</span>
        <span style={{ color: '#999999' }}>nodos</span>
        <span style={{ color: '#E5E0DA' }}>&middot;</span>
        <span style={{ color: '#1A1A1A' }}>{fmtMXN(tot.inv)}</span>
        <span style={{ color: '#E5E0DA' }}>&middot;</span>
        <span style={{ color: '#999999' }}>SROI</span>
        <span style={{ color: sroiColor(tot.sroi) }}>{tot.sroi.toFixed(2)}x</span>
      </div>

      <div className="w-px h-5 mx-1" style={{ background: '#E5E0DA' }} />

      <div className="flex items-center gap-0.5 pr-0.5">
        <IconButton
          icon={showConnections ? <Eye size={15} /> : <EyeOff size={15} />}
          active={showConnections}
          onClick={() => setShowConnections(!showConnections)}
          tooltip={showConnections ? 'Ocultar conexiones' : 'Mostrar conexiones'}
        />

        <IconButton
          icon={<RotateCcw size={15} />}
          onClick={onResetCamera}
          tooltip="Reset camara"
        />
      </div>
    </motion.div>
  )
}

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
        background: '#FFFFFF',
        border: '1px solid #E5E0DA',
        boxShadow: '0 16px 48px -12px rgba(0,0,0,0.12)',
      }}
    >
      <div className="flex items-center justify-between mb-2.5">
        <div className="text-[10px] mono uppercase tracking-[0.2em]" style={{ color: '#999999' }}>
          Arquetipos
        </div>
        <button
          onClick={onClose}
          className="w-5 h-5 rounded flex items-center justify-center hover:bg-black/5"
          aria-label="Cerrar"
        >
          <span style={{ color: '#999999', fontSize: 12 }}>&times;</span>
        </button>
      </div>
      <div className="space-y-1.5">
        {Object.entries(ARCHETYPES).map(([k, v]) => (
          <div key={k} className="flex items-center gap-2 text-[11px]">
            <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: v.color }} />
            <span className="mono" style={{ color: '#999999' }}>{k}</span>
            <span style={{ color: '#1A1A1A' }}>{v.name}</span>
            <span className="ml-auto mono text-[10px]" style={{ color: '#999999' }}>{v.count}</span>
          </div>
        ))}
      </div>
      <div className="mt-3 pt-2.5" style={{ borderTop: '1px solid #E5E0DA' }}>
        <div className="text-[10px] mono uppercase tracking-[0.2em] mb-1.5" style={{ color: '#999999' }}>
          SROI
        </div>
        <div className="flex items-center gap-3 text-[10px] mono" style={{ color: '#666666' }}>
          <span className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: '#10B981' }} />&gt; 2x
          </span>
          <span className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: '#F59E0B' }} />1-2x
          </span>
          <span className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: '#7F1D1D' }} />&lt; 1x
          </span>
        </div>
      </div>
    </motion.div>
  )
}

export function BackChip({ onClick }) {
  return (
    <motion.button
      initial={{ x: -8, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: -8, opacity: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 26 }}
      onClick={onClick}
      className="fixed rounded-xl flex items-center justify-center z-40"
      style={{
        top: '76px',
        left: '72px',
        width: 36,
        height: 36,
        background: '#FFFFFF',
        border: '1px solid #E5E0DA',
        color: '#666666',
        boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
      }}
      whileHover={{ scale: 1.08, background: '#F8F6F3' }}
      whileTap={{ scale: 0.94 }}
      aria-label="Volver al portafolio"
    >
      <ArrowLeft className="w-4 h-4" />
    </motion.button>
  )
}
