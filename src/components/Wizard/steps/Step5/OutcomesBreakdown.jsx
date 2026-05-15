import { useTheme } from '../../../../lib/theme'
import { fmtMXN } from '../../../../lib/sroiV12'

export default function OutcomesBreakdown({ outcomes, fr }) {
  const { th } = useTheme()
  const totalVB = outcomes.reduce((s, o) => s + o.vb, 0)
  const totalVA = outcomes.reduce((s, o) => s + o.va, 0)

  return (
    <div className="rounded-2xl overflow-hidden"
      style={{ border: `1px solid ${th.cardBorder}`, boxShadow: th.shadow }}>
      <div className="px-4 py-3" style={{ background: th.hoverBg, borderBottom: `1px solid ${th.cardBorder}` }}>
        <p className="text-[12px] font-semibold" style={{ color: th.textPrimary }}>
          Desglose por outcome
        </p>
      </div>
      <div style={{ overflowX: 'auto' }}>
        <table className="w-full text-left">
          <thead style={{ background: th.hoverBg, borderBottom: `1px solid ${th.cardBorder}` }}>
            <tr>
              {['Outcome', 'Qty', 'Proxy × VPN', 'VB', `FR ${fr.toFixed(2)}`, 'VA'].map(h => (
                <th key={h} className="px-3 py-2 text-[10px] uppercase tracking-wider font-medium whitespace-nowrap"
                  style={{ color: th.textMuted }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {outcomes.map((row, i) => (
              <tr key={row.id ?? i}
                style={{
                  borderBottom: i < outcomes.length - 1 ? `1px solid ${th.cardBorder}` : 'none',
                  background: th.cardBg,
                }}>
                <td className="px-3 py-2.5 text-[12px] max-w-[180px]" style={{ color: th.textPrimary }}>
                  <span className="line-clamp-2">{row.description || '—'}</span>
                </td>
                <td className="px-3 py-2.5 text-[11px] font-mono whitespace-nowrap" style={{ color: th.textSecondary }}>
                  {Number(row.quantity).toLocaleString('es-MX')}
                </td>
                <td className="px-3 py-2.5 text-[11px] font-mono whitespace-nowrap" style={{ color: th.textSecondary }}>
                  {fmtMXN(row.proxyValue)} × {row.vpn.toFixed(3)}
                </td>
                <td className="px-3 py-2.5 text-[11px] font-mono whitespace-nowrap" style={{ color: th.textSecondary }}>
                  {fmtMXN(row.vb)}
                </td>
                <td className="px-3 py-2.5 text-[11px] font-mono whitespace-nowrap" style={{ color: th.textMuted }}>
                  ×{row.fr.toFixed(2)}
                </td>
                <td className="px-3 py-2.5 text-[12px] font-mono font-semibold whitespace-nowrap"
                  style={{ color: th.textPrimary }}>
                  {fmtMXN(row.va)}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot style={{ borderTop: `2px solid ${th.cardBorder}`, background: th.hoverBg }}>
            <tr>
              <td colSpan={3} className="px-3 py-2 text-[10px] uppercase tracking-wider font-medium"
                style={{ color: th.textMuted }}>Total</td>
              <td className="px-3 py-2 text-[12px] font-mono font-semibold" style={{ color: th.textSecondary }}>
                {fmtMXN(totalVB)}
              </td>
              <td />
              <td className="px-3 py-2 text-[13px] font-mono font-semibold" style={{ color: th.accent }}>
                {fmtMXN(totalVA)}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  )
}
