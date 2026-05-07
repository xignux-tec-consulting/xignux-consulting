import { useState, useCallback, useRef, useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Network, LayoutList } from 'lucide-react'
import Constellation from './components/Constellation'
import Sidebar from './components/Sidebar'
import ChatPanel from './components/ChatPanel'
import NodePanel from './components/NodePanel'
import { BottomControls, ArchetypeLegend, BackChip } from './components/ui/Controls'
import PortfolioDashboard from './components/Dashboard/Portfolio'
import ProjectDashboard from './components/Dashboard/Project'
import { PROJECTS } from './data/projects'
import { recomputeProject } from './lib/sroi'

export default function App() {
  const [projects, setProjects] = useState(PROJECTS)
  const [selectedId, setSelectedId] = useState(null)
  const [nodeAnchor, setNodeAnchor] = useState(null)
  const [activeView, setActiveView] = useState('graph')
  const [chatCollapsed, setChatCollapsed] = useState(false)
  const [showConnections, setShowConnections] = useState(true)
  const [groupBy, setGroupBy] = useState('sroi')
  const [recentChange, setRecentChange] = useState(null)
  const [cameraTarget, setCameraTarget] = useState(null)
  const [openDashFor, setOpenDashFor] = useState(null)
  const [legendOpen, setLegendOpen] = useState(false)
  const [controlsOpen, setControlsOpen] = useState(true)

  const resetCameraRef = useRef(null)
  const transitionLockRef = useRef(false)

  const selectedProject = projects.find((p) => p.id === selectedId) || null
  const openDashProject = projects.find((p) => p.id === openDashFor) || null

  const handleSelect = useCallback((id, anchor) => {
    setSelectedId(id)
    setNodeAnchor(anchor || null)
    setCameraTarget(id)
  }, [])

  const handleDeselect = useCallback(() => {
    setSelectedId(null)
    setNodeAnchor(null)
    setCameraTarget(null)
  }, [])

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') handleDeselect() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [handleDeselect])

  const handleGroupByChange = useCallback((newMode) => {
    if (newMode === groupBy) return
    if (transitionLockRef.current) return
    transitionLockRef.current = true

    if (selectedId) {
      handleDeselect()
      setTimeout(() => {
        setGroupBy(newMode)
        setTimeout(() => { transitionLockRef.current = false }, 1500)
      }, 350)
    } else {
      setGroupBy(newMode)
      setTimeout(() => { transitionLockRef.current = false }, 1500)
    }
  }, [groupBy, selectedId, handleDeselect])

  const handleJumpTo = useCallback((id) => {
    setSelectedId(id)
    setNodeAnchor(null)
    setCameraTarget(id)
  }, [])

  const applyAdjustment = useCallback((id, adj) => {
    setProjects((prev) =>
      prev.map((p) => {
        if (p.id !== id) return p
        const updated = recomputeProject(p, adj)
        return updated
      })
    )
    setRecentChange(id)
    setTimeout(() => setRecentChange(null), 3000)
  }, [])

  const applyOptimization = useCallback(() => {
    setProjects((prev) =>
      prev.map((p) => {
        const opt = {
          dw: Math.max(0, p.adjustments.dw - 0.05),
          at: Math.max(0, p.adjustments.at - 0.03),
          dp: p.adjustments.dp,
          dr: Math.max(0, p.adjustments.dr - 0.02),
        }
        return recomputeProject(p, opt)
      })
    )
    setRecentChange('ALL')
    setTimeout(() => setRecentChange(null), 3000)
  }, [])

  const handleOpenProjectDash = useCallback((id) => {
    setOpenDashFor(id)
  }, [])

  const handleCloseProjectDash = useCallback(() => {
    setOpenDashFor(null)
  }, [])

  const sidebarExtras = activeView === 'graph' && selectedProject
    ? [{ icon: 'dashboard', label: 'Dashboard', onClick: () => handleOpenProjectDash(selectedId) }]
    : []

  const isPortfolioView = activeView === 'portfolio'
  const isProjectDashOpen = !!openDashProject

  return (
    <div className="w-screen h-screen overflow-hidden relative" style={{ background: '#0A0E1A' }}>
      {/* 3D Constellation (always mounted, hidden behind overlays) */}
      <div
        className="absolute inset-0"
        style={{ visibility: isPortfolioView ? 'hidden' : 'visible' }}
      >
        <Constellation
          projects={projects}
          selectedId={selectedId}
          recentChange={recentChange}
          showConnections={showConnections}
          groupBy={groupBy}
          onSelect={handleSelect}
          onDeselect={handleDeselect}
          onResetCamera={(fn) => { resetCameraRef.current = fn }}
        />
      </div>

      {/* Portfolio Overview */}
      <AnimatePresence>
        {isPortfolioView && (
          <PortfolioDashboard
            projects={projects}
            onOpenProject={(id) => {
              setActiveView('graph')
              handleSelect(id)
              handleOpenProjectDash(id)
            }}
            onBackToGraph={() => setActiveView('graph')}
          />
        )}
      </AnimatePresence>

      {/* Project Drill-down */}
      <AnimatePresence>
        {isProjectDashOpen && (
          <ProjectDashboard
            project={openDashProject}
            projects={projects}
            onBack={handleCloseProjectDash}
          />
        )}
      </AnimatePresence>

      {/* Node detail panel (shown in graph view when a node is selected) */}
      <AnimatePresence>
        {!isPortfolioView && !isProjectDashOpen && selectedProject && (
          <NodePanel
            project={selectedProject}
            projects={projects}
            anchor={nodeAnchor}
            onClose={handleDeselect}
            onJumpTo={handleJumpTo}
            onOpenDashboard={() => handleOpenProjectDash(selectedId)}
          />
        )}
      </AnimatePresence>

      {/* Back chip (graph view when node selected) */}
      <AnimatePresence>
        {!isPortfolioView && !isProjectDashOpen && selectedProject && (
          <BackChip onClick={handleDeselect} />
        )}
      </AnimatePresence>

      {/* Mode toggle — top center, always visible except inside project drill-down */}
      {!isProjectDashOpen && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 pointer-events-auto">
          <div
            className="flex items-center gap-0.5 p-1 rounded-full"
            style={{
              background: 'rgba(10,14,26,0.82)',
              border: '1px solid rgba(255,255,255,0.1)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              boxShadow: '0 4px 24px -8px rgba(0,0,0,0.6)',
            }}
          >
            {[
              { id: 'graph',     label: 'Explorar', Icon: Network    },
              { id: 'portfolio', label: 'Decidir',  Icon: LayoutList },
            ].map(({ id, label, Icon }) => {
              const active = activeView === id
              return (
                <motion.button
                  key={id}
                  onClick={() => setActiveView(id)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors relative"
                  style={{ color: active ? '#fff' : 'rgba(255,255,255,0.45)', position: 'relative' }}
                  whileTap={{ scale: 0.96 }}
                >
                  {active && (
                    <motion.div
                      layoutId="view-pill"
                      className="absolute inset-0 rounded-full"
                      style={{ background: 'rgba(46,117,182,0.55)', border: '1px solid rgba(46,117,182,0.5)' }}
                      transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                    />
                  )}
                  <Icon className="w-3.5 h-3.5 relative z-10" />
                  <span className="relative z-10">{label}</span>
                </motion.button>
              )
            })}
          </div>
        </div>
      )}

      {/* Sidebar */}
      {!isProjectDashOpen && (
        <Sidebar
          activeView={activeView}
          onChangeView={setActiveView}
          legendOpen={legendOpen}
          setLegendOpen={setLegendOpen}
          controlsOpen={controlsOpen}
          setControlsOpen={setControlsOpen}
          extras={sidebarExtras}
        />
      )}

      {/* Archetype legend popover */}
      <AnimatePresence>
        {legendOpen && !isProjectDashOpen && (
          <ArchetypeLegend open={legendOpen} onClose={() => setLegendOpen(false)} />
        )}
      </AnimatePresence>

      {/* Bottom controls strip */}
      <AnimatePresence>
        {!isPortfolioView && !isProjectDashOpen && controlsOpen && (
          <BottomControls
            projects={projects}
            open={controlsOpen}
            setOpen={setControlsOpen}
            showConnections={showConnections}
            setShowConnections={setShowConnections}
            groupBy={groupBy}
            setGroupBy={handleGroupByChange}
            onResetCamera={() => resetCameraRef.current?.()}
          />
        )}
      </AnimatePresence>

      {/* Chat panel */}
      {!isProjectDashOpen && (
        <ChatPanel
          collapsed={chatCollapsed}
          setCollapsed={setChatCollapsed}
          projects={projects}
          selectedId={selectedId}
          onSelectProject={handleJumpTo}
          applyAdjustment={applyAdjustment}
          applyOptimization={applyOptimization}
        />
      )}
    </div>
  )
}
