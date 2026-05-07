import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Brain, Send, X, MessageCircle } from 'lucide-react'
import { simulate } from './simulate'
import { recomputeProject, portfolioTotals, fmtMXNFull } from '../../lib/sroi'

const PLACEHOLDERS = [
  'Pregúntame sobre tu portafolio…',
  'Compara dos proyectos…',
  '¿Cuál proyecto debería escalar?',
  'Modifica el deadweight de P03…',
  '¿Qué es SROI?',
]
const QUICK_CHIPS = ['Top 3 SROI', 'Resumen portafolio', 'Comparar arquetipos', 'Qué escalar', 'Eficiencia', 'Riesgos']

function mkTh(dark) {
  return {
    panelBg:      dark ? 'rgba(19,25,41,0.88)'        : 'rgba(255,255,255,0.92)',
    panelBorder:  dark ? 'rgba(255,255,255,0.08)'     : 'rgba(0,0,0,0.09)',
    botBubbleBg:  dark ? '#1F2937'                    : '#EFF3FA',
    botBubbleText:dark ? '#F5F7FA'                    : '#0F172A',
    inputBg:      dark ? '#1a2236'                    : '#F1F5FB',
    inputBorder:  dark ? '#1F2937'                    : '#CBD5E1',
    inputText:    dark ? '#F5F7FA'                    : '#0F172A',
    placeholder:  dark ? '#5e6c87'                    : '#94A3B8',
    headerBorder: dark ? 'rgba(255,255,255,0.08)'     : 'rgba(0,0,0,0.08)',
    metaText:     dark ? '#94A3B8'                    : '#64748b',
    chipBg:       dark ? 'rgba(255,255,255,0.04)'     : 'rgba(0,0,0,0.04)',
    chipBorder:   dark ? 'rgba(255,255,255,0.08)'     : 'rgba(0,0,0,0.09)',
    chipText:     dark ? '#94A3B8'                    : '#475569',
    tableBorder:  dark ? '#1F2937'                    : '#E2E8F0',
    tableHeadBg:  'rgba(46,117,182,0.12)',
    tableHeadText:dark ? '#94A3B8'                    : '#475569',
    actionAlt:    dark ? 'rgba(255,255,255,0.06)'     : 'rgba(0,0,0,0.05)',
    actionAltBorder: dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)',
    actionAltText:dark ? '#F5F7FA'                    : '#0F172A',
    titleText:    dark ? '#F5F7FA'                    : '#0F172A',
  }
}

function TypingIndicator({ dark }) {
  return (
    <div
      className="flex gap-1 items-center px-3 py-2 rounded-2xl rounded-bl-sm"
      style={{ background: dark ? '#1F2937' : '#EFF3FA', width: 'fit-content' }}
    >
      <span className="typing-dot" /><span className="typing-dot" /><span className="typing-dot" />
    </div>
  )
}

function MiniTable({ rows, headers, th }) {
  return (
    <div className="mt-2 rounded-md overflow-hidden border" style={{ borderColor: th.tableBorder }}>
      <table className="w-full text-[11px]">
        <thead>
          <tr style={{ background: th.tableHeadBg }}>
            {headers.map((h) => (
              <th key={h} className="text-left px-2 py-1.5 font-medium" style={{ color: th.tableHeadText }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} style={{ borderTop: i ? `1px solid ${th.tableBorder}` : 'none' }}>
              {r.map((c, j) => (
                <td key={j} className="px-2 py-1.5 mono" style={c?.color ? { color: c.color } : { color: th.botBubbleText }}>
                  {typeof c === 'object' ? c.text : c}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function renderRichText(text, onProjectClick) {
  const parts = text.split(/(\bP\d{2}\b)/g)
  return parts.map((p, i) => {
    if (/^P\d{2}$/.test(p)) {
      return <span key={i} className="chip-link mono" onClick={() => onProjectClick(p)}>{p}</span>
    }
    if (p.startsWith('**') && p.endsWith('**')) {
      return <strong key={i} className="font-semibold">{p.slice(2, -2)}</strong>
    }
    return <span key={i}>{p}</span>
  })
}

function formatContent(text, onProjectClick) {
  const boldParts = text.split(/(\*\*[^*]+\*\*)/g)
  return boldParts.map((segment, i) => {
    if (segment.startsWith('**') && segment.endsWith('**')) {
      return <strong key={`b${i}`} className="font-semibold">{segment.slice(2, -2)}</strong>
    }
    return renderRichText(segment, onProjectClick).map((el, j) =>
      ({ ...el, key: `${i}-${j}` })
    )
  }).flat()
}

function ChatBubble({ msg, onAction, onProjectClick, th }) {
  const isUser = msg.role === 'user'
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-3`}
    >
      {!isUser && (
        <div className="w-6 h-6 rounded-md flex items-center justify-center mr-2 mt-1 flex-shrink-0"
          style={{ background: 'rgba(46,117,182,0.15)' }}>
          <Brain className="w-3 h-3" style={{ color: '#5B9BD5' }} />
        </div>
      )}
      <div
        className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-[13px] leading-relaxed ${isUser ? 'rounded-br-sm' : 'rounded-bl-sm'}`}
        style={
          isUser
            ? { background: 'linear-gradient(135deg,#2E75B6,#1f5285)', color: '#fff' }
            : { background: th.botBubbleBg, color: th.botBubbleText }
        }
      >
        {msg.content && (
          <div className="whitespace-pre-wrap">
            {formatContent(msg.content, onProjectClick)}
          </div>
        )}
        {msg.table && <MiniTable headers={msg.table.headers} rows={msg.table.rows} th={th} />}
        {msg.actions && (
          <div className="flex gap-2 flex-wrap mt-3">
            {msg.actions.map((a, i) => (
              <button
                key={i}
                onClick={() => onAction(a)}
                className="text-[11px] px-2.5 py-1.5 rounded-md transition hover:scale-[1.03] active:scale-[0.97]"
                style={
                  a.primary
                    ? { background: '#2E75B6', color: '#fff' }
                    : { background: th.actionAlt, color: th.actionAltText, border: `1px solid ${th.actionAltBorder}` }
                }
              >
                {a.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  )
}

export default function ChatPanel({
  collapsed, setCollapsed, projects, selectedId, onSelectProject,
  onOpenProject, applyAdjustment, applyOptimization, darkMode = true,
}) {
  const th = mkTh(darkMode)

  const [messages, setMessages] = useState(() => [{
    role: 'bot',
    content: 'Hola, soy **Impact AI**, tu asistente de portafolio RSC. Tengo contexto de los 16 proyectos de XIGNUX. Puedo:\n\n  • Consultar datos y métricas\n  • Comparar proyectos y arquetipos\n  • Asesoría estratégica\n  • Explicar conceptos SROI\n  • Modificar parámetros del modelo\n\nPrueba una pregunta o usa los chips rápidos.',
  }])
  const [input, setInput] = useState('')
  const [typing, setTyping] = useState(false)
  const [pHolder, setPHolder] = useState(0)
  const scrollRef = useRef(null)
  const lastSelectedRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => {
    const t = setInterval(() => setPHolder((p) => (p + 1) % PLACEHOLDERS.length), 4000)
    return () => clearInterval(t)
  }, [])

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight
  }, [messages, typing])

  useEffect(() => {
    if (selectedId && selectedId !== lastSelectedRef.current) {
      lastSelectedRef.current = selectedId
      const p = projects.find((x) => x.id === selectedId)
      if (p) {
        setMessages((m) => [...m, {
          role: 'bot',
          content: `Veo que estás en ${p.id} ${p.name}. ¿Qué quieres saber?`,
          actions: [
            { label: 'Resumen ejecutivo', payload: { kind: 'summary', id: p.id } },
            { label: 'Ver dashboard', primary: true, payload: { kind: 'openDash', id: p.id } },
            { label: 'Comparar con peers', payload: { kind: 'peers', id: p.id } },
          ],
        }])
      }
    }
  }, [selectedId])

  const respond = (userText) => {
    setTyping(true)
    const delay = 600 + Math.random() * 600
    setTimeout(() => {
      const reply = simulate(userText, projects, selectedId)
      setMessages((m) => [...m, ...reply])
      setTyping(false)
    }, delay)
  }

  const send = (text) => {
    const t = (text ?? input).trim()
    if (!t) return
    setMessages((m) => [...m, { role: 'user', content: t }])
    setInput('')
    respond(t)
  }

  const handleProjectClick = (id) => {
    if (onOpenProject) onOpenProject(id)
    else onSelectProject(id)
  }

  const handleAction = (a) => {
    const p = a.payload || {}
    if (p.kind === 'open' && p.id) handleProjectClick(p.id)
    if (p.kind === 'openDash' && p.id) {
      if (onOpenProject) onOpenProject(p.id)
      else onSelectProject(p.id)
    }
    if (p.kind === 'summary' && p.id) {
      const proj = projects.find((x) => x.id === p.id)
      if (proj) {
        setTyping(true)
        setTimeout(() => {
          setMessages((m) => [...m, {
            role: 'bot',
            content: `${proj.id} ${proj.name} tiene SROI ${proj.sroi.toFixed(2)}x con inversión ${fmtMXNFull(proj.investment)}. Genera ${fmtMXNFull(proj.vAjustado)} de valor social ajustado a ${proj.direct_beneficiaries.toLocaleString('es-MX')} beneficiarios directos. Categoría: ${proj.category}.`,
            actions: [{ label: `Ver dashboard ${proj.id}`, primary: true, payload: { kind: 'openDash', id: proj.id } }],
          }])
          setTyping(false)
        }, 700)
      }
    }
    if (p.kind === 'peers' && p.id) {
      const proj = projects.find((x) => x.id === p.id)
      if (proj) {
        const peers = projects.filter((x) => x.archetype === proj.archetype && x.id !== proj.id)
        setTyping(true)
        setTimeout(() => {
          setMessages((m) => [...m, {
            role: 'bot',
            content: `Peers de ${proj.id} en arquetipo ${proj.archetype}:`,
            table: {
              headers: ['ID', 'Proyecto', 'SROI'],
              rows: peers.map((px) => [
                px.id,
                px.name.length > 20 ? px.name.slice(0, 19) + '…' : px.name,
                { text: px.sroi.toFixed(2) + 'x', color: px.sroi >= 1 ? '#10B981' : px.sroi >= 0.5 ? '#F59E0B' : '#7F1D1D' },
              ]),
            },
          }])
          setTyping(false)
        }, 700)
      }
    }
    if (p.kind === 'applyAdj') {
      applyAdjustment(p.id, p.adj)
      setMessages((m) => [...m, { role: 'bot', content: `Aplicado. Recalculando ${p.id}…` }])
      setTimeout(() => {
        const updated = recomputeProject(projects.find((x) => x.id === p.id), p.adj)
        const newProjects = projects.map((x) => (x.id === p.id ? updated : x))
        const tot = portfolioTotals(newProjects)
        setMessages((m) => [...m, {
          role: 'bot',
          content: `${p.id} ahora tiene SROI ${updated.sroi.toFixed(2)}x (categoría ${updated.category}). SROI portafolio: ${tot.sroi.toFixed(2)}x.`,
        }])
      }, 600)
    }
    if (p.kind === 'applyOpt') {
      applyOptimization()
      setMessages((m) => [...m, { role: 'bot', content: 'Recomendaciones aplicadas. La constelación se está reorganizando.' }])
    }
    if (p.kind === 'cancel') {
      setMessages((m) => [...m, { role: 'bot', content: 'Sin cambios. ¿Algo más?' }])
    }
  }

  // ── Collapsed: floating button ──
  if (collapsed) {
    return (
      <motion.button
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setCollapsed(false)}
        className="fixed right-5 bottom-5 z-[60] w-14 h-14 rounded-full flex items-center justify-center shadow-2xl"
        style={{
          background: 'linear-gradient(135deg, #2E75B6, #1f5285)',
          boxShadow: '0 8px 32px -4px rgba(46,117,182,0.5), 0 0 0 1px rgba(255,255,255,0.1)',
        }}
        aria-label="Abrir chat IA"
      >
        <MessageCircle className="w-6 h-6 text-white" />
        <span className="absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-400 border-2"
          style={{ borderColor: '#0A0E1A' }} />
      </motion.button>
    )
  }

  // ── Expanded: chat panel ──
  return (
    <AnimatePresence>
      <motion.aside
        initial={{ opacity: 0, y: 40, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 40, scale: 0.95 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        className="fixed right-5 bottom-5 w-[380px] z-[60] flex flex-col rounded-2xl overflow-hidden"
        style={{
          height: 'min(620px, calc(100vh - 60px))',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          background: th.panelBg,
          border: `1px solid ${th.panelBorder}`,
          boxShadow: darkMode
            ? '0 24px 60px -20px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.05)'
            : '0 12px 40px -16px rgba(0,0,0,0.2)',
        }}
      >
        {/* Header */}
        <div
          className="px-4 py-3 flex items-center gap-3 flex-shrink-0"
          style={{ borderBottom: `1px solid ${th.headerBorder}` }}
        >
          <div className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: 'rgba(46,117,182,0.15)' }}>
            <Brain className="w-4 h-4" style={{ color: '#5B9BD5' }} />
          </div>
          <div className="flex-1">
            <div className="text-sm font-semibold leading-tight" style={{ color: th.titleText }}>Impact AI</div>
            <div className="flex items-center gap-1.5 text-[10px]" style={{ color: th.metaText }}>
              <span className="pulse-dot inline-block w-1.5 h-1.5 rounded-full" style={{ background: '#10B981' }} />
              16 proyectos · {projects.length} activos
            </div>
          </div>
          <button
            onClick={() => setCollapsed(true)}
            className="w-7 h-7 rounded-md flex items-center justify-center transition hover:bg-white/[0.06]"
            style={{ color: th.metaText }}
            aria-label="Cerrar chat"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Messages */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 scroll-smooth">
          {messages.map((m, i) => (
            <ChatBubble
              key={i} msg={m}
              onAction={handleAction}
              onProjectClick={handleProjectClick}
              th={th}
            />
          ))}
          {typing && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-3 flex items-end gap-2">
              <div className="w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0"
                style={{ background: 'rgba(46,117,182,0.15)' }}>
                <Brain className="w-3 h-3" style={{ color: '#5B9BD5' }} />
              </div>
              <TypingIndicator dark={darkMode} />
            </motion.div>
          )}
        </div>

        {/* Quick chips */}
        <div className="px-3 pt-1.5 pb-1 flex gap-1.5 flex-wrap flex-shrink-0">
          {QUICK_CHIPS.map((c) => (
            <button
              key={c}
              onClick={() => send(c)}
              className="text-[10px] px-2 py-1 rounded-md transition hover:scale-[1.03] active:scale-[0.97]"
              style={{
                background: th.chipBg,
                border: `1px solid ${th.chipBorder}`,
                color: th.chipText,
              }}
            >
              {c}
            </button>
          ))}
        </div>

        {/* Input */}
        <div className="p-3 flex-shrink-0" style={{ borderTop: `1px solid ${th.headerBorder}` }}>
          <div
            className="rounded-xl px-3 py-2 flex items-end gap-2"
            style={{ background: th.inputBg, border: `1px solid ${th.inputBorder}` }}
          >
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() } }}
              placeholder={PLACEHOLDERS[pHolder]}
              rows={1}
              className="flex-1 bg-transparent outline-none text-[13px] resize-none py-1.5"
              style={{
                maxHeight: 100,
                color: th.inputText,
                caretColor: '#5B9BD5',
              }}
            />
            <button
              onClick={() => send()}
              disabled={!input.trim()}
              className="w-8 h-8 rounded-lg flex items-center justify-center transition disabled:opacity-30 hover:scale-[1.05] active:scale-[0.95]"
              style={{ background: input.trim() ? '#2E75B6' : 'transparent', color: '#fff' }}
              aria-label="Enviar"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </motion.aside>
    </AnimatePresence>
  )
}
