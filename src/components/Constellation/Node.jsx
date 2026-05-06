import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import * as THREE from 'three'
import { nodeMatProps } from './utils'
import { fmtMXN, sroiColor } from '../../lib/sroi'

function SelectionRing({ radius }) {
  const ringRef = useRef()
  const scaleRef = useRef(0)
  useFrame((state, delta) => {
    if (ringRef.current) {
      scaleRef.current = THREE.MathUtils.lerp(scaleRef.current, 1, 0.12)
      ringRef.current.scale.setScalar(scaleRef.current)
      ringRef.current.rotation.z += delta * 0.4
    }
  })
  return (
    <mesh ref={ringRef} rotation={[Math.PI / 2, 0, 0]}>
      <torusGeometry args={[radius * 1.8, 0.02, 16, 100]} />
      <meshBasicMaterial color="#FFFFFF" transparent opacity={0.4} toneMapped={false} />
    </mesh>
  )
}

export default function NodeMesh({
  project, position, radius, hovered, selected, dimmed,
  brainHovered, dispersionRef, onHover, onUnhover, onClick, recentChange,
}) {
  const meshRef = useRef()
  const matRef = useRef()
  const lightRef = useRef()
  const phase = useMemo(() => Math.random() * Math.PI * 2, [])
  const idHash = useMemo(
    () => (project.id.charCodeAt(1) + project.id.charCodeAt(2)) * 0.1,
    [project.id]
  )
  const mp = nodeMatProps(project.sroi)
  const { color, emi: baseEmissive } = mp

  useFrame((state) => {
    if (!meshRef.current) return
    const t = state.clock.elapsedTime
    const breathe = 1 + Math.sin(t * 0.3 + phase) * 0.02
    let target = breathe
    if (hovered || selected) target = 1.3 * breathe

    let pulseMul = 1
    if (recentChange && (recentChange.id === project.id || recentChange.id === 'ALL')) {
      const age = t - recentChange.t
      if (age < 2.4)
        pulseMul = 1 + Math.abs(Math.sin(age * Math.PI * 2)) * 0.45 * Math.max(0, 1 - age / 2.4)
    }

    const cur = meshRef.current.scale.x
    const next = THREE.MathUtils.lerp(cur, target * pulseMul, 0.12)
    meshRef.current.scale.set(next, next, next)

    if (matRef.current) {
      const liveMul = 1 + Math.sin(t * 0.4 + idHash) * 0.12
      const stateMul = brainHovered ? 0.7 : 2.5
      const focusBoost = hovered || selected ? 1.5 : 1.0
      const dimMul = dimmed ? 0.4 : 1.0
      matRef.current.emissiveIntensity = baseEmissive * stateMul * liveMul * focusBoost * dimMul
      const d = dispersionRef?.current ?? 0
      matRef.current.opacity = THREE.MathUtils.lerp(0.55, 0.92, d)
      matRef.current.transmission = THREE.MathUtils.lerp(0.4, 0.05, d)
      matRef.current.roughness = THREE.MathUtils.lerp(0.4, 0.15, d)
    }
    if (lightRef.current) {
      lightRef.current.intensity = brainHovered ? 0.3 : 1.2
      lightRef.current.distance = brainHovered ? 3 : 8
    }
  })

  return (
    <group position={position}>
      <mesh
        ref={meshRef}
        onPointerOver={(e) => { e.stopPropagation(); onHover(); document.body.style.cursor = 'pointer' }}
        onPointerOut={() => { onUnhover(); document.body.style.cursor = 'auto' }}
        onClick={(e) => { e.stopPropagation(); onClick() }}
      >
        <sphereGeometry args={[radius, 64, 64]} />
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
      <pointLight ref={lightRef} color={color} intensity={1.2} distance={8} decay={2} />

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
