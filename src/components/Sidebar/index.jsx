import { motion } from 'framer-motion'
import {
  Network, LayoutDashboard, Database, TrendingUp, Target, Settings,
} from 'lucide-react'

const NAV_ITEMS = [
  { id: 'graph',     icon: Network,        label: 'Constelación' },
  { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard portafolio' },
  { id: 'proxies',   icon: Database,        label: 'Base de proxies' },
  { id: 'bench',     icon: TrendingUp,      label: 'Benchmarks' },
  { id: 'optimize',  icon: Target,          label: 'Optimización' },
  { id: 'settings',  icon: Settings,        label: 'Configuración' },
]

const glassBtn = (active) => ({
  background: active ? '#1A2035' : '#111827',
  border: `1px solid ${active ? '#2E75B6' : '#1E293B'}`,
  boxShadow: active
    ? '0 4px 16px -4px rgba(46,117,182,0.25)'
    : '0 4px 12px -4px rgba(0,0,0,0.3)',
  transition: 'background 0.25s, border-color 0.25s, box-shadow 0.25s',
})

function IconBtn({ it, active, onClick }) {
  const Icon = it.icon
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.08, x: 2 }}
      whileTap={{ scale: 0.94 }}
      transition={{ type: 'spring', stiffness: 400, damping: 18 }}
      className="group relative w-12 h-12 rounded-2xl flex items-center justify-center"
      style={glassBtn(active)}
    >
      <Icon className="w-[18px] h-[18px]" style={{ color: active ? '#E8ECF2' : '#94A3B8' }} />
      {active && (
        <motion.span
          layoutId="sidebarActiveIndicator"
          className="absolute -left-2 top-1/2 -translate-y-1/2 w-1 h-6 rounded-full"
          style={{ background: '#E8ECF2' }}
          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
        />
      )}
      <span
        className="absolute left-[58px] whitespace-nowrap text-xs px-2.5 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-200"
        style={{
          background: '#111827',
          border: '1px solid #1E293B',
          color: '#E8ECF2',
        }}
      >
        {it.label ?? it.id}
      </span>
    </motion.button>
  )
}

export default function Sidebar({ activeView, setView, extras = [] }) {
  return (
    <motion.nav
      initial={{ x: -30, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.6, delay: 0.3 }}
      className="fixed left-4 z-30 flex flex-col gap-2"
      style={{ top: '50%', transform: 'translateY(-50%)' }}
    >
      {NAV_ITEMS.map((it) => (
        <IconBtn
          key={it.id}
          it={it}
          active={activeView === it.id}
          onClick={() => setView(it.id)}
        />
      ))}

      {extras.length > 0 && (
        <div className="my-1 mx-auto w-6 h-px" style={{ background: '#1E293B' }} />
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
