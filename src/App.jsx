import { useState, useCallback, useRef, useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import Header, { Sidebar } from './components/Header'
import Constellation from './components/Constellation'
import ChatPanel from './components/ChatPanel'
import NodePanel from './components/NodePanel'
import { GroupByPills, BottomControls, ArchetypeLegend, BackChip } from './components/ui/Controls'
import PortfolioDashboard from './components/Dashboard/Portfolio'
import ProjectDashboard from './components/Dashboard/Project'
import ProxiesDashboard from './components/Dashboard/Proxies'
import BenchmarksDashboard from './components/Dashboard/Benchmarks'
import OptimizeDashboard from './components/Dashboard/Optimize'
import Chalkboard from './components/Chalkboard'
import { PROJECTS } from './data/projects'
import { recomputeProject } from './lib/sroi'
import { useTheme } from './lib/theme'

export default function App() {
  const { th } = useTheme()
  const [projects, setProjects] = useState(PROJECTS)
  const [selectedId, setSelectedId] = useState(null)
  const [nodeAnchor, setNodeAnchor] = useState(null)
  const [activeView, setActiveView] = useState('graph')
  const [chatCollapsed, setChatCollapsed] = useState(true)
  const [showConnections, setShowConnections] = useState(true)
  const [groupBy, setGroupBy] = useState('sroi')
  const [recentChange, setRecentChange] = useState(null)
  const [cameraTarget, setCameraTarget] = useState(null)
  const [openDashFor, setOpenDashFor] = useState(null)
  const [legendOpen, setLegendOpen] = useState(false)
  const [controlsOpen, setControlsOpen] = useState(true)
  const [nodeInfoVisible, setNodeInfoVisible] = useState(true)
  const [viewMode, setViewMode] = useState('3d')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const resetCameraRef = useRef(null)
  const transitionLockRef = useRef(false)

  const selectedProject = projects.find((p) => p.id === selectedId) || null
  const openDashProject = projects.find((p) => p.id === openDashFor) || null

  const handleSelect = useCallback((id, anchor) => {
    setSelectedId(id)
    setNodeAnchor(anchor || null)
    setCameraTarget(id)
    setNodeInfoVisible(true)
    setChatCollapsed(true)
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
          dw: Math.max(0, p.adjustments.dw - 0.03),
          at: Math.max(0, p.adjustments.at - 0.02),
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

  const isPortfolioView = activeView === 'portfolio'
  const isOverlayView = activeView !== 'graph'
  const isProjectDashOpen = !!openDashProject

  return (
    <div className="w-screen h-screen overflow-hidden relative" style={{ background: th.pageBg }}>
      {/* 3D Constellation (always mounted, hidden behind overlays or 2D mode) */}
      <div
        className="absolute inset-0 z-0 md:pl-[72px]"
        style={{ visibility: isOverlayView || viewMode === '2d' ? 'hidden' : 'visible' }}
      >
        <Constellation
          projects={projects}
          selectedId={selectedId}
          recentChange={recentChange}
          showConnections={showConnections}
          groupBy={groupBy}
          paused={isOverlayView || isProjectDashOpen || viewMode === '2d'}
          onSelect={handleSelect}
          onDeselect={handleDeselect}
          onResetCamera={(fn) => { resetCameraRef.current = fn }}
        />
      </div>

      {/* 2D Chalkboard org chart */}
      <AnimatePresence>
        {!isPortfolioView && viewMode === '2d' && (
          <Chalkboard
            projects={projects}
            selectedId={selectedId}
            onSelect={handleSelect}
            onDeselect={handleDeselect}
          />
        )}
      </AnimatePresence>

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

      {/* Proxies View */}
      <AnimatePresence>
        {activeView === 'proxies' && (
          <ProxiesDashboard
            projects={projects}
            onBackToGraph={() => setActiveView('graph')}
          />
        )}
      </AnimatePresence>

      {/* Benchmarks View */}
      <AnimatePresence>
        {activeView === 'bench' && (
          <BenchmarksDashboard
            projects={projects}
            onBackToGraph={() => setActiveView('graph')}
          />
        )}
      </AnimatePresence>

      {/* Optimization View */}
      <AnimatePresence>
        {activeView === 'optimize' && (
          <OptimizeDashboard
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
        {!isOverlayView && !isProjectDashOpen && selectedProject && nodeInfoVisible && (
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
        {!isOverlayView && !isProjectDashOpen && selectedProject && (
          <BackChip onClick={handleDeselect} />
        )}
      </AnimatePresence>

      {/* Header — always visible except project drill-down */}
      {!isProjectDashOpen && (
        <>
          <Header
            projects={projects}
            activeView={activeView}
            onChangeView={setActiveView}
            viewMode={viewMode}
            onChangeViewMode={setViewMode}
            mobileMenuOpen={mobileMenuOpen}
            setMobileMenuOpen={setMobileMenuOpen}
          />
          <Sidebar
            activeView={activeView}
            onChangeView={setActiveView}
          />
        </>
      )}

      {/* Archetype legend popover */}
      <AnimatePresence>
        {legendOpen && !isProjectDashOpen && (
          <ArchetypeLegend open={legendOpen} onClose={() => setLegendOpen(false)} />
        )}
      </AnimatePresence>

      {/* Group-by pill nav (top-left) */}
      <AnimatePresence>
        {!isOverlayView && !isProjectDashOpen && !selectedId && viewMode === '3d' && (
          <GroupByPills groupBy={groupBy} setGroupBy={handleGroupByChange} />
        )}
      </AnimatePresence>

      {/* Bottom controls strip */}
      <AnimatePresence>
        {!isOverlayView && !isProjectDashOpen && controlsOpen && viewMode === '3d' && (
          <BottomControls
            projects={projects}
            open={controlsOpen}
            setOpen={setControlsOpen}
            showConnections={showConnections}
            setShowConnections={setShowConnections}
            onResetCamera={() => resetCameraRef.current?.()}
          />
        )}
      </AnimatePresence>

      {/* Chat panel — always accessible */}
      <ChatPanel
        collapsed={chatCollapsed}
        setCollapsed={setChatCollapsed}
        projects={projects}
        selectedId={selectedId}
        onSelectProject={handleJumpTo}
        onOpenProject={(id) => {
          handleOpenProjectDash(id)
          if (activeView === 'portfolio') setActiveView('graph')
          handleSelect(id)
        }}
        applyAdjustment={applyAdjustment}
        applyOptimization={applyOptimization}
      />
    </div>
  )
}
