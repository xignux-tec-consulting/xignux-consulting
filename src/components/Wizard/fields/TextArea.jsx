import { useTheme } from '../../../lib/theme'

export default function TextArea({ label, value, onChange, placeholder = '', rows = 4, helper = '' }) {
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
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        className="w-full rounded-xl px-3 py-2.5 text-[13px] outline-none transition resize-none"
        style={{
          background: th.inputBg,
          border: `1px solid ${th.inputBorder}`,
          color: th.textPrimary,
        }}
        onFocus={(e) => { e.target.style.borderColor = th.accentBorder }}
        onBlur={(e)  => { e.target.style.borderColor = th.inputBorder }}
      />
      {helper && (
        <span className="text-[11px]" style={{ color: th.textMuted }}>{helper}</span>
      )}
    </div>
  )
}
