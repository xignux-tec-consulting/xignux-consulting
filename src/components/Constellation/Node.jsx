import { useRef, useMemo, memo } from 'react'
import { useFrame } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import * as THREE from 'three'
import { nodeMatProps } from './utils'
import { fmtMXN } from '../../lib/sroi'

function OrbitalRing({ radius, color, opacity, speed, thickness = 0.018 }) {
  const ringRef = useRef()
  const scaleRef = useRef(0)
  const geometry = useMemo(() => new THREE.TorusGeometry(radius, thickness, 8, 64), [radius, thickness])
  const material = useMemo(
    () => new THREE.MeshBasicMaterial({ color, transparent: true, opacity, toneMapped: false }),
    [color, opacity]
  )
  useFrame((_, delta) => {
    if (!ringRef.current) return
    scaleRef.current = THREE.MathUtils.lerp(scaleRef.current, 1, 0.1)
    ringRef.current.scale.setScalar(scaleRef.current)
    ringRef.current.rotation.z += delta * speed
  })
  return <mesh ref={ringRef} rotation={[Math.PI / 2, 0, 0]} geometry={geometry} material={material} />
}

function DoubleSelectionRings({ radius }) {
  return (
    <>
      <OrbitalRing radius={radius * 1.8} color="#FFFFFF" opacity={0.35} speed={0.4} />
      <OrbitalRing radius={radius * 2.3} color="#22D3EE" opacity={0.55} speed={-0.22} thickness={0.025} />
    </>
  )
}

const NodeMesh = memo(function NodeMesh({
  project, position, radius, hovered, selected, dimmed,
  brainHoveredRef, dispersionRef, onHover, onUnhover, onClick, recentChange,
}) {
  const groupRef = useRef()
  const meshRef = useRef()
  const clickPulseRef = useRef(0)

  const phase = useMemo(() => Math.random() * Math.PI * 2, [])
  const idHash = useMemo(
    () => (project.id.charCodeAt(1) + project.id.charCodeAt(2)) * 0.1,
    [project.id]
  )
  const { color, emi: baseEmissive } = useMemo(() => nodeMatProps(project.sroi), [project.sroi])
  const baseColor = useMemo(() => new THREE.Color(color), [color])
  const cyanColor = useMemo(() => new THREE.Color('#22D3EE'), [])

  const geometry = useMemo(() => new THREE.SphereGeometry(radius, 32, 32), [radius])
  const material = useMemo(() => new THREE.MeshPhysicalMaterial({
    color,
    emissive: new THREE.Color(color),
    emissiveIntensity: baseEmissive * 2.5,
    transparent: true,
    opacity: 0.7,
    roughness: 0.15,
    metalness: 0.05,
    clearcoat: 0.9,
    clearcoatRoughness: 0.05,
    toneMapped: false,
    side: THREE.FrontSide,
  }), [color, baseEmissive])

  const posVec = useRef(new THREE.Vector3(...position))
  const targetVec = useMemo(
    () => new THREE.Vector3(...position),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [position[0], position[1], position[2]]
  )

  useFrame((state, delta) => {
    // Position lerp (smooth groupBy transitions)
    if (groupRef.current) {
      posVec.current.lerp(targetVec, Math.min(1, delta * 2.5))
      groupRef.current.position.copy(posVec.current)
    }

    if (!meshRef.current) return
    const t = state.clock.elapsedTime

    // Dimmed nodes: attenuate opacity + scale back — focus mode
    if (dimmed) {
      meshRef.current.scale.setScalar(THREE.MathUtils.lerp(meshRef.current.scale.x, 0.9, Math.min(1, delta * 4)))
      material.opacity = THREE.MathUtils.lerp(material.opacity, 0.15, Math.min(1, delta * 3))
      material.emissiveIntensity = THREE.MathUtils.lerp(material.emissiveIntensity, baseEmissive * 0.3, Math.min(1, delta * 3))
      return
    }

    // Scale: breathe + hover/select + click pulse + data change pulse
    const breathe = 1 + Math.sin(t * 0.3 + phase) * 0.02
    let targetScale = (hovered || selected) ? 1.3 * breathe : breathe

    // Click pulse: fast visual acknowledgment, ref-based (no re-render)
    if (clickPulseRef.current > 0.005) {
      clickPulseRef.current *= 0.78
      targetScale *= (1 + clickPulseRef.current * 0.55)
    }

    let pulseMul = 1
    if (recentChange && (recentChange.id === project.id || recentChange.id === 'ALL')) {
      const age = t - recentChange.t
      if (age < 2.4)
        pulseMul = 1 + Math.abs(Math.sin(age * Math.PI * 2)) * 0.45 * Math.max(0, 1 - age / 2.4)
    }
    const curScale = meshRef.current.scale.x
    meshRef.current.scale.setScalar(THREE.MathUtils.lerp(curScale, targetScale * pulseMul, 0.12))

    // Material animation
    const brainHovered = brainHoveredRef?.current ?? false
    const liveMul = 1 + Math.sin(t * 0.4 + idHash) * 0.12
    const stateMul = brainHovered ? 0.7 : 2.5
    const focusBoost = (hovered || selected) ? 1.5 : 1.0

    // Color lerp: cyan when selected, base color otherwise
    const colorSpeed = Math.min(1, delta * 4)
    material.color.lerp(selected ? cyanColor : baseColor, colorSpeed)
    material.emissive.lerp(selected ? cyanColor : baseColor, colorSpeed)

    material.emissiveIntensity = THREE.MathUtils.lerp(
      material.emissiveIntensity,
      selected ? 1.8 : baseEmissive * stateMul * liveMul * focusBoost,
      Math.min(1, delta * 5)
    )

    // Opacity: selected stays bright; others follow dispersion
    const d = dispersionRef?.current ?? 0
    const targetOpacity = selected ? 0.95 : THREE.MathUtils.lerp(0.55, 0.92, d)
    material.opacity = THREE.MathUtils.lerp(material.opacity, targetOpacity, Math.min(1, delta * 4))
    material.roughness = THREE.MathUtils.lerp(0.25, 0.15, d)
  })

  return (
    <group ref={groupRef}>
      <mesh
        ref={meshRef}
        geometry={geometry}
        material={material}
        onPointerOver={(e) => { e.stopPropagation(); onHover(project.id); document.body.style.cursor = 'pointer' }}
        onPointerOut={() => { onUnhover(project.id); document.body.style.cursor = 'auto' }}
        onClick={(e) => { e.stopPropagation(); clickPulseRef.current = 1.0; onClick(project.id) }}
      />

      {selected && <DoubleSelectionRings radius={radius} />}

      {(hovered || selected) && (
        <Html
          center
          position={[0, radius + 0.9, 0]}
          distanceFactor={12}
          zIndexRange={[100, 0]}
          style={{ pointerEvents: 'none' }}
        >
          <div className="node-tooltip">
            <div className="node-tooltip-name">{project.name}</div>
            <div className="node-tooltip-meta">
              <span className="mono" style={{ color }}>{project.sroi.toFixed(2)}x</span>
              <span style={{ opacity: 0.5 }}>·</span>
              <span className="mono">{fmtMXN(project.investment)}</span>
            </div>
            <div className="node-tooltip-arrow" />
          </div>
        </Html>
      )}
    </group>
  )
})

export default NodeMesh
