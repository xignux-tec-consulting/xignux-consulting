import { useState } from 'react'
import { Clock, Target, DollarSign } from 'lucide-react'
import { useTheme } from '../../../../lib/theme'
import TextField from '../../fields/TextField'
import TextArea from '../../fields/TextArea'
import NumberField from '../../fields/NumberField'
import { VPN_PROFILES, vpnForProfile, fmtMXNFull } from '../../../../lib/sroiV12'

function validate(o) {
  return (
    Boolean(o.description?.trim()) &&
    Boolean(o.indicator?.name?.trim()) &&
    Number(o.indicator?.value) > 0 &&
    Boolean(o.indicator?.source?.trim()) &&
    Boolean(o.proxy?.name?.trim()) &&
    Number(o.proxy?.value) > 0 &&
    Boolean(o.proxy?.source?.trim()) &&
    Boolean(o.vpnProfile && VPN_PROFILES[o.vpnProfile])
  )
}

const subCard = (th) => ({
  border: `1px solid ${th.cardBorder}`,
  borderRadius: 12,
  overflow: 'hidden',
})
const subHead = (th) => ({
  display: 'flex',
  alignItems: 'center',
  gap: 8,
  padding: '10px 16px',
  background: th.hoverBg,
  borderBottom: `1px solid ${th.cardBorder}`,
})

export default function OutcomeEditor({ outcome, onChange, onSave, onCancel, onDelete, isNew }) {
  const { th } = useTheme()
  const [anyTouched, setAnyTouched] = useState(false)

  const ind = outcome.indicator ?? { name: '', value: '', unit: '', source: '' }
  const prx = outcome.proxy    ?? { name: '', value: '', source: '' }

  const touch = () => setAnyTouched(true)
  const setInd = (p) => { touch(); onChange({ indicator: { ...ind, ...p } }) }
  const setPrx = (p) => { touch(); onChange({ proxy:    { ...prx, ...p } }) }

  const showErr  = (v) => anyTouched && !v?.toString().trim()
  const showNErr = (v) => anyTouched && !(Number(v) > 0)
  const req = (label, hasErr) =>
    hasErr ? <span>{label}<span style={{ color: '#7F1D1D' }}> *</span></span> : label

  const isValid = validate(outcome)
  const vpn = outcome.vpnProfile ? vpnForProfile(outcome.vpnProfile) : null
  const vb  = vpn !== null && Number(ind.value) > 0 && Number(prx.value) > 0
    ? Number(ind.value) * Number(prx.value) * vpn
    : null

  return (
    <div className="space-y-5 px-5 pt-4 pb-5">

      {/* Description */}
      <TextArea
        label={req('Descripción del outcome', showErr(outcome.description))}
        value={outcome.description ?? ''}
        onChange={(v) => { touch(); onChange({ description: v }) }}
        placeholder="Las familias beneficiarias reducen su gasto eléctrico mensual en un 60% durante el primer año tras la instalación de paneles solares."
        rows={2}
        helper="Reformule el cambio como un outcome formal: qué cambió, para quién, en qué medida."
      />

      {/* Indicator sub-card */}
      <div style={subCard(th)}>
        <div style={subHead(th)}>
          <Target className="w-4 h-4 flex-shrink-0" style={{ color: th.accent }} />
          <span className="text-[12px] font-semibold" style={{ color: th.textPrimary }}>Indicador</span>
          <span className="text-[11px]" style={{ color: th.textMuted }}>— Métrica cuantitativa que prueba el cambio</span>
        </div>
        <div className="p-4 space-y-3">
          <TextField
            label={req('Nombre del indicador', showErr(ind.name))}
            value={ind.name}
            onChange={(v) => setInd({ name: v })}
            placeholder="Pesos ahorrados al año por hogar"
          />
          <div className="grid grid-cols-2 gap-3">
            <NumberField
              label={req('Valor medido', showNErr(ind.value))}
              value={ind.value}
              onChange={(v) => setInd({ value: v })}
              placeholder="0"
            />
            <TextField
              label="Unidad / contexto (opcional)"
              value={ind.unit ?? ''}
              onChange={(v) => setInd({ unit: v })}
              placeholder="por hogar, anual, %"
            />
          </div>
          <TextField
            label={req('Fuente del indicador', showErr(ind.source))}
            value={ind.source}
            onChange={(v) => setInd({ source: v })}
            placeholder="Ej: Encuesta interna 2024, n=120"
          />
        </div>
      </div>

      {/* Proxy sub-card */}
      <div style={subCard(th)}>
        <div style={subHead(th)}>
          <DollarSign className="w-4 h-4 flex-shrink-0" style={{ color: th.accent }} />
          <span className="text-[12px] font-semibold" style={{ color: th.textPrimary }}>Proxy financiero</span>
          <span className="text-[11px]" style={{ color: th.textMuted }}>— Monetice el outcome con proxies conservadores</span>
        </div>
        <div className="p-4 space-y-3">
          <TextField
            label={req('Nombre del proxy', showErr(prx.name))}
            value={prx.name}
            onChange={(v) => setPrx({ name: v })}
            placeholder="Ahorro promedio en factura eléctrica anual"
          />
          <NumberField
            label={req('Valor del proxy ($)', showNErr(prx.value))}
            value={prx.value}
            onChange={(v) => setPrx({ value: v })}
            placeholder="0"
            prefix="$"
          />
          <TextField
            label={req('Fuente del proxy', showErr(prx.source))}
            value={prx.source}
            onChange={(v) => setPrx({ source: v })}
            placeholder="CFE tarifas residenciales 2024"
          />
        </div>
      </div>

      {/* VPN Profile selector */}
      <div style={subCard(th)}>
        <div style={subHead(th)}>
          <Clock className="w-4 h-4 flex-shrink-0" style={{ color: th.accent }} />
          <span className="text-[12px] font-semibold" style={{ color: th.textPrimary }}>
            {req('Perfil VPN', anyTouched && !outcome.vpnProfile)}
          </span>
          <span className="text-[11px]" style={{ color: th.textMuted }}>— Proyección del beneficio en el tiempo</span>
        </div>
        <div className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {Object.values(VPN_PROFILES).map(profile => {
              const selected = outcome.vpnProfile === profile.id
              return (
                <button
                  key={profile.id}
                  type="button"
                  onClick={() => { touch(); onChange({ vpnProfile: profile.id }) }}
                  className="text-left rounded-xl p-3 transition-all"
                  style={{
                    border: `1.5px solid ${selected ? th.accent : th.cardBorder}`,
                    background: selected ? th.accentSoft : 'transparent',
                    cursor: 'pointer',
                  }}
                >
                  <p className="text-[12px] font-semibold leading-tight" style={{ color: th.textPrimary }}>
                    {profile.label}
                  </p>
                  <p className="text-[11px] mt-1 leading-snug" style={{ color: th.textMuted }}>
                    {profile.description}
                  </p>
                  <p className="text-[10px] font-mono mt-2" style={{ color: selected ? th.accent : th.textMuted }}>
                    n={profile.n}yr · DO={(profile.dropOff * 100).toFixed(0)}% · VPN={vpnForProfile(profile.id).toFixed(2)}
                  </p>
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* Live VB preview */}
      <div className="rounded-xl p-4" style={{ background: th.accentSoft, border: `1px solid ${th.accentBorder}` }}>
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <span className="text-[10px] uppercase tracking-wider font-medium" style={{ color: th.textMuted }}>
            Valor Bruto estimado (VB)
          </span>
          {vb !== null ? (
            <span className="text-[20px] font-semibold mono" style={{ color: th.textPrimary }}>
              {fmtMXNFull(vb)}
            </span>
          ) : (
            <span className="text-[13px]" style={{ color: th.textMuted }}>Complete los campos requeridos</span>
          )}
        </div>
        {vb !== null && (
          <p className="text-[10px] font-mono mt-1.5" style={{ color: th.textMuted }}>
            = {Number(ind.value).toLocaleString('es-MX')} × ${Number(prx.value).toLocaleString('es-MX')} × {vpn.toFixed(3)} ({VPN_PROFILES[outcome.vpnProfile]?.label})
          </p>
        )}
        <p className="text-[10px] mt-2" style={{ color: th.textMuted }}>
          Este es el Valor Bruto SIN ajustes. El Factor Reclamado se aplica en el Paso 4.
        </p>
      </div>

      {/* Action buttons */}
      <div className="flex items-center justify-end gap-2 pt-2 border-t" style={{ borderColor: th.cardBorder }}>
        {isNew ? (
          <button type="button" onClick={onCancel}
            className="px-4 py-2 rounded-xl text-[12px] font-medium"
            style={{ background: 'transparent', border: `1px solid ${th.cardBorder}`, color: th.textSecondary, cursor: 'pointer' }}>
            Cancelar
          </button>
        ) : (
          <button type="button" onClick={onDelete}
            className="px-4 py-2 rounded-xl text-[12px] font-medium"
            style={{ color: '#7F1D1D', background: 'transparent', border: '1px solid rgba(127,29,29,0.3)', cursor: 'pointer' }}>
            Eliminar
          </button>
        )}
        <button
          type="button"
          onClick={() => { if (isValid) onSave() }}
          disabled={!isValid}
          className="px-4 py-2 rounded-xl text-[12px] font-semibold transition-all"
          style={{
            background:  isValid ? th.accent   : th.hoverBg,
            color:       isValid ? '#fff'      : th.textMuted,
            boxShadow:   isValid ? '0 2px 10px -2px rgba(232,82,14,0.4)' : 'none',
            cursor:      isValid ? 'pointer'   : 'not-allowed',
            border: 'none',
          }}
        >
          Guardar outcome
        </button>
      </div>
    </div>
  )
}
