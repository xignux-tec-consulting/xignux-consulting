import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Html, Line } from '@react-three/drei'
import * as THREE from 'three'

function circlePoints(radius, segments = 96) {
  const pts = []
  for (let i = 0; i <= segments; i++) {
    const a = (i / segments) * Math.PI * 2
    pts.push([Math.cos(a) * radius, 0, Math.sin(a) * radius])
  }
  return pts
}

function RegionDisc({ center, radius, color, label, labelAngle, isConcentric }) {
  const groupRef = useRef()
  const labelRef = useRef()
  const lineRef = useRef()
  const scaleRef = useRef(0)
  const baseDiscOpacity = isConcentric ? 0.025 : 0.045
  const baseEdgeOpacity = 0.25

  const discGeometry = useMemo(
    () => new THREE.CircleGeometry(radius, 64),
    [radius]
  )
  const discMaterial = useMemo(
    () => new THREE.MeshBasicMaterial({
      color,
      transparent: true,
      opacity: baseDiscOpacity,
      side: THREE.DoubleSide,
      depthWrite: false,
    }),
    [color, baseDiscOpacity]
  )

  const edgePts = useMemo(() => circlePoints(radius), [radius])

  const labelPos = useMemo(() => {
    if (labelAngle != null) {
      return [
        Math.cos(labelAngle) * (radius + 0.3),
        0.05,
        Math.sin(labelAngle) * (radius + 0.3),
      ]
    }
    return [0, 0.05, -(radius + 0.5)]
  }, [radius, labelAngle])

  useFrame((state, delta) => {
    if (!groupRef.current) return
    scaleRef.current = THREE.MathUtils.lerp(scaleRef.current, 1, Math.min(1, delta * 3))
    groupRef.current.scale.setScalar(scaleRef.current)

    const dist = state.camera.position.length()
    const fade = dist < 24 ? 1 : dist > 35 ? 0 : 1 - (dist - 24) / 11

    discMaterial.opacity = baseDiscOpacity * fade
    if (lineRef.current?.material) {
      lineRef.current.material.opacity = baseEdgeOpacity * fade
    }
    if (labelRef.current) {
      labelRef.current.style.opacity = String(fade)
    }
  })

  return (
    <group ref={groupRef} position={center} scale={0}>
      {!isConcentric && (
        <mesh
          geometry={discGeometry}
          material={discMaterial}
          rotation={[-Math.PI / 2, 0, 0]}
        />
      )}

      <Line
        ref={lineRef}
        points={edgePts}
        color={color}
        lineWidth={1}
        transparent
        opacity={baseEdgeOpacity}
        dashed
        dashSize={0.5}
        gapSize={0.3}
      />

      <Html
        center
        position={labelPos}
        style={{ pointerEvents: 'none', userSelect: 'none' }}
      >
        <div ref={labelRef} style={{
          fontSize: 10,
          fontFamily: "'JetBrains Mono', monospace",
          fontWeight: 500,
          color,
          whiteSpace: 'nowrap',
          padding: '1px 6px',
          borderRadius: 4,
          background: 'rgba(248,246,243,0.9)',
          border: `1px solid ${color}33`,
          transition: 'opacity 0.1s',
        }}>
          {label}
        </div>
      </Html>
    </group>
  )
}

export default function GroupRegions({ regions, groupBy }) {
  if (!regions || regions.length === 0) return null

  const isConcentric = groupBy === 'sroi' || groupBy === 'inversion'

  return (
    <>
      {regions.map((r, i) => (
        <RegionDisc
          key={`${groupBy}-${i}`}
          center={r.center}
          radius={r.radius}
          color={r.color}
          label={r.label}
          labelAngle={r.labelAngle}
          isConcentric={isConcentric}
        />
      ))}
    </>
  )
}
