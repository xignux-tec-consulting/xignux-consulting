import * as THREE from 'three'
import { ARCHETYPES } from '../../data/projects'

// Stable seed from project id — no Math.random(), same result every call
const seed = (p) => (p.id.charCodeAt(1) * 13 + p.id.charCodeAt(2) * 7) % 100
const seed2 = (p) => (p.id.charCodeAt(1) * 7 + p.id.charCodeAt(2) * 17) % 100

export const projectPosition = (p) => {
  let R
  if (p.sroi > 2) R = 1.2
  else if (p.sroi >= 1) R = 2.5
  else R = 4

  const archIdx = 'ABCDE'.indexOf(p.archetype)
  const sliceCenter = (archIdx / 5) * Math.PI * 2
  const s = seed(p)
  const theta = sliceCenter + ((s / 100) - 0.5) * 0.9
  const phi = Math.PI * (0.25 + ((s * 1.7) % 100) / 100 * 0.5)

  return [
    R * Math.sin(phi) * Math.cos(theta),
    R * Math.cos(phi) * 0.85,
    R * Math.sin(phi) * Math.sin(theta),
  ]
}

// Positions for all modes — deterministic (seed only from project id)
const ARC_CENTERS = {
  A: { angle: 0,              R: 4.5 },
  B: { angle: Math.PI * 0.4,  R: 4.5 },
  C: { angle: Math.PI * 0.8,  R: 4.5 },
  D: { angle: Math.PI * 1.2,  R: 4.5 },
  E: { angle: Math.PI * 1.6,  R: 4.5 },
}

export const computePositions = (projects, groupBy) => {
  if (groupBy === 'arquetipo') {
    const idxByArch = {}
    const countByArch = {}
    projects.forEach((p) => { countByArch[p.archetype] = (countByArch[p.archetype] || 0) + 1 })
    return projects.map((p) => {
      const center = ARC_CENTERS[p.archetype]
      const cx = Math.cos(center.angle) * center.R
      const cz = Math.sin(center.angle) * center.R
      const idx = idxByArch[p.archetype] = (idxByArch[p.archetype] ?? -1) + 1
      const total = countByArch[p.archetype]
      const localAngle = (idx / Math.max(1, total)) * Math.PI * 2
      const localR = 0.6 + (seed(p) / 100) * 0.8
      const y = (seed2(p) / 100 - 0.5) * 1.2
      return [cx + Math.cos(localAngle) * localR, y, cz + Math.sin(localAngle) * localR]
    })
  }

  if (groupBy === 'inversion') {
    const tiers = [
      { test: (inv) => inv >= 1000000, R: 1.5 },
      { test: (inv) => inv >= 400000,  R: 3.5 },
      { test: () => true,             R: 5.5 },
    ]
    const idxByTier = {}
    const countByTier = {}
    projects.forEach((p) => {
      const tier = tiers.findIndex((t) => t.test(p.investment))
      countByTier[tier] = (countByTier[tier] || 0) + 1
    })
    return projects.map((p) => {
      const tier = tiers.findIndex((t) => t.test(p.investment))
      const R = tiers[tier].R
      const idx = idxByTier[tier] = (idxByTier[tier] ?? -1) + 1
      const total = countByTier[tier]
      const angle = (idx / Math.max(1, total)) * Math.PI * 2
      const y = (seed(p) / 100 - 0.5) * 1.2
      return [Math.cos(angle) * R, y, Math.sin(angle) * R]
    })
  }

  // 'sroi' — concentric rings by category (default)
  const radiusMap = { ALTO: 1.5, MEDIO: 3.5, BAJO: 5.5 }
  const idxByCat = {}
  const countByCat = {}
  projects.forEach((p) => { countByCat[p.category] = (countByCat[p.category] || 0) + 1 })
  return projects.map((p) => {
    const R = radiusMap[p.category] ?? 4.0
    const idx = idxByCat[p.category] = (idxByCat[p.category] ?? -1) + 1
    const total = countByCat[p.category]
    const angle = (idx / Math.max(1, total)) * Math.PI * 2
    const y = (seed(p) / 100 - 0.5) * 1.2
    return [Math.cos(angle) * R, y, Math.sin(angle) * R]
  })
}

export const getGroupRegions = (projects, positions, groupBy) => {
  if (groupBy === 'arquetipo') {
    const groups = {}
    projects.forEach((p, i) => {
      if (!groups[p.archetype]) groups[p.archetype] = []
      groups[p.archetype].push(positions[i])
    })
    return Object.entries(groups).map(([key, pts]) => {
      const cx = pts.reduce((s, p) => s + p[0], 0) / pts.length
      const cz = pts.reduce((s, p) => s + p[2], 0) / pts.length
      const maxDist = pts.reduce((m, p) => {
        const dx = p[0] - cx, dz = p[2] - cz
        return Math.max(m, Math.sqrt(dx * dx + dz * dz))
      }, 0)
      return {
        center: [cx, -1.2, cz],
        radius: maxDist + 0.9,
        color: ARCHETYPES[key]?.color || '#888',
        label: ARCHETYPES[key]?.name || key,
      }
    })
  }

  if (groupBy === 'sroi') {
    return [
      { center: [0, -1.2, 0], radius: 2.3,  color: '#10B981', label: 'SROI Alto (>2x)',   labelAngle: Math.PI * 0.5 },
      { center: [0, -1.2, 0], radius: 4.3,  color: '#F59E0B', label: 'SROI Medio (1-2x)', labelAngle: Math.PI * 1.0 },
      { center: [0, -1.2, 0], radius: 6.3,  color: '#7F1D1D', label: 'SROI Bajo (<1x)',   labelAngle: Math.PI * 1.5 },
    ]
  }

  if (groupBy === 'inversion') {
    return [
      { center: [0, -1.2, 0], radius: 2.3, color: '#E8520E', label: '> $1M MXN',        labelAngle: Math.PI * 0.5 },
      { center: [0, -1.2, 0], radius: 4.3, color: '#F59E0B', label: '$400K – $1M MXN',  labelAngle: Math.PI * 1.0 },
      { center: [0, -1.2, 0], radius: 6.3, color: '#999999', label: '< $400K MXN',      labelAngle: Math.PI * 1.5 },
    ]
  }

  return []
}

export const projectRadius = (p) => {
  const t = (p.investment - 200000) / (2000000 - 200000)
  return 0.3 + Math.max(0, Math.min(1, t)) * 0.4
}

export const nodeMatProps = (sroi) => {
  if (sroi >= 2) return { color: '#10B981', emi: 1.8, opacity: 0.9, clearcoat: 0.9 }
  if (sroi >= 1) return { color: '#F59E0B', emi: 1.2, opacity: 0.85, clearcoat: 0.8 }
  return { color: '#7F1D1D', emi: 0.4, opacity: 0.7, clearcoat: 0.6 }
}

let __softParticleTexture = null
export const getSoftParticleTexture = () => {
  if (__softParticleTexture) return __softParticleTexture
  const canvas = document.createElement('canvas')
  canvas.width = 64; canvas.height = 64
  const ctx = canvas.getContext('2d')
  const g = ctx.createRadialGradient(32, 32, 0, 32, 32, 32)
  g.addColorStop(0, 'rgba(255,255,255,1)')
  g.addColorStop(0.3, 'rgba(255,255,255,0.4)')
  g.addColorStop(1, 'rgba(255,255,255,0)')
  ctx.fillStyle = g; ctx.fillRect(0, 0, 64, 64)
  __softParticleTexture = new THREE.CanvasTexture(canvas)
  return __softParticleTexture
}

export const generateBrainPositions = (count) => {
  const positions = new Float32Array(count * 3)
  const targetIdle = new Float32Array(count * 3)
  const targetDispersed = new Float32Array(count * 3)
  for (let i = 0; i < count; i++) {
    const isLeft = i % 2 === 0
    const hemisphereSign = isLeft ? -1 : 1
    const u = Math.random(), v = Math.random()
    const w = Math.pow(Math.random(), 0.4)
    const theta = u * Math.PI * 2
    const phi = Math.acos(2 * v - 1)
    let lx = 5.0 * w * Math.sin(phi) * Math.cos(theta)
    let ly = 4.0 * w * Math.sin(phi) * Math.sin(theta)
    let lz = 4.5 * w * Math.cos(phi)
    if (ly < 0) ly *= 0.65
    const distanceFromMidline = Math.abs(lx)
    if (distanceFromMidline < 1.5) lx *= 0.5
    if (lz > 0) lz *= 1.15; else lz *= 0.9
    const wrinkle = Math.sin(theta * 7 + phi * 3) * Math.cos(phi * 5) * 0.6
    const len = Math.sqrt(lx * lx + ly * ly + lz * lz) || 1
    lx += (lx / len) * wrinkle
    ly += (ly / len) * wrinkle
    lz += (lz / len) * wrinkle
    const x = lx + hemisphereSign * (Math.abs(lx) > 1 ? 1.5 : 0.5)
    const y = ly
    const z = lz
    const noise = 0.25
    targetIdle[i * 3]     = x + (Math.random() - 0.5) * noise
    targetIdle[i * 3 + 1] = y + (Math.random() - 0.5) * noise
    targetIdle[i * 3 + 2] = z + (Math.random() - 0.5) * noise
    const dispRadius = 9 + Math.random() * 5
    const dispTheta = Math.random() * Math.PI * 2
    const dispPhi = Math.acos(2 * Math.random() - 1)
    targetDispersed[i * 3]     = dispRadius * Math.sin(dispPhi) * Math.cos(dispTheta)
    targetDispersed[i * 3 + 1] = dispRadius * Math.sin(dispPhi) * Math.sin(dispTheta)
    targetDispersed[i * 3 + 2] = dispRadius * Math.cos(dispPhi)
    positions[i * 3]     = targetIdle[i * 3]
    positions[i * 3 + 1] = targetIdle[i * 3 + 1]
    positions[i * 3 + 2] = targetIdle[i * 3 + 2]
  }
  return { positions, targetIdle, targetDispersed }
}
