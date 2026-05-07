import { motion } from 'framer-motion'
import { Network, LayoutList } from 'lucide-react'
import { portfolioTotals, fmtMXN, sroiColor } from '../../lib/sroi'

function StatChip({ label, value, color }) {
  return (
    <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg"
      style={{ background: 'rgba(46,117,182,0.08)', border: '1px solid rgba(46,117,182,0.18)' }}>
      <span className="text-[11px] uppercase tracking-wider font-medium"
        style={{ color: '#5B9BD5' }}>{label}</span>
      <span className="text-[12px] mono font-semibold"
        style={{ color: color || '#E8ECF2' }}>{value}</span>
    </div>
  )
}

export default function Header({ projects, activeView, onChangeView }) {
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
          background: 'linear-gradient(90deg, rgba(10,14,26,0.97) 0%, rgba(14,20,36,0.97) 50%, rgba(10,14,26,0.97) 100%)',
          borderBottom: '1px solid rgba(46,117,182,0.15)',
        }}
      >
        {/* ── Left: Logo + Brand ── */}
        <div className="flex items-center gap-3.5 min-w-0">
          <img
            src="/logo.png"
            alt="XIGNUX"
            className="flex-shrink-0"
            style={{ height: 20, width: 'auto', objectFit: 'contain' }}
          />

          <div className="w-px h-6 flex-shrink-0" style={{ background: 'rgba(46,117,182,0.25)' }} />

          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-[14px] font-semibold tracking-tight" style={{ color: '#E8ECF2' }}>
                Impact Lens
              </span>
              <span className="text-[10px] mono px-1.5 py-0.5 rounded font-medium"
                style={{ background: 'rgba(46,117,182,0.18)', color: '#5B9BD5', border: '1px solid rgba(46,117,182,0.3)' }}>
                BETA
              </span>
            </div>
            <span className="text-[11px] -mt-0.5 tracking-wide font-medium" style={{ color: '#5B9BD5' }}>
              Portafolio RSC
            </span>
          </div>
        </div>

        {/* ── Center: Mode Toggle ── */}
        <div className="flex-1 flex justify-center">
          <div
            className="flex items-center gap-0.5 p-1 rounded-full"
            style={{
              background: 'rgba(46,117,182,0.06)',
              border: '1px solid rgba(46,117,182,0.15)',
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
                  style={{ color: active ? '#fff' : '#5B9BD5' }}
                  whileTap={{ scale: 0.96 }}
                >
                  {active && (
                    <motion.div
                      layoutId="header-view-pill"
                      className="absolute inset-0 rounded-full"
                      style={{
                        background: '#2E75B6',
                        boxShadow: '0 2px 12px -2px rgba(46,117,182,0.5)',
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

        {/* ── Right: Stats + Avatar ── */}
        <div className="flex items-center gap-2.5">
          <div className="hidden xl:flex items-center gap-2">
            <StatChip label="Proyectos" value={count} />
            <StatChip label="Inversión" value={fmtMXN(inv)} />
            <StatChip label="SROI" value={sroi.toFixed(2) + 'x'} color={sroiColor(sroi)} />
          </div>

          <div className="xl:hidden flex items-center gap-2">
            <StatChip label="SROI" value={sroi.toFixed(2) + 'x'} color={sroiColor(sroi)} />
          </div>

          <div className="w-px h-6" style={{ background: 'rgba(46,117,182,0.25)' }} />

          <motion.div
            whileHover={{ scale: 1.05 }}
            className="w-9 h-9 rounded-xl flex items-center justify-center text-[11px] font-semibold cursor-pointer"
            style={{
              background: '#2E75B6',
              color: '#fff',
              boxShadow: '0 2px 8px -2px rgba(46,117,182,0.5)',
            }}
          >
            MR
          </motion.div>
        </div>
      </div>

      {/* ── Accent line ── */}
      <div className="h-px" style={{
        background: 'linear-gradient(90deg, transparent 10%, #2E75B6 40%, #5B9BD5 50%, #2E75B6 60%, transparent 90%)',
        opacity: 0.4,
      }} />
    </motion.header>
  )
}
