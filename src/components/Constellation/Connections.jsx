import { useRef, useMemo, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import { Line } from '@react-three/drei'
import * as THREE from 'three'
import { ARCHETYPES } from '../../data/projects'

export default function ConnectionsLayer({ projects, positions, showConnections, selectedId, groupBy }) {
  const lines = useMemo(() => {
    if (!showConnections) return []
    const result = []
    const topIds = new Set(
      [...projects].sort((a, b) => b.sroi - a.sroi).slice(0, 3).map((p) => p.id)
    )

    const byArch = {}
    projects.forEach((p, i) => {
      ;(byArch[p.archetype] = byArch[p.archetype] || []).push(i)
    })
    const degree = new Array(projects.length).fill(0)

    Object.entries(byArch).forEach(([arch, idxs]) => {
      const sorted = idxs
        .map((i) => ({ i, sroi: projects[i].sroi }))
        .sort((a, b) => b.sroi - a.sroi)
      for (let a = 0; a < sorted.length; a++) {
        for (let b = a + 1; b < sorted.length; b++) {
          const i = sorted[a].i, j = sorted[b].i
          if (degree[i] >= 4 || degree[j] >= 4) continue
          const pa = projects[i], pb = projects[j]
          const isTop = topIds.has(pa.id) && topIds.has(pb.id)
          result.push({
            from: positions[i], to: positions[j],
            opacity: isTop ? 0.45 : 0.25,
            width: isTop ? 1.2 : 0.8,
            archColor: ARCHETYPES[arch]?.color || '#C0B8AE',
            ids: [pa.id, pb.id],
            key: `${pa.id}-${pb.id}`,
          })
          degree[i]++; degree[j]++
        }
      }
    })

    ;[...projects]
      .map((p, i) => ({ p, i }))
      .sort((a, b) => b.p.sroi - a.p.sroi)
      .slice(0, 3)
      .forEach(({ p, i }) => {
        result.push({
          from: positions[i], to: [0, 0, 0],
          opacity: 0.35, width: 1.0,
          archColor: '#E8520E',
          ids: [p.id, '__origin'],
          key: `origin-${p.id}`,
        })
      })

    return result
  }, [projects, positions, showConnections])

  // Fade refs — no state, updated imperatively in useFrame
  const lineRefs = useRef([])
  const globalOpacity = useRef(1)
  const targetOpacity = useRef(1)
  const prevGroupBy = useRef(groupBy)

  useEffect(() => {
    if (prevGroupBy.current === groupBy) return
    prevGroupBy.current = groupBy
    targetOpacity.current = 0
    const t = setTimeout(() => { targetOpacity.current = 1 }, 650)
    return () => clearTimeout(t)
  }, [groupBy])

  useFrame((_, delta) => {
    globalOpacity.current = THREE.MathUtils.lerp(
      globalOpacity.current,
      targetOpacity.current,
      Math.min(1, delta * 5)
    )
    const g = globalOpacity.current
    lineRefs.current.forEach((lr, i) => {
      if (!lr || !lines[i]) return
      if (lr.material) {
        const involved = selectedId && lines[i].ids.includes(selectedId)
        const base = involved ? 0.8 : lines[i].opacity
        lr.material.opacity = base * g
      }
    })
  })

  // Reset ref array each render so stale entries don't linger
  lineRefs.current = []

  return (
    <>
      {lines.map((l, i) => {
        const involved = selectedId && l.ids.includes(selectedId)
        return (
          <Line
            key={l.key}
            ref={(el) => { lineRefs.current[i] = el }}
            points={[l.from, l.to]}
            color={involved ? '#E8520E' : l.archColor || '#C0B8AE'}
            lineWidth={involved ? 2.0 : l.width || 0.8}
            transparent
            opacity={involved ? 0.85 : l.opacity || 0.25}
            toneMapped={false}
          />
        )
      })}
    </>
  )
}
