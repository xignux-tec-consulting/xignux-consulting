import { motion } from 'framer-motion'
import { Network, LayoutList, Info, Layers } from 'lucide-react'

const glassBtn = (active) => ({
  backdropFilter: 'blur(20px)',
  WebkitBackdropFilter: 'blur(20px)',
  background: active ? 'rgba(46,117,182,0.28)' : 'rgba(255,255,255,0.04)',
  border: `1px solid ${active ? 'rgba(46,117,182,0.55)' : 'rgba(255,255,255,0.08)'}`,
  boxShadow: active
    ? '0 8px 32px -10px rgba(46,117,182,0.45)'
    : '0 4px 16px -8px rgba(0,0,0,0.4)',
  transition: 'background 0.2s, border-color 0.2s, box-shadow 0.2s',
})

function IconBtn({ icon: Icon, label, active, onClick, disabled }) {
  return (
    <motion.button
      onClick={disabled ? undefined : onClick}
      whileHover={disabled ? {} : { scale: 1.08, x: 2 }}
      whileTap={disabled ? {} : { scale: 0.94 }}
      transition={{ type: 'spring', stiffness: 400, damping: 18 }}
      className="group relative w-11 h-11 rounded-2xl flex items-center justify-center"
      style={{ ...glassBtn(active), opacity: disabled ? 0.35 : 1, cursor: disabled ? 'default' : 'pointer' }}
      aria-label={label}
    >
      <Icon
        className="w-[18px] h-[18px]"
        style={{ color: active ? '#F5F7FA' : 'rgba(255,255,255,0.5)' }}
      />
      {active && (
        <motion.span
          layoutId="sidebar-active-pill"
          className="absolute -left-2.5 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-full"
          style={{ background: '#5B9BD5' }}
          transition={{ type: 'spring', stiffness: 420, damping: 30 }}
        />
      )}
      {!disabled && (
        <span
          className="absolute left-[52px] whitespace-nowrap text-xs px-2.5 py-1.5 rounded-lg
                     opacity-0 group-hover:opacity-100 pointer-events-none
                     transition-opacity duration-150 z-50"
          style={{
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            background: 'rgba(8,12,24,0.9)',
            border: '1px solid rgba(255,255,255,0.1)',
            color: 'rgba(255,255,255,0.92)',
            letterSpacing: '-0.01em',
          }}
        >
          {label}
        </span>
      )}
    </motion.button>
  )
}

export default function Sidebar({
  activeView, onChangeView,
  nodeSelected, nodeInfoActive, onToggleNodeInfo,
  legendOpen, onToggleLegend,
}) {
  return (
    <>
      {/* Logo flotante — sin caja */}
      <motion.div
        initial={{ opacity: 0, x: -12 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="fixed left-4 top-4 z-40"
      >
        <img
          src="/logo.png"
          alt="XIGNUX"
          style={{ height: '28px', width: 'auto', objectFit: 'contain', opacity: 0.95 }}
        />
      </motion.div>

      {/* Nav centrado verticalmente */}
      <motion.nav
        initial={{ x: -24, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="fixed left-4 top-[44%] -translate-y-1/2 z-40 flex flex-col gap-2"
      >
        <IconBtn
          icon={Network}
          label="Explorar"
          active={activeView === 'graph'}
          onClick={() => onChangeView('graph')}
        />
        <IconBtn
          icon={LayoutList}
          label="Decidir"
          active={activeView === 'portfolio'}
          onClick={() => onChangeView('portfolio')}
        />

        <div className="mx-auto w-5 h-px my-1" style={{ background: 'rgba(255,255,255,0.1)' }} />

        <IconBtn
          icon={Info}
          label={nodeSelected ? (nodeInfoActive ? 'Ocultar info' : 'Mostrar info') : 'Selecciona un nodo'}
          active={nodeSelected && nodeInfoActive}
          onClick={onToggleNodeInfo}
        />
        <IconBtn
          icon={Layers}
          label={legendOpen ? 'Ocultar leyenda' : 'Leyenda'}
          active={legendOpen}
          onClick={onToggleLegend}
        />
      </motion.nav>
    </>
  )
}
