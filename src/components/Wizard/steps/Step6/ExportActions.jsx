import { useTheme } from '../../../../lib/theme'

export default function ExportActions({ fullState, onChange, onReset, onGoToStep }) {
  const { th } = useTheme()

  const { step6 } = fullState
  const projectName = fullState.step1?.projectName?.trim() || 'sroi-report'

  const handleExportJson = () => {
    const now = new Date().toISOString()
    const data = {
      meta: { exportedAt: now, version: 'v12.10', tool: 'XIGNUX Impact Lens' },
      ...fullState,
      computedResults: fullState.step5?.results ?? null,
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    a.href     = url
    a.download = `sroi-${projectName.replace(/\s+/g, '-').toLowerCase()}-${now.slice(0, 10)}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    onChange({ exportedAt: now })
  }

  const handlePrint = () => {
    const cleanup = () => {
      document.body.classList.remove('wizard-printing')
      window.removeEventListener('afterprint', cleanup)
    }
    window.addEventListener('afterprint', cleanup)
    document.body.classList.add('wizard-printing')
    setTimeout(() => window.print(), 100)
  }

  const handleReset = () => {
    if (window.confirm('¿Está seguro? Esta acción no se puede deshacer. Todos los datos del análisis se perderán.')) {
      onReset()
      onGoToStep(1)
    }
  }

  const actions = [
    {
      id:      'json',
      icon:    '↓',
      title:   'Exportar JSON',
      helper:  'Datos completos del análisis en formato JSON. Útil para auditoría y backup.',
      btnText: 'Descargar .json',
      onClick: handleExportJson,
      btnStyle: {
        background: th.accent,
        color: '#fff',
        border: 'none',
        boxShadow: '0 2px 10px -2px rgba(232,82,14,0.4)',
      },
    },
    {
      id:      'print',
      icon:    '⎙',
      title:   'Vista imprimible (PDF)',
      helper:  'Abre la vista imprimible. Use Ctrl+P / Cmd+P y "Guardar como PDF" para generar el reporte.',
      btnText: 'Abrir vista imprimible',
      onClick: handlePrint,
      btnStyle: {
        background: 'transparent',
        color: th.accent,
        border: `1.5px solid ${th.accent}`,
      },
    },
    {
      id:      'reset',
      icon:    '↺',
      title:   'Empezar nuevo análisis',
      helper:  'Limpia el wizard y empieza desde cero. Sus datos actuales se perderán.',
      btnText: 'Resetear wizard',
      onClick: handleReset,
      btnStyle: {
        background: 'transparent',
        color: '#7F1D1D',
        border: '1.5px solid rgba(127,29,29,0.40)',
      },
    },
  ]

  return (
    <div id="step6-export" className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {actions.map(a => (
          <div key={a.id} className="rounded-2xl p-5 flex flex-col gap-4"
            style={{ background: th.cardBg, border: `1px solid ${th.cardBorder}`, boxShadow: th.shadow }}>
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[18px]" style={{ lineHeight: 1 }}>{a.icon}</span>
                <p className="text-[13px] font-semibold" style={{ color: th.textPrimary }}>{a.title}</p>
              </div>
              <p className="text-[12px]" style={{ color: th.textMuted }}>{a.helper}</p>
            </div>
            <button
              type="button"
              onClick={a.onClick}
              className="w-full py-2.5 rounded-xl text-[12px] font-semibold"
              style={{ cursor: 'pointer', ...a.btnStyle }}
            >
              {a.btnText}
            </button>
          </div>
        ))}
      </div>

      {step6?.exportedAt && (
        <p className="text-[11px] text-right" style={{ color: th.textMuted }}>
          Último export: {new Date(step6.exportedAt).toLocaleString('es-MX')}
        </p>
      )}
    </div>
  )
}
