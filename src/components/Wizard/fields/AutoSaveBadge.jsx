import { Check } from 'lucide-react'

const fmt = (iso) =>
  new Date(iso).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit', second: '2-digit' })

export default function AutoSaveBadge({ lastSavedAt }) {
  if (!lastSavedAt) return null
  return (
    <div
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full"
      style={{ background: 'rgba(16,185,129,0.10)', border: '1px solid rgba(16,185,129,0.20)' }}
    >
      <Check className="w-3 h-3 flex-shrink-0" style={{ color: '#10B981' }} />
      <span className="text-[10px] mono font-medium" style={{ color: '#10B981' }}>
        Autoguardado · {fmt(lastSavedAt)}
      </span>
    </div>
  )
}
