import { motion } from 'framer-motion'
import { CheckCircle, AlertTriangle } from 'lucide-react'
import { useTheme } from '../../../lib/theme'
import SectionHeader from '../fields/SectionHeader'
import ExecutiveSummary from './Step6/ExecutiveSummary'
import QualityChecklist from './Step6/QualityChecklist'
import LimitationsCapture from './Step6/LimitationsCapture'
import ExportActions from './Step6/ExportActions'
import PrintableReport from './Step6/PrintableReport'

export default function Step6_Report({ value, onChange, fullState, onReset, onGoToStep }) {
  const { th } = useTheme()

  const result     = fullState.step5?.results ?? null
  const archetypeId = fullState.step4?.archetypeId
  const investment  = (fullState.step2?.inputs ?? []).reduce(
    (s, i) => s + (Number(i.quantity) || 0) * (Number(i.unitValue) || 0), 0
  )
  const calcOutcomes = (fullState.step3?.outcomes ?? []).filter(
    o => Number(o.indicator?.value) > 0 && Number(o.proxy?.value) > 0 && Boolean(o.vpnProfile)
  )

  const missing = []
  if (!result)                   missing.push({ step: 5, label: 'Ejecutar el cálculo SROI (Paso 5)' })
  else if (!archetypeId)         missing.push({ step: 4, label: 'Seleccionar arquetipo (Paso 4)' })
  else if (investment <= 0)      missing.push({ step: 2, label: 'Agregar inversión en Inputs (Paso 2)' })
  else if (calcOutcomes.length === 0) missing.push({ step: 3, label: 'Completar al menos un outcome calculable (Paso 3)' })

  if (missing.length > 0) {
    return (
      <div className="space-y-6">
        <SectionHeader
          stepNumber={6}
          title="Reportar y Certificar"
          subtitle="Resumen ejecutivo del análisis SROI con autoevaluación metodológica y opciones de exportación."
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
                Análisis incompleto
              </p>
              <p className="text-[12px]" style={{ color: th.textMuted }}>
                Complete los siguientes pasos antes de generar el reporte:
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

  return (
    <motion.div
      className="space-y-6"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <SectionHeader
        stepNumber={6}
        title="Reportar y Certificar"
        subtitle="Resumen ejecutivo del análisis SROI con autoevaluación metodológica y opciones de exportación."
      />

      {/* Banner completado */}
      <div className="flex items-start gap-3 p-4 rounded-xl"
        style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.25)' }}>
        <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: '#10B981' }} />
        <p className="text-[12px]" style={{ color: th.textPrimary }}>
          Análisis completado. Revise el resumen, capture limitaciones y exporte el reporte para
          la presentación ejecutiva.
        </p>
      </div>

      {/* Sección A — Executive Summary */}
      <ExecutiveSummary result={result} fullState={fullState} />

      {/* Sección B — Quality Checklist */}
      <QualityChecklist fullState={fullState} result={result} />

      {/* Sección C — Limitations */}
      <LimitationsCapture
        limitations={value?.knownLimitations ?? []}
        onChange={onChange}
      />

      {/* Sección D — Export Actions */}
      <ExportActions
        fullState={fullState}
        onChange={onChange}
        onReset={onReset}
        onGoToStep={onGoToStep}
      />

      {/* Versión imprimible (oculta excepto al imprimir) */}
      <PrintableReport result={result} fullState={fullState} />
    </motion.div>
  )
}
