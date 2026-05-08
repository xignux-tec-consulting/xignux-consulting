import { useRef, useMemo, memo } from 'react'
import { useFrame } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import * as THREE from 'three'
import { nodeMatProps } from './utils'
import { fmtMXN } from '../../lib/sroi'
import { ARCHETYPES } from '../../data/projects'

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
      <OrbitalRing radius={radius * 1.8} color="#E8520E" opacity={0.5} speed={0.4} />
      <OrbitalRing radius={radius * 2.3} color="#F0854A" opacity={0.6} speed={-0.22} thickness={0.025} />
    </>
  )
}

function NodeHaloRing({ radius, color }) {
  const ringRef = useRef()
  const geometry = useMemo(() => new THREE.RingGeometry(radius * 1.15, radius * 1.22, 64), [radius])
  const material = useMemo(() => new THREE.MeshBasicMaterial({
    color, transparent: true, opacity: 0.25, side: THREE.DoubleSide, toneMapped: false,
  }), [color])
  useFrame((state) => {
    if (!ringRef.current) return
    ringRef.current.rotation.x = Math.PI / 2 + Math.sin(state.clock.elapsedTime * 0.3) * 0.1
  })
  return <mesh ref={ringRef} geometry={geometry} material={material} />
}

const NodeMesh = memo(function NodeMesh({
  project, position, radius, hovered, selected, dimmed,
  onHover, onUnhover, onClick, recentChange,
}) {
  const groupRef = useRef()
  const meshRef = useRef()
  const coreRef = useRef()
  const labelRef = useRef()
  const clickPulseRef = useRef(0)

  const phase = useMemo(() => Math.random() * Math.PI * 2, [])
  const idHash = useMemo(
    () => (project.id.charCodeAt(1) + project.id.charCodeAt(2)) * 0.1,
    [project.id]
  )
  const { color, emi: baseEmissive } = useMemo(() => nodeMatProps(project.sroi), [project.sroi])
  const arcColor = useMemo(() => ARCHETYPES[project.archetype]?.color || '#E8520E', [project.archetype])
  const baseColor = useMemo(() => new THREE.Color(color), [color])
  const accentColor = useMemo(() => new THREE.Color('#E8520E'), [])

  const outerGeometry = useMemo(() => new THREE.IcosahedronGeometry(radius * 0.85, 1), [radius])
  const coreGeometry = useMemo(() => new THREE.IcosahedronGeometry(radius * 0.5, 2), [radius])

  const material = useMemo(() => new THREE.MeshPhysicalMaterial({
    color,
    emissive: new THREE.Color(color),
    emissiveIntensity: baseEmissive * 0.6,
    transparent: true,
    opacity: 0.35,
    roughness: 0.1,
    metalness: 0.3,
    clearcoat: 1.0,
    clearcoatRoughness: 0.05,
    toneMapped: true,
    side: THREE.DoubleSide,
    wireframe: true,
  }), [color, baseEmissive])

  const coreMaterial = useMemo(() => new THREE.MeshPhysicalMaterial({
    color,
    emissive: new THREE.Color(color),
    emissiveIntensity: baseEmissive * 1.0,
    transparent: true,
    opacity: 0.9,
    roughness: 0.15,
    metalness: 0.2,
    clearcoat: 0.9,
    clearcoatRoughness: 0.1,
    toneMapped: true,
  }), [color, baseEmissive])

  const posVec = useRef(new THREE.Vector3(...position))
  const targetVec = useMemo(
    () => new THREE.Vector3(...position),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [position[0], position[1], position[2]]
  )

  useFrame((state, delta) => {
    if (groupRef.current) {
      posVec.current.lerp(targetVec, Math.min(1, delta * 2.5))
      groupRef.current.position.copy(posVec.current)
    }

    if (!meshRef.current) return
    const t = state.clock.elapsedTime

    const colorSpeed = Math.min(1, delta * 4)
    material.color.lerp(selected ? accentColor : baseColor, colorSpeed)
    material.emissive.lerp(selected ? accentColor : baseColor, colorSpeed)
    coreMaterial.color.lerp(selected ? accentColor : baseColor, colorSpeed)
    coreMaterial.emissive.lerp(selected ? accentColor : baseColor, colorSpeed)

    meshRef.current.rotation.y += delta * 0.15
    meshRef.current.rotation.x += delta * 0.08
    if (coreRef.current) {
      coreRef.current.rotation.y -= delta * 0.1
    }

    if (dimmed) {
      meshRef.current.scale.setScalar(THREE.MathUtils.lerp(meshRef.current.scale.x, 0.9, Math.min(1, delta * 4)))
      if (coreRef.current) coreRef.current.scale.setScalar(meshRef.current.scale.x)
      material.opacity = THREE.MathUtils.lerp(material.opacity, 0.1, Math.min(1, delta * 3))
      coreMaterial.opacity = THREE.MathUtils.lerp(coreMaterial.opacity, 0.2, Math.min(1, delta * 3))
      material.emissiveIntensity = THREE.MathUtils.lerp(material.emissiveIntensity, baseEmissive * 0.1, Math.min(1, delta * 3))
      coreMaterial.emissiveIntensity = THREE.MathUtils.lerp(coreMaterial.emissiveIntensity, baseEmissive * 0.15, Math.min(1, delta * 3))
      return
    }

    const breathe = 1 + Math.sin(t * 0.3 + phase) * 0.02
    let targetScale = (hovered || selected) ? 1.3 * breathe : breathe

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
    const newScale = THREE.MathUtils.lerp(curScale, targetScale * pulseMul, 0.12)
    meshRef.current.scale.setScalar(newScale)
    if (coreRef.current) coreRef.current.scale.setScalar(newScale)

    const liveMul = 1 + Math.sin(t * 0.4 + idHash) * 0.12
    const focusBoost = (hovered || selected) ? 1.3 : 1.0

    material.emissiveIntensity = THREE.MathUtils.lerp(
      material.emissiveIntensity,
      selected ? 0.8 : baseEmissive * 0.6 * liveMul * focusBoost,
      Math.min(1, delta * 5)
    )
    coreMaterial.emissiveIntensity = THREE.MathUtils.lerp(
      coreMaterial.emissiveIntensity,
      selected ? 1.2 : baseEmissive * 1.0 * liveMul * focusBoost,
      Math.min(1, delta * 5)
    )

    const targetWireOpacity = selected ? 0.6 : hovered ? 0.5 : 0.35
    material.opacity = THREE.MathUtils.lerp(material.opacity, targetWireOpacity, Math.min(1, delta * 4))
    const targetCoreOpacity = selected ? 1.0 : dimmed ? 0.4 : 0.9
    coreMaterial.opacity = THREE.MathUtils.lerp(coreMaterial.opacity, targetCoreOpacity, Math.min(1, delta * 4))

    if (labelRef.current) {
      const dist = state.camera.position.length()
      const fade = dist < 18 ? 0.7 : dist > 24 ? 0 : 0.7 * (1 - (dist - 18) / 6)
      labelRef.current.style.opacity = String(dimmed ? 0 : fade)
    }
  })

  return (
    <group ref={groupRef}>
      {/* Outer wireframe icosahedron */}
      <mesh
        ref={meshRef}
        geometry={outerGeometry}
        material={material}
        onPointerOver={(e) => {
          e.stopPropagation()
          if (dimmed) return
          onHover(project.id)
          document.body.style.cursor = 'pointer'
        }}
        onPointerOut={() => {
          onUnhover(project.id)
          document.body.style.cursor = 'auto'
        }}
        onClick={(e) => {
          e.stopPropagation()
          if (dimmed) return
          clickPulseRef.current = 1.0
          onClick(project.id)
        }}
      />

      {/* Inner solid core */}
      <mesh ref={coreRef} geometry={coreGeometry} material={coreMaterial} />

      {/* Subtle equatorial ring */}
      {!dimmed && <NodeHaloRing radius={radius} color={arcColor} />}

      {selected && <DoubleSelectionRings radius={radius} />}

      {hovered && !selected && (
        <Html
          center
          position={[0, radius + 0.6, 0]}
          zIndexRange={[100, 0]}
          style={{ pointerEvents: 'none' }}
        >
          <div className="node-tooltip">
            <div className="node-tooltip-name">{project.name}</div>
            <div className="node-tooltip-meta">
              <span className="mono" style={{ color }}>{project.sroi.toFixed(2)}x</span>
              <span style={{ opacity: 0.4 }}>&middot;</span>
              <span className="mono">{fmtMXN(project.investment)}</span>
              <span style={{ opacity: 0.4 }}>&middot;</span>
              <span style={{ color: ARCHETYPES[project.archetype]?.color, opacity: 0.9 }}>
                {ARCHETYPES[project.archetype]?.name ?? project.archetype}
              </span>
            </div>
            <div className="node-tooltip-arrow" />
          </div>
        </Html>
      )}

      {!selected && (
        <Html
          center
          position={[0, -(radius + 0.5), 0]}
          style={{ pointerEvents: 'none', userSelect: 'none' }}
        >
          <div ref={labelRef} style={{
            fontSize: 9,
            fontFamily: "'JetBrains Mono', monospace",
            fontWeight: 400,
            color: '#999999',
            whiteSpace: 'nowrap',
            textAlign: 'center',
            opacity: 0,
          }}>
            {project.id}
          </div>
        </Html>
      )}

    </group>
  )
})

export default NodeMesh
