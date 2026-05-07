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

const PANEL_WIDTH_PX = 420
const NODE_CAM_DIST = 5
const DEFAULT_POS = new THREE.Vector3(0, 1, 14)
const ORIGIN = new THREE.Vector3(0, 0, 0)

export function NodeZoomCamera({ selectedId, projects, positions, controlsRef }) {
  const { camera, size } = useThree()
  const nodePos = useRef(new THREE.Vector3())
  const camDir = useRef(new THREE.Vector3())
  const camTarget = useRef(new THREE.Vector3())
  const rightVec = useRef(new THREE.Vector3())
  const upVec = useRef(new THREE.Vector3(0, 1, 0))
  const lookAtTarget = useRef(new THREE.Vector3())
  const prevSelectedId = useRef(null)
  const returning = useRef(false)

  useEffect(() => {
    if (prevSelectedId.current && !selectedId) {
      returning.current = true
    }
    prevSelectedId.current = selectedId
  }, [selectedId])

  useFrame((_, delta) => {
    if (returning.current) {
      const speed = Math.min(1, delta * 2.2)
      camera.position.lerp(DEFAULT_POS, speed)
      if (controlsRef?.current) {
        controlsRef.current.target.lerp(ORIGIN, speed)
        controlsRef.current.update()
      }
      if (camera.position.distanceTo(DEFAULT_POS) < 0.05) {
        returning.current = false
      }
      return
    }

    if (!selectedId || !positions || !projects) return
    const idx = projects.findIndex((p) => p.id === selectedId)
    if (idx < 0) return

    const pos = positions[idx]
    nodePos.current.set(pos[0], pos[1], pos[2])

    const dist = nodePos.current.length() || 0.001
    camDir.current.copy(nodePos.current).multiplyScalar(1 / dist)
    camTarget.current.copy(nodePos.current).addScaledVector(camDir.current, NODE_CAM_DIST)

    const speed = Math.min(1, delta * 1.8)
    camera.position.lerp(camTarget.current, speed)

    const fovRad = (camera.fov * Math.PI) / 180
    const worldWidth = 2 * Math.tan(fovRad / 2) * NODE_CAM_DIST
    const panelOffsetWorld = (PANEL_WIDTH_PX / 2 / size.width) * worldWidth
    rightVec.current.crossVectors(camDir.current, upVec.current).normalize().negate()
    lookAtTarget.current.copy(nodePos.current).addScaledVector(rightVec.current, panelOffsetWorld)
    camera.lookAt(lookAtTarget.current)

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
