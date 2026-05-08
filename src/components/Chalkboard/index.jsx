import { useState, useRef, useMemo, useCallback, useEffect } from 'react'
import { motion } from 'framer-motion'
import { ARCHETYPES } from '../../data/projects'
import { sroiColor } from '../../lib/sroi'

const ARC_KEYS = ['A', 'B', 'C', 'D', 'E']
const CANVAS_W = 2200
const CANVAS_H = 1200
const ROOT = { x: CANVAS_W / 2, y: 70 }
const ARC_Y = 250
const PROJ_CENTER = 720
const PROJ_GAP = 110

const arcX = (i) => 220 + i * (CANVAS_W - 440) / 4

function projY(idx, total) {
  if (total === 1) return PROJ_CENTER
  const span = PROJ_GAP * (total - 1)
  return PROJ_CENTER - span / 2 + idx * PROJ_GAP
}

const POSTIT_COLORS = {
  A: { bg: '#DBEAFE', border: '#93C5FD', text: '#1E40AF' },
  B: { bg: '#FFEDD5', border: '#FDBA74', text: '#9A3412' },
  C: { bg: '#D1FAE5', border: '#6EE7B7', text: '#065F46' },
  D: { bg: '#ECFCCB', border: '#BEF264', text: '#3F6212' },
  E: { bg: '#FFE4E6', border: '#FDA4AF', text: '#9F1239' },
}

function seededRandom(seed) {
  const x = Math.sin(seed * 127.1 + 311.7) * 43758.5453
  return x - Math.floor(x)
}

function sketchyPath(x1, y1, x2, y2, seed) {
  const dx = x2 - x1
  const dy = y2 - y1
  const len = Math.sqrt(dx * dx + dy * dy)
  const nx = -dy / len
  const ny = dx / len
  const wobble = Math.min(len * 0.08, 12)
  const r1 = (seededRandom(seed) - 0.5) * wobble
  const r2 = (seededRandom(seed + 1) - 0.5) * wobble
  const cx1 = x1 + dx * 0.33 + nx * r1
  const cy1 = y1 + dy * 0.33 + ny * r1
  const cx2 = x1 + dx * 0.66 + nx * r2
  const cy2 = y1 + dy * 0.66 + ny * r2
  return `M${x1},${y1} C${cx1},${cy1} ${cx2},${cy2} ${x2},${y2}`
}

function postitRotation(id) {
  const s = id.charCodeAt(1) * 7 + id.charCodeAt(2) * 13
  return (seededRandom(s) - 0.5) * 4
}

export default function Chalkboard({ projects, selectedId, onSelect, onDeselect }) {
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const viewRef = useRef()
  const dragging = useRef(false)
  const last = useRef({ x: 0, y: 0 })

  const groups = useMemo(() => {
    const g = {}
    ARC_KEYS.forEach((k) => { g[k] = [] })
    projects.forEach((p) => { if (g[p.archetype]) g[p.archetype].push(p) })
    return g
  }, [projects])

  const arcPos = useMemo(() => ARC_KEYS.map((_, i) => arcX(i)), [])

  const handleClick = useCallback((id) => {
    if (selectedId === id) onDeselect()
    else onSelect(id)
  }, [selectedId, onSelect, onDeselect])

  useEffect(() => {
    const el = viewRef.current
    if (!el) return
    const onWheel = (e) => {
      e.preventDefault()
      setZoom((z) => Math.min(2.5, Math.max(0.35, z * (e.deltaY > 0 ? 0.92 : 1.08))))
    }
    const onPointerDown = (e) => {
      if (e.target.closest('button')) return
      dragging.current = true
      last.current = { x: e.clientX, y: e.clientY }
      el.setPointerCapture(e.pointerId)
    }
    const onPointerMove = (e) => {
      if (!dragging.current) return
      const dx = e.clientX - last.current.x
      const dy = e.clientY - last.current.y
      last.current = { x: e.clientX, y: e.clientY }
      setPan((p) => ({ x: p.x + dx, y: p.y + dy }))
    }
    const onPointerUp = () => { dragging.current = false }

    el.addEventListener('wheel', onWheel, { passive: false })
    el.addEventListener('pointerdown', onPointerDown)
    el.addEventListener('pointermove', onPointerMove)
    el.addEventListener('pointerup', onPointerUp)
    return () => {
      el.removeEventListener('wheel', onWheel)
      el.removeEventListener('pointerdown', onPointerDown)
      el.removeEventListener('pointermove', onPointerMove)
      el.removeEventListener('pointerup', onPointerUp)
    }
  }, [])

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
      className="absolute inset-0"
    >
    <div
      ref={viewRef}
      className="absolute inset-0 overflow-hidden org-viewport"
      style={{ background: '#F8F6F3' }}
    >
      <div style={{
        position: 'absolute', left: '50%', top: '50%',
        width: CANVAS_W, height: CANVAS_H,
        transform: `translate(calc(-50% + ${pan.x}px), calc(-50% + ${pan.y}px)) scale(${zoom})`,
        transformOrigin: '50% 50%',
      }}>
        {/* Hand-drawn connections */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none">
          <defs>
            <filter id="pencil">
              <feTurbulence type="turbulence" baseFrequency="0.03" numOctaves="4" result="noise" seed="2" />
              <feDisplacementMap in="SourceGraphic" in2="noise" scale="1.5" />
            </filter>
          </defs>
          {ARC_KEYS.map((k, i) => (
            <path key={`r-${k}`}
              d={sketchyPath(ROOT.x, ROOT.y + 40, arcPos[i], ARC_Y - 28, i * 100)}
              stroke="#C0B8AE"
              strokeWidth="2.5"
              strokeLinecap="round"
              fill="none"
              opacity="0.5"
              filter="url(#pencil)"
            />
          ))}
          {ARC_KEYS.map((k, ai) =>
            groups[k].map((p, pi) => (
              <path key={`a-${p.id}`}
                d={sketchyPath(arcPos[ai], ARC_Y + 30, arcPos[ai], projY(pi, groups[k].length) - 32, ai * 1000 + pi * 10)}
                stroke={ARCHETYPES[k].color}
                strokeWidth="2"
                strokeLinecap="round"
                fill="none"
                opacity="0.3"
                filter="url(#pencil)"
              />
            ))
          )}
        </svg>

        {/* Root node */}
        <div className="org-node" style={{ left: ROOT.x, top: ROOT.y }}>
          <div style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
            padding: '16px 32px',
            background: '#FFFFFF',
            border: '2px solid #E8520E',
            borderRadius: 14,
            boxShadow: '3px 4px 0 rgba(232,82,14,0.15)',
          }}>
            <span className="text-[14px] font-semibold" style={{ color: '#1A1A1A' }}>Portafolio RSC</span>
            <span className="text-[11px] font-medium" style={{ color: '#E8520E' }}>XIGNUX · {projects.length} proyectos</span>
          </div>
        </div>

        {/* Archetype nodes — banner style, non-clickable */}
        {ARC_KEYS.map((k, i) => {
          const arcColor = ARCHETYPES[k].color
          return (
            <div key={k} className="org-node" style={{ left: arcPos[i], top: ARC_Y }}>
              <div style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '14px 24px',
                background: '#FFFFFF',
                borderLeft: `4px solid ${arcColor}`,
                borderRadius: '12px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                whiteSpace: 'nowrap',
                minWidth: 200,
              }}>
                <div style={{
                  width: 36, height: 36, borderRadius: '50%',
                  background: arcColor, opacity: 0.15,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0,
                  position: 'relative',
                }}>
                  <div style={{
                    width: 14, height: 14, borderRadius: '50%',
                    background: arcColor,
                    position: 'absolute',
                  }} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <span className="text-[13px] font-semibold" style={{ color: '#1A1A1A' }}>{ARCHETYPES[k].name}</span>
                  <span className="mono text-[11px] font-medium" style={{ color: '#999999' }}>{groups[k].length} proyectos</span>
                </div>
              </div>
            </div>
          )
        })}

        {/* Project post-its */}
        {ARC_KEYS.map((k, ai) =>
          groups[k].map((p, pi) => {
            const y = projY(pi, groups[k].length)
            const sel = selectedId === p.id
            const col = sroiColor(p.sroi)
            const pc = POSTIT_COLORS[k]
            const rot = postitRotation(p.id)
            return (
              <div key={p.id} className="org-node" style={{ left: arcPos[ai], top: y }}>
                <button
                  onClick={() => handleClick(p.id)}
                  className="postit-node"
                  style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
                    padding: '14px 20px',
                    background: sel ? '#FFF3E0' : pc.bg,
                    border: `2px solid ${sel ? '#E8520E' : pc.border}`,
                    borderRadius: 4,
                    cursor: 'pointer',
                    textAlign: 'center',
                    minWidth: 155,
                    position: 'relative',
                    transform: `rotate(${sel ? 0 : rot}deg)`,
                    boxShadow: sel
                      ? '4px 5px 0 rgba(232,82,14,0.2), 0 8px 20px -6px rgba(232,82,14,0.15)'
                      : '3px 4px 0 rgba(0,0,0,0.08)',
                    transition: 'transform 0.2s, box-shadow 0.2s, background 0.2s, border-color 0.2s',
                  }}
                >
                  <span style={{
                    fontSize: 12, fontWeight: 600, color: sel ? '#1A1A1A' : pc.text,
                    maxWidth: 130, overflow: 'hidden', textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap', lineHeight: 1.3,
                  }}>{p.name}</span>
                  <span className="mono" style={{
                    fontSize: 13, fontWeight: 700, color: col,
                  }}>{p.sroi.toFixed(2)}x</span>
                  <span style={{
                    position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)',
                    fontSize: 14, color: sel ? '#E8520E' : pc.border, fontWeight: 300,
                  }}>›</span>
                </button>
              </div>
            )
          })
        )}
      </div>
    </div>
    </motion.div>
  )
}
