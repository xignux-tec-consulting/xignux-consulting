import { motion } from 'framer-motion'
import { Network, Database, TrendingUp, Target, LayoutList, Sun, Moon } from 'lucide-react'
import { portfolioTotals, fmtMXN, sroiColor } from '../../lib/sroi'
import { useTheme } from '../../lib/theme'

export const NAV_ITEMS = [
  { id: 'graph',     label: 'Explorar',     Icon: Network },
  { id: 'proxies',   label: 'Proxies',      Icon: Database },
  { id: 'bench',     label: 'Benchmarks',   Icon: TrendingUp },
  { id: 'optimize',  label: 'Optimizar',    Icon: Target },
  { id: 'portfolio', label: 'Portafolio',   Icon: LayoutList },
]

function StatChip({ label, value, color, th }) {
  return (
    <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg"
      style={{ background: th.accentSoft, border: `1px solid ${th.accentBorder}` }}>
      <span className="text-[11px] uppercase tracking-wider font-medium"
        style={{ color: th.accent }}>{label}</span>
      <span className="text-[12px] mono font-semibold"
        style={{ color: color || th.textPrimary }}>{value}</span>
    </div>
  )
}

export default function Header({ projects, activeView, onChangeView, viewMode, onChangeViewMode }) {
  const { dark, toggle, th } = useTheme()
  const { inv, sroi, count } = portfolioTotals(projects)

  return (
    <motion.header
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="fixed top-0 left-0 right-0 z-50 pointer-events-auto"
    >
      <div
        className="h-14 px-6 flex items-center"
        style={{
          background: th.headerBg,
          borderBottom: `1px solid ${th.headerBorder}`,
          boxShadow: th.headerShadow,
        }}
      >
        {/* Left: Logo + Brand */}
        <div className="flex items-center gap-3.5 min-w-0 flex-shrink-0">
          <img
            src="/logo.png"
            alt="XIGNUX"
            className="flex-shrink-0"
            style={{
              height: 20,
              width: 'auto',
              objectFit: 'contain',
              filter: dark
                ? 'brightness(0) saturate(100%) invert(100%)'
                : 'brightness(0) saturate(100%) invert(27%) sepia(95%) saturate(4000%) hue-rotate(11deg) brightness(95%) contrast(100%)',
            }}
          />

          <div className="w-px h-6 flex-shrink-0" style={{ background: th.headerBorder }} />

          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-[14px] font-semibold tracking-tight" style={{ color: th.textPrimary }}>
                Impact Lens
              </span>
              <span className="text-[10px] mono px-1.5 py-0.5 rounded font-medium"
                style={{ background: th.accentSoft, color: th.accent, border: `1px solid ${th.accentBorder}` }}>
                BETA
              </span>
            </div>
            <span className="text-[11px] -mt-0.5 tracking-wide font-medium" style={{ color: th.accent }}>
              Portafolio RSC
            </span>
          </div>
        </div>

        <div className="flex-1" />

        {/* Right: Stats + View toggle + Dark mode + Avatar */}
        <div className="flex items-center gap-2.5 flex-shrink-0">
          {activeView === 'graph' && (
            <div
              className="flex items-center gap-0.5 p-0.5 rounded-full"
              style={{ background: th.pillBg, border: `1px solid ${th.pillBorder}` }}
            >
              {['3d', '2d'].map((m) => {
                const active = viewMode === m
                return (
                  <motion.button
                    key={m}
                    onClick={() => onChangeViewMode(m)}
                    className="relative px-3 py-1 rounded-full text-[11px] font-semibold mono"
                    style={{ color: active ? '#fff' : th.textMuted }}
                    whileTap={{ scale: 0.96 }}
                  >
                    {active && (
                      <motion.div
                        layoutId="header-dim-pill"
                        className="absolute inset-0 rounded-full"
                        style={{ background: th.accent, boxShadow: '0 2px 10px -2px rgba(232,82,14,0.4)' }}
                        transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                      />
                    )}
                    <span className="relative z-10">{m.toUpperCase()}</span>
                  </motion.button>
                )
              })}
            </div>
          )}

          <div className="w-px h-6" style={{ background: th.headerBorder }} />

          <div className="hidden lg:flex items-center gap-2">
            <StatChip label="Proyectos" value={count} th={th} />
            <StatChip label="Inversión" value={fmtMXN(inv)} th={th} />
            <StatChip label="SROI" value={sroi.toFixed(2) + 'x'} color={sroiColor(sroi)} th={th} />
          </div>

          <div className="lg:hidden flex items-center gap-2">
            <StatChip label="SROI" value={sroi.toFixed(2) + 'x'} color={sroiColor(sroi)} th={th} />
          </div>

          <div className="w-px h-6" style={{ background: th.headerBorder }} />

          <button
            onClick={toggle}
            className="w-9 h-9 rounded-xl flex items-center justify-center transition"
            style={{ color: th.textSecondary }}
          >
            {dark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          <motion.div
            whileHover={{ scale: 1.05 }}
            className="w-9 h-9 rounded-xl flex items-center justify-center text-[11px] font-semibold cursor-pointer"
            style={{
              background: th.accent,
              color: '#fff',
              boxShadow: '0 2px 8px -2px rgba(232,82,14,0.4)',
            }}
          >
            MR
          </motion.div>
        </div>
      </div>
    </motion.header>
  )
}

export function Sidebar({ activeView, onChangeView }) {
  const { th } = useTheme()

  return (
    <motion.nav
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, delay: 0.15 }}
      className="fixed left-0 top-14 bottom-0 z-40 flex flex-col items-center py-4 gap-1"
      style={{
        width: 64,
        background: th.headerBg,
        borderRight: `1px solid ${th.headerBorder}`,
      }}
    >
      {NAV_ITEMS.map(({ id, label, Icon }) => {
        const active = activeView === id
        return (
          <motion.button
            key={id}
            onClick={() => onChangeView(id)}
            className="relative w-12 h-12 rounded-xl flex flex-col items-center justify-center gap-0.5 transition-colors"
            style={{ color: active ? th.accent : th.textMuted }}
            whileTap={{ scale: 0.93 }}
          >
            {active && (
              <motion.div
                layoutId="sidebar-active-bg"
                className="absolute inset-0 rounded-xl"
                style={{ background: th.accentSoft, border: `1px solid ${th.accentBorder}` }}
                transition={{ type: 'spring', stiffness: 380, damping: 32 }}
              />
            )}
            <Icon className="w-4 h-4 relative z-10" />
            <span className="text-[9px] font-medium relative z-10 leading-none">{label}</span>
          </motion.button>
        )
      })}
    </motion.nav>
  )
}
