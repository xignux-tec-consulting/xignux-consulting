import { useState, useRef, useEffect, useMemo } from 'react'
import { Canvas, useThree } from '@react-three/fiber'
import { OrbitControls, Stars } from '@react-three/drei'
import { EffectComposer, Bloom, Vignette, Noise } from '@react-three/postprocessing'
import { BlendFunction, KernelSize } from 'postprocessing'
import BrainHalo from './BrainHalo'
import NodeMesh from './Node'
import ConnectionsLayer from './Connections'
import { CameraRig, BrainHoverCamera, NodeProjector } from './CameraRig'
import { projectPosition } from './utils'

function SceneBackground({ darkMode }) {
  const { gl } = useThree()
  useEffect(() => {
    gl.setClearColor(darkMode ? '#0A0E1A' : '#0d1422', 1)
  }, [darkMode, gl])
  return null
}

function SceneInner({
  projects, hoveredId, setHoveredId, selectedId, onSelect, onDeselect,
  showConnections, autoRotate, controlsRef, recentChange, cameraTarget, darkMode,
}) {
  const positions = useMemo(() => projects.map((p) => projectPosition(p)), [projects])
  const [brainHovered, setBrainHovered] = useState(false)
  const dispersionRef = useRef(0)

  return (
    <>
      <SceneBackground darkMode={darkMode} />
      <fog attach="fog" args={[darkMode ? '#0a0a0f' : '#0d1220', 26, 70]} />

      <ambientLight intensity={darkMode ? 0.15 : 0.45} color={darkMode ? '#1E293B' : '#E0ECFF'} />
      <directionalLight position={[10, 10, 15]} intensity={darkMode ? 0.5 : 0.8} color="#E0E7FF" />
      <directionalLight position={[-10, -5, -10]} intensity={darkMode ? 0.2 : 0.3} color="#F59E0B" />
      <pointLight position={[0, 0, 5]} intensity={darkMode ? 0.4 : 0.7} color="#FFFFFF" distance={30} />

      <BrainHalo count={3000} isHovered={brainHovered} dispersionRef={dispersionRef} darkMode={darkMode} />
      <mesh
        onPointerEnter={() => setBrainHovered(true)}
        onPointerLeave={() => setBrainHovered(false)}
      >
        <sphereGeometry args={[8, 32, 32]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>

      <Stars radius={120} depth={80} count={darkMode ? 1500 : 800} factor={2} saturation={darkMode ? 0.1 : 0.3} fade speed={0.3} />

      <ConnectionsLayer
        projects={projects}
        positions={positions}
        showConnections={showConnections}
        selectedId={selectedId}
        darkMode={darkMode}
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
  showConnections = true, recentChange, cameraTarget, onProjectAnchor, darkMode = true,
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

  const bgColor = darkMode ? '#0A0E1A' : '#0d1422'

  return (
    <Canvas
      camera={{ position: [0, 1, 28], fov: 45, near: 0.1, far: 200 }}
      gl={{ antialias: true, powerPreference: 'high-performance', alpha: false, clearColor: bgColor }}
      dpr={[1, 2]}
      style={{ background: bgColor, transition: 'background 0.3s' }}
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
        darkMode={darkMode}
      />
    </Canvas>
  )
}
