import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTheme } from '../../lib/theme'
import { wizardStateToProject, projectToWizardState } from '../../lib/wizardProjectMapper'
import Stepper from './Stepper'
import NavBar from './NavBar'
import Step1_Scope from './steps/Step1_Scope'
import Step2_OutcomeMap from './steps/Step2_OutcomeMap'
import Step3_Outcomes from './steps/Step3_Outcomes'
import Step4_Impact from './steps/Step4_Impact'
import Step5_Calculate from './steps/Step5_Calculate'
import Step6_Report from './steps/Step6_Report'
import AutoSaveBadge from './fields/AutoSaveBadge'
import useWizardState from './useWizardState'

const TOTAL_STEPS = 6

export default function SROIWizard({ onBackToGraph, projects = [], onAddProject, onUpdateProject }) {
  const { th } = useTheme()
  const { state, updateStep, resetWizard, lastSavedAt, forceSave, loadFromState } = useWizardState()
  const currentStep = state.meta.currentStep

  const [loadedProjectId, setLoadedProjectId] = useState(null)
  const [toast, setToast] = useState(null)

  const showToast = useCallback((msg) => {
    setToast(msg)
    setTimeout(() => setToast(null), 3000)
  }, [])

  const goNext = () => {
    if (currentStep === TOTAL_STEPS) {
      document.getElementById('step6-export')?.scrollIntoView({ behavior: 'smooth' })
    } else {
      updateStep('meta', { currentStep: Math.min(currentStep + 1, TOTAL_STEPS) })
    }
  }
  const goPrev = () => updateStep('meta', { currentStep: Math.max(currentStep - 1, 1) })

  const step4Valid = Boolean(state.step4.archetypeId) && state.step4.justification?.trim().length > 0
  const nextDisabled = currentStep === 4 && !step4Valid

  const handleLoadProject = useCallback((project) => {
    const wizState = projectToWizardState(project)
    loadFromState(wizState)
    setLoadedProjectId(project.id)
  }, [loadFromState])

  const handleClearLoad = useCallback(() => {
    resetWizard()
    setLoadedProjectId(null)
  }, [resetWizard])

  const handleSaveToPortfolio = useCallback(() => {
    if (!onAddProject) return
    const project = wizardStateToProject(state)
    onAddProject(project)
    setLoadedProjectId(project.id)
    showToast('Proyecto guardado en el portafolio')
  }, [state, onAddProject, showToast])

  const handleUpdateInPortfolio = useCallback(() => {
    if (!onUpdateProject) return
    const project = wizardStateToProject(state, loadedProjectId)
    onUpdateProject(project)
    showToast('Proyecto actualizado en el portafolio')
  }, [state, loadedProjectId, onUpdateProject, showToast])

  const loadedProject = projects.find(p => p.id === loadedProjectId) || null

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="absolute inset-0 overflow-y-auto md:pl-[72px]"
      style={{ background: th.pageBg }}
    >
      <div className="max-w-[1440px] mx-auto px-4 md:px-8 pt-20 pb-8 space-y-6">

        <AutoSaveBadge lastSavedAt={lastSavedAt} />

        {/* ── Cargar proyecto ───────────────────────────────────── */}
        {projects.length > 0 && (
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl"
            style={{ background: th.cardBg, border: `1px solid ${th.cardBorder}` }}>
            <span className="text-[12px] font-medium shrink-0" style={{ color: th.textSecondary }}>
              Cargar proyecto:
            </span>
            <select
              className="flex-1 text-[12px] rounded-lg px-3 py-1.5 outline-none"
              style={{
                background: th.pillBg, border: `1px solid ${th.cardBorder}`,
                color: th.textPrimary, cursor: 'pointer',
              }}
              value={loadedProjectId || ''}
              onChange={e => {
                const pid = e.target.value
                if (!pid) { handleClearLoad(); return }
                const p = projects.find(x => x.id === pid)
                if (p) handleLoadProject(p)
              }}
            >
              <option value="">— Nuevo análisis —</option>
              {projects.map(p => (
                <option key={p.id} value={p.id}>
                  {p.id} · {p.name} ({p.sroi.toFixed(2)}x)
                </option>
              ))}
            </select>
            {loadedProject && (
              <span className="text-[11px] px-2 py-1 rounded shrink-0"
                style={{ background: '#10B98120', color: '#10B981', border: '1px solid #10B98133' }}>
                cargado
              </span>
            )}
          </div>
        )}

        <Stepper currentStep={currentStep} />

        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
          >
            {currentStep === 1 && (
              <Step1_Scope
                value={state.step1}
                onChange={(p) => updateStep('step1', p)}
                onSave={forceSave}
              />
            )}
            {currentStep === 2 && (
              <Step2_OutcomeMap
                value={state.step2}
                onChange={(p) => updateStep('step2', p)}
                stakeholders={state.step1.stakeholders}
                onSave={forceSave}
                onGoToStep1={() => updateStep('meta', { currentStep: 1 })}
              />
            )}
            {currentStep === 3 && (
              <Step3_Outcomes
                value={state.step3}
                onChange={(p) => updateStep('step3', p)}
                beneficiaryChanges={state.step2.beneficiaryChanges}
                outputs={state.step2.outputs}
                stakeholders={state.step1.stakeholders}
                onSave={forceSave}
                onGoToStep={(n) => updateStep('meta', { currentStep: n })}
              />
            )}
            {currentStep === 4 && (
              <Step4_Impact
                value={state.step4}
                onChange={(p) => updateStep('step4', p)}
                outcomes={state.step3.outcomes}
                inputs={state.step2.inputs}
                onSave={forceSave}
              />
            )}
            {currentStep === 5 && (
              <Step5_Calculate
                value={state.step5}
                onChange={(p) => updateStep('step5', p)}
                fullState={state}
                onSave={forceSave}
                onGoToStep={(n) => updateStep('meta', { currentStep: n })}
              />
            )}
            {currentStep === 6 && (
              <Step6_Report
                value={state.step6}
                onChange={(p) => updateStep('step6', p)}
                fullState={state}
                onReset={resetWizard}
                onGoToStep={(n) => updateStep('meta', { currentStep: n })}
                onSaveToPortfolio={onAddProject ? handleSaveToPortfolio : null}
                onUpdateInPortfolio={onUpdateProject ? handleUpdateInPortfolio : null}
                loadedProjectId={loadedProjectId}
              />
            )}
          </motion.div>
        </AnimatePresence>

        <NavBar
          step={currentStep}
          onPrev={goPrev}
          onNext={goNext}
          onSave={forceSave}
          nextDisabled={nextDisabled}
        />

      </div>

      {/* ── Toast feedback ────────────────────────────────────── */}
      <AnimatePresence>
        {toast && (
          <motion.div
            key="toast"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.25 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 px-5 py-3 rounded-xl text-sm font-medium z-50"
            style={{ background: '#10B981', color: '#fff', boxShadow: '0 4px 20px -4px rgba(16,185,129,0.5)' }}
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
