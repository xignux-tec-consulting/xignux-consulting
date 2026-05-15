import { useTheme } from '../../../lib/theme'

export default function Card({ children, className = '' }) {
  const { th } = useTheme()
  return (
    <div
      className={`rounded-2xl ${className}`}
      style={{ background: th.cardBg, border: `1px solid ${th.cardBorder}`, boxShadow: th.shadow }}
    >
      {children}
    </div>
  )
}
