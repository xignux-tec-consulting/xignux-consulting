function App() {
  const [projects, setProjects] = useState(PROJECTS);
  const [selectedId, setSelectedId] = useState(null);
  const [activeView, setActiveView] = useState("graph"); // graph | dashboard | projectDash
  const [chatCollapsed, setChatCollapsed] = useState(true);
  const [showConnections, setShowConnections] = useState(true);
  const [groupBy, setGroupBy] = useState("arquetipo");
  const [recentChange, setRecentChange] = useState(null);
  const [cameraTarget, setCameraTarget] = useState(null);
  const [openDashFor, setOpenDashFor] = useState(null);
  const [legendOpen, setLegendOpen] = useState(false);
  const [controlsOpen, setControlsOpen] = useState(false);
  const [nodeAnchor, setNodeAnchor] = useState(null);

  const selectedProject = selectedId ? projects.find(p => p.id === selectedId) : null;
  const dashProject = openDashFor ? projects.find(p => p.id === openDashFor) : null;

  // when selecting a node, move camera close
  const handleSelect = useCallback((id) => {
    setSelectedId(id);
    const idx = projects.findIndex(p => p.id === id);
    if (idx < 0) return;
    const pos = projectPosition(projects[idx], idx, projects.length);
    // camera offset along node-to-origin axis, slightly outside
    const len = Math.sqrt(pos[0]**2 + pos[1]**2 + pos[2]**2);
    const k = (len + 6) / len;
    const camPos = [pos[0] * k, pos[1] * k + 1, pos[2] * k];
    setCameraTarget({ position: camPos, lookAt: pos, t: performance.now() });
  }, [projects]);

  const handleDeselect = useCallback(() => {
    setSelectedId(null);
    setCameraTarget({ position: [0, 6, 26], lookAt: [0, 0, 0], t: performance.now() });
  }, []);

  const applyAdjustment = useCallback((id, adj) => {
    setProjects((prev) => prev.map(p => p.id === id ? recomputeProject(p, adj) : p));
    setRecentChange({ id, t: performance.now() / 1000 });
    setTimeout(() => setRecentChange(null), 3000);
  }, []);

  const applyOptimization = useCallback(() => {
    setProjects((prev) => prev.map(p => {
      // simulate optimization: nudge dw and dr down by some amount
      const newAdj = {
        dw: Math.max(0.05, p.adjustments.dw - 0.10),
        dr: Math.max(0.05, p.adjustments.dr - 0.05),
      };
      return recomputeProject(p, newAdj);
    }));
    // pulse all
    setRecentChange({ id: "ALL", t: performance.now() / 1000 });
    setTimeout(() => setRecentChange(null), 3000);
  }, []);

  return (
    <div className="w-screen h-screen overflow-hidden relative" style={{ background: "radial-gradient(circle at 50% 50%, #1E293B 0%, #0F172A 40%, #020617 100%)" }}>
      <Sidebar
        activeView={activeView}
        setView={(v) => { setActiveView(v); setOpenDashFor(null); setSelectedId(null); }}
        extras={[
          { id: "legend", icon: Layers, label: "Arquetipos", active: legendOpen, onClick: () => setLegendOpen(o => !o) },
          { id: "controls", icon: SlidersHorizontal, label: "Controles", active: controlsOpen, onClick: () => setControlsOpen(o => !o) },
          { id: "chat", icon: Brain, label: "Asistente", active: !chatCollapsed, onClick: () => setChatCollapsed(c => !c) },
        ]}
      />

      <main className="absolute inset-0 overflow-hidden">
        {/* GRAPH VIEW */}
        <AnimatePresence mode="wait">
          {activeView === "graph" && (
            <motion.div
              key="graph"
              animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
              className="absolute inset-0"
            >
              <Constellation
                projects={projects}
                selectedId={selectedId}
                onSelect={handleSelect}
                onDeselect={handleDeselect}
                showConnections={showConnections}
                recentChange={recentChange}
                cameraTarget={cameraTarget}
                onProjectAnchor={setNodeAnchor}
              />

              {/* title - flotante */}
              <motion.div
                initial={{ y: -20, opacity: 0 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="fixed top-6 left-24 z-20"
              >
                <div className="text-[10px] mono uppercase tracking-[0.25em]" style={{ color: "rgba(255,255,255,0.4)" }}>Constellation</div>
                <h1 className="text-xl font-semibold mt-1" style={{ color: "rgba(255,255,255,0.95)" }}>Portafolio de Impacto · 2024</h1>
              </motion.div>

              <AnimatePresence>
                {legendOpen && <ArchetypeLegend key="legend" open={legendOpen} onClose={() => setLegendOpen(false)} />}
              </AnimatePresence>

              <AnimatePresence>
                {selectedId && <BackChip key="back" onClick={handleDeselect} />}
              </AnimatePresence>

              <AnimatePresence>
                {controlsOpen && (
                  <BottomControls
                    key="controls"
                    open={controlsOpen}
                    setOpen={setControlsOpen}
                    projects={projects}
                    showConnections={showConnections}
                    setShowConnections={setShowConnections}
                    groupBy={groupBy}
                    setGroupBy={setGroupBy}
                    onResetCamera={handleDeselect}
                  />
                )}
              </AnimatePresence>

              <AnimatePresence>
                {selectedProject && (
                  <NodePanel
                    key={selectedProject.id}
                    project={selectedProject}
                    projects={projects}
                    anchor={nodeAnchor}
                    onClose={handleDeselect}
                    onJumpTo={(id) => handleSelect(id)}
                    onOpenDashboard={() => setOpenDashFor(selectedProject.id)}
                  />
                )}
              </AnimatePresence>
            </motion.div>
          )}

          {activeView === "dashboard" && (
            <motion.div
              key="dashboard"
              animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
              className="absolute inset-0"
            >
              <PortfolioDashboard
                projects={projects}
                onOpenProject={(id) => setOpenDashFor(id)}
                onBackToGraph={() => setActiveView("graph")}
              />
            </motion.div>
          )}

          {(activeView === "proxies" || activeView === "bench" || activeView === "optimize" || activeView === "settings") && (
            <motion.div
              key="placeholder"
              animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 flex items-center justify-center"
            >
              <div className="text-center max-w-md px-8">
                <div className="text-[10px] mono uppercase tracking-[0.25em]" style={{ color: "#5e6c87" }}>Próximamente</div>
                <h2 className="text-2xl font-semibold mt-2">
                  {activeView === "proxies" && "Base de proxies"}
                  {activeView === "bench" && "Benchmarks sectoriales"}
                  {activeView === "optimize" && "Asistente de optimización"}
                  {activeView === "settings" && "Configuración"}
                </h2>
                <p className="text-sm mt-2" style={{ color: "#94A3B8" }}>
                  Esta sección está en construcción. Vuelve a la constelación para explorar el portafolio o pregunta al asistente en el panel derecho.
                </p>
                <button
                  onClick={() => setActiveView("graph")}
                  className="mt-5 text-xs px-3 py-2 rounded-lg hover:bg-white/5 transition"
                  style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
                >
                  Volver a la constelación
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* PROJECT DASHBOARD overlay */}
        <AnimatePresence>
          {dashProject && (
            <ProjectDashboard
              key={dashProject.id}
              project={dashProject}
              projects={projects}
              onBack={() => setOpenDashFor(null)}
              onOpenProject={(id) => setOpenDashFor(id)}
            />
          )}
        </AnimatePresence>
      </main>

      <ChatPanel
        collapsed={chatCollapsed}
        setCollapsed={setChatCollapsed}
        projects={projects}
        selectedId={selectedId}
        onSelectProject={(id) => {
          if (activeView !== "graph") setActiveView("graph");
          setOpenDashFor(null);
          handleSelect(id);
        }}
        applyAdjustment={applyAdjustment}
        applyOptimization={applyOptimization}
      />
    </div>
  );
}

const root = createRoot(document.getElementById("root"));
root.render(<App />);
