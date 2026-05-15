import { useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Info, ChevronDown } from 'lucide-react'
import { useTheme } from '../../../lib/theme'
import SectionHeader from '../fields/SectionHeader'
import TextArea from '../fields/TextArea'
import ArchetypeCard from './Step4/ArchetypeCard'
import ExpertOverrides from './Step4/ExpertOverrides'
import {
  ARCHETYPES, factorReclamado, vpnForProfile, fmtMXN, fmtMXNFull,
} from '../../../lib/sroiV12'

// Merges per-field overrides (null = use archetype default) into a complete adj object
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

export default function Step4_Impact({ value, onChange, outcomes, inputs }) {
  const { th }    = useTheme()
  const justRef   = useRef(null)

  const { archetypeId, expertMode, overrides, justification } = value
  const archetype    = archetypeId ? ARCHETYPES[archetypeId] : null
  const effectiveAdj = expertMode && archetype ? mergeAdj(archetype, overrides) : null
  const fr           = archetype ? factorReclamado(archetypeId, effectiveAdj) : null
  const frBase       = archetype ? factorReclamado(archetypeId, null) : null

  const calcOutcomes = (outcomes || []).filter(isCalculable)
  const investment   = (inputs   || []).reduce((s, i) =>
    s + (Number(i.quantity) || 0) * (Number(i.unitValue) || 0), 0)

  const outcomeRows = fr !== null ? calcOutcomes.map(o => {
    const vpn = vpnForProfile(o.vpnProfile)
    const vb  = Number(o.indicator.value) * Number(o.proxy.value) * vpn
    const va  = vb * fr
    return { ...o, vb, va }
  }) : []

  const totalVB   = outcomeRows.reduce((s, r) => s + r.vb, 0)
  const totalVA   = outcomeRows.reduce((s, r) => s + r.va, 0)
  const sroiTang  = fr !== null && investment > 0 ? totalVA / investment : null

  const handleSelectArchetype = (id) => {
    onChange({ archetypeId: id })
    setTimeout(() => justRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' }), 60)
  }

  return (
    <div className="space-y-6">
      <SectionHeader
        stepNumber={4}
        title="Establecer Impacto"
        subtitle="Seleccione el arquetipo del proyecto. Los factores de ajuste (DW/Attr/Disp/Drop) se aplican según el modelo SROI XIGNUX v12.10 calibrado con benchmarks de CONEVAL, INEGI y literatura sectorial."
      />

      {/* Methodology banner */}
      <div className="flex items-start gap-3 p-4 rounded-xl"
        style={{ background: th.accentSoft, border: `1px solid ${th.accentBorder}` }}>
        <Info className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: th.accent }} />
        <p className="text-[12px]" style={{ color: th.textPrimary }}>
          <span className="font-mono font-semibold">VA = VB × FR</span>. El Factor Reclamado se calibra
          por ARQUETIPO de programa, no por proyecto individual. Esto asegura consistencia metodológica
          al comparar entre proyectos del portafolio.
        </p>
      </div>

      {/* ── Archetype selector ─────────────────────────────────────────────── */}
      <div className="space-y-3">
        <div>
          <p className="text-[14px] font-semibold" style={{ color: th.textPrimary }}>
            Arquetipo del proyecto *
          </p>
          <p className="text-[12px] mt-0.5" style={{ color: th.textMuted }}>
            Elija el arquetipo que mejor describe la naturaleza del programa.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {Object.values(ARCHETYPES).map(arch => (
            <ArchetypeCard
              key={arch.id}
              archetype={arch}
              selected={archetypeId === arch.id}
              onClick={() => handleSelectArchetype(arch.id)}
            />
          ))}
        </div>
      </div>

      {/* ── Justification ──────────────────────────────────────────────────── */}
      <AnimatePresence>
        {archetypeId && (
          <motion.div
            key="just"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
          >
            <div ref={justRef}>
              <TextArea
                label="Justificación de la elección *"
                value={justification}
                onChange={(v) => onChange({ justification: v })}
                rows={3}
                placeholder="Ej: El proyecto es de educación STEM porque enfoca en innovación tecnológica y emprendimiento. Aplica A_STEM (no A general) por el deadweight reducido al 18% al ser población autoseleccionada con perfil técnico."
                helper="Explique por qué este arquetipo describe correctamente el proyecto. Esto es CLAVE en la defensa metodológica (rúbrica: 15% Manejo de supuestos)."
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Expert mode ────────────────────────────────────────────────────── */}
      {archetypeId && (
        <div className="space-y-2">
          <button
            type="button"
            onClick={() => onChange({ expertMode: !expertMode })}
            className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-left"
            style={{
              background: expertMode ? th.accentSoft : th.cardBg,
              border: `1px solid ${expertMode ? th.accentBorder : th.cardBorder}`,
              cursor: 'pointer',
            }}
          >
            <span className="text-[13px] font-semibold flex-1" style={{ color: th.textPrimary }}>
              🔧 Modo experto: override de ajustes
            </span>
            <span className="text-[10px] mr-2" style={{ color: th.textMuted }}>
              Solo si tiene evidencia específica
            </span>
            <motion.div animate={{ rotate: expertMode ? 180 : 0 }} transition={{ duration: 0.2 }}>
              <ChevronDown className="w-4 h-4" style={{ color: th.textMuted }} />
            </motion.div>
          </button>
          <AnimatePresence initial={false}>
            {expertMode && (
              <motion.div
                key="expert"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.22 }}
                style={{ overflow: 'hidden' }}
              >
                <ExpertOverrides
                  archetypeId={archetypeId}
                  overrides={overrides}
                  onChange={(newOv) => onChange({ overrides: newOv })}
                  fr={fr}
                  frBase={frBase}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* ── Live preview ───────────────────────────────────────────────────── */}
      <div className="rounded-2xl p-5 space-y-4"
        style={{ background: th.accentSoft, border: `1px solid ${th.accentBorder}` }}>
        <div>
          <p className="text-[14px] font-semibold" style={{ color: th.textPrimary }}>
            💡 Vista previa del cálculo
          </p>
          <p className="text-[11px] mt-0.5" style={{ color: th.textMuted }}>
            Los siguientes valores se aplicarán a TODOS los outcomes del Paso 3 con el Factor
            Reclamado del arquetipo seleccionado.
          </p>
        </div>

        {!archetypeId ? (
          <p className="text-[12px] py-3 text-center" style={{ color: th.textMuted }}>
            Seleccione un arquetipo para ver el preview.
          </p>
        ) : calcOutcomes.length === 0 ? (
          <p className="text-[12px] py-3 text-center" style={{ color: th.textMuted }}>
            Complete al menos un outcome en el Paso 3 para ver el cálculo.
          </p>
        ) : (
          <>
            {/* Outcomes table */}
            <div className="rounded-xl overflow-hidden" style={{ border: `1px solid ${th.cardBorder}` }}>
              <table className="w-full text-left">
                <thead style={{ background: th.hoverBg, borderBottom: `1px solid ${th.cardBorder}` }}>
                  <tr>
                    {[`Outcome`, `VB`, `FR ${fr.toFixed(2)}`, `VA`].map(h => (
                      <th key={h} className="px-3 py-2 text-[10px] uppercase tracking-wider font-medium"
                        style={{ color: th.textMuted }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {outcomeRows.map((row, i) => (
                    <tr key={row.id ?? i}
                      style={{ borderBottom: i < outcomeRows.length - 1 ? `1px solid ${th.cardBorder}` : 'none' }}>
                      <td className="px-3 py-2 text-[12px] max-w-[200px]" style={{ color: th.textPrimary }}>
                        <span className="line-clamp-2">{row.description || row.changeText || '—'}</span>
                      </td>
                      <td className="px-3 py-2 text-[12px] font-mono whitespace-nowrap" style={{ color: th.textSecondary }}>
                        {fmtMXN(row.vb)}
                      </td>
                      <td className="px-3 py-2 text-[12px] font-mono whitespace-nowrap" style={{ color: th.textMuted }}>
                        ×{fr.toFixed(2)}
                      </td>
                      <td className="px-3 py-2 text-[12px] font-mono font-semibold whitespace-nowrap" style={{ color: th.textPrimary }}>
                        {fmtMXN(row.va)}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot style={{ borderTop: `2px solid ${th.cardBorder}`, background: th.hoverBg }}>
                  <tr>
                    <td className="px-3 py-2 text-[10px] uppercase tracking-wider font-medium" style={{ color: th.textMuted }}>
                      Total
                    </td>
                    <td className="px-3 py-2 text-[12px] font-mono font-semibold" style={{ color: th.textSecondary }}>
                      {fmtMXN(totalVB)}
                    </td>
                    <td />
                    <td className="px-3 py-2 text-[13px] font-mono font-semibold" style={{ color: th.accent }}>
                      {fmtMXN(totalVA)}{' '}
                      <span className="text-[10px] font-normal" style={{ color: th.textMuted }}>
                        ajustado FR {fr.toFixed(2)}
                      </span>
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>

            {/* SROI tangible prelim */}
            <div className="flex items-center justify-between p-3 rounded-xl"
              style={{ background: th.cardBg, border: `1px solid ${th.cardBorder}` }}>
              <div>
                <p className="text-[10px] uppercase tracking-wider font-medium" style={{ color: th.textMuted }}>
                  SROI Tangible preliminar
                </p>
                <p className="text-[10px] mt-0.5" style={{ color: th.textMuted }}>
                  Sin intangibles (Paso 5)
                </p>
              </div>
              {sroiTang !== null ? (
                <p className="text-[22px] font-semibold mono" style={{ color: th.textPrimary }}>
                  {sroiTang.toFixed(2)}x
                </p>
              ) : (
                <p className="text-[11px] text-right max-w-[200px]" style={{ color: th.textMuted }}>
                  {investment === 0
                    ? 'SROI no calculable — Agregue inversión en Paso 2 → Inputs'
                    : 'Calculando…'}
                </p>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
