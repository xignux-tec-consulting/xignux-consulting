import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { getSoftParticleTexture, generateBrainPositions } from './utils'

export default function BrainHalo({ count = 3000, isHovered, dispersionRef }) {
  const groupRef = useRef()
  const pointsRef = useRef()
  const localDispersion = useRef(0)

  const { positions, targetIdle } = useMemo(
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
    size: 0.16,
    color: new THREE.Color('#E8520E'),
    transparent: true,
    opacity: 0.35,
    sizeAttenuation: true,
    depthWrite: false,
    alphaTest: 0.001,
    blending: THREE.NormalBlending,
    toneMapped: false,
  }), [])

  useFrame((_, delta) => {
    if (!pointsRef.current) return

    const target = isHovered ? 1 : 0
    const prevDisp = localDispersion.current
    localDispersion.current += (target - localDispersion.current) * Math.min(1, delta * 1.8)
    const t = localDispersion.current
    const eased = t * t * (3 - 2 * t)
    if (dispersionRef) dispersionRef.current = eased

    const isMoving = Math.abs(t - prevDisp) > 0.0003
    if (isMoving) {
      const arr = pointsRef.current.geometry.attributes.position.array
      const scale = 1 + eased * 0.15
      for (let i = 0; i < count; i++) {
        arr[i * 3]     = targetIdle[i * 3]     * scale
        arr[i * 3 + 1] = targetIdle[i * 3 + 1] * scale
        arr[i * 3 + 2] = targetIdle[i * 3 + 2] * scale
      }
      pointsRef.current.geometry.attributes.position.needsUpdate = true
      material.size = THREE.MathUtils.lerp(0.16, 0.2, eased)
    }

    const targetOpacity = isHovered ? 0.5 : 0.35
    if (Math.abs(material.opacity - targetOpacity) > 0.001) {
      material.opacity = THREE.MathUtils.lerp(material.opacity, targetOpacity, Math.min(1, delta * 3))
    }

    if (groupRef.current) {
      if (groupRef.current.rotation.y === 0) groupRef.current.rotation.y = -0.3
      groupRef.current.rotation.y += delta * (0.05 + eased * 0.03)
    }
  })

  return (
    <group ref={groupRef}>
      <points ref={pointsRef} geometry={geometry} material={material} />
    </group>
  )
}
