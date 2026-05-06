/* ============== SIDEBAR (floating icons, Arc/Linear style) ============== */
function Sidebar({ activeView, setView, extras = [] }) {
  const items = [
    { id: "graph",     icon: window.Network,  label: "Constelación" },
    { id: "dashboard", icon: LayoutDashboard, label: "Dashboard portafolio" },
    { id: "proxies",   icon: Database,        label: "Base de proxies" },
    { id: "bench",     icon: TrendingUp,      label: "Benchmarks" },
    { id: "optimize",  icon: Target,          label: "Optimización" },
    { id: "settings",  icon: Settings,        label: "Configuración" },
  ];
  return (
    <>
      {/* Logo flotante esquina sup izq */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="fixed left-4 top-4 z-30 w-12 h-12 rounded-2xl flex items-center justify-center"
        style={{
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          background: "rgba(255,255,255,0.04)",
          border: "1px solid rgba(255,255,255,0.08)",
          boxShadow: "0 12px 40px -10px rgba(0,0,0,0.5)",
        }}
      >
        <Sparkles className="w-5 h-5" style={{ color: "#5B9BD5" }} />
      </motion.div>

      {/* Icon stack centrado verticalmente */}
      <motion.nav
        initial={{ x: -30, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="fixed left-4 z-30 flex flex-col gap-2"
        style={{ top: "25%", transform: "translateY(-50%)" }}
      >
        {items.map((it) => {
          const Active = activeView === it.id;
          const Icon = it.icon;
          return (
            <motion.button
              key={it.id}
              onClick={() => setView(it.id)}
              whileHover={{ scale: 1.08, x: 2 }}
              whileTap={{ scale: 0.94 }}
              transition={{ type: "spring", stiffness: 400, damping: 18 }}
              className="group relative w-12 h-12 rounded-2xl flex items-center justify-center"
              style={{
                backdropFilter: "blur(20px)",
                WebkitBackdropFilter: "blur(20px)",
                background: Active ? "rgba(255,255,255,0.12)" : "rgba(255,255,255,0.04)",
                border: `1px solid ${Active ? "rgba(255,255,255,0.22)" : "rgba(255,255,255,0.08)"}`,
                boxShadow: Active ? "0 12px 40px -10px rgba(46,117,182,0.4)" : "0 8px 24px -10px rgba(0,0,0,0.4)",
                transition: "background 0.25s, border-color 0.25s, box-shadow 0.25s",
              }}
            >
              <Icon className="w-[18px] h-[18px]" style={{ color: Active ? "#F5F7FA" : "rgba(255,255,255,0.6)" }} />
              {Active && (
                <motion.span
                  layoutId="sidebarActiveIndicator"
                  className="absolute -left-2 top-1/2 -translate-y-1/2 w-1 h-6 rounded-full"
                  style={{ background: "#F5F7FA" }}
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              {/* Tooltip */}
              <span
                className="absolute left-[58px] whitespace-nowrap text-xs px-2.5 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-200"
                style={{
                  backdropFilter: "blur(16px)",
                  WebkitBackdropFilter: "blur(16px)",
                  background: "rgba(0,0,0,0.6)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  color: "rgba(255,255,255,0.92)",
                }}
              >
                {it.label}
              </span>
            </motion.button>
          );
        })}
        {/* divider */}
        {extras.length > 0 && (
          <div className="my-1 mx-auto w-6 h-px" style={{ background: "rgba(255,255,255,0.12)" }} />
        )}
        {extras.map((ex) => (
          <motion.button
            key={ex.id}
            onClick={ex.onClick}
            whileHover={{ scale: 1.08, x: 2 }}
            whileTap={{ scale: 0.94 }}
            transition={{ type: "spring", stiffness: 400, damping: 18 }}
            className="group relative w-12 h-12 rounded-2xl flex items-center justify-center"
            style={{
              backdropFilter: "blur(20px)",
              WebkitBackdropFilter: "blur(20px)",
              background: ex.active ? "rgba(255,255,255,0.12)" : "rgba(255,255,255,0.04)",
              border: `1px solid ${ex.active ? "rgba(255,255,255,0.22)" : "rgba(255,255,255,0.08)"}`,
              boxShadow: ex.active ? "0 12px 40px -10px rgba(46,117,182,0.4)" : "0 8px 24px -10px rgba(0,0,0,0.4)",
              transition: "background 0.25s, border-color 0.25s, box-shadow 0.25s",
            }}
          >
            <ex.icon className="w-[18px] h-[18px]" style={{ color: ex.active ? "#F5F7FA" : "rgba(255,255,255,0.6)" }} />
            <span
              className="absolute left-[58px] whitespace-nowrap text-xs px-2.5 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-200"
              style={{
                backdropFilter: "blur(16px)",
                WebkitBackdropFilter: "blur(16px)",
                background: "rgba(0,0,0,0.6)",
                border: "1px solid rgba(255,255,255,0.1)",
                color: "rgba(255,255,255,0.92)",
              }}
            >
              {ex.label}
            </span>
          </motion.button>
        ))}
      </motion.nav>

      {/* Avatar flotante esquina inf izq */}
      <motion.button
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
        whileHover={{ scale: 1.05 }}
        className="fixed left-4 bottom-4 z-30 w-12 h-12 rounded-2xl flex items-center justify-center text-sm font-semibold"
        style={{
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          background: "rgba(255,255,255,0.04)",
          border: "1px solid rgba(255,255,255,0.08)",
          color: "rgba(255,255,255,0.85)",
          boxShadow: "0 12px 40px -10px rgba(0,0,0,0.5)",
        }}
      >
        MR
      </motion.button>
    </>
  );
}

/* ============== NODE PANEL (floating right of canvas) ============== */
function MiniBar({ value, max, color, label }) {
  return (
    <div>
      <div className="flex justify-between text-[11px] mb-1" style={{ color: "#94A3B8" }}>
        <span>{label}</span><span className="mono" style={{ color: "#F5F7FA" }}>{Math.round(value * 100)}%</span>
      </div>
      <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "#1F2937" }}>
        <div className="h-full rounded-full" style={{ width: `${(value / max) * 100}%`, background: color }} />
      </div>
    </div>
  );
}

function NodePanel({ project, projects, anchor, onClose, onJumpTo, onOpenDashboard }) {
  if (!project) return null;
  const PANEL_W = 380;
  const PANEL_H_EST = 540;
  const PANEL_GAP = 32;
  const MARGIN = 16;
  const vw = typeof window !== "undefined" ? window.innerWidth : 1440;
  const vh = typeof window !== "undefined" ? window.innerHeight : 900;

  // Always pin panel to right edge of screen with margin
  let panelLeft = vw - PANEL_W - MARGIN;
  let panelTop = MARGIN + 8;
  let connectFromX = anchor ? anchor.edgeX : null;
  let connectToX = panelLeft;
  let side = "right";

  // If node is too close to right edge (would overlap panel), flip panel to left
  if (anchor && anchor.edgeX > vw - PANEL_W - PANEL_GAP - MARGIN) {
    side = "left";
    panelLeft = MARGIN;
    connectToX = panelLeft + PANEL_W;
    // connector from left edge of node
    connectFromX = anchor.x - (anchor.edgeX - anchor.x);
  }
  const arch = ARCHETYPES[project.archetype];
  const benchmark = arch.benchmark;
  const diag = project.sroi >= benchmark * 0.85 && project.sroi <= benchmark * 1.4 ? { label: "EN RANGO", color: "#10B981" }
            : project.sroi < benchmark * 0.85 ? { label: "MUY BAJO", color: "#EF4444" }
            : { label: "POR VERIFICAR", color: "#F59E0B" };
  const peers = projects.filter(p => p.archetype === project.archetype && p.id !== project.id);
  const totalGross = project.outcomes.reduce((a, o) => a + o.gross, 0);

  return (
    <>
      {anchor && (
        <svg
          className="fixed inset-0 z-30 pointer-events-none"
          style={{ width: "100vw", height: "100vh" }}
        >
          <defs>
            <linearGradient id="connGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.7" />
              <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0.15" />
            </linearGradient>
          </defs>
          <motion.path
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            d={`M ${connectFromX} ${anchor.y} L ${connectToX} ${panelTop + 60}`}
            stroke="url(#connGrad)"
            strokeWidth="1.2"
            fill="none"
            strokeDasharray="3 3"
          />
          <motion.circle
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3 }}
            cx={connectToX} cy={panelTop + 60} r="3"
            fill="#FFFFFF" opacity="0.6"
          />
        </svg>
      )}
    <motion.div
      initial={{ x: side === "right" ? 30 : -30, opacity: 0, scale: 0.96 }}
      animate={{ x: 0, opacity: 1, scale: 1 }}
      exit={{ x: side === "right" ? 40 : -40, opacity: 0, scale: 0.96 }}
      transition={{ type: "spring", stiffness: 260, damping: 28 }}
      className="fixed rounded-3xl overflow-hidden flex flex-col z-40"
      style={{
        left: `${panelLeft}px`,
        top: `${panelTop}px`,
        width: `${PANEL_W}px`,
        maxHeight: "calc(100vh - 48px)",
        backdropFilter: "blur(24px)",
        WebkitBackdropFilter: "blur(24px)",
        background: "rgba(19,25,41,0.55)",
        border: "1px solid rgba(255,255,255,0.08)",
        boxShadow: "0 24px 60px -20px rgba(0,0,0,0.6)",
      }}
    >
      <div className="p-5 border-b hairline">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-[10px] mono px-2 py-1 rounded" style={{ background: arch.color + "33", color: arch.color, border: `1px solid ${arch.color}55` }}>
              {project.id} · ARQ {project.archetype}
            </span>
            <span className="text-[10px] mono px-2 py-1 rounded" style={{ background: sroiColor(project.sroi) + "22", color: sroiColor(project.sroi), border: `1px solid ${sroiColor(project.sroi)}55` }}>
              {project.category}
            </span>
          </div>
          <button onClick={onClose} className="w-7 h-7 rounded-md flex items-center justify-center hover:bg-white/5 focus-ring" aria-label="Cerrar">
            <X className="w-4 h-4" style={{ color: "#94A3B8" }} />
          </button>
        </div>
        <h2 className="text-lg font-semibold leading-tight pr-2">{project.name}</h2>
        <div className="text-xs mt-1.5" style={{ color: "#94A3B8" }}>
          {fmtMXNFull(project.investment)} · SROI <span className="mono" style={{ color: sroiColor(project.sroi) }}>{project.sroi.toFixed(2)}x</span> · {arch.name}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-5 space-y-5">
        {/* KPI strip */}
        <div className="grid grid-cols-3 gap-2">
          {[
            { label: "Valor bruto",    val: fmtMXN(project.vBruto) },
            { label: "Valor ajustado", val: fmtMXN(project.vAjustado) },
            { label: "Beneficiarios",  val: project.direct_beneficiaries.toLocaleString("es-MX") },
          ].map((k) => (
            <div key={k.label} className="rounded-lg p-3" style={{ background: "#1a2236", border: "1px solid #1F2937" }}>
              <div className="text-[10px] uppercase tracking-wider" style={{ color: "#94A3B8" }}>{k.label}</div>
              <div className="text-base font-semibold mt-1 mono">{k.val}</div>
            </div>
          ))}
        </div>

        {/* Outcomes */}
        <div>
          <div className="text-xs font-semibold mb-2 tracking-wide" style={{ color: "#94A3B8" }}>OUTCOMES</div>
          <div className="space-y-2">
            {project.outcomes.map((o, i) => (
              <div key={i} className="rounded-lg p-3" style={{ background: "#1a2236", border: "1px solid #1F2937" }}>
                <div className="text-sm">{o.description}</div>
                <div className="text-[11px] mono mt-1" style={{ color: "#94A3B8" }}>
                  {o.qty.toLocaleString("es-MX")} × {fmtMXN(o.proxy)} = {fmtMXN(o.gross)}
                </div>
                <div className="h-1 rounded-full mt-2 overflow-hidden" style={{ background: "#0A0E1A" }}>
                  <div className="h-full" style={{ width: `${(o.gross / totalGross) * 100}%`, background: "linear-gradient(90deg,#2E75B6,#5B9BD5)" }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Adjustments */}
        <div>
          <div className="text-xs font-semibold mb-3 tracking-wide" style={{ color: "#94A3B8" }}>AJUSTES SROI</div>
          <div className="space-y-3">
            <MiniBar label="Deadweight"    value={project.adjustments.dw} max={1} color="#EF4444" />
            <MiniBar label="Attribution"   value={project.adjustments.at} max={1} color="#F59E0B" />
            <MiniBar label="Displacement"  value={project.adjustments.dp} max={1} color="#5B9BD5" />
            <MiniBar label="Drop-off"      value={project.adjustments.dr} max={1} color="#ED7D31" />
          </div>
        </div>

        {/* Benchmark */}
        <div className="rounded-lg p-4" style={{ background: "#1a2236", border: "1px solid #1F2937" }}>
          <div className="flex justify-between items-start mb-2">
            <div>
              <div className="text-[10px] uppercase tracking-wider" style={{ color: "#94A3B8" }}>Benchmark sectorial</div>
              <div className="text-sm font-semibold mono mt-0.5">{benchmark.toFixed(2)}x · Arquetipo {project.archetype}</div>
            </div>
            <span className="text-[10px] mono px-2 py-1 rounded" style={{ background: diag.color + "22", color: diag.color, border: `1px solid ${diag.color}55` }}>
              {diag.label}
            </span>
          </div>
          {/* gauge bar */}
          <div className="relative h-1.5 rounded-full mt-3" style={{ background: "#0A0E1A" }}>
            <div className="absolute top-0 h-full rounded-full" style={{ left: 0, width: `${Math.min(100, (project.sroi / 4) * 100)}%`, background: sroiColor(project.sroi) }} />
            <div className="absolute -top-1 w-px h-3.5" style={{ left: `${(benchmark / 4) * 100}%`, background: "#F5F7FA" }} />
          </div>
          <div className="flex justify-between text-[10px] mono mt-1" style={{ color: "#94A3B8" }}>
            <span>0x</span><span>2x</span><span>4x</span>
          </div>
        </div>

        {/* Stakeholders */}
        <div>
          <div className="text-xs font-semibold mb-2 tracking-wide" style={{ color: "#94A3B8" }}>STAKEHOLDERS</div>
          <div className="flex flex-wrap gap-1.5">
            {project.stakeholders.map((s) => (
              <span key={s} className="text-[11px] px-2 py-1 rounded-md" style={{ background: "#1a2236", border: "1px solid #1F2937", color: "#F5F7FA" }}>
                {s}
              </span>
            ))}
          </div>
        </div>

        {/* Connections */}
        {peers.length > 0 && (
          <div>
            <div className="text-xs font-semibold mb-2 tracking-wide" style={{ color: "#94A3B8" }}>CONEXIONES (mismo arquetipo)</div>
            <div className="space-y-1">
              {peers.map((p) => (
                <button
                  key={p.id}
                  onClick={() => onJumpTo(p.id)}
                  className="w-full flex items-center justify-between p-2 rounded-md hover:bg-white/5 transition focus-ring text-left"
                >
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full" style={{ background: sroiColor(p.sroi) }} />
                    <span className="text-xs">{p.id} · {p.name.length > 24 ? p.name.slice(0, 23) + "…" : p.name}</span>
                  </div>
                  <span className="text-[10px] mono" style={{ color: sroiColor(p.sroi) }}>{p.sroi.toFixed(2)}x</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="p-3 border-t hairline">
        <button
          onClick={onOpenDashboard}
          className="w-full py-2.5 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition focus-ring"
          style={{ background: "#2E75B6", color: "#fff" }}
        >
          Ver dashboard completo
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
    </>
  );
}

/* ============== CHAT PANEL ============== */
const PLACEHOLDERS = [
  "Pregúntame sobre tu portafolio…",
  "Compara dos proyectos…",
  "¿Cuál proyecto debería escalar?",
  "Modifica el deadweight de P03…",
];

const QUICK_CHIPS = ["Top 3 SROI", "Optimización", "Comparar arquetipos", "Riesgos"];

function TypingIndicator() {
  return (
    <div className="flex gap-1 items-center px-3 py-2 rounded-2xl rounded-bl-sm" style={{ background: "#1F2937", width: "fit-content" }}>
      <span className="typing-dot" /><span className="typing-dot" /><span className="typing-dot" />
    </div>
  );
}

function MiniTable({ rows, headers }) {
  return (
    <div className="mt-2 rounded-md overflow-hidden border" style={{ borderColor: "#1F2937" }}>
      <table className="w-full text-[11px]">
        <thead>
          <tr style={{ background: "rgba(46,117,182,0.12)" }}>
            {headers.map((h) => <th key={h} className="text-left px-2 py-1.5 font-medium" style={{ color: "#94A3B8" }}>{h}</th>)}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} style={{ borderTop: i ? "1px solid #1F2937" : "none" }}>
              {r.map((c, j) => <td key={j} className="px-2 py-1.5 mono" style={c.color ? { color: c.color } : {}}>{typeof c === "object" ? c.text : c}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ChatBubble({ msg, onAction, onProjectClick }) {
  const isUser = msg.role === "user";
  return (
    <motion.div
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className={`flex ${isUser ? "justify-end" : "justify-start"} mb-3`}
    >
      <div
        className={`max-w-[88%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${isUser ? "rounded-br-sm" : "rounded-bl-sm"}`}
        style={isUser
          ? { background: "linear-gradient(135deg,#2E75B6,#1f5285)", color: "#fff" }
          : { background: "#1F2937", color: "#F5F7FA" }
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
                className="text-[11px] px-2.5 py-1.5 rounded-md transition focus-ring"
                style={a.primary
                  ? { background: "#2E75B6", color: "#fff" }
                  : { background: "rgba(255,255,255,0.06)", color: "#F5F7FA", border: "1px solid rgba(255,255,255,0.08)" }
                }
              >
                {a.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}

// Replace tokens like [P10] with clickable spans
function renderRichText(text, onProjectClick) {
  const parts = text.split(/(\bP\d{2}\b)/g);
  return parts.map((p, i) => {
    if (/^P\d{2}$/.test(p)) {
      return (
        <span key={i} className="chip-link mono" onClick={() => onProjectClick(p)}>
          {p}
        </span>
      );
    }
    return <span key={i}>{p}</span>;
  });
}

function ChatPanel({
  collapsed, setCollapsed, projects, selectedId, onSelectProject,
  applyAdjustment, applyOptimization,
}) {
  const [messages, setMessages] = useState(() => [
    {
      role: "bot",
      content: "Hola, soy tu asistente de portafolio. Pregúntame cualquier cosa sobre tus 15 proyectos. Puedo:\n\n  • Comparar proyectos\n  • Sugerir optimizaciones\n  • Modificar parámetros del modelo\n\nPrueba: \"¿Cuál es mi proyecto de mayor SROI?\"",
    },
  ]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [pHolder, setPHolder] = useState(0);
  const scrollRef = useRef(null);
  const lastSelectedRef = useRef(null);

  // rotate placeholder
  useEffect(() => {
    const t = setInterval(() => setPHolder((p) => (p + 1) % PLACEHOLDERS.length), 4000);
    return () => clearInterval(t);
  }, []);

  // autoscroll
  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, typing]);

  // context awareness when user selects a node
  useEffect(() => {
    if (selectedId && selectedId !== lastSelectedRef.current) {
      lastSelectedRef.current = selectedId;
      const p = projects.find((x) => x.id === selectedId);
      if (p) {
        setMessages((m) => [...m, {
          role: "bot",
          content: `Veo que estás en ${p.id} ${p.name}. ¿Qué quieres saber sobre este proyecto?`,
          actions: [
            { label: "Resumen ejecutivo", payload: { kind: "summary", id: p.id } },
            { label: "Comparar con peers", payload: { kind: "peers", id: p.id } },
          ],
        }]);
      }
    }
  }, [selectedId]);

  const respond = (userText) => {
    setTyping(true);
    const delay = 800 + Math.random() * 700;
    setTimeout(() => {
      const reply = simulate(userText, projects, selectedId);
      setMessages((m) => [...m, ...reply]);
      setTyping(false);
    }, delay);
  };

  const send = (text) => {
    const t = (text ?? input).trim();
    if (!t) return;
    setMessages((m) => [...m, { role: "user", content: t }]);
    setInput("");
    respond(t);
  };

  const handleAction = (a) => {
    const p = a.payload || {};
    if (p.kind === "open" && p.id) onSelectProject(p.id);
    if (p.kind === "summary" && p.id) {
      const proj = projects.find(x => x.id === p.id);
      if (proj) {
        setTyping(true);
        setTimeout(() => {
          setMessages((m) => [...m, {
            role: "bot",
            content: `${proj.id} ${proj.name} tiene SROI ${proj.sroi.toFixed(2)}x con inversión ${fmtMXNFull(proj.investment)}. Genera ${fmtMXNFull(proj.vAjustado)} de valor social ajustado a ${proj.direct_beneficiaries.toLocaleString("es-MX")} beneficiarios directos. Categoría: ${proj.category}.`,
          }]);
          setTyping(false);
        }, 700);
      }
    }
    if (p.kind === "applyAdj") {
      applyAdjustment(p.id, p.adj);
      setMessages((m) => [...m, {
        role: "bot",
        content: `✓ Aplicado. Recalculando ${p.id}…`,
      }]);
      setTimeout(() => {
        const updated = recomputeProject(projects.find(x => x.id === p.id), p.adj);
        const newProjects = projects.map(x => x.id === p.id ? updated : x);
        const tot = portfolioTotals(newProjects);
        setMessages((m) => [...m, {
          role: "bot",
          content: `${p.id} ahora tiene SROI ${updated.sroi.toFixed(2)}x (categoría ${updated.category}). SROI portafolio: ${tot.sroi.toFixed(2)}x.`,
        }]);
      }, 600);
    }
    if (p.kind === "applyOpt") {
      applyOptimization();
      setMessages((m) => [...m, {
        role: "bot",
        content: "✓ Recomendaciones aplicadas. La constelación se está reorganizando.",
      }]);
    }
    if (p.kind === "cancel") {
      setMessages((m) => [...m, { role: "bot", content: "Sin cambios. ¿Algo más?" }]);
    }
  };

  if (collapsed) {
    return (
      <motion.button
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        whileHover={{ scale: 1.05 }}
        onClick={() => setCollapsed(false)}
        className="fixed right-4 top-4 z-30 w-12 h-12 rounded-2xl flex items-center justify-center"
        style={{
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          background: "rgba(255,255,255,0.04)",
          border: "1px solid rgba(255,255,255,0.08)",
          boxShadow: "0 12px 40px -10px rgba(0,0,0,0.5)",
        }}
        aria-label="Expandir chat"
      >
        <Brain className="w-5 h-5" style={{ color: "#5B9BD5" }} />
      </motion.button>
    );
  }

  return (
    <motion.aside
      initial={{ x: 60, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.5, delay: 0.15 }}
      className="fixed right-4 top-4 bottom-4 w-[360px] z-20 flex flex-col rounded-3xl overflow-hidden"
      style={{
        backdropFilter: "blur(24px)",
        WebkitBackdropFilter: "blur(24px)",
        background: "rgba(19,25,41,0.55)",
        border: "1px solid rgba(255,255,255,0.08)",
        boxShadow: "0 24px 60px -20px rgba(0,0,0,0.6)",
      }}
    >
      <div className="px-4 py-3 border-b hairline flex items-center gap-3">
        <button onClick={() => setCollapsed(true)} className="w-7 h-7 rounded-md flex items-center justify-center hover:bg-white/5 focus-ring" aria-label="Colapsar">
          <ChevronsRight className="w-4 h-4" style={{ color: "#94A3B8" }} />
        </button>
        <div className="w-8 h-8 rounded-md flex items-center justify-center" style={{ background: "rgba(46,117,182,0.15)" }}>
          <Brain className="w-4 h-4" style={{ color: "#5B9BD5" }} />
        </div>
        <div className="flex-1">
          <div className="text-sm font-semibold leading-tight">Impact AI</div>
          <div className="flex items-center gap-1.5 text-[10px]" style={{ color: "#94A3B8" }}>
            <span className="pulse-dot inline-block w-1.5 h-1.5 rounded-full" style={{ background: "#10B981" }} />
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

      {/* quick chips */}
      <div className="px-4 pt-2 pb-1 flex gap-1.5 flex-wrap">
        {QUICK_CHIPS.map((c) => (
          <button
            key={c}
            onClick={() => send(c)}
            className="text-[11px] px-2.5 py-1 rounded-md hover:bg-white/5 transition"
            style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", color: "#94A3B8" }}
          >
            {c}
          </button>
        ))}
      </div>

      {/* input */}
      <div className="p-3 border-t hairline">
        <div className="rounded-xl px-3 py-2 flex items-end gap-2" style={{ background: "#1a2236", border: "1px solid #1F2937" }}>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
            placeholder={PLACEHOLDERS[pHolder]}
            rows={1}
            className="flex-1 bg-transparent outline-none text-sm resize-none placeholder:text-[#5e6c87] py-1.5"
            style={{ maxHeight: 120 }}
          />
          <button
            onClick={() => send()}
            disabled={!input.trim()}
            className="w-8 h-8 rounded-md flex items-center justify-center transition focus-ring disabled:opacity-30"
            style={{ background: input.trim() ? "#2E75B6" : "transparent", color: "#fff" }}
            aria-label="Enviar"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </motion.aside>
  );
}

/* ============== AI SIMULATION ============== */
function simulate(text, projects, selectedId) {
  const t = text.toLowerCase();
  const tot = portfolioTotals(projects);
  const sorted = [...projects].sort((a, b) => b.sroi - a.sroi);
  const top = sorted[0], worst = sorted[sorted.length - 1];

  // top SROI
  if (/(mayor|top|mejor|alto)\s*(sroi|proyecto|rendimiento)?|top 3 sroi/.test(t) && !t.includes("compara")) {
    const top3 = sorted.slice(0, 3);
    return [{
      role: "bot",
      content: `Tu top de SROI lo lidera ${top.id} ${top.name} con SROI ${top.sroi.toFixed(2)}x. Genera ${fmtMXNFull(top.vAjustado)} de valor social ajustado contra ${fmtMXNFull(top.investment)} de inversión.`,
      table: {
        headers: ["#", "ID", "SROI", "Inversión"],
        rows: top3.map((p, i) => [(i + 1).toString(), p.id, { text: p.sroi.toFixed(2) + "x", color: sroiColor(p.sroi) }, fmtMXN(p.investment)]),
      },
      actions: [{ label: `Abrir ${top.id}`, primary: true, payload: { kind: "open", id: top.id } }],
    }];
  }

  // worst
  if (/(menor|peor|bajo)\s*(sroi|proyecto)?|riesgo|riesgos/.test(t) && !t.includes("compara")) {
    if (/riesgo/.test(t)) {
      const concentration = top.investment / tot.inv;
      return [{
        role: "bot",
        content: `Identifico 3 riesgos en tu portafolio:\n\n  1. Concentración en ${top.id}: representa el ${(concentration * 100).toFixed(0)}% de la inversión total. Una falla operativa aquí te baja el SROI portafolio en ${(top.sroi * concentration).toFixed(2)}x.\n  2. Fragmentación en reforestación: 4 proyectos del arquetipo D suman ${fmtMXNFull(projects.filter(p => p.archetype === "D").reduce((a, p) => a + p.investment, 0))} con SROI promedio bajo. Convendría consolidar.\n  3. Eventos comunitarios (arquetipo B) con SROI <0.25x — el formato actual no genera valor medible.`,
      }];
    }
    return [{
      role: "bot",
      content: `${worst.id} ${worst.name} es el de menor SROI: ${worst.sroi.toFixed(2)}x. Esto sugiere revisar el modelo de outcomes o considerar redirigir la inversión.`,
      actions: [{ label: `Abrir ${worst.id}`, primary: true, payload: { kind: "open", id: worst.id } }],
    }];
  }

  // compare X y Y
  const compareMatch = t.match(/compara\s+(p\d{2}).{0,5}?(p\d{2})/i) || t.match(/(p\d{2}).{0,5}?vs.{0,5}?(p\d{2})/i);
  if (compareMatch) {
    const a = projects.find(p => p.id === compareMatch[1].toUpperCase());
    const b = projects.find(p => p.id === compareMatch[2].toUpperCase());
    if (a && b) {
      return [{
        role: "bot",
        content: `Comparativo ${a.id} vs ${b.id}:`,
        table: {
          headers: ["Métrica", a.id, b.id],
          rows: [
            ["SROI", { text: a.sroi.toFixed(2) + "x", color: sroiColor(a.sroi) }, { text: b.sroi.toFixed(2) + "x", color: sroiColor(b.sroi) }],
            ["Inversión", fmtMXN(a.investment), fmtMXN(b.investment)],
            ["Valor ajust.", fmtMXN(a.vAjustado), fmtMXN(b.vAjustado)],
            ["Beneficiarios", a.direct_beneficiaries.toLocaleString("es-MX"), b.direct_beneficiaries.toLocaleString("es-MX")],
            ["Arquetipo", a.archetype, b.archetype],
          ],
        },
        actions: [
          { label: `Abrir ${a.id}`, payload: { kind: "open", id: a.id } },
          { label: `Abrir ${b.id}`, primary: true, payload: { kind: "open", id: b.id } },
        ],
      }];
    }
  }

  // count low
  if (/(cuántos|cuantos).+(bajo|rojo)/.test(t)) {
    const low = projects.filter(p => p.category === "BAJO");
    return [{
      role: "bot",
      content: `${low.length} de los ${projects.length} proyectos están en categoría BAJO (SROI <1x). Es esperable: eventos comunitarios y educación de cohorte amplia tienden a tener SROI bajo medible. ¿Quieres ver cuáles son y qué los une?`,
      actions: [{ label: "Ver lista", payload: { kind: "open", id: low[0].id } }],
    }];
  }

  // optimization
  if (/optimi|recomenda|cómo optimizo|como optimizo/.test(t)) {
    return [{
      role: "bot",
      content: `5 acciones para subir tu SROI portafolio de ${tot.sroi.toFixed(2)}x a ~1.45x:\n\n  1. Aliarse con operador especializado para ${top.id} (reduce deadweight 10%→5%).\n  2. Consolidar reforestación: fusionar P12+P14 con P11.\n  3. Migrar P15 a un canal con menor displacement.\n  4. Discontinuar P08 — SROI 0.01x sin tracción.\n  5. Reasignar 30% del presupuesto de eventos comunitarios a P10.\n\n¿Quieres que aplique estas recomendaciones al modelo?`,
      actions: [
        { label: "Aplicar todo", primary: true, payload: { kind: "applyOpt" } },
        { label: "Cancelar", payload: { kind: "cancel" } },
      ],
    }];
  }

  // archetypes compare
  if (/comparar arquetipos|arquetipo/.test(t)) {
    const byArch = {};
    projects.forEach(p => {
      const a = byArch[p.archetype] = byArch[p.archetype] || { inv: 0, adj: 0, n: 0 };
      a.inv += p.investment; a.adj += p.vAjustado; a.n += 1;
    });
    return [{
      role: "bot",
      content: "Comparativo por arquetipo:",
      table: {
        headers: ["Arq", "Nombre", "n", "SROI prom."],
        rows: Object.entries(byArch).map(([k, v]) => {
          const sroi = v.adj / v.inv;
          return [k, ARCHETYPES[k].name.length > 18 ? ARCHETYPES[k].name.slice(0, 17) + "…" : ARCHETYPES[k].name, v.n.toString(), { text: sroi.toFixed(2) + "x", color: sroiColor(sroi) }];
        }),
      },
    }];
  }

  // modify deadweight P03 to 40%
  const modMatch = t.match(/(deadweight|attribution|displacement|drop.?off|dropoff)\s+(?:de\s+)?(p\d{2})\s+(?:a\s+)?(\d{1,3})\s*%?/i)
                 || t.match(/(p\d{2})\s+(deadweight|attribution|displacement|drop.?off|dropoff)\s+(?:a\s+)?(\d{1,3})/i)
                 || t.match(/sube.+(deadweight|attribution|displacement|drop.?off|dropoff).+(p\d{2}).+(\d{1,3})/i);
  if (modMatch) {
    let key, id, pct;
    if (/p\d{2}/i.test(modMatch[1])) { id = modMatch[1].toUpperCase(); key = modMatch[2]; pct = modMatch[3]; }
    else { key = modMatch[1]; id = modMatch[2].toUpperCase(); pct = modMatch[3]; }
    const map = { deadweight: "dw", attribution: "at", displacement: "dp", "drop-off": "dr", dropoff: "dr", "dropoff": "dr", "drop off": "dr" };
    const k = map[key.toLowerCase().replace(/-/g, "")] || map[key.toLowerCase()];
    const proj = projects.find(p => p.id === id);
    if (proj && k) {
      const newAdj = { [k]: Math.min(0.95, parseInt(pct) / 100) };
      const after = recomputeProject(proj, newAdj);
      return [{
        role: "bot",
        content: `Aplicando ${key}=${pct}% al proyecto ${id} ${proj.name}. Esto cambiaría su SROI de ${proj.sroi.toFixed(2)}x a aproximadamente ${after.sroi.toFixed(2)}x. ¿Confirmas?`,
        actions: [
          { label: "Confirmar", primary: true, payload: { kind: "applyAdj", id, adj: newAdj } },
          { label: "Cancelar", payload: { kind: "cancel" } },
        ],
      }];
    }
  }

  // explain concept
  if (/qu[eé] es deadweight|expl[íi]came (deadweight|attribution|displacement|drop)/.test(t)) {
    return [{
      role: "bot",
      content: `**Deadweight** mide qué tanto del outcome habría ocurrido sin tu intervención. Si plantas 100 árboles pero el municipio iba a plantar 30 de todos modos, tu deadweight es 30%. Se descuenta del valor bruto. En ${top.id}, asumimos deadweight de 10% porque las comunidades no tenían acceso eléctrico previo.`,
    }];
  }

  // fallback
  return [{
    role: "bot",
    content: "Aún no sé responder eso, pero puedo ayudarte con: comparar proyectos, sugerir optimizaciones, modificar parámetros, o explicar conceptos del modelo. ¿Por dónde quieres empezar?",
  }];
}

/* ============== BOTTOM CONTROLS ============== */
function BottomControls({ projects, open, setOpen, showConnections, setShowConnections, groupBy, setGroupBy, onResetCamera }) {
  const tot = portfolioTotals(projects);
  if (!open) return null;
  return (
    <motion.div
      initial={{ y: 20, opacity: 0, scale: 0.96 }}
      animate={{ y: 0, opacity: 1, scale: 1 }}
      exit={{ y: 20, opacity: 0, scale: 0.96 }}
      transition={{ type: "spring", stiffness: 320, damping: 26 }}
      className="fixed bottom-5 left-1/2 -translate-x-1/2 rounded-2xl p-1.5 flex items-center gap-1 z-30"
      style={{
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        background: "rgba(255,255,255,0.04)",
        border: "1px solid rgba(255,255,255,0.08)",
        boxShadow: "0 16px 48px -12px rgba(0,0,0,0.6)",
      }}
    >
      <div className="flex items-center gap-2 px-4 py-2 text-[11px] mono" style={{ color: "rgba(255,255,255,0.7)" }}>
        <span style={{ color: "#F5F7FA" }}>{tot.count}</span>
        <span>nodos</span>
        <span style={{ color: "rgba(255,255,255,0.2)" }}>·</span>
        <span style={{ color: "#F5F7FA" }}>{fmtMXN(tot.inv)}</span>
        <span style={{ color: "rgba(255,255,255,0.2)" }}>·</span>
        <span>SROI</span>
        <span className="mono" style={{ color: sroiColor(tot.sroi) }}>{tot.sroi.toFixed(2)}x</span>
      </div>

      <div className="w-px h-6" style={{ background: "rgba(255,255,255,0.1)" }} />

      <div className="flex items-center gap-1 p-1">
        <span className="text-[10px] uppercase tracking-wider px-2" style={{ color: "rgba(255,255,255,0.4)" }}>Agrupar</span>
        {["arquetipo", "sroi", "inversión"].map((g) => (
          <button
            key={g}
            onClick={() => setGroupBy(g)}
            className="text-[11px] px-3 py-1.5 rounded-lg transition-all duration-200"
            style={{
              background: groupBy === g ? "rgba(255,255,255,0.1)" : "transparent",
              color: groupBy === g ? "#F5F7FA" : "rgba(255,255,255,0.5)",
            }}
          >
            {g}
          </button>
        ))}
      </div>

      <div className="w-px h-6" style={{ background: "rgba(255,255,255,0.1)" }} />

      <div className="flex items-center gap-1">
        <button
          onClick={() => setShowConnections(!showConnections)}
          className="text-[11px] px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all duration-200"
          style={{
            background: showConnections ? "rgba(255,255,255,0.08)" : "transparent",
            color: showConnections ? "#F5F7FA" : "rgba(255,255,255,0.7)",
          }}
        >
          {showConnections ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
          Conexiones
        </button>

        <button
          onClick={onResetCamera}
          className="text-[11px] px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all duration-200 hover:bg-white/5"
          style={{ color: "rgba(255,255,255,0.7)" }}
        >
          <RotateCcw className="w-3 h-3" />
          Reset
        </button>

        <button
          onClick={() => setOpen(false)}
          className="text-[11px] px-2 py-1.5 rounded-lg flex items-center justify-center transition-all duration-200 hover:bg-white/5"
          style={{ color: "rgba(255,255,255,0.5)" }}
          aria-label="Cerrar"
        >
          <X className="w-3 h-3" />
        </button>
      </div>
    </motion.div>
  );
}

/* ============== ARCHETYPE LEGEND POPOVER ============== */
function ArchetypeLegend({ open, onClose }) {
  if (!open) return null;
  return (
    <motion.div
      initial={{ x: -20, opacity: 0, scale: 0.96 }}
      animate={{ x: 0, opacity: 1, scale: 1 }}
      exit={{ x: -20, opacity: 0, scale: 0.96 }}
      transition={{ type: "spring", stiffness: 320, damping: 26 }}
      className="fixed z-30 rounded-2xl px-5 py-4 w-[260px]"
      style={{
        left: "76px",
        top: "50%",
        transform: "translateY(-50%)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        background: "rgba(255,255,255,0.04)",
        border: "1px solid rgba(255,255,255,0.08)",
        boxShadow: "0 16px 48px -12px rgba(0,0,0,0.6)",
      }}
    >
      <div className="flex items-center justify-between mb-2.5">
        <div className="text-[9px] mono uppercase tracking-[0.2em]" style={{ color: "rgba(255,255,255,0.4)" }}>Arquetipos</div>
        <button onClick={onClose} className="w-5 h-5 rounded flex items-center justify-center hover:bg-white/5" aria-label="Cerrar">
          <X className="w-3 h-3" style={{ color: "rgba(255,255,255,0.5)" }} />
        </button>
      </div>
      <div className="space-y-1.5">
        {Object.entries(ARCHETYPES).map(([k, v]) => (
          <div key={k} className="flex items-center gap-2 text-[11px]">
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: v.color }} />
            <span className="mono" style={{ color: "rgba(255,255,255,0.5)" }}>{k}</span>
            <span style={{ color: "rgba(255,255,255,0.92)" }}>{v.name}</span>
            <span className="ml-auto mono text-[10px]" style={{ color: "rgba(255,255,255,0.35)" }}>{v.count}</span>
          </div>
        ))}
      </div>
      <div className="mt-3 pt-2.5" style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}>
        <div className="text-[9px] mono uppercase tracking-[0.2em] mb-1.5" style={{ color: "rgba(255,255,255,0.4)" }}>SROI</div>
        <div className="flex items-center gap-3 text-[10px] mono" style={{ color: "rgba(255,255,255,0.7)" }}>
          <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full" style={{background:"#10B981"}} />&gt; 2x</span>
          <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full" style={{background:"#F59E0B"}} />1–2x</span>
          <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full" style={{background:"#EF4444"}} />&lt; 1x</span>
        </div>
      </div>
    </motion.div>
  );
}

/* ============== BACK CHIP (when node selected) ============== */
function BackChip({ onClick }) {
  return (
    <motion.button
      initial={{ y: -10, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: -10, opacity: 0 }}
      transition={{ type: "spring", stiffness: 220, damping: 24 }}
      onClick={onClick}
      className="fixed top-4 left-1/2 -translate-x-1/2 rounded-2xl px-4 py-2 text-xs flex items-center gap-2 z-30"
      style={{
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        background: "rgba(255,255,255,0.04)",
        border: "1px solid rgba(255,255,255,0.08)",
        boxShadow: "0 12px 40px -10px rgba(0,0,0,0.5)",
        color: "rgba(255,255,255,0.85)",
      }}
    >
      <ArrowLeft className="w-3.5 h-3.5" />
      Volver al portafolio
    </motion.button>
  );
}
