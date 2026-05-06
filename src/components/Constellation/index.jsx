import { useState, useRef, useEffect, useMemo } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Stars } from '@react-three/drei'
import { EffectComposer, Bloom, Vignette, Noise } from '@react-three/postprocessing'
import { BlendFunction, KernelSize } from 'postprocessing'
import BrainHalo from './BrainHalo'
import NodeMesh from './Node'
import ConnectionsLayer from './Connections'
import { CameraRig, BrainHoverCamera, NodeProjector } from './CameraRig'
import { projectPosition } from './utils'

function SceneInner({
  projects, hoveredId, setHoveredId, selectedId, onSelect, onDeselect,
  showConnections, autoRotate, controlsRef, recentChange, cameraTarget,
}) {
  const positions = useMemo(() => projects.map((p) => projectPosition(p)), [projects])
  const [brainHovered, setBrainHovered] = useState(false)
  const dispersionRef = useRef(0)

  return (
    <>
      <fog attach="fog" args={['#0a0a0f', 26, 70]} />

      <ambientLight intensity={0.15} color="#1E293B" />
      <directionalLight position={[10, 10, 15]} intensity={0.5} color="#E0E7FF" />
      <directionalLight position={[-10, -5, -10]} intensity={0.2} color="#F59E0B" />
      <pointLight position={[0, 0, 5]} intensity={0.4} color="#FFFFFF" distance={30} />

      <BrainHalo count={3000} isHovered={brainHovered} dispersionRef={dispersionRef} />
      <mesh
        onPointerEnter={() => setBrainHovered(true)}
        onPointerLeave={() => setBrainHovered(false)}
      >
        <sphereGeometry args={[8, 32, 32]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>

      <Stars radius={120} depth={80} count={1500} factor={2} saturation={0.1} fade speed={0.3} />

      <ConnectionsLayer
        projects={projects}
        positions={positions}
        showConnections={showConnections}
        selectedId={selectedId}
      />

      {projects.map((p, i) => (
        <NodeMesh
          key={p.id}
          project={p}
          position={positions[i]}
          radius={0.3 + Math.max(0, Math.min(1, (p.investment - 200000) / (2000000 - 200000))) * 0.4}
          hovered={hoveredId === p.id}
          selected={selectedId === p.id}
          dimmed={!!selectedId && selectedId !== p.id}
          brainHovered={brainHovered}
          dispersionRef={dispersionRef}
          onHover={() => setHoveredId(p.id)}
          onUnhover={() => setHoveredId((h) => (h === p.id ? null : h))}
          onClick={() => onSelect(p.id)}
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

      <BrainHoverCamera
        brainHovered={brainHovered}
        cameraTarget={cameraTarget}
        controlsRef={controlsRef}
      />

      <OrbitControls
        ref={controlsRef}
        enabled={!brainHovered}
        enableZoom
        enablePan={false}
        autoRotate={autoRotate && !brainHovered}
        autoRotateSpeed={0.2}
        zoomSpeed={0.6}
        enableDamping
        dampingFactor={0.05}
        minDistance={12}
        maxDistance={50}
      />

      <EffectComposer multisampling={4}>
        <Bloom
          intensity={0.7}
          luminanceThreshold={0.25}
          luminanceSmoothing={0.7}
          kernelSize={KernelSize.MEDIUM}
          mipmapBlur
        />
        <Vignette offset={0.3} darkness={0.55} eskil={false} blendFunction={BlendFunction.NORMAL} />
        <Noise opacity={0.025} blendFunction={BlendFunction.OVERLAY} />
      </EffectComposer>
    </>
  )
}

export default function Constellation({
  projects, selectedId, onSelect, onDeselect,
  showConnections = true, recentChange, cameraTarget, onProjectAnchor,
}) {
  const [hoveredId, setHoveredId] = useState(null)
  const [autoRotate, setAutoRotate] = useState(true)
  const controlsRef = useRef()
  const idleTimer = useRef(null)

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
  }, [controlsRef.current])

  return (
    <Canvas
      camera={{ position: [0, 1, 28], fov: 45, near: 0.1, far: 200 }}
      gl={{ antialias: true, powerPreference: 'high-performance', alpha: false }}
      dpr={[1, 2]}
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
      />
    </Canvas>
  )
}
