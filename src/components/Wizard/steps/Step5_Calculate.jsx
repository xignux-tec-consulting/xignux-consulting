import { motion } from 'framer-motion'
import { AlertTriangle } from 'lucide-react'
import { useTheme } from '../../../lib/theme'
import SectionHeader from '../fields/SectionHeader'
import { ARCHETYPES, computeProjectSROI } from '../../../lib/sroiV12'
import HeadlineResults from './Step5/HeadlineResults'
import OutcomesBreakdown from './Step5/OutcomesBreakdown'
import IntangiblesCapture from './Step5/IntangiblesCapture'
import FormulaPanel from './Step5/FormulaPanel'

function mergeAdj(archetype, overrides) {
  return {
    deadweight:   overrides?.deadweight   ?? archetype.deadweight,
    attribution:  overrides?.attribution  ?? archetype.attribution,
    displacement: overrides?.displacement ?? archetype.displacement,
    dropOff:      overrides?.dropOff      ?? archetype.dropOff,
  }
}

function isCalculable(o) {
  return Number(o.indicator?.value) > 0 && Number(o.proxy?.value) > 0 && Boolean(o.vpnProfile)
}

export default function Step5_Calculate({ value, onChange, fullState, onGoToStep }) {
  const { th } = useTheme()

  const { intangibles, intangibleSources } = value

  const investment = (fullState.step2.inputs || []).reduce(
    (s, i) => s + (Number(i.quantity) || 0) * (Number(i.unitValue) || 0), 0
  )
  const { archetypeId, expertMode, overrides } = fullState.step4
  const archetype = archetypeId ? ARCHETYPES[archetypeId] : null
  const calcOutcomes = (fullState.step3.outcomes || []).filter(isCalculable)

  const missing = []
  if (!archetypeId)           missing.push({ step: 4, label: 'Seleccionar arquetipo (Paso 4)' })
  if (investment <= 0)        missing.push({ step: 2, label: 'Agregar inversión en Inputs (Paso 2)' })
  if (calcOutcomes.length === 0) missing.push({ step: 3, label: 'Completar al menos un outcome calculable (Paso 3)' })

  let result = null
  if (missing.length === 0 && archetype) {
    const project = {
      id: 'WIZARD',
      name: fullState.step1.projectName || 'Proyecto',
      investment,
      archetypeId,
      archetypeOverrides: expertMode ? mergeAdj(archetype, overrides) : null,
      outcomes: calcOutcomes.map(o => ({
        id: o.id,
        description: o.description || o.changeText || '',
        quantity: Number(o.indicator.value),
        proxyValue: Number(o.proxy.value),
        vpnProfile: o.vpnProfile,
      })),
      intangibles,
    }
    try { result = computeProjectSROI(project) } catch { /* guard */ }
  }

  if (missing.length > 0) {
    return (
      <div className="space-y-6">
        <SectionHeader
          stepNumber={5}
          title="Calcular SROI"
          subtitle="Se requieren datos de pasos anteriores para ejecutar el cálculo."
        />
        <div className="rounded-2xl p-8"
          style={{ background: th.cardBg, border: `1px solid ${th.cardBorder}`, boxShadow: th.shadow }}>
          <div className="flex flex-col items-center gap-5 text-center">
            <div className="w-12 h-12 rounded-full flex items-center justify-center"
              style={{ background: 'rgba(245,158,11,0.15)', border: '1px solid rgba(245,158,11,0.30)' }}>
              <AlertTriangle className="w-5 h-5" style={{ color: '#F59E0B' }} />
            </div>
            <div>
              <p className="text-[14px] font-semibold mb-1" style={{ color: th.textPrimary }}>
                Datos incompletos
              </p>
              <p className="text-[12px]" style={{ color: th.textMuted }}>
                Complete los siguientes elementos antes de calcular:
              </p>
            </div>
            <div className="w-full max-w-sm space-y-2">
              {missing.map(m => (
                <button key={m.step} type="button" onClick={() => onGoToStep(m.step)}
                  className="w-full flex items-center justify-between px-4 py-3 rounded-xl text-left"
                  style={{ background: th.hoverBg, border: `1px solid ${th.cardBorder}`, cursor: 'pointer' }}>
                  <span className="text-[12px]" style={{ color: th.textPrimary }}>{m.label}</span>
                  <span className="text-[11px] font-semibold" style={{ color: th.accent }}>Ir →</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!result) return null

  return (
    <motion.div
      className="space-y-6"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <SectionHeader
        stepNumber={5}
        title="Calcular SROI"
        subtitle="Modelo SROI XIGNUX v12.10. SROI Tangible = VA ajustado / inversión. SROI Total incluye las 7 categorías de valor intangible capturadas abajo."
      />

      <HeadlineResults result={result} />

      <OutcomesBreakdown outcomes={result.outcomes} fr={result.factorReclamado} />

      <IntangiblesCapture
        intangibles={intangibles}
        intangibleSources={intangibleSources}
        onChange={onChange}
      />

      <FormulaPanel result={result} />
    </motion.div>
  )
}
