import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { getSoftParticleTexture, generateBrainPositions } from './utils'

export default function BrainHalo({ count = 3000, isHovered, dispersionRef, darkMode = true }) {
  const groupRef = useRef()
  const pointsRef = useRef()
  const localDispersion = useRef(0)

  const { positions, targetIdle, targetDispersed } = useMemo(
    () => generateBrainPositions(count),
    [count]
  )

  const geometry = useMemo(() => {
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    return g
  }, [positions])

  const material = useMemo(() => new THREE.PointsMaterial({
    map: getSoftParticleTexture(),
    size: 0.18,
    color: new THREE.Color('#3B82F6'),
    transparent: true,
    opacity: 0.85,
    sizeAttenuation: true,
    depthWrite: false,
    alphaTest: 0.001,
    blending: THREE.AdditiveBlending,
    toneMapped: false,
  }), [])

  useFrame((_, delta) => {
    if (!pointsRef.current) return

    const target = isHovered ? 1 : 0
    const prevDisp = localDispersion.current
    localDispersion.current += (target - localDispersion.current) * Math.min(1, delta * (isHovered ? 1.0 : 1.2))
    const t = localDispersion.current
    const eased = 1 - Math.pow(1 - t, 3)
    if (dispersionRef) dispersionRef.current = eased

    // Only push to GPU when dispersion is actually moving
    const isMoving = Math.abs(t - prevDisp) > 0.0003
    if (isMoving) {
      const arr = pointsRef.current.geometry.attributes.position.array
      for (let i = 0; i < count; i++) {
        arr[i * 3]     = THREE.MathUtils.lerp(targetIdle[i * 3],     targetDispersed[i * 3],     eased)
        arr[i * 3 + 1] = THREE.MathUtils.lerp(targetIdle[i * 3 + 1], targetDispersed[i * 3 + 1], eased)
        arr[i * 3 + 2] = THREE.MathUtils.lerp(targetIdle[i * 3 + 2], targetDispersed[i * 3 + 2], eased)
      }
      pointsRef.current.geometry.attributes.position.needsUpdate = true
      material.size = THREE.MathUtils.lerp(0.18, 0.08, eased)
      material.opacity = THREE.MathUtils.lerp(0.85, 0.35, eased)
    }

    // Rotation continues always (cheap, no buffer update needed)
    if (groupRef.current) {
      if (groupRef.current.rotation.y === 0) groupRef.current.rotation.y = -0.3
      groupRef.current.rotation.y += delta * 0.05 * (1 - eased)
    }
  })

  return (
    <group ref={groupRef}>
      <points ref={pointsRef} geometry={geometry} material={material} />
    </group>
  )
}
