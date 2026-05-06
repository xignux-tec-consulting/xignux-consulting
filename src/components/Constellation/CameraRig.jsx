import { useRef, useEffect } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { projectPosition } from './utils'

export function CameraRig({ targetPosition, targetLookAt, controlsRef }) {
  const { camera } = useThree()
  const startRef = useRef(null)
  const endRef = useRef(null)
  const startTimeRef = useRef(0)
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
        tgt.lerp(new THREE.Vector3(...targetLookAt), 0.1)
        controlsRef.current.update()
      }
      if (t >= 1) { startRef.current = null; endRef.current = null }
    }
  })
  return null
}

export function BrainHoverCamera({ brainHovered, cameraTarget, controlsRef }) {
  const { camera } = useThree()
  const targetPos = useRef(new THREE.Vector3(0, 1, 28))
  useFrame((state, delta) => {
    if (cameraTarget) return
    targetPos.current.set(0, brainHovered ? 0 : 1, brainHovered ? 16 : 28)
    const lerpAmt = Math.min(1, delta * 1.2)
    camera.position.lerp(targetPos.current, lerpAmt)
    camera.lookAt(0, 0, 0)
    if (controlsRef?.current) {
      controlsRef.current.target.lerp(new THREE.Vector3(0, 0, 0), lerpAmt)
      controlsRef.current.update()
    }
  })
  return null
}

export function NodeProjector({ projects, selectedId, onProject }) {
  const { camera, size } = useThree()
  useFrame(() => {
    if (!selectedId) { onProject(null); return }
    const p = projects.find((pr) => pr.id === selectedId)
    if (!p) { onProject(null); return }
    const pos = projectPosition(p)
    const v = new THREE.Vector3(pos[0], pos[1], pos[2])
    v.project(camera)
    const x = (v.x * 0.5 + 0.5) * size.width
    const y = (-v.y * 0.5 + 0.5) * size.height
    const r = 0.3 + Math.max(0, Math.min(1, (p.investment - 200000) / (2000000 - 200000))) * 0.4
    const edge = new THREE.Vector3(pos[0] + r, pos[1], pos[2]).project(camera)
    const ex = (edge.x * 0.5 + 0.5) * size.width
    onProject({ x, y, edgeX: ex })
  })
  return null
}
