import { useState, useCallback, useRef, useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { MessageSquare } from 'lucide-react'
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
  const [chatCollapsed, setChatCollapsed] = useState(true)
  const [showConnections, setShowConnections] = useState(true)
  const [groupBy, setGroupBy] = useState('sroi')
  const [recentChange, setRecentChange] = useState(null)
  const [openDashFor, setOpenDashFor] = useState(null)
  const [legendOpen, setLegendOpen] = useState(false)
  const [controlsOpen, setControlsOpen] = useState(true)
  const [nodeInfoVisible, setNodeInfoVisible] = useState(true)

  const resetCameraRef = useRef(null)
  const transitionLockRef = useRef(false)

  const selectedProject = projects.find((p) => p.id === selectedId) || null
  const openDashProject = projects.find((p) => p.id === openDashFor) || null

  const handleSelect = useCallback((id) => {
    setSelectedId(id)
    setNodeAnchor(null)
    setNodeInfoVisible(true)
  }, [])

  const handleDeselect = useCallback(() => {
    setSelectedId(null)
    setNodeAnchor(null)
    setNodeInfoVisible(true)
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
    setNodeInfoVisible(true)
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

  const handleOpenProjectDash = useCallback((id) => { setOpenDashFor(id) }, [])
  const handleCloseProjectDash = useCallback(() => { setOpenDashFor(null) }, [])

  const isPortfolioView = activeView === 'portfolio'
  const isProjectDashOpen = !!openDashProject

  return (
    <div className="w-screen h-screen overflow-hidden relative" style={{ background: '#0A0E1A' }}>

      {/* 3D Constellation */}
      <div className="absolute inset-0" style={{ visibility: isPortfolioView ? 'hidden' : 'visible' }}>
        <Constellation
          projects={projects}
          selectedId={selectedId}
          recentChange={recentChange}
          showConnections={showConnections}
          groupBy={groupBy}
          onSelect={handleSelect}
          onDeselect={handleDeselect}
          onResetCamera={(fn) => { resetCameraRef.current = fn }}
          onProjectAnchor={setNodeAnchor}
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

      {/* Node detail panel */}
      <AnimatePresence>
        {!isPortfolioView && !isProjectDashOpen && selectedProject && nodeInfoVisible && (
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

      {/* Sidebar — contiene modo toggle + info + leyenda */}
      {!isProjectDashOpen && (
        <Sidebar
          activeView={activeView}
          onChangeView={setActiveView}
          nodeSelected={!!selectedProject}
          nodeInfoActive={nodeInfoVisible}
          onToggleNodeInfo={() => setNodeInfoVisible((v) => !v)}
          legendOpen={legendOpen}
          onToggleLegend={() => setLegendOpen((v) => !v)}
        />
      )}

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
            setGroupBy={handleGroupByChange}
            onResetCamera={() => resetCameraRef.current?.()}
          />
        )}
      </AnimatePresence>

      {/* Chat FAB — bottom right */}
      {!isProjectDashOpen && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4, type: 'spring', stiffness: 320, damping: 22 }}
          onClick={() => setChatCollapsed((c) => !c)}
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.94 }}
          className="fixed bottom-4 right-4 z-40 w-11 h-11 rounded-2xl flex items-center justify-center"
          style={{
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            background: chatCollapsed ? 'rgba(255,255,255,0.04)' : 'rgba(46,117,182,0.28)',
            border: `1px solid ${chatCollapsed ? 'rgba(255,255,255,0.08)' : 'rgba(46,117,182,0.55)'}`,
            boxShadow: chatCollapsed
              ? '0 4px 16px -8px rgba(0,0,0,0.4)'
              : '0 8px 32px -10px rgba(46,117,182,0.45)',
            transition: 'background 0.2s, border-color 0.2s, box-shadow 0.2s',
          }}
          aria-label={chatCollapsed ? 'Abrir Chat IA' : 'Cerrar Chat IA'}
        >
          <MessageSquare
            className="w-[18px] h-[18px]"
            style={{ color: chatCollapsed ? 'rgba(255,255,255,0.5)' : '#F5F7FA' }}
          />
          {chatCollapsed && (
            <motion.span
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ repeat: Infinity, repeatDelay: 3, duration: 0.6 }}
              className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full"
              style={{ background: '#10B981' }}
            />
          )}
        </motion.button>
      )}

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
