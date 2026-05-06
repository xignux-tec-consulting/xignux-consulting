import { motion } from 'framer-motion'
import { Eye, EyeOff, RotateCcw, X, ArrowLeft, Layers } from 'lucide-react'
import { ARCHETYPES } from '../../data/projects'
import { portfolioTotals, fmtMXN, sroiColor } from '../../lib/sroi'

export function BottomControls({ projects, open, setOpen, showConnections, setShowConnections, groupBy, setGroupBy, onResetCamera }) {
  const tot = portfolioTotals(projects)
  if (!open) return null
  return (
    <motion.div
      initial={{ x: '-50%', y: 20, opacity: 0, scale: 0.96 }}
      animate={{ x: '-50%', y: 0, opacity: 1, scale: 1 }}
      exit={{ x: '-50%', y: 20, opacity: 0, scale: 0.96 }}
      transition={{ type: 'spring', stiffness: 320, damping: 26 }}
      className="fixed bottom-6 rounded-2xl p-1.5 flex items-center gap-1 z-20"
      style={{
        left: '50%',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        background: 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(255,255,255,0.08)',
        boxShadow: '0 16px 48px -12px rgba(0,0,0,0.6)',
      }}
    >
      <div className="flex items-center gap-2 px-4 py-2 text-[11px] mono" style={{ color: 'rgba(255,255,255,0.7)' }}>
        <span style={{ color: '#F5F7FA' }}>{tot.count}</span>
        <span>nodos</span>
        <span style={{ color: 'rgba(255,255,255,0.2)' }}>·</span>
        <span style={{ color: '#F5F7FA' }}>{fmtMXN(tot.inv)}</span>
        <span style={{ color: 'rgba(255,255,255,0.2)' }}>·</span>
        <span>SROI</span>
        <span className="mono" style={{ color: sroiColor(tot.sroi) }}>{tot.sroi.toFixed(2)}x</span>
      </div>

      <div className="w-px h-6" style={{ background: 'rgba(255,255,255,0.1)' }} />

      <div className="flex items-center gap-1 p-1">
        <span className="text-[10px] uppercase tracking-wider px-2" style={{ color: 'rgba(255,255,255,0.4)' }}>Agrupar</span>
        {['arquetipo', 'sroi', 'inversión'].map((g) => (
          <button
            key={g}
            onClick={() => setGroupBy(g)}
            className="text-[11px] px-3 py-1.5 rounded-lg transition-all duration-200"
            style={{
              background: groupBy === g ? 'rgba(255,255,255,0.1)' : 'transparent',
              color: groupBy === g ? '#F5F7FA' : 'rgba(255,255,255,0.5)',
            }}
          >
            {g}
          </button>
        ))}
      </div>

      <div className="w-px h-6" style={{ background: 'rgba(255,255,255,0.1)' }} />

      <div className="flex items-center gap-1">
        <button
          onClick={() => setShowConnections(!showConnections)}
          className="text-[11px] px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all duration-200"
          style={{
            background: showConnections ? 'rgba(255,255,255,0.08)' : 'transparent',
            color: showConnections ? '#F5F7FA' : 'rgba(255,255,255,0.7)',
          }}
        >
          {showConnections ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
          Conexiones
        </button>

        <button
          onClick={onResetCamera}
          className="text-[11px] px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all duration-200 hover:bg-white/5"
          style={{ color: 'rgba(255,255,255,0.7)' }}
        >
          <RotateCcw className="w-3 h-3" />
          Reset
        </button>

        <button
          onClick={() => setOpen(false)}
          className="text-[11px] px-2 py-1.5 rounded-lg flex items-center justify-center transition-all duration-200 hover:bg-white/5"
          style={{ color: 'rgba(255,255,255,0.5)' }}
          aria-label="Cerrar"
        >
          <X className="w-3 h-3" />
        </button>
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
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        background: 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(255,255,255,0.08)',
        boxShadow: '0 16px 48px -12px rgba(0,0,0,0.6)',
      }}
    >
      <div className="flex items-center justify-between mb-2.5">
        <div className="text-[9px] mono uppercase tracking-[0.2em]" style={{ color: 'rgba(255,255,255,0.4)' }}>Arquetipos</div>
        <button onClick={onClose} className="w-5 h-5 rounded flex items-center justify-center hover:bg-white/5" aria-label="Cerrar">
          <X className="w-3 h-3" style={{ color: 'rgba(255,255,255,0.5)' }} />
        </button>
      </div>
      <div className="space-y-1.5">
        {Object.entries(ARCHETYPES).map(([k, v]) => (
          <div key={k} className="flex items-center gap-2 text-[11px]">
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: v.color }} />
            <span className="mono" style={{ color: 'rgba(255,255,255,0.5)' }}>{k}</span>
            <span style={{ color: 'rgba(255,255,255,0.92)' }}>{v.name}</span>
            <span className="ml-auto mono text-[10px]" style={{ color: 'rgba(255,255,255,0.35)' }}>{v.count}</span>
          </div>
        ))}
      </div>
      <div className="mt-3 pt-2.5" style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
        <div className="text-[9px] mono uppercase tracking-[0.2em] mb-1.5" style={{ color: 'rgba(255,255,255,0.4)' }}>SROI</div>
        <div className="flex items-center gap-3 text-[10px] mono" style={{ color: 'rgba(255,255,255,0.7)' }}>
          <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full" style={{ background: '#10B981' }} />&gt; 2x</span>
          <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full" style={{ background: '#F59E0B' }} />1–2x</span>
          <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full" style={{ background: '#EF4444' }} />&lt; 1x</span>
        </div>
      </div>
    </motion.div>
  )
}

export function BackChip({ onClick }) {
  return (
    <motion.button
      initial={{ y: -10, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: -10, opacity: 0 }}
      transition={{ type: 'spring', stiffness: 220, damping: 24 }}
      onClick={onClick}
      className="fixed top-4 left-1/2 -translate-x-1/2 rounded-2xl px-4 py-2 text-xs flex items-center gap-2 z-30"
      style={{
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        background: 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(255,255,255,0.08)',
        boxShadow: '0 12px 40px -10px rgba(0,0,0,0.5)',
        color: 'rgba(255,255,255,0.85)',
      }}
    >
      <ArrowLeft className="w-3.5 h-3.5" />
      Volver al portafolio
    </motion.button>
  )
}
