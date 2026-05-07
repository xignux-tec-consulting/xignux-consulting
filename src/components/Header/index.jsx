import { motion } from 'framer-motion'
import { Network, LayoutList, Zap } from 'lucide-react'
import { portfolioTotals, fmtMXN, sroiColor } from '../../lib/sroi'

function StatChip({ label, value, color, th }) {
  return (
    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg"
      style={{ background: '#111827', border: '1px solid #1E293B' }}>
      <span className="text-[11px] uppercase tracking-wider" style={{ color: th.muted }}>{label}</span>
      <span className="text-[11px] mono font-semibold" style={{ color: color || th.text }}>{value}</span>
    </div>
  )
}

export default function Header({ projects, activeView, onChangeView }) {
  const { inv, sroi, count } = portfolioTotals(projects)

  const th = {
    text: '#E8ECF2',
    secondary: '#94A3B8',
    muted: '#8594A8',
  }

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
          background: 'rgba(10, 14, 26, 0.96)',
          borderBottom: '1px solid #1E293B',
        }}
      >
        {/* ── Left: Logo + Brand ── */}
        <div className="flex items-center gap-3.5 min-w-0">
          <div className="flex items-center gap-2.5 px-2 py-1 rounded-xl">
            <img
              src="/logo.png"
              alt="XIGNUX"
              className="flex-shrink-0"
              style={{ height: 18, width: 'auto', objectFit: 'contain', opacity: 0.9 }}
            />
          </div>

          <div className="w-px h-7 flex-shrink-0" style={{ background: '#1E293B' }} />

          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-[13px] font-semibold tracking-tight" style={{ color: th.text }}>
                Impact Lens
              </span>
              <span className="text-[10px] mono px-1.5 py-0.5 rounded font-medium"
                style={{ background: 'rgba(46,117,182,0.15)', color: '#5B9BD5', letterSpacing: '0.05em' }}>
                BETA
              </span>
            </div>
            <span className="text-[11px] -mt-0.5 tracking-wide" style={{ color: th.muted }}>
              Portafolio RSC
            </span>
          </div>
        </div>

        {/* ── Center: Mode Toggle ── */}
        <div className="flex-1 flex justify-center">
          <div
            className="flex items-center gap-0.5 p-1 rounded-full"
            style={{
              background: '#111827',
              border: '1px solid #1E293B',
            }}
          >
            {[
              { id: 'graph',     label: 'Explorar', Icon: Network },
              { id: 'portfolio', label: 'Decidir',  Icon: LayoutList },
            ].map(({ id, label, Icon }) => {
              const active = activeView === id
              return (
                <motion.button
                  key={id}
                  onClick={() => onChangeView(id)}
                  className="flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-medium relative"
                  style={{ color: active ? '#E8ECF2' : '#8594A8' }}
                  whileTap={{ scale: 0.96 }}
                >
                  {active && (
                    <motion.div
                      layoutId="header-view-pill"
                      className="absolute inset-0 rounded-full"
                      style={{
                        background: 'rgba(46,117,182,0.35)',
                        border: '1px solid rgba(46,117,182,0.45)',
                        boxShadow: '0 2px 8px -2px rgba(46,117,182,0.3)',
                      }}
                      transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                    />
                  )}
                  <Icon className="w-3.5 h-3.5 relative z-10" />
                  <span className="relative z-10">{label}</span>
                </motion.button>
              )
            })}
          </div>
        </div>

        {/* ── Right: Live Stats + Avatar ── */}
        <div className="flex items-center gap-2.5">
          <div className="hidden xl:flex items-center gap-2">
            <StatChip label="Proyectos" value={count} th={th} />
            <StatChip label="Inversión" value={fmtMXN(inv)} th={th} />
            <StatChip label="SROI" value={sroi.toFixed(2) + 'x'} color={sroiColor(sroi)} th={th} />
          </div>

          <div className="xl:hidden flex items-center gap-2">
            <StatChip label="SROI" value={sroi.toFixed(2) + 'x'} color={sroiColor(sroi)} th={th} />
          </div>

          <div className="w-px h-7" style={{ background: '#1E293B' }} />

          <motion.div
            whileHover={{ scale: 1.05 }}
            className="w-9 h-9 rounded-xl flex items-center justify-center text-[11px] font-semibold cursor-pointer"
            style={{
              background: 'rgba(46,117,182,0.2)',
              border: '1px solid rgba(46,117,182,0.35)',
              color: '#5B9BD5',
            }}
          >
            MR
          </motion.div>
        </div>
      </div>
    </motion.header>
  )
}
