import { motion } from 'framer-motion'
import { X, ChevronRight } from 'lucide-react'
import { ARCHETYPES } from '../../data/projects'
import { fmtMXN, fmtMXNFull, sroiColor } from '../../lib/sroi'

function MiniBar({ value, max, color, label }) {
  return (
    <div>
      <div className="flex justify-between text-[11px] mb-1" style={{ color: '#94A3B8' }}>
        <span>{label}</span>
        <span className="mono" style={{ color: '#F5F7FA' }}>{Math.round(value * 100)}%</span>
      </div>
      <div className="h-1.5 rounded-full overflow-hidden" style={{ background: '#1F2937' }}>
        <div className="h-full rounded-full" style={{ width: `${(value / max) * 100}%`, background: color }} />
      </div>
    </div>
  )
}

export default function NodePanel({ project, projects, anchor, onClose, onJumpTo, onOpenDashboard }) {
  if (!project) return null

  const PANEL_W = 380
  const MARGIN = 16
  const HEADER_H = 72
  const vw = typeof window !== 'undefined' ? window.innerWidth : 1440
  const panelLeft = vw - PANEL_W - MARGIN
  const panelTop = HEADER_H

  const arch = ARCHETYPES[project.archetype]
  const benchmark = arch.benchmarkMid
  const diag =
    project.sroi >= benchmark * 0.85 && project.sroi <= benchmark * 1.4
      ? { label: 'EN RANGO', color: '#10B981' }
      : project.sroi < benchmark * 0.85
      ? { label: 'MUY BAJO', color: '#EF4444' }
      : { label: 'POR VERIFICAR', color: '#F59E0B' }
  const peers = projects.filter((p) => p.archetype === project.archetype && p.id !== project.id)
  const totalGross = project.outcomes.reduce((a, o) => a + o.gross, 0)

  return (
    <>
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 8 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="fixed rounded-3xl overflow-hidden flex flex-col z-40"
        style={{
          left: `${panelLeft}px`,
          top: `${panelTop}px`,
          width: `${PANEL_W}px`,
          maxHeight: 'calc(100vh - 88px)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          background: 'rgba(19,25,41,0.55)',
          border: '1px solid rgba(255,255,255,0.08)',
          boxShadow: '0 24px 60px -20px rgba(0,0,0,0.6)',
        }}
      >
        <div className="p-5 border-b hairline">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="text-[10px] mono px-2 py-1 rounded" style={{ background: arch.color + '33', color: arch.color, border: `1px solid ${arch.color}55` }}>
                {project.id} · ARQ {project.archetype}
              </span>
              <span className="text-[10px] mono px-2 py-1 rounded" style={{ background: sroiColor(project.sroi) + '22', color: sroiColor(project.sroi), border: `1px solid ${sroiColor(project.sroi)}55` }}>
                {project.category}
              </span>
            </div>
            <button onClick={onClose} className="w-7 h-7 rounded-md flex items-center justify-center hover:bg-white/5" aria-label="Cerrar">
              <X className="w-4 h-4" style={{ color: '#94A3B8' }} />
            </button>
          </div>
          <h2 className="text-lg font-semibold leading-tight pr-2">{project.name}</h2>
          <div className="text-xs mt-1.5" style={{ color: '#94A3B8' }}>
            {fmtMXNFull(project.investment)} · SROI{' '}
            <span className="mono" style={{ color: sroiColor(project.sroi) }}>{project.sroi.toFixed(2)}x</span>{' '}
            · {arch.name}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          <div className="grid grid-cols-3 gap-2">
            {[
              { label: 'Valor bruto',    val: fmtMXN(project.vBruto) },
              { label: 'Valor ajustado', val: fmtMXN(project.vAjustado) },
              { label: 'Beneficiarios',  val: project.direct_beneficiaries.toLocaleString('es-MX') },
            ].map((k) => (
              <div key={k.label} className="rounded-lg p-3" style={{ background: '#1a2236', border: '1px solid #1F2937' }}>
                <div className="text-[10px] uppercase tracking-wider" style={{ color: '#94A3B8' }}>{k.label}</div>
                <div className="text-base font-semibold mt-1 mono">{k.val}</div>
              </div>
            ))}
          </div>

          <div>
            <div className="text-xs font-semibold mb-2 tracking-wide" style={{ color: '#94A3B8' }}>OUTCOMES</div>
            <div className="space-y-2">
              {project.outcomes.map((o, i) => (
                <div key={i} className="rounded-lg p-3" style={{ background: '#1a2236', border: '1px solid #1F2937' }}>
                  <div className="text-sm">{o.description}</div>
                  <div className="text-[11px] mono mt-1" style={{ color: '#94A3B8' }}>
                    {o.qty.toLocaleString('es-MX')} × {fmtMXN(o.proxy)} = {fmtMXN(o.gross)}
                  </div>
                  <div className="h-1 rounded-full mt-2 overflow-hidden" style={{ background: '#0A0E1A' }}>
                    <div className="h-full" style={{ width: `${(o.gross / totalGross) * 100}%`, background: 'linear-gradient(90deg,#2E75B6,#5B9BD5)' }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <div className="text-xs font-semibold mb-3 tracking-wide" style={{ color: '#94A3B8' }}>AJUSTES SROI</div>
            <div className="space-y-3">
              <MiniBar label="Deadweight"   value={project.adjustments.dw} max={1} color="#EF4444" />
              <MiniBar label="Attribution"  value={project.adjustments.at} max={1} color="#F59E0B" />
              <MiniBar label="Displacement" value={project.adjustments.dp} max={1} color="#5B9BD5" />
              <MiniBar label="Drop-off"     value={project.adjustments.dr} max={1} color="#ED7D31" />
            </div>
          </div>

          <div className="rounded-lg p-4" style={{ background: '#1a2236', border: '1px solid #1F2937' }}>
            <div className="flex justify-between items-start mb-2">
              <div>
                <div className="text-[10px] uppercase tracking-wider" style={{ color: '#94A3B8' }}>Benchmark sectorial</div>
                <div className="text-sm font-semibold mono mt-0.5">{benchmark.toFixed(2)}x · Arquetipo {project.archetype}</div>
              </div>
              <span className="text-[10px] mono px-2 py-1 rounded" style={{ background: diag.color + '22', color: diag.color, border: `1px solid ${diag.color}55` }}>
                {diag.label}
              </span>
            </div>
            <div className="relative h-1.5 rounded-full mt-3" style={{ background: '#0A0E1A' }}>
              <div className="absolute top-0 h-full rounded-full" style={{ left: 0, width: `${Math.min(100, (project.sroi / 4) * 100)}%`, background: sroiColor(project.sroi) }} />
              <div className="absolute -top-1 w-px h-3.5" style={{ left: `${(benchmark / 4) * 100}%`, background: '#F5F7FA' }} />
            </div>
            <div className="flex justify-between text-[10px] mono mt-1" style={{ color: '#94A3B8' }}>
              <span>0x</span><span>2x</span><span>4x</span>
            </div>
          </div>

          <div>
            <div className="text-xs font-semibold mb-2 tracking-wide" style={{ color: '#94A3B8' }}>STAKEHOLDERS</div>
            <div className="flex flex-wrap gap-1.5">
              {project.stakeholders.map((s) => (
                <span key={s} className="text-[11px] px-2 py-1 rounded-md" style={{ background: '#1a2236', border: '1px solid #1F2937', color: '#F5F7FA' }}>
                  {s}
                </span>
              ))}
            </div>
          </div>

          {peers.length > 0 && (
            <div>
              <div className="text-xs font-semibold mb-2 tracking-wide" style={{ color: '#94A3B8' }}>CONEXIONES (mismo arquetipo)</div>
              <div className="space-y-1">
                {peers.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => onJumpTo(p.id)}
                    className="w-full flex items-center justify-between p-2 rounded-md hover:bg-white/5 transition text-left"
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full" style={{ background: sroiColor(p.sroi) }} />
                      <span className="text-xs">{p.id} · {p.name.length > 24 ? p.name.slice(0, 23) + '…' : p.name}</span>
                    </div>
                    <span className="text-[10px] mono" style={{ color: sroiColor(p.sroi) }}>{p.sroi.toFixed(2)}x</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="p-3 border-t hairline">
          <button
            onClick={onOpenDashboard}
            className="w-full py-2.5 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition"
            style={{ background: '#2E75B6', color: '#fff' }}
          >
            Ver dashboard completo
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </motion.div>
    </>
  )
}
