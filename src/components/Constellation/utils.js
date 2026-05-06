import * as THREE from 'three'

export const projectPosition = (p) => {
  let R
  if (p.sroi > 2) R = 1.2
  else if (p.sroi >= 1) R = 2.5
  else R = 4

  const archIdx = 'ABCDE'.indexOf(p.archetype)
  const sliceCenter = (archIdx / 5) * Math.PI * 2
  const seed = (p.id.charCodeAt(1) * 13 + p.id.charCodeAt(2) * 7) % 100
  const theta = sliceCenter + ((seed / 100) - 0.5) * 0.9
  const phi = Math.PI * (0.25 + ((seed * 1.7) % 100) / 100 * 0.5)

  return [
    R * Math.sin(phi) * Math.cos(theta),
    R * Math.cos(phi) * 0.85,
    R * Math.sin(phi) * Math.sin(theta),
  ]
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
