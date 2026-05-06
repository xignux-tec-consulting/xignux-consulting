import { useMemo } from 'react'
import { Line } from '@react-three/drei'

export default function ConnectionsLayer({ projects, positions, showConnections, selectedId }) {
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

    Object.values(byArch).forEach((idxs) => {
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
            opacity: isTop ? 0.28 : 0.16,
            width: isTop ? 0.7 : 0.5,
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
          opacity: 0.22, width: 0.6,
          ids: [p.id, '__origin'],
          key: `origin-${p.id}`,
        })
      })

    return result
  }, [projects, positions, showConnections])

  return (
    <>
      {lines.map((l) => {
        const involved = selectedId && l.ids.includes(selectedId)
        return (
          <Line
            key={l.key}
            points={[l.from, l.to]}
            color={involved ? '#FFFFFF' : '#CBD5E1'}
            lineWidth={involved ? 1.6 : l.width || 0.6}
            transparent
            opacity={involved ? 0.8 : l.opacity || 0.2}
            toneMapped={false}
          />
        )
      })}
    </>
  )
}
