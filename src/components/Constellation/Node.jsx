import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import * as THREE from 'three'
import { nodeMatProps } from './utils'
import { fmtMXN, sroiColor } from '../../lib/sroi'

function SelectionRing({ radius }) {
  const ringRef = useRef()
  const scaleRef = useRef(0)
  useFrame((_, delta) => {
    if (ringRef.current) {
      scaleRef.current = THREE.MathUtils.lerp(scaleRef.current, 1, 0.12)
      ringRef.current.scale.setScalar(scaleRef.current)
      ringRef.current.rotation.z += delta * 0.4
    }
  })
  return (
    <mesh ref={ringRef} rotation={[Math.PI / 2, 0, 0]}>
      <torusGeometry args={[radius * 1.8, 0.02, 8, 48]} />
      <meshBasicMaterial color="#FFFFFF" transparent opacity={0.4} toneMapped={false} />
    </mesh>
  )
}

export default function NodeMesh({
  project, position, radius, hovered, selected, dimmed,
  brainHovered, dispersionRef, onHover, onUnhover, onClick, recentChange,
}) {
  const groupRef = useRef()
  const meshRef = useRef()
  const matRef = useRef()
  const phase = useMemo(() => Math.random() * Math.PI * 2, [])
  const idHash = useMemo(
    () => (project.id.charCodeAt(1) + project.id.charCodeAt(2)) * 0.1,
    [project.id]
  )
  const mp = nodeMatProps(project.sroi)
  const { color, emi: baseEmissive } = mp

  // Track current world position for smooth lerp between groupBy modes
  const posVec = useRef(new THREE.Vector3(...position))
  const targetVec = useMemo(
    () => new THREE.Vector3(...position),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [position[0], position[1], position[2]]
  )

  useFrame((state, delta) => {
    // Always lerp position toward target (smooth groupBy transitions)
    if (groupRef.current) {
      posVec.current.lerp(targetVec, Math.min(1, delta * 2.5))
      groupRef.current.position.copy(posVec.current)
    }

    if (!meshRef.current) return
    const t = state.clock.elapsedTime

    // Dimmed nodes: skip expensive material updates, only do scale
    if (dimmed) {
      const cur = meshRef.current.scale.x
      if (Math.abs(cur - 1) > 0.001) meshRef.current.scale.setScalar(THREE.MathUtils.lerp(cur, 1, 0.1))
      return
    }

    const breathe = 1 + Math.sin(t * 0.3 + phase) * 0.02
    let target = (hovered || selected) ? 1.3 * breathe : breathe

    let pulseMul = 1
    if (recentChange && (recentChange.id === project.id || recentChange.id === 'ALL')) {
      const age = t - recentChange.t
      if (age < 2.4)
        pulseMul = 1 + Math.abs(Math.sin(age * Math.PI * 2)) * 0.45 * Math.max(0, 1 - age / 2.4)
    }

    const cur = meshRef.current.scale.x
    meshRef.current.scale.setScalar(THREE.MathUtils.lerp(cur, target * pulseMul, 0.12))

    if (matRef.current) {
      const liveMul = 1 + Math.sin(t * 0.4 + idHash) * 0.12
      const stateMul = brainHovered ? 0.7 : 2.5
      const focusBoost = (hovered || selected) ? 1.5 : 1.0
      matRef.current.emissiveIntensity = baseEmissive * stateMul * liveMul * focusBoost
      const d = dispersionRef?.current ?? 0
      matRef.current.opacity = THREE.MathUtils.lerp(0.55, 0.92, d)
      matRef.current.roughness = THREE.MathUtils.lerp(0.25, 0.15, d)
    }
  })

  return (
    <group ref={groupRef}>
      <mesh
        ref={meshRef}
        onPointerOver={(e) => { e.stopPropagation(); onHover(); document.body.style.cursor = 'pointer' }}
        onPointerOut={() => { onUnhover(); document.body.style.cursor = 'auto' }}
        onClick={(e) => { e.stopPropagation(); onClick() }}
      >
        <sphereGeometry args={[radius, 32, 32]} />
        <meshPhysicalMaterial
          ref={matRef}
          color={color}
          emissive={color}
          emissiveIntensity={baseEmissive * 2.5}
          transparent
          opacity={0.7}
          roughness={0.15}
          metalness={0.05}
          clearcoat={0.9}
          clearcoatRoughness={0.05}
          toneMapped={false}
          side={THREE.FrontSide}
        />
      </mesh>

      {selected && <SelectionRing radius={radius} />}

      {(hovered || selected) && (
        <Html center distanceFactor={12} zIndexRange={[100, 0]} style={{ pointerEvents: 'none' }}>
          <div className="node-tooltip">
            <div className="node-tooltip-name">{project.name}</div>
            <div className="node-tooltip-meta">
              <span className="mono" style={{ color }}>{project.sroi.toFixed(2)}x</span>
              <span style={{ opacity: 0.5 }}>·</span>
              <span className="mono">{fmtMXN(project.investment)}</span>
            </div>
          </div>
        </Html>
      )}
    </group>
  )
}
