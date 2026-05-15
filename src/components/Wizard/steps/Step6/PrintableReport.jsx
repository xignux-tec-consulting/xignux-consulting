import { ARCHETYPES, fmtMXNFull } from '../../../../lib/sroiV12'

export default function PrintableReport({ result, fullState }) {
  if (!result) return null

  const projectName   = fullState.step1?.projectName?.trim() || 'Proyecto sin nombre'
  const archetype     = result.archetype ?? ARCHETYPES[fullState.step4?.archetypeId]
  const justification = fullState.step4?.justification || ''
  const limitations   = (fullState.step6?.knownLimitations ?? []).filter(Boolean)
  const stakeholders  = fullState.step1?.stakeholders ?? []

  const { sroiTangible, sroiTotal, vaTangible, vaIntangible, vaTotal,
          factorReclamado: fr, outcomes, project } = result

  const investment = project.investment
  const date = new Date().toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' })

  const s = {
    page:    { fontFamily: 'Inter, -apple-system, sans-serif', color: '#1A1A1A', fontSize: 13 },
    header:  { borderBottom: '2px solid #E8520E', paddingBottom: 16, marginBottom: 24 },
    label:   { fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#666' },
    h1:      { fontSize: 26, fontWeight: 600, margin: '4px 0 2px' },
    h2:      { fontSize: 16, fontWeight: 600, margin: '0 0 10px' },
    kpiBox:  { border: '1px solid #ddd', padding: 14, borderRadius: 8 },
    kpiVal:  { fontSize: 28, fontWeight: 700, margin: '4px 0 2px', fontVariantNumeric: 'tabular-nums' },
    thr:     { borderBottom: '2px solid #1A1A1A', textAlign: 'left', padding: '6px 8px', fontSize: 11, fontWeight: 600 },
    td:      { padding: '5px 8px', fontSize: 11, borderBottom: '1px solid #eee', verticalAlign: 'top' },
    tdR:     { padding: '5px 8px', fontSize: 11, borderBottom: '1px solid #eee', textAlign: 'right', fontVariantNumeric: 'tabular-nums' },
    quote:   { borderLeft: '4px solid #E8520E', paddingLeft: 12, margin: '8px 0', fontStyle: 'italic', color: '#555', fontSize: 12 },
    li:      { marginBottom: 4, fontSize: 12 },
    section: { marginBottom: 28 },
  }

  return (
    <div className="wizard-printable-report" style={s.page}>

      {/* PÁGINA 1 — Portada + headline KPIs */}
      <div className="print-no-break" style={{ minHeight: '90vh' }}>
        <header style={s.header}>
          <div style={s.label}>REPORTE SROI · MODELO XIGNUX v12.10</div>
          <h1 style={s.h1}>{projectName}</h1>
          <div style={{ ...s.label, textTransform: 'none', fontSize: 12 }}>
            Fecha: {date} &nbsp;·&nbsp; Arquetipo: {archetype?.label ?? '—'}
          </div>
        </header>

        {/* KPI grid 2x2 */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 28 }}>
          <div style={s.kpiBox}>
            <div style={s.label}>Inversión total</div>
            <div style={s.kpiVal}>{fmtMXNFull(investment)}</div>
          </div>
          <div style={s.kpiBox}>
            <div style={s.label}>Valor social total</div>
            <div style={s.kpiVal}>{fmtMXNFull(vaTotal)}</div>
            <div style={{ ...s.label, textTransform: 'none' }}>
              {fmtMXNFull(vaTangible)} tangible + {fmtMXNFull(vaIntangible)} intangible
            </div>
          </div>
          <div style={s.kpiBox}>
            <div style={s.label}>SROI Tangible</div>
            <div style={s.kpiVal}>{sroiTangible.toFixed(2)}x</div>
            <div style={{ ...s.label, textTransform: 'none' }}>VA Tangible / Inversión</div>
          </div>
          <div style={s.kpiBox}>
            <div style={s.label}>SROI Total</div>
            <div style={{ ...s.kpiVal, color: '#E8520E' }}>{sroiTotal.toFixed(2)}x</div>
            <div style={{ ...s.label, textTransform: 'none' }}>VA Total (tang + intang) / Inversión</div>
          </div>
        </div>

        {/* Hallazgos clave */}
        <div style={s.section}>
          <h2 style={s.h2}>Hallazgos clave</h2>
          <ul style={{ paddingLeft: 18, margin: 0 }}>
            <li style={s.li}>Por cada $1 invertido, se generan ${sroiTotal.toFixed(2)} de valor social total.</li>
            {vaTotal > 0 && (
              <li style={s.li}>
                Los intangibles representan {((vaIntangible / vaTotal) * 100).toFixed(0)}% del valor total.
              </li>
            )}
            <li style={s.li}>
              El arquetipo {archetype?.label} tiene Factor Reclamado de {fr.toFixed(3)}, equivalente a reclamar el {(fr * 100).toFixed(0)}% del valor bruto generado.
            </li>
            <li style={s.li}>
              El proyecto tiene {outcomes.length} outcome{outcomes.length !== 1 ? 's' : ''} evidenciado{outcomes.length !== 1 ? 's' : ''} y {stakeholders.length} stakeholder{stakeholders.length !== 1 ? 's' : ''}.
            </li>
          </ul>
        </div>

        {justification && (
          <div style={s.section}>
            <h2 style={s.h2}>Justificación del arquetipo</h2>
            <div style={s.quote}>"{justification}"</div>
          </div>
        )}
      </div>

      {/* PÁGINA 2 — Detalle de outcomes */}
      <div className="print-page-break print-no-break">
        <h2 style={{ ...s.h2, marginTop: 8 }}>Detalle de Outcomes y Cálculo</h2>
        <p style={{ fontSize: 11, color: '#666', marginBottom: 12 }}>
          FR = {fr.toFixed(3)} · Modelo SROI XIGNUX v12.10 · Tasa descuento SHCP 10%
        </p>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={{ ...s.thr, width: '40%' }}>Outcome</th>
              <th style={{ ...s.thr, textAlign: 'right' }}>Cantidad</th>
              <th style={{ ...s.thr, textAlign: 'right' }}>Proxy</th>
              <th style={{ ...s.thr, textAlign: 'right' }}>VPN</th>
              <th style={{ ...s.thr, textAlign: 'right' }}>VB</th>
              <th style={{ ...s.thr, textAlign: 'right' }}>VA</th>
            </tr>
          </thead>
          <tbody>
            {outcomes.map((o, i) => (
              <tr key={o.id ?? i}>
                <td style={s.td}>{o.description || o.changeText || `Outcome ${i + 1}`}</td>
                <td style={s.tdR}>{o.quantity?.toLocaleString('es-MX')}</td>
                <td style={s.tdR}>{fmtMXNFull(o.proxyValue)}</td>
                <td style={s.tdR}>{o.vpn?.toFixed(3)}</td>
                <td style={s.tdR}>{fmtMXNFull(o.vb)}</td>
                <td style={s.tdR}>{fmtMXNFull(o.va)}</td>
              </tr>
            ))}
            <tr>
              <td colSpan={4} style={{ ...s.td, fontWeight: 600 }}>Total</td>
              <td style={{ ...s.tdR, fontWeight: 600 }}>
                {fmtMXNFull(outcomes.reduce((a, o) => a + o.vb, 0))}
              </td>
              <td style={{ ...s.tdR, fontWeight: 600, color: '#E8520E' }}>
                {fmtMXNFull(vaTangible)}
              </td>
            </tr>
          </tbody>
        </table>

        {vaIntangible > 0 && (
          <div style={{ marginTop: 20, padding: 14, border: '1px solid #ddd', borderRadius: 6 }}>
            <div style={s.label}>VA Intangible total</div>
            <div style={{ fontSize: 18, fontWeight: 600, color: '#10B981' }}>
              {fmtMXNFull(vaIntangible)}
            </div>
          </div>
        )}

        {/* Fórmula */}
        <div style={{ marginTop: 20, padding: 14, background: '#f8f6f3', borderRadius: 6 }}>
          <div style={s.label}>Verificación de cálculo</div>
          <div style={{ fontFamily: 'monospace', fontSize: 12, marginTop: 6, lineHeight: 1.8 }}>
            <div>SROI Tangible = {fmtMXNFull(vaTangible)} / {fmtMXNFull(investment)} = <strong>{sroiTangible.toFixed(3)}x</strong></div>
            <div>SROI Total = ({fmtMXNFull(vaTangible)} + {fmtMXNFull(vaIntangible)}) / {fmtMXNFull(investment)} = <strong>{sroiTotal.toFixed(3)}x</strong></div>
          </div>
        </div>
      </div>

      {/* PÁGINA 3 — Metodología y Limitaciones */}
      <div className="print-page-break print-no-break">
        <h2 style={{ ...s.h2, marginTop: 8 }}>Nota Metodológica</h2>
        <p style={{ fontSize: 12, color: '#444', lineHeight: 1.6 }}>
          Este análisis aplica la metodología SROI (Social Return on Investment) versión XIGNUX v12.10.
          El Valor Bruto (VB) se calcula como Cantidad × Proxy Financiero × VPN (Valor Presente Neto
          del perfil temporal del outcome). El Factor Reclamado (FR) ajusta el VB por Peso muerto (DW),
          Atribución (Attr), Desplazamiento (Disp) y Caída (Drop-off) según el arquetipo del proyecto.
          El VA Tangible = VB × FR. El VA Intangible captura las 7 categorías de valor no-financiero.
          El SROI Tangible = VA Tangible / Inversión; SROI Total incluye ambas categorías.
        </p>

        {stakeholders.length > 0 && (
          <div style={s.section}>
            <h2 style={s.h2}>Stakeholders identificados</h2>
            <ul style={{ paddingLeft: 18, margin: 0 }}>
              {stakeholders.map((sh, i) => (
                <li key={sh.id ?? i} style={s.li}>
                  <strong>{sh.name}</strong>
                  {sh.role ? ` — ${sh.role}` : ''}
                  {sh.description ? `: ${sh.description}` : ''}
                </li>
              ))}
            </ul>
          </div>
        )}

        {limitations.length > 0 && (
          <div style={s.section}>
            <h2 style={s.h2}>Limitaciones reconocidas</h2>
            <ul style={{ paddingLeft: 18, margin: 0 }}>
              {limitations.map((l, i) => (
                <li key={i} style={s.li}>{l}</li>
              ))}
            </ul>
          </div>
        )}

        <div style={{ marginTop: 32, paddingTop: 12, borderTop: '1px solid #ddd',
          fontSize: 10, color: '#888' }}>
          Generado con XIGNUX Impact Lens · Modelo SROI v12.10 · {date}
        </div>
      </div>

    </div>
  )
}
