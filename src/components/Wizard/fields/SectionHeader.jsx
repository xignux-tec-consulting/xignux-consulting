import { useTheme } from '../../../lib/theme'

export default function SectionHeader({ stepNumber, title, subtitle }) {
  const { th } = useTheme()
  return (
    <div className="space-y-1">
      <span
        className="text-[11px] font-semibold uppercase tracking-widest"
        style={{ color: th.accent }}
      >
        Paso {stepNumber}
      </span>
      <h1
        className="text-[18px] font-semibold leading-snug"
        style={{ color: th.textPrimary }}
      >
        {title}
      </h1>
      {subtitle && (
        <p className="text-[12px]" style={{ color: th.textMuted }}>
          {subtitle}
        </p>
      )}
    </div>
  )
}
