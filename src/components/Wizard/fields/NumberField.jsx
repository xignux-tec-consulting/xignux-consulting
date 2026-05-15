import { useTheme } from '../../../lib/theme'

export default function NumberField({ label, value, onChange, placeholder = '', prefix = '', helper = '' }) {
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
      <div className="relative flex items-center">
        {prefix && (
          <span
            className="absolute left-3 text-[13px] font-medium pointer-events-none"
            style={{ color: th.textSecondary }}
          >
            {prefix}
          </span>
        )}
        <input
          type="number"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full rounded-xl py-2.5 text-[13px] outline-none transition"
          style={{
            background: th.inputBg,
            border: `1px solid ${th.inputBorder}`,
            color: th.textPrimary,
            paddingLeft: prefix ? 28 : 12,
            paddingRight: 12,
          }}
          onFocus={(e) => { e.target.style.borderColor = th.accentBorder }}
          onBlur={(e)  => { e.target.style.borderColor = th.inputBorder }}
        />
      </div>
      {helper && (
        <span className="text-[11px]" style={{ color: th.textMuted }}>{helper}</span>
      )}
    </div>
  )
}
