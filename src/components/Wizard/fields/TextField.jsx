import { useTheme } from '../../../lib/theme'

export default function TextField({ label, value, onChange, placeholder = '', helper = '', error = '' }) {
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
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl px-3 py-2.5 text-[13px] outline-none transition"
        style={{
          background: th.inputBg,
          border: `1px solid ${error ? '#EF4444' : th.inputBorder}`,
          color: th.textPrimary,
        }}
        onFocus={(e)  => { e.target.style.borderColor = th.accentBorder }}
        onBlur={(e)   => { e.target.style.borderColor = error ? '#EF4444' : th.inputBorder }}
      />
      {helper && !error && (
        <span className="text-[11px]" style={{ color: th.textMuted }}>{helper}</span>
      )}
      {error && (
        <span className="text-[11px]" style={{ color: '#EF4444' }}>{error}</span>
      )}
    </div>
  )
}
