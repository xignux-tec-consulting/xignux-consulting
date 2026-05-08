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

const NODE_CAM_DIST = 4.5
const DEFAULT_POS = new THREE.Vector3(0, 4, 18)
const ORIGIN = new THREE.Vector3(0, 0, 0)
const PANEL_OFFSET_X = 1.5

export function NodeZoomCamera({ selectedId, projects, positions, controlsRef }) {
  const { camera } = useThree()
  const nodePos = useRef(new THREE.Vector3())
  const camTarget = useRef(new THREE.Vector3())
  const approachDir = useRef(new THREE.Vector3())
  const lookAtTarget = useRef(new THREE.Vector3())
  const prevSelectedId = useRef(null)
  const returning = useRef(false)
  const settled = useRef(false)

  useEffect(() => {
    if (selectedId) {
      returning.current = false
      settled.current = false
    } else if (prevSelectedId.current) {
      returning.current = true
      settled.current = false
    }
    prevSelectedId.current = selectedId
  }, [selectedId])

  useFrame((_, delta) => {
    if (returning.current) {
      const speed = Math.min(1, delta * 5)
      camera.position.lerp(DEFAULT_POS, speed)
      camera.lookAt(ORIGIN)
      if (controlsRef?.current) {
        controlsRef.current.target.copy(ORIGIN)
      }
      if (camera.position.distanceTo(DEFAULT_POS) < 0.2) {
        returning.current = false
        camera.position.copy(DEFAULT_POS)
        if (controlsRef?.current) {
          controlsRef.current.target.copy(ORIGIN)
          controlsRef.current.update()
        }
      }
      return
    }

    if (!selectedId || !positions || !projects) return
    if (settled.current) return
    const idx = projects.findIndex((p) => p.id === selectedId)
    if (idx < 0) return

    const pos = positions[idx]
    nodePos.current.set(pos[0], pos[1], pos[2])

    approachDir.current.copy(DEFAULT_POS).sub(nodePos.current).normalize()
    camTarget.current.copy(nodePos.current).addScaledVector(approachDir.current, NODE_CAM_DIST)

    lookAtTarget.current.set(pos[0] + PANEL_OFFSET_X, pos[1], pos[2])

    const speed = Math.min(1, delta * 4)
    camera.position.lerp(camTarget.current, speed)
    camera.lookAt(lookAtTarget.current)

    if (controlsRef?.current) {
      controlsRef.current.target.copy(lookAtTarget.current)
    }

    if (camera.position.distanceTo(camTarget.current) < 0.1) {
      settled.current = true
      camera.position.copy(camTarget.current)
      camera.lookAt(lookAtTarget.current)
      if (controlsRef?.current) {
        controlsRef.current.target.copy(lookAtTarget.current)
      }
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
