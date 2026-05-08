import { motion } from 'framer-motion'
import {
  Network, LayoutDashboard, Database, TrendingUp, Target, Info,
} from 'lucide-react'

const NAV_ITEMS = [
  { id: 'graph',     icon: Network,        label: 'Constelación' },
  { id: 'portfolio', icon: LayoutDashboard, label: 'Dashboard portafolio' },
  { id: 'proxies',   icon: Database,        label: 'Base de proxies' },
  { id: 'bench',     icon: TrendingUp,      label: 'Benchmarks' },
  { id: 'optimize',  icon: Target,          label: 'Optimización' },
]

const btnStyle = (active) => ({
  background: active ? 'rgba(232,82,14,0.08)' : '#FFFFFF',
  border: `1px solid ${active ? 'rgba(232,82,14,0.25)' : '#E5E0DA'}`,
  boxShadow: active
    ? '0 4px 16px -4px rgba(232,82,14,0.2)'
    : '0 2px 8px -4px rgba(0,0,0,0.08)',
  transition: 'background 0.25s, border-color 0.25s, box-shadow 0.25s',
})

function IconBtn({ it, active, onClick, disabled, group = 'nav' }) {
  const Icon = it.icon
  return (
    <motion.button
      onClick={disabled ? undefined : onClick}
      whileHover={disabled ? {} : { scale: 1.08, x: 2 }}
      whileTap={disabled ? {} : { scale: 0.94 }}
      transition={{ type: 'spring', stiffness: 400, damping: 18 }}
      className="group relative w-12 h-12 rounded-2xl flex items-center justify-center"
      style={{ ...btnStyle(active), opacity: disabled ? 0.35 : 1, cursor: disabled ? 'default' : 'pointer' }}
      aria-label={it.label}
    >
      <Icon className="w-[18px] h-[18px]" style={{ color: active ? '#E8520E' : '#666666' }} />
      {active && (
        <motion.span
          layoutId={`sidebar-indicator-${group}`}
          className="absolute -left-2 top-1/2 -translate-y-1/2 w-1 h-6 rounded-full"
          style={{ background: '#E8520E' }}
          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
        />
      )}
      <span
        className="absolute left-[58px] whitespace-nowrap text-xs px-2.5 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-200"
        style={{
          background: '#1A1A1A',
          border: '1px solid #333',
          color: '#FFFFFF',
        }}
      >
        {it.label ?? it.id}
      </span>
    </motion.button>
  )
}

export default function Sidebar({ activeView, setView, extras = [], nodeSelected, nodeInfoActive, onToggleNodeInfo }) {
  return (
    <motion.nav
      initial={{ x: -30, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.6, delay: 0.3 }}
      className="fixed left-4 z-30 flex flex-col justify-center gap-2"
      style={{ top: '72px', bottom: '60px' }}
    >
      {NAV_ITEMS.map((it) => (
        <IconBtn
          key={it.id}
          it={it}
          active={activeView === it.id}
          onClick={() => setView(it.id)}
        />
      ))}

      <div className="my-1 mx-auto w-6 h-px" style={{ background: '#E5E0DA' }} />

      <IconBtn
        it={{ id: 'info', icon: Info, label: nodeSelected ? (nodeInfoActive ? 'Ocultar info' : 'Mostrar info') : 'Selecciona un nodo' }}
        active={nodeSelected && nodeInfoActive}
        onClick={nodeSelected ? onToggleNodeInfo : undefined}
        disabled={!nodeSelected}
        group="info"
      />

      {extras.length > 0 && (
        <div className="my-1 mx-auto w-6 h-px" style={{ background: '#E5E0DA' }} />
      )}

      {extras.map((ex) => (
        <IconBtn
          key={ex.id}
          it={ex}
          active={ex.active}
          onClick={ex.onClick}
        />
      ))}
    </motion.nav>
  )
}
