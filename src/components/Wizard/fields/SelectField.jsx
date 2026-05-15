import { useTheme } from '../../../lib/theme'

export default function SelectField({ label, value, onChange, options = [], helper = '' }) {
  const { th } = useTheme()
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label
          className="text-[11px] uppercase tracking-wider font-medium"
          style={{ color: th.textSecondary }}
        >
          {label}
        </label>
      )}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl px-3 py-2.5 text-[13px] outline-none transition appearance-none cursor-pointer"
        style={{
          background: th.inputBg,
          border: `1px solid ${th.inputBorder}`,
          color: value ? th.textPrimary : th.textMuted,
        }}
        onFocus={(e) => { e.target.style.borderColor = th.accentBorder }}
        onBlur={(e)  => { e.target.style.borderColor = th.inputBorder }}
      >
        <option value="">Seleccionar...</option>
        {options.map((opt) => (
          <option key={opt} value={opt}>{opt}</option>
        ))}
      </select>
      {helper && (
        <span className="text-[11px]" style={{ color: th.textMuted }}>{helper}</span>
      )}
    </div>
  )
}
