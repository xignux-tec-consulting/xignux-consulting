// 3D position by SROI band + archetype slice
const projectPosition = (p) => {
  let R;
  if (p.sroi > 2) R = 1.2;
  else if (p.sroi >= 1) R = 2.5;
  else R = 4;

  const archIdx = "ABCDE".indexOf(p.archetype);
  const sliceCenter = (archIdx / 5) * Math.PI * 2;
  const seed = (p.id.charCodeAt(1) * 13 + p.id.charCodeAt(2) * 7) % 100;
  const theta = sliceCenter + ((seed / 100) - 0.5) * 0.9;
  const phi = Math.PI * (0.25 + ((seed * 1.7) % 100) / 100 * 0.5);

  return [
    R * Math.sin(phi) * Math.cos(theta),
    R * Math.cos(phi) * 0.85,
    R * Math.sin(phi) * Math.sin(theta),
  ];
};

const projectRadius = (p) => {
  const t = (p.investment - 200000) / (2000000 - 200000);
  return 0.3 + Math.max(0, Math.min(1, t)) * 0.4; // 0.3 .. 0.7
};

// Glass-bead palette: per-SROI fill, emissive intensity, opacity, clearcoat
const nodeMatProps = (sroi) => {
  if (sroi >= 2) return { color: "#10B981", emi: 1.8, opacity: 0.9, clearcoat: 0.9 };
  if (sroi >= 1) return { color: "#F59E0B", emi: 1.2, opacity: 0.85, clearcoat: 0.8 };
  return { color: "#7F1D1D", emi: 0.4, opacity: 0.7, clearcoat: 0.6 };
};

// ───────── Particle Halo ─────────

// Soft circular gradient texture — makes points look pre-blurred
let __softParticleTexture = null;
const getSoftParticleTexture = () => {
  if (__softParticleTexture) return __softParticleTexture;
  const canvas = document.createElement("canvas");
  canvas.width = 64; canvas.height = 64;
  const ctx = canvas.getContext("2d");
  const g = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
  g.addColorStop(0, "rgba(255,255,255,1)");
  g.addColorStop(0.3, "rgba(255,255,255,0.4)");
  g.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = g; ctx.fillRect(0, 0, 64, 64);
  __softParticleTexture = new THREE_NS.CanvasTexture(canvas);
  return __softParticleTexture;
};

// Brain-shaped particle cloud with hover dispersion
const generateBrainPositions = (count) => {
  const positions = new Float32Array(count * 3);
  const targetIdle = new Float32Array(count * 3);
  const targetDispersed = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    const isLeft = i % 2 === 0;
    const hemisphereSign = isLeft ? -1 : 1;
    const u = Math.random(), v = Math.random();
    const w = Math.pow(Math.random(), 0.4);
    const theta = u * Math.PI * 2;
    const phi = Math.acos(2 * v - 1);
    let lx = 5.0 * w * Math.sin(phi) * Math.cos(theta);
    let ly = 4.0 * w * Math.sin(phi) * Math.sin(theta);
    let lz = 4.5 * w * Math.cos(phi);
    if (ly < 0) ly *= 0.65;
    const distanceFromMidline = Math.abs(lx);
    if (distanceFromMidline < 1.5) lx *= 0.5;
    if (lz > 0) lz *= 1.15; else lz *= 0.9;
    const wrinkle = Math.sin(theta * 7 + phi * 3) * Math.cos(phi * 5) * 0.6;
    const len = Math.sqrt(lx*lx + ly*ly + lz*lz) || 1;
    lx += (lx/len) * wrinkle;
    ly += (ly/len) * wrinkle;
    lz += (lz/len) * wrinkle;
    const x = lx + hemisphereSign * (Math.abs(lx) > 1 ? 1.5 : 0.5);
    const y = ly;
    const z = lz;
    const noise = 0.25;
    targetIdle[i*3]   = x + (Math.random() - 0.5) * noise;
    targetIdle[i*3+1] = y + (Math.random() - 0.5) * noise;
    targetIdle[i*3+2] = z + (Math.random() - 0.5) * noise;
    const dispRadius = 9 + Math.random() * 5;
    const dispTheta = Math.random() * Math.PI * 2;
    const dispPhi = Math.acos(2 * Math.random() - 1);
    targetDispersed[i*3]   = dispRadius * Math.sin(dispPhi) * Math.cos(dispTheta);
    targetDispersed[i*3+1] = dispRadius * Math.sin(dispPhi) * Math.sin(dispTheta);
    targetDispersed[i*3+2] = dispRadius * Math.cos(dispPhi);
    positions[i*3] = targetIdle[i*3];
    positions[i*3+1] = targetIdle[i*3+1];
    positions[i*3+2] = targetIdle[i*3+2];
  }
  return { positions, targetIdle, targetDispersed };
};

function BrainHalo({ count = 3000, isHovered, dispersionRef }) {
  const groupRef = useRef();
  const pointsRef = useRef();
  const localDispersion = useRef(0);
  const colorRef = useMemo(() => new THREE_NS.Color(), []);
  const idleColor = useMemo(() => new THREE_NS.Color('#3B82F6'), []);
  const dispersedColor = useMemo(() => new THREE_NS.Color('#64748B'), []);
  const { positions, targetIdle, targetDispersed } = useMemo(() => generateBrainPositions(count), [count]);
  const geometry = useMemo(() => {
    const g = new THREE_NS.BufferGeometry();
    g.setAttribute('position', new THREE_NS.BufferAttribute(positions, 3));
    return g;
  }, [positions]);

  useFrame((state, delta) => {
    if (!pointsRef.current) return;
    const target = isHovered ? 1 : 0;
    const speed = isHovered ? delta * 1.0 : delta * 1.2;
    localDispersion.current += (target - localDispersion.current) * Math.min(1, speed);
    const t = localDispersion.current;
    const eased = 1 - Math.pow(1 - t, 3);
    if (dispersionRef) dispersionRef.current = eased;
    const arr = pointsRef.current.geometry.attributes.position.array;
    for (let i = 0; i < arr.length / 3; i++) {
      arr[i*3]   = THREE_NS.MathUtils.lerp(targetIdle[i*3],   targetDispersed[i*3],   eased);
      arr[i*3+1] = THREE_NS.MathUtils.lerp(targetIdle[i*3+1], targetDispersed[i*3+1], eased);
      arr[i*3+2] = THREE_NS.MathUtils.lerp(targetIdle[i*3+2], targetDispersed[i*3+2], eased);
    }
    pointsRef.current.geometry.attributes.position.needsUpdate = true;
    const mat = pointsRef.current.material;
    if (mat) {
      mat.size = THREE_NS.MathUtils.lerp(0.18, 0.08, eased);
      mat.opacity = THREE_NS.MathUtils.lerp(0.85, 0.35, eased);
      // Color stays #3B82F6 fixed — brain identity
    }
    if (groupRef.current) {
      // initial 3/4 view
      if (groupRef.current.rotation.y === 0) groupRef.current.rotation.y = -0.3;
      groupRef.current.rotation.y += delta * 0.05 * (1 - eased);
    }
  });

  return (
    <group ref={groupRef}>
      <points ref={pointsRef} geometry={geometry}>
        <pointsMaterial
          map={getSoftParticleTexture()}
          size={0.18}
          color="#3B82F6"
          transparent
          opacity={0.85}
          sizeAttenuation
          depthWrite={false}
          alphaTest={0.001}
          blending={THREE_NS.AdditiveBlending}
          toneMapped={false}
        />
      </points>
    </group>
  );
}

// ───────── Node ─────────

function NodeMesh({ project, position, radius, hovered, selected, dimmed, brainHovered, dispersionRef, onHover, onUnhover, onClick, recentChange }) {
  const meshRef = useRef();
  const matRef = useRef();
  const lightRef = useRef();
  const phase = useMemo(() => Math.random() * Math.PI * 2, []);
  const idHash = useMemo(() => (project.id.charCodeAt(1) + project.id.charCodeAt(2)) * 0.1, [project.id]);
  const mp = nodeMatProps(project.sroi);
  const color = mp.color;
  const baseEmissive = mp.emi;

  useFrame((state) => {
    if (!meshRef.current) return;
    const t = state.clock.elapsedTime;
    const breathe = 1 + Math.sin(t * 0.3 + phase) * 0.02;
    let target = breathe;
    if (hovered || selected) target = 1.3 * breathe;

    let pulseMul = 1;
    if (recentChange && recentChange.id === project.id) {
      const age = t - recentChange.t;
      if (age < 2.4) pulseMul = 1 + Math.abs(Math.sin(age * Math.PI * 2)) * 0.45 * Math.max(0, 1 - age / 2.4);
    }
    const cur = meshRef.current.scale.x;
    const next = THREE_NS.MathUtils.lerp(cur, target * pulseMul, 0.12);
    meshRef.current.scale.set(next, next, next);

    if (matRef.current) {
      const liveMul = 1 + Math.sin(t * 0.4 + idHash) * 0.12;
      // Inversion: idle (cloud closed) brilla mucho, hover (cloud disperses) baja
      const stateMul = brainHovered ? 0.7 : 2.5;
      const focusBoost = (hovered || selected) ? 1.5 : 1.0;
      const dimMul = dimmed ? 0.4 : 1.0;
      matRef.current.emissiveIntensity = baseEmissive * stateMul * liveMul * focusBoost * dimMul;
      // Material-driven blur sim: idle = translúcido suave, hover = nítido sólido
      const d = dispersionRef?.current ?? 0;
      matRef.current.opacity = THREE_NS.MathUtils.lerp(0.55, 0.92, d);
      matRef.current.transmission = THREE_NS.MathUtils.lerp(0.4, 0.05, d);
      matRef.current.roughness = THREE_NS.MathUtils.lerp(0.4, 0.15, d);
    }
    if (lightRef.current) {
      lightRef.current.intensity = brainHovered ? 0.3 : 1.2;
      lightRef.current.distance = brainHovered ? 3 : 8;
    }
  });

  return (
    <group position={position}>
      <mesh
        ref={meshRef}
        onPointerOver={(e) => { e.stopPropagation(); onHover(); document.body.style.cursor = "pointer"; }}
        onPointerOut={() => { onUnhover(); document.body.style.cursor = "auto"; }}
        onClick={(e) => { e.stopPropagation(); onClick(); }}
      >
        <sphereGeometry args={[radius, 64, 64]} />
        <meshPhysicalMaterial
          ref={matRef}
          color={color}
          emissive={color}
          emissiveIntensity={baseEmissive * 2.5}
          transparent
          opacity={0.7}
          roughness={0.15}
          metalness={0.05}
          clearcoat={0.9}
          clearcoatRoughness={0.05}
          toneMapped={false}
          side={THREE_NS.FrontSide}
        />
      </mesh>
      <pointLight ref={lightRef} color={color} intensity={1.2} distance={8} decay={2} />

      {selected && <SelectionRing radius={radius} />}

      {(hovered || selected) && (
        <Html center distanceFactor={12} zIndexRange={[100, 0]} style={{ pointerEvents: "none" }}>
          <div className="node-tooltip">
            <div className="node-tooltip-name">{project.name}</div>
            <div className="node-tooltip-meta">
              <span className="mono" style={{ color }}>{project.sroi.toFixed(2)}x</span>
              <span style={{ opacity: 0.5 }}>·</span>
              <span className="mono">{fmtMXN(project.investment)}</span>
            </div>
          </div>
        </Html>
      )}
    </group>
  );
}

function SelectionRing({ radius }) {
  const ringRef = useRef();
  const scaleRef = useRef(0);
  useFrame((state, delta) => {
    if (ringRef.current) {
      scaleRef.current = THREE_NS.MathUtils.lerp(scaleRef.current, 1, 0.12);
      ringRef.current.scale.setScalar(scaleRef.current);
      ringRef.current.rotation.z += delta * 0.4;
    }
  });
  return (
    <mesh ref={ringRef} rotation={[Math.PI / 2, 0, 0]}>
      <torusGeometry args={[radius * 1.8, 0.02, 16, 100]} />
      <meshBasicMaterial color="#FFFFFF" transparent opacity={0.4} toneMapped={false} />
    </mesh>
  );
}

// ───────── Camera rig ─────────

function CameraRig({ targetPosition, targetLookAt, controlsRef }) {
  const { camera } = useThree();
  const startRef = useRef(null);
  const endRef = useRef(null);
  const startTimeRef = useRef(0);
  const durationMs = 800;

  useEffect(() => {
    if (targetPosition) {
      startRef.current = camera.position.clone();
      endRef.current = new THREE_NS.Vector3(...targetPosition);
      startTimeRef.current = performance.now();
    }
  }, [targetPosition && targetPosition.join(",")]);

  useFrame(() => {
    if (startRef.current && endRef.current) {
      const t = Math.min(1, (performance.now() - startTimeRef.current) / durationMs);
      const eased = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
      camera.position.lerpVectors(startRef.current, endRef.current, eased);
      if (controlsRef.current && targetLookAt) {
        const tgt = controlsRef.current.target;
        tgt.lerp(new THREE_NS.Vector3(...targetLookAt), 0.1);
        controlsRef.current.update();
      }
      if (t >= 1) { startRef.current = null; endRef.current = null; }
    }
  });
  return null;
}

// ───────── Connections (archetype only, max 4 per node, top-3 SROI to origin) ─────────

function ConnectionsLayer({ projects, positions, showConnections, selectedId }) {
  const lines = useMemo(() => {
    if (!showConnections) return [];
    const result = [];
    const topIds = new Set([...projects].sort((a, b) => b.sroi - a.sroi).slice(0, 3).map((p) => p.id));

    // archetype pairs — limit to max 4 per node
    const byArch = {};
    projects.forEach((p, i) => { (byArch[p.archetype] = byArch[p.archetype] || []).push(i); });
    const degree = new Array(projects.length).fill(0);

    Object.values(byArch).forEach((idxs) => {
      // sort by SROI desc so the strongest pair first
      const sorted = idxs.map((i) => ({ i, sroi: projects[i].sroi })).sort((a, b) => b.sroi - a.sroi);
      for (let a = 0; a < sorted.length; a++) {
        for (let b = a + 1; b < sorted.length; b++) {
          const i = sorted[a].i, j = sorted[b].i;
          if (degree[i] >= 4 || degree[j] >= 4) continue;
          const pa = projects[i], pb = projects[j];
          const isTop = topIds.has(pa.id) && topIds.has(pb.id);
          result.push({
            from: positions[i], to: positions[j],
            opacity: isTop ? 0.28 : 0.16,
            width: isTop ? 0.7 : 0.5,
            ids: [pa.id, pb.id],
            key: `${pa.id}-${pb.id}`,
          });
          degree[i]++; degree[j]++;
        }
      }
    });

    // top-3 SROI connected to origin
    [...projects].map((p, i) => ({ p, i })).sort((a, b) => b.p.sroi - a.p.sroi).slice(0, 3).forEach(({ p, i }) => {
      result.push({
        from: positions[i], to: [0, 0, 0],
        opacity: 0.22, width: 0.6,
        ids: [p.id, "__origin"],
        key: `origin-${p.id}`,
      });
    });

    return result;
  }, [projects, positions, showConnections]);

  return (
    <>
      {lines.map((l) => {
        const involved = selectedId && l.ids.includes(selectedId);
        return (
          <DLine
            key={l.key}
            points={[l.from, l.to]}
            color={involved ? "#FFFFFF" : "#CBD5E1"}
            lineWidth={involved ? 1.6 : (l.width || 0.6)}
            transparent
            opacity={involved ? 0.8 : (l.opacity || 0.2)}
            toneMapped={false}
          />
        );
      })}
    </>
  );
}

// ───────── Scene ─────────

function SceneInner({ projects, hoveredId, setHoveredId, selectedId, onSelect, onDeselect, showConnections, autoRotate, controlsRef, recentChange, cameraTarget }) {
  const positions = useMemo(() => projects.map((p) => projectPosition(p)), [projects]);
  const [brainHovered, setBrainHovered] = useState(false);
  const dispersionRef = useRef(0);

  return (
    <>
      <fog attach="fog" args={["#0a0a0f", 26, 70]} />

      {/* 3-point cinematic lighting */}
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

      <ConnectionsLayer projects={projects} positions={positions} showConnections={showConnections} selectedId={selectedId} />

      {projects.map((p, i) => (
        <NodeMesh
          key={p.id}
          project={p}
          position={positions[i]}
          radius={projectRadius(p)}
          hovered={hoveredId === p.id}
          selected={selectedId === p.id}
          dimmed={selectedId && selectedId !== p.id}
          brainHovered={brainHovered}
          dispersionRef={dispersionRef}
          onHover={() => setHoveredId(p.id)}
          onUnhover={() => setHoveredId((h) => h === p.id ? null : h)}
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

      <BrainHoverCamera brainHovered={brainHovered} cameraTarget={cameraTarget} controlsRef={controlsRef} />

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

      {/* Postprocessing */}
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
  );
}

// (DoF removed — blur is simulated via node material)

function BrainHoverCamera({ brainHovered, cameraTarget, controlsRef }) {
  const { camera } = useThree();
  const targetPos = useRef(new THREE_NS.Vector3(0, 1, 28));
  useFrame((state, delta) => {
    // Don't fight an explicit cameraTarget (selecting a node)
    if (cameraTarget) return;
    targetPos.current.set(0, brainHovered ? 0 : 1, brainHovered ? 16 : 28);
    const lerpAmt = Math.min(1, delta * 1.2);
    camera.position.lerp(targetPos.current, lerpAmt);
    camera.lookAt(0, 0, 0);
    if (controlsRef?.current) {
      controlsRef.current.target.lerp(new THREE_NS.Vector3(0, 0, 0), lerpAmt);
      controlsRef.current.update();
    }
  });
  return null;
}

// (placeholder removed)

function NodeProjector({ projects, selectedId, onProject }) {
  const { camera, size } = useThree();
  useFrame(() => {
    if (!selectedId) { onProject(null); return; }
    const p = projects.find(pr => pr.id === selectedId);
    if (!p) { onProject(null); return; }
    const pos = projectPosition(p);
    const v = new THREE_NS.Vector3(pos[0], pos[1], pos[2]);
    v.project(camera);
    const x = (v.x * 0.5 + 0.5) * size.width;
    const y = (-v.y * 0.5 + 0.5) * size.height;
    const r = projectRadius(p);
    // edge offset (project a point at radius offset along view-right)
    const edge = new THREE_NS.Vector3(pos[0] + r, pos[1], pos[2]).project(camera);
    const ex = (edge.x * 0.5 + 0.5) * size.width;
    onProject({ x, y, edgeX: ex });
  });
  return null;
}

function Constellation({
  projects, selectedId, onSelect, onDeselect,
  showConnections = true, recentChange, cameraTarget, onProjectAnchor,
}) {
  const [hoveredId, setHoveredId] = useState(null);
  const [autoRotate, setAutoRotate] = useState(true);
  const controlsRef = useRef();
  const idleTimer = useRef(null);

  useEffect(() => {
    const ctrl = controlsRef.current;
    if (!ctrl) return;
    const onStart = () => { setAutoRotate(false); clearTimeout(idleTimer.current); };
    const onEnd = () => { clearTimeout(idleTimer.current); idleTimer.current = setTimeout(() => setAutoRotate(true), 4500); };
    ctrl.addEventListener("start", onStart);
    ctrl.addEventListener("end", onEnd);
    return () => { ctrl.removeEventListener("start", onStart); ctrl.removeEventListener("end", onEnd); };
  }, [controlsRef.current]);

  return (
    <Canvas
      camera={{ position: [0, 1, 28], fov: 45, near: 0.1, far: 200 }}
      gl={{ antialias: true, powerPreference: "high-performance", alpha: false }}
      dpr={[1, 2]}
      style={{ background: "transparent" }}
    >
      {onProjectAnchor && <NodeProjector projects={projects} selectedId={selectedId} onProject={onProjectAnchor} />}
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
  );
}
