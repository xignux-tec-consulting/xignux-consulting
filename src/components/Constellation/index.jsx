import { useState, useRef, useMemo, useCallback, useEffect } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Stars } from '@react-three/drei'
import { EffectComposer, Bloom, Vignette, Noise } from '@react-three/postprocessing'
import { BlendFunction, KernelSize } from 'postprocessing'
import NodeMesh from './Node'
import ConnectionsLayer from './Connections'
import { CameraRig, NodeProjector, NodeZoomCamera } from './CameraRig'
import { computePositions } from './utils'

function SceneInner({
  projects, hoveredId, setHoveredId, selectedId, onSelect, onDeselect,
  showConnections, autoRotate, controlsRef, recentChange, cameraTarget, groupBy,
}) {
  const positions = useMemo(() => computePositions(projects, groupBy), [projects, groupBy])
  // Pre-compute radii once — stable unless projects change
  const radii = useMemo(
    () => projects.map((p) => 0.2 + Math.max(0, Math.min(1, (p.investment - 200000) / (2000000 - 200000))) * 0.3),
    [projects]
  )

  const handleHover = useCallback((id) => { setHoveredId(id) }, [setHoveredId])
  const handleUnhover = useCallback((id) => { setHoveredId((h) => (h === id ? null : h)) }, [setHoveredId])
  const handleSelect = useCallback((id) => { onSelect(id) }, [onSelect])

  return (
    <>
      <fog attach="fog" args={['#0a0a0f', 26, 70]} />

      <ambientLight intensity={0.15} color="#1E293B" />
      <directionalLight position={[10, 10, 15]} intensity={0.5} color="#E0E7FF" />
      <directionalLight position={[-10, -5, -10]} intensity={0.2} color="#F59E0B" />
      <pointLight position={[0, 0, 5]} intensity={0.4} color="#FFFFFF" distance={30} />

      <Stars radius={120} depth={80} count={300} factor={1.5} saturation={0} fade speed={0.2} />

      <ConnectionsLayer
        projects={projects}
        positions={positions}
        showConnections={showConnections}
        selectedId={selectedId}
        groupBy={groupBy}
      />

      {projects.map((p, i) => (
        <NodeMesh
          key={p.id}
          project={p}
          position={positions[i]}
          radius={radii[i]}
          hovered={hoveredId === p.id}
          selected={selectedId === p.id}
          dimmed={!!selectedId && selectedId !== p.id}
          onHover={handleHover}
          onUnhover={handleUnhover}
          onClick={handleSelect}
          recentChange={recentChange}
        />
      ))}

      <mesh position={[0, 0, 0]} onPointerMissed={onDeselect}>
        <boxGeometry args={[0.001, 0.001, 0.001]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>

      <CameraRig
        targetPosition={cameraTarget?.position}
        targetLookAt={cameraTarget?.lookAt}
        controlsRef={controlsRef}
      />

      <NodeZoomCamera
        selectedId={selectedId}
        projects={projects}
        positions={positions}
        controlsRef={controlsRef}
      />

      <OrbitControls
        ref={controlsRef}
        enabled={!selectedId}
        enableZoom
        enablePan={false}
        autoRotate={autoRotate && !selectedId}
        autoRotateSpeed={0.15}
        zoomSpeed={0.6}
        enableDamping
        dampingFactor={0.05}
        minDistance={10}
        maxDistance={35}
      />

      <EffectComposer multisampling={0}>
        <Bloom
          intensity={0.65}
          luminanceThreshold={0.25}
          luminanceSmoothing={0.7}
          kernelSize={KernelSize.SMALL}
          mipmapBlur
        />
        <Vignette offset={0.3} darkness={0.55} eskil={false} blendFunction={BlendFunction.NORMAL} />
        <Noise opacity={0.02} blendFunction={BlendFunction.OVERLAY} />
      </EffectComposer>
    </>
  )
}

export default function Constellation({
  projects, selectedId, onSelect, onDeselect,
  showConnections = true, groupBy = 'sroi', recentChange, cameraTarget, onProjectAnchor,
  paused = false,
}) {
  const [hoveredId, setHoveredId] = useState(null)
  const [autoRotate, setAutoRotate] = useState(true)
  const controlsRef = useRef()
  const idleTimer = useRef(null)

  // [] — OrbitControls ref is populated by the time this effect runs (after R3F commit)
  useEffect(() => {
    const ctrl = controlsRef.current
    if (!ctrl) return
    const onStart = () => { setAutoRotate(false); clearTimeout(idleTimer.current) }
    const onEnd = () => {
      clearTimeout(idleTimer.current)
      idleTimer.current = setTimeout(() => setAutoRotate(true), 4500)
    }
    ctrl.addEventListener('start', onStart)
    ctrl.addEventListener('end', onEnd)
    return () => { ctrl.removeEventListener('start', onStart); ctrl.removeEventListener('end', onEnd) }
  }, [])

  return (
    <Canvas
      camera={{ position: [0, 1, 14], fov: 45, near: 0.1, far: 200 }}
      gl={{ antialias: false, powerPreference: 'high-performance', alpha: false }}
      dpr={[1, 1.5]}
      frameloop={paused ? 'never' : 'always'}
      style={{ background: 'transparent' }}
    >
      {onProjectAnchor && (
        <NodeProjector
          projects={projects}
          selectedId={selectedId}
          onProject={onProjectAnchor}
        />
      )}
      <SceneInner
        projects={projects}
        hoveredId={hoveredId}
        setHoveredId={setHoveredId}
        selectedId={selectedId}
        onSelect={onSelect}
        onDeselect={onDeselect}
        showConnections={showConnections}
        autoRotate={autoRotate}
        controlsRef={controlsRef}
        recentChange={recentChange}
        cameraTarget={cameraTarget}
        groupBy={groupBy}
      />
    </Canvas>
  )
}
