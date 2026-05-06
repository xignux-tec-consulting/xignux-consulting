import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { Brain, Send, ChevronsRight } from 'lucide-react'
import { simulate } from './simulate'
import { recomputeProject, portfolioTotals, fmtMXNFull } from '../../lib/sroi'

const PLACEHOLDERS = [
  'Pregúntame sobre tu portafolio…',
  'Compara dos proyectos…',
  '¿Cuál proyecto debería escalar?',
  'Modifica el deadweight de P03…',
]
const QUICK_CHIPS = ['Top 3 SROI', 'Optimización', 'Comparar arquetipos', 'Riesgos']

function TypingIndicator() {
  return (
    <div className="flex gap-1 items-center px-3 py-2 rounded-2xl rounded-bl-sm" style={{ background: '#1F2937', width: 'fit-content' }}>
      <span className="typing-dot" /><span className="typing-dot" /><span className="typing-dot" />
    </div>
  )
}

function MiniTable({ rows, headers }) {
  return (
    <div className="mt-2 rounded-md overflow-hidden border" style={{ borderColor: '#1F2937' }}>
      <table className="w-full text-[11px]">
        <thead>
          <tr style={{ background: 'rgba(46,117,182,0.12)' }}>
            {headers.map((h) => (
              <th key={h} className="text-left px-2 py-1.5 font-medium" style={{ color: '#94A3B8' }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} style={{ borderTop: i ? '1px solid #1F2937' : 'none' }}>
              {r.map((c, j) => (
                <td key={j} className="px-2 py-1.5 mono" style={c?.color ? { color: c.color } : {}}>
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
      return (
        <span key={i} className="chip-link mono" onClick={() => onProjectClick(p)}>{p}</span>
      )
    }
    return <span key={i}>{p}</span>
  })
}

function ChatBubble({ msg, onAction, onProjectClick }) {
  const isUser = msg.role === 'user'
  return (
    <motion.div
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-3`}
    >
      <div
        className={`max-w-[88%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${isUser ? 'rounded-br-sm' : 'rounded-bl-sm'}`}
        style={
          isUser
            ? { background: 'linear-gradient(135deg,#2E75B6,#1f5285)', color: '#fff' }
            : { background: '#1F2937', color: '#F5F7FA' }
        }
      >
        {msg.content && (
          <div className="whitespace-pre-wrap">
            {renderRichText(msg.content, onProjectClick)}
          </div>
        )}
        {msg.table && <MiniTable headers={msg.table.headers} rows={msg.table.rows} />}
        {msg.actions && (
          <div className="flex gap-2 flex-wrap mt-3">
            {msg.actions.map((a, i) => (
              <button
                key={i}
                onClick={() => onAction(a)}
                className="text-[11px] px-2.5 py-1.5 rounded-md transition"
                style={
                  a.primary
                    ? { background: '#2E75B6', color: '#fff' }
                    : { background: 'rgba(255,255,255,0.06)', color: '#F5F7FA', border: '1px solid rgba(255,255,255,0.08)' }
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
  applyAdjustment, applyOptimization,
}) {
  const [messages, setMessages] = useState(() => [{
    role: 'bot',
    content: 'Hola, soy tu asistente de portafolio. Pregúntame cualquier cosa sobre tus 15 proyectos. Puedo:\n\n  • Comparar proyectos\n  • Sugerir optimizaciones\n  • Modificar parámetros del modelo\n\nPrueba: "¿Cuál es mi proyecto de mayor SROI?"',
  }])
  const [input, setInput] = useState('')
  const [typing, setTyping] = useState(false)
  const [pHolder, setPHolder] = useState(0)
  const scrollRef = useRef(null)
  const lastSelectedRef = useRef(null)

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
          content: `Veo que estás en ${p.id} ${p.name}. ¿Qué quieres saber sobre este proyecto?`,
          actions: [
            { label: 'Resumen ejecutivo', payload: { kind: 'summary', id: p.id } },
            { label: 'Comparar con peers', payload: { kind: 'peers', id: p.id } },
          ],
        }])
      }
    }
  }, [selectedId])

  const respond = (userText) => {
    setTyping(true)
    const delay = 800 + Math.random() * 700
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

  const handleAction = (a) => {
    const p = a.payload || {}
    if (p.kind === 'open' && p.id) onSelectProject(p.id)
    if (p.kind === 'summary' && p.id) {
      const proj = projects.find((x) => x.id === p.id)
      if (proj) {
        setTyping(true)
        setTimeout(() => {
          setMessages((m) => [...m, {
            role: 'bot',
            content: `${proj.id} ${proj.name} tiene SROI ${proj.sroi.toFixed(2)}x con inversión ${fmtMXNFull(proj.investment)}. Genera ${fmtMXNFull(proj.vAjustado)} de valor social ajustado a ${proj.direct_beneficiaries.toLocaleString('es-MX')} beneficiarios directos. Categoría: ${proj.category}.`,
          }])
          setTyping(false)
        }, 700)
      }
    }
    if (p.kind === 'applyAdj') {
      applyAdjustment(p.id, p.adj)
      setMessages((m) => [...m, { role: 'bot', content: `✓ Aplicado. Recalculando ${p.id}…` }])
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
      setMessages((m) => [...m, { role: 'bot', content: '✓ Recomendaciones aplicadas. La constelación se está reorganizando.' }])
    }
    if (p.kind === 'cancel') {
      setMessages((m) => [...m, { role: 'bot', content: 'Sin cambios. ¿Algo más?' }])
    }
  }

  if (collapsed) {
    return (
      <motion.button
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        whileHover={{ scale: 1.05 }}
        onClick={() => setCollapsed(false)}
        className="fixed right-4 top-4 z-30 w-12 h-12 rounded-2xl flex items-center justify-center"
        style={{
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(255,255,255,0.08)',
          boxShadow: '0 12px 40px -10px rgba(0,0,0,0.5)',
        }}
        aria-label="Expandir chat"
      >
        <Brain className="w-5 h-5" style={{ color: '#5B9BD5' }} />
      </motion.button>
    )
  }

  return (
    <motion.aside
      initial={{ x: 60, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.5, delay: 0.15 }}
      className="fixed right-4 top-4 bottom-4 w-[360px] z-20 flex flex-col rounded-3xl overflow-hidden"
      style={{
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        background: 'rgba(19,25,41,0.55)',
        border: '1px solid rgba(255,255,255,0.08)',
        boxShadow: '0 24px 60px -20px rgba(0,0,0,0.6)',
      }}
    >
      <div className="px-4 py-3 border-b hairline flex items-center gap-3">
        <button
          onClick={() => setCollapsed(true)}
          className="w-7 h-7 rounded-md flex items-center justify-center hover:bg-white/5"
          aria-label="Colapsar"
        >
          <ChevronsRight className="w-4 h-4" style={{ color: '#94A3B8' }} />
        </button>
        <div className="w-8 h-8 rounded-md flex items-center justify-center" style={{ background: 'rgba(46,117,182,0.15)' }}>
          <Brain className="w-4 h-4" style={{ color: '#5B9BD5' }} />
        </div>
        <div className="flex-1">
          <div className="text-sm font-semibold leading-tight">Impact AI</div>
          <div className="flex items-center gap-1.5 text-[10px]" style={{ color: '#94A3B8' }}>
            <span className="pulse-dot inline-block w-1.5 h-1.5 rounded-full" style={{ background: '#10B981' }} />
            Online
          </div>
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4">
        {messages.map((m, i) => (
          <ChatBubble
            key={i} msg={m}
            onAction={handleAction}
            onProjectClick={(id) => onSelectProject(id)}
          />
        ))}
        {typing && (
          <motion.div animate={{ opacity: 1 }} className="mb-3">
            <TypingIndicator />
          </motion.div>
        )}
      </div>

      <div className="px-4 pt-2 pb-1 flex gap-1.5 flex-wrap">
        {QUICK_CHIPS.map((c) => (
          <button
            key={c}
            onClick={() => send(c)}
            className="text-[11px] px-2.5 py-1 rounded-md hover:bg-white/5 transition"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: '#94A3B8' }}
          >
            {c}
          </button>
        ))}
      </div>

      <div className="p-3 border-t hairline">
        <div className="rounded-xl px-3 py-2 flex items-end gap-2" style={{ background: '#1a2236', border: '1px solid #1F2937' }}>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() } }}
            placeholder={PLACEHOLDERS[pHolder]}
            rows={1}
            className="flex-1 bg-transparent outline-none text-sm resize-none placeholder:text-[#5e6c87] py-1.5"
            style={{ maxHeight: 120 }}
          />
          <button
            onClick={() => send()}
            disabled={!input.trim()}
            className="w-8 h-8 rounded-md flex items-center justify-center transition disabled:opacity-30"
            style={{ background: input.trim() ? '#2E75B6' : 'transparent', color: '#fff' }}
            aria-label="Enviar"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </motion.aside>
  )
}
