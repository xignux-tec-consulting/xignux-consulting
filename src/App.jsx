import { useState, useCallback, useRef, useEffect } from 'react'
import { AnimatePresence } from 'framer-motion'
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
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [darkMode, setDarkMode] = useState(true)

  const resetCameraRef = useRef(null)

  // Apply theme class to root element
  useEffect(() => {
    const root = document.documentElement
    if (darkMode) {
      root.classList.remove('light')
    } else {
      root.classList.add('light')
    }
  }, [darkMode])

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

  const handleJumpTo = useCallback((id) => {
    setSelectedId(id)
    setNodeAnchor(null)
    setCameraTarget(id)
  }, [])

  const applyAdjustment = useCallback((id, adj) => {
    setProjects((prev) =>
      prev.map((p) => {
        if (p.id !== id) return p
        return recomputeProject(p, adj)
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

  const handleOpenProjectDash = useCallback((id) => setOpenDashFor(id), [])
  const handleCloseProjectDash = useCallback(() => setOpenDashFor(null), [])

  const sidebarExtras = activeView === 'graph' && selectedProject
    ? [{ id: 'dash-project', icon: 'dashboard', label: 'Dashboard proyecto', onClick: () => handleOpenProjectDash(selectedId) }]
    : []

  const isPortfolioView = activeView === 'portfolio'
  const isProjectDashOpen = !!openDashProject

  return (
    <div
      className="w-screen h-screen overflow-hidden flex"
      style={{ background: darkMode ? '#0A0E1A' : '#F0F4FA' }}
    >
      {/* Sidebar — ocupa su propio espacio en el flex row */}
      {!isProjectDashOpen && (
        <Sidebar
          activeView={activeView}
          setView={setActiveView}
          extras={sidebarExtras}
          collapsed={sidebarCollapsed}
          setCollapsed={setSidebarCollapsed}
          darkMode={darkMode}
          setDarkMode={setDarkMode}
        />
      )}

      {/* Main content area */}
      <div className="flex-1 relative overflow-hidden">

        {/* 3D Constellation */}
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
              darkMode={darkMode}
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

        {/* Node detail panel */}
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

        {/* Back chip */}
        <AnimatePresence>
          {!isPortfolioView && !isProjectDashOpen && selectedProject && (
            <BackChip onClick={handleDeselect} />
          )}
        </AnimatePresence>

        {/* Archetype legend */}
        <AnimatePresence>
          {legendOpen && !isProjectDashOpen && (
            <ArchetypeLegend open={legendOpen} onClose={() => setLegendOpen(false)} />
          )}
        </AnimatePresence>

        {/* Bottom controls */}
        <AnimatePresence>
          {!isPortfolioView && !isProjectDashOpen && controlsOpen && (
            <BottomControls
              projects={projects}
              open={controlsOpen}
              setOpen={setControlsOpen}
              showConnections={showConnections}
              setShowConnections={setShowConnections}
              groupBy={groupBy}
              setGroupBy={setGroupBy}
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
    </div>
  )
}
