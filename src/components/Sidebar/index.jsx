import { motion, AnimatePresence } from 'framer-motion'
import {
  Network, LayoutDashboard, Database, TrendingUp, Target, Settings, Sparkles,
  ChevronRight, ChevronLeft, Sun, Moon,
} from 'lucide-react'

const NAV_ITEMS = [
  { id: 'graph',     icon: Network,        label: 'Constelación' },
  { id: 'portfolio', icon: LayoutDashboard, label: 'Dashboard portafolio' },
  { id: 'proxies',   icon: Database,        label: 'Base de proxies' },
  { id: 'bench',     icon: TrendingUp,      label: 'Benchmarks' },
  { id: 'optimize',  icon: Target,          label: 'Optimización' },
  { id: 'settings',  icon: Settings,        label: 'Configuración' },
]

function glassBtn(active, isLight) {
  return {
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    background: active
      ? (isLight ? 'rgba(46,117,182,0.15)' : 'rgba(255,255,255,0.12)')
      : (isLight ? 'rgba(255,255,255,0.6)' : 'rgba(255,255,255,0.04)'),
    border: `1px solid ${active
      ? (isLight ? 'rgba(46,117,182,0.4)' : 'rgba(255,255,255,0.22)')
      : (isLight ? 'rgba(0,0,0,0.09)' : 'rgba(255,255,255,0.08)')}`,
    boxShadow: active
      ? '0 12px 40px -10px rgba(46,117,182,0.35)'
      : (isLight ? '0 4px 16px -6px rgba(0,0,0,0.12)' : '0 8px 24px -10px rgba(0,0,0,0.4)'),
    transition: 'background 0.25s, border-color 0.25s, box-shadow 0.25s',
  }
}

function IconBtn({ it, active, onClick, collapsed, isLight }) {
  const Icon = it.icon
  const iconColor = active
    ? (isLight ? '#1D5A96' : '#F5F7FA')
    : (isLight ? '#475569' : 'rgba(255,255,255,0.6)')

  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.05, x: collapsed ? 2 : 0 }}
      whileTap={{ scale: 0.94 }}
      transition={{ type: 'spring', stiffness: 400, damping: 18 }}
      className="group relative flex items-center gap-3 rounded-2xl"
      style={{
        ...glassBtn(active, isLight),
        width: collapsed ? 48 : '100%',
        height: 48,
        padding: collapsed ? '0' : '0 14px',
        justifyContent: collapsed ? 'center' : 'flex-start',
        flexShrink: 0,
      }}
    >
      <Icon className="w-[18px] h-[18px] shrink-0" style={{ color: iconColor }} />

      <AnimatePresence initial={false}>
        {!collapsed && (
          <motion.span
            initial={{ opacity: 0, width: 0 }}
            animate={{ opacity: 1, width: 'auto' }}
            exit={{ opacity: 0, width: 0 }}
            transition={{ duration: 0.2 }}
            className="text-xs font-medium whitespace-nowrap overflow-hidden"
            style={{ color: iconColor }}
          >
            {it.label ?? it.id}
          </motion.span>
        )}
      </AnimatePresence>

      {active && (
        <motion.span
          layoutId="sidebarActiveIndicator"
          className="absolute -left-2 top-1/2 -translate-y-1/2 w-1 h-6 rounded-full"
          style={{ background: isLight ? '#2E75B6' : '#F5F7FA' }}
          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
        />
      )}

      {/* Tooltip solo cuando está colapsado */}
      {collapsed && (
        <span
          className="absolute left-[58px] whitespace-nowrap text-xs px-2.5 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-200 z-50"
          style={{
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            background: isLight ? 'rgba(240,244,250,0.95)' : 'rgba(0,0,0,0.6)',
            border: `1px solid ${isLight ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.1)'}`,
            color: isLight ? '#0F172A' : 'rgba(255,255,255,0.92)',
            boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
          }}
        >
          {it.label ?? it.id}
        </span>
      )}
    </motion.button>
  )
}

export default function Sidebar({
  activeView, setView,
  extras = [],
  collapsed, setCollapsed,
  darkMode, setDarkMode,
}) {
  const isLight = !darkMode

  const sidebarW = collapsed ? 64 : 200

  return (
    <>
      {/* Sidebar panel — posicionado en el flujo (no fixed) */}
      <motion.aside
        animate={{ width: sidebarW }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="relative flex flex-col z-30 shrink-0"
        style={{
          height: '100%',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          background: isLight ? 'rgba(240,244,250,0.85)' : 'rgba(10,14,26,0.7)',
          borderRight: `1px solid ${isLight ? 'rgba(0,0,0,0.08)' : 'rgba(255,255,255,0.06)'}`,
        }}
      >
        {/* Logo / Brand */}
        <motion.div
          className="flex items-center gap-2.5 px-3 pt-4 pb-3"
          style={{ height: 64, flexShrink: 0 }}
        >
          <div
            className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0"
            style={glassBtn(false, isLight)}
          >
            <Sparkles className="w-5 h-5" style={{ color: '#5B9BD5' }} />
          </div>
          <AnimatePresence initial={false}>
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -8 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <p className="text-[13px] font-semibold leading-tight whitespace-nowrap" style={{ color: isLight ? '#0F172A' : '#F5F7FA' }}>
                  Impact Lens
                </p>
                <p className="text-[10px] whitespace-nowrap" style={{ color: isLight ? '#475569' : '#64748b' }}>
                  XIGNUX RSC
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Divider */}
        <div className="mx-3 mb-3" style={{ height: 1, background: isLight ? 'rgba(0,0,0,0.07)' : 'rgba(255,255,255,0.06)' }} />

        {/* Nav items */}
        <nav className="flex flex-col gap-1.5 px-3 flex-1 overflow-y-auto overflow-x-hidden">
          {NAV_ITEMS.map((it) => (
            <IconBtn
              key={it.id}
              it={it}
              active={activeView === it.id}
              onClick={() => setView(it.id)}
              collapsed={collapsed}
              isLight={isLight}
            />
          ))}

          {extras.length > 0 && (
            <div className="my-1" style={{ height: 1, background: isLight ? 'rgba(0,0,0,0.07)' : 'rgba(255,255,255,0.08)' }} />
          )}

          {extras.map((ex) => (
            <IconBtn
              key={ex.id}
              it={ex}
              active={ex.active}
              onClick={ex.onClick}
              collapsed={collapsed}
              isLight={isLight}
            />
          ))}
        </nav>

        {/* Bottom: dark/light toggle + avatar */}
        <div className="flex flex-col gap-2 px-3 pb-4 pt-2">
          <div className="flex items-center justify-between gap-2">
            {/* Theme toggle */}
            <motion.button
              onClick={() => setDarkMode(!darkMode)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.94 }}
              className="flex items-center gap-2 rounded-xl px-2"
              style={{
                ...glassBtn(false, isLight),
                height: 36,
                flexShrink: 0,
                width: collapsed ? 40 : '100%',
                justifyContent: collapsed ? 'center' : 'flex-start',
              }}
              title={darkMode ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
            >
              {darkMode
                ? <Sun className="w-4 h-4 shrink-0" style={{ color: '#F59E0B' }} />
                : <Moon className="w-4 h-4 shrink-0" style={{ color: '#5B9BD5' }} />
              }
              <AnimatePresence initial={false}>
                {!collapsed && (
                  <motion.span
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: 'auto' }}
                    exit={{ opacity: 0, width: 0 }}
                    transition={{ duration: 0.2 }}
                    className="text-xs whitespace-nowrap overflow-hidden"
                    style={{ color: isLight ? '#475569' : 'rgba(255,255,255,0.7)' }}
                  >
                    {darkMode ? 'Modo claro' : 'Modo oscuro'}
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>
          </div>

          {/* Avatar */}
          <motion.div
            className="flex items-center gap-2.5 rounded-2xl px-2"
            style={{
              ...glassBtn(false, isLight),
              height: 44,
              flexShrink: 0,
              overflow: 'hidden',
            }}
          >
            <div
              className="w-7 h-7 rounded-xl flex items-center justify-center text-xs font-semibold shrink-0"
              style={{
                background: 'linear-gradient(135deg, #2E75B6, #5B9BD5)',
                color: '#fff',
              }}
            >
              MR
            </div>
            <AnimatePresence initial={false}>
              {!collapsed && (
                <motion.div
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: 'auto' }}
                  exit={{ opacity: 0, width: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <p className="text-xs font-medium whitespace-nowrap" style={{ color: isLight ? '#0F172A' : '#F5F7FA' }}>
                    Equipo RSC
                  </p>
                  <p className="text-[10px] whitespace-nowrap" style={{ color: isLight ? '#64748b' : '#64748b' }}>
                    XIGNUX
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>

        {/* Collapse toggle button */}
        <motion.button
          onClick={() => setCollapsed(!collapsed)}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.92 }}
          className="absolute -right-3.5 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full flex items-center justify-center z-40"
          style={{
            background: isLight ? '#E8EEF8' : '#1a2035',
            border: `1px solid ${isLight ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.12)'}`,
            boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
          }}
        >
          {collapsed
            ? <ChevronRight className="w-3.5 h-3.5" style={{ color: isLight ? '#475569' : '#94A3B8' }} />
            : <ChevronLeft className="w-3.5 h-3.5" style={{ color: isLight ? '#475569' : '#94A3B8' }} />
          }
        </motion.button>
      </motion.aside>
    </>
  )
}
