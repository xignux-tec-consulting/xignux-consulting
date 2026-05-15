import { useTheme } from '../../../../lib/theme'
import { ARCHETYPES, fmtMXN, sroiColor, sroiCategory } from '../../../../lib/sroiV12'

export default function ExecutiveSummary({ result, fullState }) {
  const { th } = useTheme()

  const projectName  = fullState.step1.projectName?.trim() || 'Proyecto sin nombre'
  const stakeholders = fullState.step1.stakeholders || []
  const inputs       = fullState.step2.inputs || []
  const archetype    = result.archetype ?? ARCHETYPES[fullState.step4.archetypeId]
  const justification = fullState.step4.justification || ''

  const { sroiTangible, sroiTotal, vaTangible, vaIntangible, vaTotal,
          factorReclamado: fr, outcomes, project } = result

  const investment  = project.investment
  const inputCount  = inputs.length

  const topOutcomes = [...outcomes]
    .sort((a, b) => b.va - a.va)
    .slice(0, 5)

  const date = new Date().toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' })

  const kpis = [
    {
      label: 'Inversión',
      value: fmtMXN(investment),
      context: `${inputCount} insumo${inputCount !== 1 ? 's' : ''}`,
    },
    {
      label: 'Valor social total',
      value: fmtMXN(vaTotal),
      context: `${fmtMXN(vaTangible)} tang. + ${fmtMXN(vaIntangible)} intang.`,
    },
    {
      label: 'SROI Tangible',
      value: `${sroiTangible.toFixed(2)}x`,
      chip: { label: sroiCategory(sroiTangible), color: sroiColor(sroiTangible) },
    },
    {
      label: 'SROI Total',
      value: `${sroiTotal.toFixed(2)}x`,
      chip: { label: sroiCategory(sroiTotal), color: sroiColor(sroiTotal) },
    },
  ]

  const findings = [
    `Por cada $1 invertido, se generan $${sroiTotal.toFixed(2)} de valor social total.`,
    vaTotal > 0
      ? `Los intangibles representan ${((vaIntangible / vaTotal) * 100).toFixed(0)}% del valor total.`
      : 'No se capturaron intangibles en este análisis.',
    `El arquetipo ${archetype?.label ?? '—'} tiene Factor Reclamado de ${fr.toFixed(2)}, equivalente a reclamar el ${(fr * 100).toFixed(0)}% del valor bruto generado.`,
    `El proyecto tiene ${outcomes.length} outcome${outcomes.length !== 1 ? 's' : ''} evidenciado${outcomes.length !== 1 ? 's' : ''} y ${stakeholders.length} stakeholder${stakeholders.length !== 1 ? 's' : ''}.`,
  ]

  return (
    <div className="rounded-2xl p-6 space-y-5"
      style={{ background: th.cardBg, border: `1px solid ${th.cardBorder}`, boxShadow: th.shadow }}>

      {/* Header */}
      <div>
        <p className="text-[10px] uppercase tracking-wider font-medium mb-1"
          style={{ color: th.accent }}>
          REPORTE SROI · MODELO XIGNUX v12.10
        </p>
        <h2 className="text-[24px] font-semibold leading-tight"
          style={{ color: th.textPrimary }}>
          {projectName}
        </h2>
        <p className="text-[12px] mt-1" style={{ color: th.textMuted }}>
          Fecha de análisis: {date} · Arquetipo: {archetype?.label ?? '—'}
        </p>
      </div>

      {/* KPI grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {kpis.map(kpi => (
          <div key={kpi.label} className="rounded-xl p-4 space-y-1"
            style={{ background: th.inputBg, border: `1px solid ${th.cardBorder}` }}>
            <p className="text-[10px] uppercase tracking-wider" style={{ color: th.textMuted }}>
              {kpi.label}
            </p>
            <p className="text-[20px] font-semibold font-mono leading-tight"
              style={{ color: th.textPrimary }}>
              {kpi.value}
            </p>
            {kpi.chip ? (
              <span className="inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full"
                style={{
                  background: `${kpi.chip.color}22`,
                  color: kpi.chip.color,
                  border: `1px solid ${kpi.chip.color}44`,
                }}>
                {kpi.chip.label}
              </span>
            ) : (
              <p className="text-[11px]" style={{ color: th.textSecondary }}>{kpi.context}</p>
            )}
          </div>
        ))}
      </div>

      {/* Hallazgos clave */}
      <div className="mt-2">
        <p className="text-[11px] font-semibold uppercase tracking-wider mb-3"
          style={{ color: th.textSecondary }}>
          Hallazgos clave
        </p>
        <ul className="space-y-2">
          {findings.map((f, i) => (
            <li key={i} className="flex items-start gap-2">
              <span className="flex-shrink-0 w-4 h-4 rounded-sm flex items-center justify-center mt-0.5"
                style={{ background: th.accent }}>
                <span className="text-white text-[8px] font-bold">{i + 1}</span>
              </span>
              <span className="text-[12px]" style={{ color: th.textPrimary }}>{f}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Outcomes evidenciados (top 5) */}
      {topOutcomes.length > 0 && (
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wider mb-2"
            style={{ color: th.textSecondary }}>
            Outcomes evidenciados (top {topOutcomes.length} por VA)
          </p>
          <div className="space-y-1.5">
            {topOutcomes.map(o => (
              <div key={o.id} className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                  style={{ background: th.accent }} />
                <span className="text-[12px] flex-1 truncate" style={{ color: th.textPrimary }}>
                  {o.description || o.changeText || `Outcome ${o.id?.slice(0, 6)}`}
                </span>
                <span className="text-[11px] font-mono flex-shrink-0 px-2 py-0.5 rounded-lg"
                  style={{ background: th.inputBg, color: th.textSecondary, border: `1px solid ${th.cardBorder}` }}>
                  {fmtMXN(o.va)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Justificación del arquetipo */}
      {justification && (
        <div style={{ borderLeft: `4px solid ${th.accent}`, paddingLeft: 12 }}>
          <p className="text-[10px] uppercase tracking-wider mb-1" style={{ color: th.textMuted }}>
            Justificación del arquetipo
          </p>
          <p className="text-[12px] italic" style={{ color: th.textSecondary }}>
            "{justification}"
          </p>
        </div>
      )}
    </div>
  )
}
