import { useState, useRef, useMemo, useCallback, useEffect } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { EffectComposer, Bloom, Noise } from '@react-three/postprocessing'
import { BlendFunction, KernelSize } from 'postprocessing'
import NodeMesh from './Node'
import ConnectionsLayer from './Connections'
import GroupRegions from './GroupRegions'
import { CameraRig, NodeProjector, NodeZoomCamera } from './CameraRig'
import { computePositions, getGroupRegions } from './utils'

function SceneInner({
  projects, hoveredId, setHoveredId, selectedId, onSelect, onDeselect,
  showConnections, autoRotate, controlsRef, recentChange, cameraTarget, groupBy,
}) {
  const positions = useMemo(() => computePositions(projects, groupBy), [projects, groupBy])
  const regions = useMemo(() => getGroupRegions(projects, positions, groupBy), [projects, positions, groupBy])
  const radii = useMemo(
    () => projects.map((p) => 0.2 + Math.max(0, Math.min(1, (p.investment - 200000) / (2000000 - 200000))) * 0.3),
    [projects]
  )

  const handleHover = useCallback((id) => { setHoveredId(id) }, [setHoveredId])
  const handleUnhover = useCallback((id) => { setHoveredId((h) => (h === id ? null : h)) }, [setHoveredId])
  const handleSelect = useCallback((id) => { onSelect(id) }, [onSelect])

  return (
    <>
      <fog attach="fog" args={['#F0EDE8', 40, 90]} />
      <color attach="background" args={['#F0EDE8']} />

      <ambientLight intensity={0.6} color="#FFFFFF" />
      <directionalLight position={[10, 12, 15]} intensity={0.8} color="#FFF8F0" />
      <directionalLight position={[-8, -4, -10]} intensity={0.3} color="#E8520E" />
      <pointLight position={[0, 0, 6]} intensity={0.3} color="#FFFFFF" distance={30} />
      <hemisphereLight args={['#FFF8F0', '#E5E0DA', 0.4]} />

      {!selectedId && <GroupRegions regions={regions} groupBy={groupBy} />}

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
        minDistance={8}
        maxDistance={45}
      />

      <EffectComposer multisampling={0}>
        <Bloom
          intensity={0.25}
          luminanceThreshold={0.7}
          luminanceSmoothing={0.9}
          kernelSize={KernelSize.VERY_SMALL}
        />
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
      camera={{ position: [0, 4, 18], fov: 45, near: 0.1, far: 200 }}
      gl={{ antialias: true, powerPreference: 'high-performance', alpha: false }}
      dpr={[1, 1.5]}
      frameloop={paused ? 'never' : 'always'}
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
