import { useState } from 'react'
import { useTheme } from '../../../../lib/theme'

const CRITERIA = [
  {
    id: 'methodology',
    label: 'Comprensión de la metodología SROI',
    weight: 10,
    helper: 'Distingue outputs (Paso 2) de outcomes (Paso 3) y aplica la fórmula completa con VPN, FR e intangibles.',
    autoCheck: (fs, r) => Boolean(r) && (fs.step3?.outcomes ?? []).length > 0,
  },
  {
    id: 'stakeholders',
    label: 'Identificación de stakeholders',
    weight: 10,
    helper: 'Mínimo 3 stakeholders identificados con roles específicos.',
    autoCheck: (fs) => (fs.step1?.stakeholders ?? []).length >= 3,
  },
  {
    id: 'outcomes_def',
    label: 'Definición de outcomes',
    weight: 15,
    helper: 'Outcomes redactados como cambios formales medibles, no como actividades.',
    autoCheck: (fs) => {
      const outcomes = fs.step3?.outcomes ?? []
      return outcomes.length > 0 && outcomes.every(o => (o.description || '').trim().length > 50)
    },
  },
  {
    id: 'proxies',
    label: 'Uso de proxies financieros',
    weight: 15,
    helper: 'Proxies con fuente citada, conservadores y defendibles.',
    autoCheck: (fs) => {
      const outcomes = fs.step3?.outcomes ?? []
      return outcomes.length > 0 && outcomes.every(
        o => (o.proxy?.source || '').trim().length > 0 && Number(o.proxy?.value) > 0
      )
    },
  },
  {
    id: 'adjustments',
    label: 'Aplicación de ajustes SROI',
    weight: 15,
    helper: 'Arquetipo seleccionado con justificación que cubre los 4 ajustes (DW/Attr/Disp/Drop).',
    autoCheck: (fs) =>
      Boolean(fs.step4?.archetypeId) &&
      (fs.step4?.justification || '').trim().length > 30,
  },
  {
    id: 'numeric',
    label: 'Cálculo y consistencia numérica',
    weight: 10,
    helper: 'Cálculos completos con SROI Tangible y Total, trazables paso a paso.',
    autoCheck: (_, r) => Boolean(r) && (r.sroiTotal ?? 0) > 0,
  },
  {
    id: 'sensitivity',
    label: 'Manejo de supuestos y sensibilidad',
    weight: 15,
    helper: 'Análisis de 5 escenarios + tornado chart de variables sensibles disponible en Paso 5.',
    autoCheck: (_, r) => Boolean(r),
  },
  {
    id: 'comparison',
    label: 'Priorización y comparación entre proyectos',
    weight: 10,
    helper: 'Análisis incluye comparación con otros proyectos del portafolio bajo misma metodología.',
    autoCheck: () => false,
  },
]

function scoreLabel(score) {
  if (score >= 85) return { text: 'Excelente', color: '#10B981' }
  if (score >= 70) return { text: 'Bueno',     color: '#F59E0B' }
  return { text: 'Mejorar', color: '#7F1D1D' }
}

export default function QualityChecklist({ fullState, result }) {
  const { th } = useTheme()

  const [checks, setChecks] = useState(() =>
    CRITERIA.map(c => c.autoCheck(fullState, result))
  )

  const score = CRITERIA.reduce((acc, c, i) => acc + (checks[i] ? c.weight : 0), 0)
  const verdict = scoreLabel(score)

  const toggle = (i) => setChecks(prev => prev.map((v, idx) => idx === i ? !v : v))

  return (
    <div className="rounded-2xl overflow-hidden"
      style={{ background: th.cardBg, border: `1px solid ${th.cardBorder}`, boxShadow: th.shadow }}>

      <div className="px-6 pt-5 pb-3">
        <p className="text-[14px] font-semibold" style={{ color: th.textPrimary }}>
          Auto-evaluación metodológica
        </p>
        <p className="text-[12px] mt-1" style={{ color: th.textMuted }}>
          Checklist basado en la rúbrica de evaluación de Tec Consulting Club. Marque los criterios que su análisis cumple.
        </p>
      </div>

      <div className="px-6 pb-4 space-y-2">
        {CRITERIA.map((c, i) => {
          const checked = checks[i]
          return (
            <button
              key={c.id}
              type="button"
              onClick={() => toggle(i)}
              className="w-full text-left rounded-xl p-3 transition-colors"
              style={{
                background: checked ? 'rgba(16,185,129,0.08)' : th.inputBg,
                border: `1px solid ${checked ? 'rgba(16,185,129,0.30)' : th.cardBorder}`,
                cursor: 'pointer',
              }}
            >
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-4 h-4 rounded flex items-center justify-center mt-0.5"
                  style={{
                    background: checked ? '#10B981' : th.hoverBg,
                    border: `1.5px solid ${checked ? '#10B981' : th.cardBorder}`,
                  }}>
                  {checked && (
                    <svg width="9" height="7" viewBox="0 0 9 7" fill="none">
                      <path d="M1 3.5L3.5 6L8 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-[12px] font-medium"
                      style={{ color: checked ? th.textPrimary : th.textMuted }}>
                      {c.label}
                    </p>
                    <span className="flex-shrink-0 text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded"
                      style={{ background: th.hoverBg, color: th.textSecondary }}>
                      {c.weight}%
                    </span>
                  </div>
                  <p className="text-[11px] mt-0.5" style={{ color: th.textMuted }}>
                    {c.helper}
                  </p>
                </div>
              </div>
            </button>
          )
        })}
      </div>

      {/* Score footer */}
      <div className="px-6 py-4"
        style={{ borderTop: `1px solid ${th.cardBorder}`, background: th.hoverBg }}>
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-[10px] uppercase tracking-wider" style={{ color: th.textMuted }}>
              Puntuación auto-evaluada
            </p>
            <p className="text-[28px] font-mono font-semibold leading-tight"
              style={{ color: th.accent }}>
              {score}%
            </p>
            <p className="text-[10px]" style={{ color: th.textMuted }}>
              de 100% — Auto-evaluación. La calificación real depende del jurado.
            </p>
          </div>
          <span className="text-[13px] font-semibold px-4 py-2 rounded-xl"
            style={{
              background: `${verdict.color}18`,
              color: verdict.color,
              border: `1px solid ${verdict.color}44`,
            }}>
            {verdict.text}
          </span>
        </div>
      </div>
    </div>
  )
}
