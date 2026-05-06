import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { getSoftParticleTexture, generateBrainPositions } from './utils'

export default function BrainHalo({ count = 3000, isHovered, dispersionRef }) {
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

  useFrame((state, delta) => {
    if (!pointsRef.current) return
    const target = isHovered ? 1 : 0
    const speed = isHovered ? delta * 1.0 : delta * 1.2
    localDispersion.current += (target - localDispersion.current) * Math.min(1, speed)
    const t = localDispersion.current
    const eased = 1 - Math.pow(1 - t, 3)
    if (dispersionRef) dispersionRef.current = eased

    const arr = pointsRef.current.geometry.attributes.position.array
    for (let i = 0; i < arr.length / 3; i++) {
      arr[i * 3]     = THREE.MathUtils.lerp(targetIdle[i * 3],     targetDispersed[i * 3],     eased)
      arr[i * 3 + 1] = THREE.MathUtils.lerp(targetIdle[i * 3 + 1], targetDispersed[i * 3 + 1], eased)
      arr[i * 3 + 2] = THREE.MathUtils.lerp(targetIdle[i * 3 + 2], targetDispersed[i * 3 + 2], eased)
    }
    pointsRef.current.geometry.attributes.position.needsUpdate = true

    const mat = pointsRef.current.material
    if (mat) {
      mat.size = THREE.MathUtils.lerp(0.18, 0.08, eased)
      mat.opacity = THREE.MathUtils.lerp(0.85, 0.35, eased)
    }

    if (groupRef.current) {
      if (groupRef.current.rotation.y === 0) groupRef.current.rotation.y = -0.3
      groupRef.current.rotation.y += delta * 0.05 * (1 - eased)
    }
  })

  return (
    <group ref={groupRef}>
      <points ref={pointsRef} geometry={geometry}>
        <pointsMaterial
          map={getSoftParticleTexture()}
          size={0.18}
          color="#3B82F6"
          transparent
          opacity={0.85}
          sizeAttenuation
          depthWrite={false}
          alphaTest={0.001}
          blending={THREE.AdditiveBlending}
          toneMapped={false}
        />
      </points>
    </group>
  )
}
