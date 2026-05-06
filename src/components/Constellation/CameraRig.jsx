import { useRef, useEffect } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { projectPosition } from './utils'

export function CameraRig({ targetPosition, targetLookAt, controlsRef }) {
  const { camera } = useThree()
  const startRef = useRef(null)
  const endRef = useRef(null)
  const startTimeRef = useRef(0)
  const lookAtVec = useRef(new THREE.Vector3())
  const durationMs = 800

  useEffect(() => {
    if (targetPosition) {
      startRef.current = camera.position.clone()
      endRef.current = new THREE.Vector3(...targetPosition)
      startTimeRef.current = performance.now()
    }
  }, [targetPosition && targetPosition.join(',')])

  useFrame(() => {
    if (startRef.current && endRef.current) {
      const t = Math.min(1, (performance.now() - startTimeRef.current) / durationMs)
      const eased = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
      camera.position.lerpVectors(startRef.current, endRef.current, eased)
      if (controlsRef.current && targetLookAt) {
        const tgt = controlsRef.current.target
        tgt.lerp(lookAtVec.current.set(...targetLookAt), 0.1)
        controlsRef.current.update()
      }
      if (t >= 1) { startRef.current = null; endRef.current = null }
    }
  })
  return null
}

export function BrainHoverCamera({ brainHovered, cameraTarget, controlsRef }) {
  const { camera } = useThree()
  const targetPos = useRef(new THREE.Vector3(0, 1, 18))
  const zeroVec = useRef(new THREE.Vector3(0, 0, 0))
  useFrame((state, delta) => {
    if (cameraTarget) return
    targetPos.current.set(0, brainHovered ? 0 : 1, brainHovered ? 16 : 18)
    const lerpAmt = Math.min(1, delta * 1.2)
    camera.position.lerp(targetPos.current, lerpAmt)
    camera.lookAt(0, 0, 0)
    // Sync target reference only — no controls.update() to avoid double-update conflict
    if (controlsRef?.current) {
      controlsRef.current.target.lerp(zeroVec.current, lerpAmt)
    }
  })
  return null
}

export function NodeZoomCamera({ selectedId, projects, positions, controlsRef }) {
  const { camera } = useThree()
  const nodePos = useRef(new THREE.Vector3())
  const camDir = useRef(new THREE.Vector3())
  const camTarget = useRef(new THREE.Vector3())
  const rightVec = useRef(new THREE.Vector3())
  const upVec = useRef(new THREE.Vector3(0, 1, 0))
  const lookAtTarget = useRef(new THREE.Vector3())

  useFrame((_, delta) => {
    if (!selectedId || !positions || !projects) return
    const idx = projects.findIndex((p) => p.id === selectedId)
    if (idx < 0) return

    const pos = positions[idx]
    nodePos.current.set(pos[0], pos[1], pos[2])

    // Camera sits 5 units radially outward from the node (away from origin)
    const dist = nodePos.current.length() || 0.001
    camDir.current.copy(nodePos.current).multiplyScalar(1 / dist)
    camTarget.current.copy(nodePos.current).addScaledVector(camDir.current, 5)

    const speed = Math.min(1, delta * 1.8)
    camera.position.lerp(camTarget.current, speed)

    // Offset lookAt right by 1.5 units so node appears in the visible area center
    // (compensates for the ~420px right panel). right = -normalize(camDir × worldUp)
    rightVec.current.crossVectors(camDir.current, upVec.current).normalize().negate()
    lookAtTarget.current.copy(nodePos.current).addScaledVector(rightVec.current, 1.5)
    camera.lookAt(lookAtTarget.current)

    // Keep target in sync for when OrbitControls re-enables on deselect
    if (controlsRef?.current) {
      controlsRef.current.target.copy(nodePos.current)
    }
  })
  return null
}

export function NodeProjector({ projects, selectedId, onProject }) {
  const { camera, size } = useThree()
  const vRef = useRef(new THREE.Vector3())
  const edgeRef = useRef(new THREE.Vector3())
  useFrame(() => {
    if (!selectedId) { onProject(null); return }
    const p = projects.find((pr) => pr.id === selectedId)
    if (!p) { onProject(null); return }
    const pos = projectPosition(p)
    vRef.current.set(pos[0], pos[1], pos[2]).project(camera)
    const x = (vRef.current.x * 0.5 + 0.5) * size.width
    const y = (-vRef.current.y * 0.5 + 0.5) * size.height
    const r = 0.3 + Math.max(0, Math.min(1, (p.investment - 200000) / (2000000 - 200000))) * 0.4
    edgeRef.current.set(pos[0] + r, pos[1], pos[2]).project(camera)
    const ex = (edgeRef.current.x * 0.5 + 0.5) * size.width
    onProject({ x, y, edgeX: ex })
  })
  return null
}
