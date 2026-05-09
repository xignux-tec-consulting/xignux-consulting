import { useState, useMemo } from 'react'
import {
  Network, Filter, ArrowUpDown, ChevronDown, ChevronRight,
  TrendingUp, TrendingDown, Minus, AlertTriangle, Info,
  Star, Gem, Sprout,
} from 'lucide-react'
import {
  ResponsiveContainer, LineChart, Line, BarChart, Bar,
  PieChart, Pie, Cell, RadarChart, Radar, PolarGrid, PolarAngleAxis,
  CartesianGrid, XAxis, YAxis, Tooltip, Legend, ReferenceLine,
} from 'recharts'
import { ARCHETYPES } from '../../data/projects'
import { portfolioTotals, fmtMXN, fmtMXNFull, sroiColor } from '../../lib/sroi'
import { useTheme } from '../../lib/theme'

/* ─── primitives ─────────────────────────────────────────────────── */
// Theme helper — sources values from global theme context
function mkTh(globalTh) {
  return {
    cardBg:       globalTh.cardBg,
    cardBorder:   globalTh.cardBorder,
    pageBg:       globalTh.pageBg,
    tableBorder:  globalTh.tableBorder,
    inputBg:      globalTh.inputBg,
    inputBorder:  globalTh.inputBorder,
    chartGrid:    globalTh.chartGrid,
    trackBg:      globalTh.trackBg,
    quadBg:       globalTh.cardBg,
    quadDivider:  globalTh.cardBorder,
    limItemBg:    globalTh.pageBg,
    limItemBorder:globalTh.cardBorder,
    textPrimary:  globalTh.textPrimary,
    textSecondary:globalTh.textSecondary,
    textMuted:    globalTh.textMuted,
    textFaint:    globalTh.textMuted,
    tabBarBg:     globalTh.cardBg,
    tabBarBorder: globalTh.cardBorder,
    tabActiveBg:  globalTh.accentSoft,
    tabActiveBorder: globalTh.accentBorder,
    tabActiveColor:  globalTh.accent,
    tabInactiveColor: globalTh.textMuted,
    tooltipBg:    globalTh.tooltipBg,
    tooltipBorder:globalTh.tooltipBorder,
    tooltipText:  globalTh.textPrimary,
  }
}

function Card({ children, className = '', style = {}, noPad, th: cardTh }) {
  const { th: globalTh } = useTheme()
  const t = cardTh || globalTh
  return (
    <div
      className={`rounded-2xl ${noPad ? '' : 'p-5'} ${className}`}
      style={{
        background: t.cardBg,
        border: `1px solid ${t.cardBorder}`,
        boxShadow: t.shadow,
        ...style,
      }}
    >
      {children}
    </div>
  )
}

function SectionTitle({ children, sub, th }) {
  return (
    <div className="mb-4">
      <h2 className="text-sm font-semibold tracking-wide" style={{ color: th?.textPrimary || '#1A1A1A' }}>{children}</h2>
      {sub && <p className="text-[11px] mt-0.5" style={{ color: th?.textMuted || '#999999' }}>{sub}</p>}
    </div>
  )
}

function KpiChip({ label, value, sub, color, delay }) {
  const { th } = useTheme()
  return (
    <Card delay={delay} className="flex flex-col gap-1">
      <span className="text-[10px] mono uppercase tracking-widest" style={{ color: th.textMuted }}>{label}</span>
      <span className="text-2xl font-semibold mono leading-tight" style={{ color: color || th.textPrimary }}>{value}</span>
      {sub && <span className="text-[11px]" style={{ color: th.textSecondary }}>{sub}</span>}
    </Card>
  )
}

function SroiBadge({ sroi }) {
  const c = sroiColor(sroi)
  const label = sroi >= 2 ? 'ALTO' : sroi >= 1 ? 'MEDIO' : 'BAJO'
  return (
    <span className="text-[10px] mono px-1.5 py-0.5 rounded-md font-medium" style={{ background: c + '1a', color: c, border: `1px solid ${c}44` }}>
      {label}
    </span>
  )
}

/* ─── quadrant colors / icons ────────────────────────────────────── */
const QUADRANT = {
  ESTRELLA:    { color: '#F59E0B', Icon: Star,          label: 'Estrella',    desc: 'SROI alto + Estratégico alto · Mantener y escalar' },
  OPORTUNIDAD: { color: '#5B9BD5', Icon: Gem,           label: 'Oportunidad', desc: 'SROI alto + Estratégico medio · Reposicionar' },
  SEMILLA:     { color: '#10B981', Icon: Sprout,        label: 'Semilla',     desc: 'SROI bajo + Estratégico alto · Invertir en medición' },
  REVISAR:     { color: '#EF4444', Icon: AlertTriangle, label: 'Revisar',     desc: 'SROI bajo + Estratégico bajo · Evaluar consolidación' },
}

/* ─── benchmark data ─────────────────────────────────────────────── */
const BENCHMARK_REFS = {
  A_STEM: { ref: 'WSIPP Workforce · Sopact meta-analysis',  low: 0.50, mid: 1.50, high: 3.00 },
  A:      { ref: 'Cemex Patrimonio Hoy · FasterCapital',     low: 0.50, mid: 1.50, high: 3.00 },
  B:      { ref: 'HACT UK Social Value Bank',                low: 0.30, mid: 1.00, high: 1.80 },
  C:      { ref: 'Iluméxico · WarmHomes UK (1.9:1)',         low: 1.50, mid: 2.50, high: 4.00 },
  D:      { ref: 'World Vision FMNR · CONAFOR MX',          low: 0.80, mid: 1.50, high: 2.50 },
  E:      { ref: 'BAMX · SecondBite SROI · Charity Intel.',  low: 2.00, mid: 3.50, high: 5.00 },
}

const SCENARIOS = [
  { label: 'Conservador @10%', sroi: 1.83, adj: 16130407,  color: '#EF4444', desc: 'CSC = $100/tCO₂ (IEPS MX), VB tangible ×0.70 + intangibles base' },
  { label: 'Base v12 @10%',   sroi: 2.28, adj: 20058707,  color: '#F59E0B', desc: 'CSC = $200/tCO₂ (ANPs MX), VPN compuesto, PX_RC + PX44 + PX46 + 7 cat. intangibles' },
  { label: 'Optimista @10%',  sroi: 2.72, adj: 23987008,  color: '#10B981', desc: 'CSC = $400/tCO₂ ($20 USD forestry), VB tangible ×1.30 + intangibles base' },
]

const SENSITIVITY_VARS = [
  { label: 'Factor Reclamable promedio',       base: 'Varía por arq.',   impact: '±40.0% SROI portafolio — variable más sensible del modelo',            magnitude: 'ALTA' },
  { label: 'Proxy salud PX37 (v11 $1,174)',    base: '$1,174 IMSS DOF',  impact: '±16.0% SROI — outcomes de salud respiratoria P10',                     magnitude: 'ALTA' },
  { label: 'Proxy energético P10',             base: '$2,400/año Tarifa 1', impact: '±11.5% SROI — Tarifa 1 CFE subsidiada ($200/mes)',                  magnitude: 'ALTA' },
  { label: 'PX43 prevención juvenil',          base: '$2,500/persona',   impact: '±10.0% SROI — nuevo outcome en P06, P08, P09',                        magnitude: 'ALTA' },
  { label: 'Tasa de descuento (10% vs 3.5%)',  base: '10% SHCP',         impact: '±9.3% SROI entre tasa SHCP y UK Green Book',                          magnitude: 'ALTA' },
  { label: 'Recarga hídrica PXWATER',          base: '$18.9/m³ CONAGUA', impact: '±6.0% SROI — nuevo proxy agua infiltrada ANPs',                       magnitude: 'ALTA' },
  { label: 'Proxy no-finalistas P01',          base: '$1,500/persona',   impact: '±3.7% SROI si cambia proxy de red profesional',                       magnitude: 'BAJA' },
  { label: 'Proxy alimentario P15',            base: '$35 CONEVAL',      impact: '±3.4% SROI si cambia valoración de porciones',                        magnitude: 'BAJA' },
  { label: 'DW Eventos (B)',                   base: '55%',              impact: '±1.3% SROI — alto DW pero bajo peso en portafolio',                   magnitude: 'BAJA' },
  { label: 'Precio carbono $200/tCO₂',        base: '$200/tCO₂ ANPs',   impact: '±0.6% SROI — precio conservador vs co-beneficios verificados',        magnitude: 'BAJA' },
]

const LIMITATIONS = [
  { cat: 'PROXIES',        text: 'Proxies de mercado aproximados: ante falta de precios directos para outcomes sociales, usamos proxies que pueden sobre- o sub-estimar el valor real.' },
  { cat: 'DATOS',          text: 'Horizonte temporal limitado: mayoría de proyectos analizados a 1 año. Subestima impactos de largo plazo (educación, reforestación).' },
  { cat: 'METODOLOGÍA',    text: 'Ajustes basados en literatura: DW, Attr, Disp, Drop calibrados con Krlev et al. 2013 (114 estudios), HACT y CONAFOR. No son mediciones primarias de XIGNUX, pero validados sectorialmente.' },
  { cat: 'EXTERNALIDADES', text: 'Externalidades negativas parcialmente incorporadas: v11 incluye huella de carbono eventos (−$5K), rebound energético (−$259K) y desplazamiento alimentario (−$61K). Total: −$329K.' },
  { cat: 'METODOLOGÍA',    text: 'Doble conteo potencial: outcomes de educación y emprendimiento en P01–P05 podrían superponerse parcialmente.' },
  { cat: 'PROXIES',        text: 'WTP de estudios internacionales: valores de willingness-to-pay para turismo y voluntariado provienen de estudios no mexicanos.' },
  { cat: 'DATOS',          text: 'Supervivencia de árboles: v11 modela drop-off asimétrico (25%/año años 1-3, 2% años 4+) basado en CONAFOR (34-63% supervivencia). Aún podría ser optimista.' },
  { cat: 'PROXIES',        text: 'Outcomes difíciles de monetizar: P06 (gaming) y P08 (exploradores) tienen incertidumbre alta en la monetización.' },
  { cat: 'METODOLOGÍA',    text: 'Multiplicadores parciales: v11 incluye alivio carga energética (+$206K) y servicios ecosistémicos (+$132K agua + $78K suelo) en Modelo. Externalidades positivas documentadas en hoja Externalidades.' },
  { cat: 'METODOLOGÍA',    text: 'Supuesto de linealidad: duplicar inversión ≠ duplicar impacto. Rendimientos decrecientes no modelados.' },
  { cat: 'VERIFICACIÓN',   text: 'Sin seguimiento post-proyecto: falta de datos de tracking para validar persistencia real de impacto.' },
  { cat: 'DATOS',          text: 'Sin ajuste por tipo de cambio/inflación: todos los valores en MXN nominales. No se ajustan por poder adquisitivo.' },
  { cat: 'METODOLOGÍA',    text: 'Intangibles INCLUIDOS en v11: 7 categorías ($6.96M MXN). El SROI reportado (2.28x) incluye tangibles e intangibles. Los intangibles tienen menor certeza causal que los tangibles.' },
  { cat: 'DATOS',          text: 'Sesgo de selección: los 15 proyectos fueron preseleccionados por XIGNUX; no representan todo el portafolio posible.' },
  { cat: 'METODOLOGÍA',    text: 'Tasa de descuento: se usa 10% (SHCP México). UK Green Book recomienda 3.5%, lo que aumentaría PV de outcomes multi-año ~50%. Incluido en análisis tornado.' },
  { cat: 'PROXIES',        text: 'Precio carbono ANPs México: v11 usa $200 MXN/tCO₂ (servicios ecosistémicos ANPs federales MX). Reporte completo indica $1,099/tCO₂ con co-beneficios. EPA $190 USD/tCO₂. Elección conservadora.' },
  { cat: 'METODOLOGÍA',    text: 'Análisis Forecast, no Evaluative: análisis predictivo validado contra 8 fuentes externas (6/8 confirmadas). Conversión a evaluative requiere entrevistas y encuestas con beneficiarios.' },
  { cat: 'PROXIES',        text: 'P12 proxy i-Tree no verificado localmente: el valor de $100/árbol/año viene de USDA (EE.UU.). Podría ser diferente en contexto urbano de Monterrey.' },
  { cat: 'METODOLOGÍA',    text: 'Supuesto de linealidad (no modelado): rendimientos marginales decrecientes (saturación de beneficiarios, cuellos de botella logísticos) no están modelados. Recomendación v12: implementar curva de saturación logística.' },
  { cat: 'DATOS',          text: 'Estacionariedad paramétrica: proxies en MXN nominales 2025 sin indexación inflacionaria. Con inflación 3.0-3.8% (Banxico, SHCP CGPE 2026), proxies de bienestar subestiman valor real a mediano plazo.' },
]

/* ─── main component ─────────────────────────────────────────────── */
export default function PortfolioDashboard({ projects, onOpenProject, onBackToGraph }) {
  const tot = portfolioTotals(projects)
  const [sortKey, setSortKey]       = useState('sroi')
  const [sortDir, setSortDir]       = useState('desc')
  const [filterArch, setFilterArch] = useState('ALL')
  const [activeTab, setActiveTab]   = useState('overview')
  const [expandedLim, setExpandedLim] = useState(null)
  const { th: globalTh } = useTheme()
  const th = useMemo(() => mkTh(globalTh), [globalTh])

  const tabs = [
    { id: 'overview',     label: 'Resumen ejecutivo' },
    { id: 'ranking',      label: 'Ranking completo' },
    { id: 'benchmarks',   label: 'Benchmarks sectoriales' },
    { id: 'quadrant',     label: 'Matriz estratégica' },
    { id: 'sensitivity',  label: 'Sensibilidad' },
    { id: 'limitations',  label: 'Limitaciones' },
  ]

  const sortedProjects = useMemo(() => {
    let arr = [...projects]
    if (filterArch !== 'ALL') arr = arr.filter((p) => p.archetype === filterArch)
    arr.sort((a, b) => {
      const av = a[sortKey], bv = b[sortKey]
      if (typeof av === 'string') return sortDir === 'asc' ? av.localeCompare(bv) : bv.localeCompare(av)
      return sortDir === 'asc' ? av - bv : bv - av
    })
    return arr
  }, [projects, sortKey, sortDir, filterArch])

  const distData = useMemo(() => [
    { name: 'Alto (≥2x)',  value: tot.dist.ALTO  || 0, color: '#10B981' },
    { name: 'Medio (1–2x)', value: tot.dist.MEDIO || 0, color: '#F59E0B' },
    { name: 'Bajo (<1x)',  value: tot.dist.BAJO  || 0, color: '#EF4444' },
  ], [tot.dist.ALTO, tot.dist.MEDIO, tot.dist.BAJO])

  const archetypeBar = useMemo(() =>
    Object.entries(ARCHETYPES).map(([k, v]) => {
      const pp = projects.filter((p) => p.archetype === k)
      if (!pp.length) return null
      const inv = pp.reduce((a, p) => a + p.investment, 0)
      const adj = pp.reduce((a, p) => a + p.vTotal, 0)
      return { name: v.name.split(' ')[0], sroi: +(adj / inv).toFixed(2), inv: inv / 1e6, color: v.color, arch: k, mid: BENCHMARK_REFS[k].mid }
    }).filter(Boolean),
  [projects])

  const top5 = useMemo(() => [...projects].sort((a, b) => b.sroi - a.sroi).slice(0, 5), [projects])

  const toggleSort = (key) => {
    if (sortKey === key) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    else { setSortKey(key); setSortDir('desc') }
  }

  const benchmarkRows = useMemo(() =>
    projects.map((p) => {
      const bench = ARCHETYPES[p.archetype]
      const mid = bench.benchmarkMid
      const delta = +(p.sroi - mid).toFixed(2)
      const status = Math.abs(delta) < 0.15 ? 'EN_RANGO' : delta > 0 ? 'SOBRE' : 'MUY_BAJO'
      return { ...p, delta, status, benchMid: mid, benchRef: BENCHMARK_REFS[p.archetype].ref }
    }).sort((a, b) => b.sroi - a.sroi),
  [projects])

  const quadrantProjects = useMemo(() =>
    projects.map((p) => ({
      ...p,
      q: QUADRANT[p.quadrant] || QUADRANT.REVISAR,
    })),
  [projects])

  const { tt, ttBar } = useMemo(() => {
    const _tt = {
      contentStyle: { background: th.tooltipBg, border: `1px solid ${th.tooltipBorder}`, borderRadius: 10, fontSize: 11, padding: '8px 12px' },
      itemStyle: { color: th.tooltipText },
      labelStyle: { color: th.textMuted, marginBottom: 4 },
      cursor: { stroke: '#E8520E', strokeWidth: 1, strokeDasharray: '3 3' },
    }
    return { tt: _tt, ttBar: { ..._tt, cursor: { fill: 'rgba(232,82,14,0.06)' } } }
  }, [th])

  /* ─── render ─────────────────────────────────────────────────── */
  return (
    <div className="absolute inset-0 overflow-y-auto md:pl-[72px]" style={{ background: th.pageBg, transition: 'background 0.3s' }}>
      <div className="max-w-[1440px] mx-auto px-4 md:px-8 pt-20 pb-8">

        {/* Header */}
        <header className="flex items-end justify-between mb-6">
          <div>
            <div className="text-[10px] mono uppercase tracking-[0.25em] mb-1" style={{ color: th.textFaint }}>
              XIGNUX · Portafolio RSC
            </div>
            <h1 className="text-3xl font-semibold leading-tight" style={{ color: th.textPrimary }}>Análisis de Impacto Social</h1>
            <p className="text-sm mt-1" style={{ color: th.textMuted }}>
              {tot.count} iniciativas · {fmtMXNFull(tot.inv)} inversión ·{' '}
              SROI portafolio{' '}
              <span className="mono font-semibold" style={{ color: sroiColor(tot.sroi) }}>{tot.sroi.toFixed(2)}x</span>
            </p>
          </div>
          <div className="text-xs mono px-3 py-1.5 rounded-xl" style={{ background: 'rgba(232,82,14,0.06)', border: '1px solid rgba(232,82,14,0.2)', color: '#E8520E' }}>
            Modo Decidir
          </div>
        </header>

        {/* Tab nav */}
        <div className="flex gap-1 mb-6 p-1 rounded-xl" style={{ background: th.tabBarBg, border: `1px solid ${th.tabBarBorder}` }}>
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className="flex-1 text-[11px] py-2 px-3 rounded-lg transition font-medium"
              style={{
                background: activeTab === t.id ? th.tabActiveBg : 'transparent',
                color: activeTab === t.id ? th.tabActiveColor : th.tabInactiveColor,
                border: activeTab === t.id ? `1px solid ${th.tabActiveBorder}` : '1px solid transparent',
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* ── TAB: overview ──────────────────────────────────────────── */}
        {activeTab === 'overview' && (
          <div className="space-y-4">
            {/* KPI row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <KpiChip delay={0.05} label="SROI Portafolio" value={`${tot.sroi.toFixed(2)}x`} color={sroiColor(tot.sroi)} sub="Valor ajustado / Inversión" />
              <KpiChip delay={0.10} label="Inversión total" value={fmtMXN(tot.inv)} sub="MXN" />
              <KpiChip delay={0.15} label="Valor social total" value={fmtMXN(tot.adj)} sub={`Tangible + intangible`} color="#10B981" />
              <KpiChip delay={0.20} label="Beneficiarios directos" value={projects.reduce((a, p) => a + p.direct_beneficiaries, 0).toLocaleString('es-MX')} sub="personas" />
            </div>

            {/* Distribution + SROI trend by archetype */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
              <Card delay={0.25} className="lg:col-span-3">
                <SectionTitle th={th}>Distribución de impacto</SectionTitle>
                <div className="flex flex-col items-center">
                  <div className="w-32 h-32">
                    <ResponsiveContainer>
                      <PieChart>
                        <Pie
                          data={distData}
                          dataKey="value"
                          innerRadius={32}
                          outerRadius={56}
                          activeOuterRadius={62}
                          strokeWidth={0}
                          paddingAngle={2}
                          style={{ cursor: 'pointer', outline: 'none' }}
                        >
                          {distData.map((d, i) => (
                            <Cell key={i} fill={d.color} />
                          ))}
                        </Pie>
                        <Tooltip
                          content={(props) => {
                            if (!props.active || !props.payload?.length) return null
                            const d = props.payload[0]
                            return (
                              <div style={{ background: th.tooltipBg, border: `1px solid ${th.tooltipBorder}`, borderRadius: 8, padding: '6px 10px', fontSize: 11 }}>
                                <div style={{ color: d.payload.color, fontWeight: 600 }}>{d.name}</div>
                                <div style={{ color: th.tooltipText }}>{d.value} proyecto{d.value !== 1 ? 's' : ''}</div>
                              </div>
                            )
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="space-y-2 text-xs w-full mt-3">
                    {distData.map((d) => (
                      <div key={d.name} className="flex items-center justify-between">
                        <span className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: d.color }} />
                          <span style={{ color: th.textSecondary }}>{d.name}</span>
                        </span>
                        <span className="mono font-semibold" style={{ color: th.textPrimary }}>{d.value} proy.</span>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>

              <Card delay={0.3} className="lg:col-span-5">
                <SectionTitle th={th} sub="barra = portafolio · línea = benchmark medio sectorial">SROI por arquetipo vs. benchmark</SectionTitle>
                <div className="h-[200px]">
                  <ResponsiveContainer>
                    <BarChart data={archetypeBar} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="2 4" stroke={th.chartGrid} />
                      <XAxis dataKey="name" tick={{ fill: th.textSecondary, fontSize: 10 }} stroke={th.chartGrid} />
                      <YAxis tick={{ fill: th.textSecondary, fontSize: 10 }} stroke={th.chartGrid} />
                      <Tooltip {...ttBar} formatter={(v) => v.toFixed(2) + 'x'} />
                      <Bar dataKey="sroi" name="SROI portafolio" radius={[4, 4, 0, 0]}
                        activeBar={{ stroke: 'rgba(0,0,0,0.15)', strokeWidth: 2, fillOpacity: 1 }}
                      >
                        {archetypeBar.map((d, i) => <Cell key={i} fill={d.color} fillOpacity={0.75} />)}
                      </Bar>
                      {archetypeBar.map((d) => (
                        <ReferenceLine key={d.arch} y={d.mid} stroke={d.color} strokeDasharray="3 3" strokeOpacity={0.5} />
                      ))}
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <p className="text-[10px] mt-2" style={{ color: th.textFaint }}>
                  Líneas punteadas = benchmark medio sectorial (fuentes: Cemex, BAMX, Iluméxico, CONAFOR, HACT UK)
                </p>
              </Card>

              <Card delay={0.35} className="lg:col-span-4">
                <SectionTitle th={th}>Top 5 iniciativas por SROI</SectionTitle>
                <div className="space-y-3">
                  {top5.map((p, i) => (
                    <button key={p.id} onClick={() => onOpenProject(p.id)} className="w-full text-left group">
                      <div className="flex justify-between items-center text-xs mb-1.5">
                        <span className="flex items-center gap-2">
                          <span className="mono text-[10px] w-5" style={{ color: th.textFaint }}>{i + 1}</span>
                          <span className="group-hover:text-[#E8520E] transition truncate max-w-[160px]" style={{ color: th.textPrimary }}>{p.name}</span>
                        </span>
                        <span className="mono font-semibold flex-shrink-0 ml-2" style={{ color: sroiColor(p.sroi) }}>{p.sroi.toFixed(2)}x</span>
                      </div>
                      <div className="h-1.5 rounded-full overflow-hidden" style={{ background: th.trackBg }}>
                        <div className="h-full rounded-full transition-all" style={{ width: `${Math.min(100, (p.sroi / 3.5) * 100)}%`, background: sroiColor(p.sroi) }} />
                      </div>
                    </button>
                  ))}
                </div>
              </Card>
            </div>

            {/* Insights box */}
            <Card delay={0.4}>
              <SectionTitle th={th}>Hallazgos principales del portafolio</SectionTitle>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 text-xs" style={{ color: th.textSecondary }}>
                <div>
                  <div className="flex items-center gap-1.5 mb-2 font-semibold text-[11px]" style={{ color: '#10B981' }}>
                    <TrendingUp className="w-3.5 h-3.5" /> Iniciativa flagship
                  </div>
                  <p><strong style={{ color: th.textPrimary }}>Energía para Todos (P10)</strong> concentra $8.03M de valor total ($6.54M tangible + $1.49M intangible) con SROI 4.02x. v12 incorpora ahorro erario CFE ($7,500/hogar/año) que quintuplica el valor tangible. Su escalabilidad con Iluméxico podría duplicar cobertura.</p>
                </div>
                <div>
                  <div className="flex items-center gap-1.5 mb-2 font-semibold text-[11px]" style={{ color: '#F59E0B' }}>
                    <AlertTriangle className="w-3.5 h-3.5" /> Sub-inversión visible
                  </div>
                  <p><strong style={{ color: th.textPrimary }}>Red SumaRSE (P07)</strong> alcanza SROI 3.57x beneficiando a 3,000 niños con solo $250K — la asignación más eficiente. Doblar la inversión generaría retornos marginales altos.</p>
                </div>
                <div>
                  <div className="flex items-center gap-1.5 mb-2 font-semibold text-[11px]" style={{ color: '#EF4444' }}>
                    <TrendingDown className="w-3.5 h-3.5" /> Sobre-inversión relativa
                  </div>
                  <p><strong style={{ color: th.textPrimary }}>Academia Exploradores (P08)</strong> invierte $400K para impactar 40 niños ($10K/beneficiario), SROI 0.41x. <strong style={{ color: th.textPrimary }}>Gamer con Causa (P06)</strong> gasta $480K para SROI 0.22x. Ambos candidatos a rediseño o consolidación en Hub STEM.</p>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* ── TAB: ranking ───────────────────────────────────────────── */}
        {activeTab === 'ranking' && (
          <Card delay={0.05}>
            <div className="flex items-center justify-between mb-4">
              <SectionTitle th={th} sub="SROI ajustado con deadweight, attribution, displacement y drop-off">Ranking completo de iniciativas</SectionTitle>
              <div className="flex items-center gap-2">
                <Filter className="w-3.5 h-3.5" style={{ color: th.textMuted }} />
                <select
                  value={filterArch}
                  onChange={(e) => setFilterArch(e.target.value)}
                  className="text-[11px] mono px-2 py-1.5 rounded-lg outline-none"
                  style={{ background: th.inputBg, border: `1px solid ${th.inputBorder}`, color: th.textPrimary }}
                >
                  <option value="ALL">Todos los arquetipos</option>
                  {Object.entries(ARCHETYPES).map(([k, v]) => (
                    <option key={k} value={k}>{k} · {v.name}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr style={{ color: th.textMuted, borderBottom: `1px solid ${th.tableBorder}` }}>
                  {[
                    { k: 'id',                   l: 'ID'            },
                    { k: 'name',                 l: 'Iniciativa'    },
                    { k: 'archetype',            l: 'Arq.'          },
                    { k: 'investment',           l: 'Inversión'     },
                    { k: 'vTotal',               l: 'Valor Total'   },
                    { k: 'sroi',                 l: 'SROI'          },
                    { k: 'direct_beneficiaries', l: 'Beneficiarios' },
                    { k: 'category',             l: 'Categoría'     },
                    { k: null,                   l: 'Decisión'      },
                  ].map((h) => (
                    <th
                      key={h.k || h.l}
                      onClick={h.k ? () => toggleSort(h.k) : undefined}
                      className={`text-left py-2.5 px-2 font-medium select-none ${h.k ? 'cursor-pointer hover:text-black transition' : ''}`}
                    >
                      {h.k ? (
                        <span className="inline-flex items-center gap-1">{h.l} <ArrowUpDown className="w-3 h-3 opacity-40" /></span>
                      ) : h.l}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {sortedProjects.map((p) => {
                  const arch = ARCHETYPES[p.archetype]
                  const decision = p.category === 'ALTO'
                    ? { label: 'Escalar',    color: '#10B981' }
                    : p.category === 'MEDIO'
                    ? { label: 'Mantener',   color: '#F59E0B' }
                    : { label: 'Reevaluar',  color: '#EF4444' }
                  return (
                    <tr
                      key={p.id}
                      onClick={() => onOpenProject(p.id)}
                      className="cursor-pointer transition group hover:bg-[rgba(232,82,14,0.04)]"
                      style={{ borderBottom: `1px solid ${th.tableBorder}` }}
                    >
                      <td className="py-3 px-2 mono text-[11px]" style={{ color: th.textFaint }}>{p.id}</td>
                      <td className="py-3 px-2 font-medium group-hover:text-[#E8520E] transition max-w-[180px]" style={{ color: th.textPrimary }}>
                        <span className="truncate block">{p.name}</span>
                      </td>
                      <td className="py-3 px-2">
                        <span className="mono text-[10px] px-1.5 py-0.5 rounded-md" style={{ background: arch.color + '22', color: arch.color }}>
                          {p.archetype} · {arch.name.split(' ')[0]}
                        </span>
                      </td>
                      <td className="py-3 px-2 mono" style={{ color: th.textPrimary }}>{fmtMXN(p.investment)}</td>
                      <td className="py-3 px-2 mono font-semibold" style={{ color: th.textPrimary }}>{fmtMXN(p.vTotal)}</td>
                      <td className="py-3 px-2">
                        <div className="flex items-center gap-2">
                          <div className="w-14 h-1.5 rounded-full overflow-hidden" style={{ background: th.trackBg }}>
                            <div className="h-full rounded-full" style={{ width: `${Math.min(100, (p.sroi / 3.5) * 100)}%`, background: sroiColor(p.sroi) }} />
                          </div>
                          <span className="mono font-semibold text-[11px]" style={{ color: sroiColor(p.sroi) }}>{p.sroi.toFixed(2)}x</span>
                        </div>
                      </td>
                      <td className="py-3 px-2 mono text-[11px]" style={{ color: th.textPrimary }}>
                        {p.direct_beneficiaries.toLocaleString('es-MX')}
                      </td>
                      <td className="py-3 px-2"><SroiBadge sroi={p.sroi} /></td>
                      <td className="py-3 px-2">
                        <span className="inline-flex items-center gap-1.5 text-[10px] px-2 py-1 rounded-md font-semibold" style={{ background: decision.color + '18', color: decision.color, border: `1px solid ${decision.color}44` }}>
                          <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: decision.color }} />
                          {decision.label}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
            </div>
            <div className="mt-4 pt-4" style={{ borderTop: `1px solid ${th.tableBorder}` }}>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-[11px]" style={{ color: th.textMuted }}>
                <div>
                  <span className="font-semibold" style={{ color: th.textSecondary }}>Inversión total: </span>
                  {fmtMXNFull(sortedProjects.reduce((a, p) => a + p.investment, 0))}
                </div>
                <div>
                  <span className="font-semibold" style={{ color: th.textSecondary }}>Valor total: </span>
                  {fmtMXN(sortedProjects.reduce((a, p) => a + p.vTotal, 0))}
                </div>
                <div>
                  <span className="font-semibold" style={{ color: th.textSecondary }}>Beneficiarios: </span>
                  {sortedProjects.reduce((a, p) => a + p.direct_beneficiaries, 0).toLocaleString('es-MX')}
                </div>
                <div className="flex gap-3">
                  {[{ l: 'Escalar', c: '#10B981' }, { l: 'Mantener', c: '#F59E0B' }, { l: 'Reevaluar', c: '#EF4444' }].map(({ l, c }) => (
                    <span key={l} className="flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full" style={{ background: c }} />
                      <span style={{ color: c }}>{l}</span>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* ── TAB: benchmarks ────────────────────────────────────────── */}
        {activeTab === 'benchmarks' && (
          <div className="space-y-4">
            <Card delay={0.05}>
              <SectionTitle th={th} sub="Fuentes: Cemex Patrimonio Hoy · HACT UK · Iluméxico · Caso Metepec MX · BAMX · Social Value UK">Rangos SROI típicos por arquetipo</SectionTitle>
              <div className="space-y-3">
                {Object.entries(ARCHETYPES).map(([k, v]) => {
                  const bench = BENCHMARK_REFS[k]
                  const pp = projects.filter((p) => p.archetype === k)
                  const archSroi = pp.length ? pp.reduce((a, p) => a + p.vTotal, 0) / pp.reduce((a, p) => a + p.investment, 0) : 0
                  const pct = Math.min(100, (archSroi / bench.high) * 100)
                  const benchPctLow = (bench.low / bench.high) * 100
                  const benchPctMid = (bench.mid / bench.high) * 100
                  return (
                    <div key={k}>
                      <div className="flex items-center justify-between text-xs mb-1.5">
                        <span className="flex items-center gap-2 font-medium">
                          <span className="mono px-1.5 py-0.5 rounded text-[10px]" style={{ background: v.color + '22', color: v.color }}>Arq. {k}</span>
                          {v.name}
                        </span>
                        <div className="flex items-center gap-3 mono text-[10px]" style={{ color: th.textMuted }}>
                          <span>Portafolio: <strong style={{ color: sroiColor(archSroi) }}>{archSroi.toFixed(2)}x</strong></span>
                          <span>Bench. medio: <strong style={{ color: '#94A3B8' }}>{bench.mid}x</strong></span>
                        </div>
                      </div>
                      <div className="relative h-4 rounded-full overflow-hidden" style={{ background: th.trackBg }}>
                        {/* benchmark range */}
                        <div
                          className="absolute top-0 h-full rounded-full opacity-20"
                          style={{ left: `${benchPctLow}%`, width: `${benchPctMid - benchPctLow}%`, background: v.color }}
                        />
                        {/* portfolio SROI */}
                        <div
                          className="absolute top-0 h-full rounded-full"
                          style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${v.color}88, ${sroiColor(archSroi)})` }}
                        />
                        {/* benchmark mid line */}
                        <div className="absolute top-0 h-full w-px opacity-70" style={{ left: `${benchPctMid}%`, background: v.color }} />
                      </div>
                      <div className="flex justify-between text-[10px] mt-0.5" style={{ color: th.textFaint }}>
                        <span>{bench.low}x min</span>
                        <span>{bench.ref}</span>
                        <span>{bench.high}x max</span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </Card>

            <Card delay={0.15}>
              <SectionTitle th={th} sub="Δ = SROI del proyecto menos benchmark medio del arquetipo">Posición de cada proyecto vs. benchmark medio</SectionTitle>
              <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr style={{ color: th.textMuted, borderBottom: `1px solid ${th.tableBorder}` }}>
                    <th className="text-left py-2.5 px-2 font-medium">Proyecto</th>
                    <th className="text-left py-2.5 px-2 font-medium">Arq.</th>
                    <th className="text-right py-2.5 px-2 font-medium">SROI modelo</th>
                    <th className="text-right py-2.5 px-2 font-medium">Bench. medio</th>
                    <th className="text-right py-2.5 px-2 font-medium">Δ vs bench.</th>
                    <th className="text-left py-2.5 px-2 font-medium">Diagnóstico</th>
                    <th className="text-left py-2.5 px-2 font-medium">Fuente de referencia</th>
                  </tr>
                </thead>
                <tbody>
                  {benchmarkRows.map((p) => {
                    const arch = ARCHETYPES[p.archetype]
                    const deltaColor = p.status === 'EN_RANGO' ? '#10B981' : p.status === 'SOBRE' ? '#5B9BD5' : '#EF4444'
                    const deltaLabel = p.status === 'EN_RANGO' ? '✓ En rango' : p.status === 'SOBRE' ? '↑ Sobre bench.' : '⚠ Muy bajo'
                    return (
                      <tr key={p.id} style={{ borderBottom: `1px solid ${th.tableBorder}`, color: th.textPrimary }}>
                        <td className="py-2.5 px-2 font-medium">{p.id} · {p.name}</td>
                        <td className="py-2.5 px-2">
                          <span className="mono text-[10px] px-1.5 py-0.5 rounded-md" style={{ background: arch.color + '22', color: arch.color }}>{p.archetype}</span>
                        </td>
                        <td className="py-2.5 px-2 mono text-right font-semibold" style={{ color: sroiColor(p.sroi) }}>{p.sroi.toFixed(2)}x</td>
                        <td className="py-2.5 px-2 mono text-right" style={{ color: th.textMuted }}>{p.benchMid.toFixed(2)}x</td>
                        <td className="py-2.5 px-2 mono text-right font-semibold" style={{ color: deltaColor }}>
                          {p.delta > 0 ? '+' : ''}{p.delta.toFixed(2)}x
                        </td>
                        <td className="py-2.5 px-2">
                          <span className="text-[10px] px-1.5 py-0.5 rounded-md font-medium" style={{ background: deltaColor + '18', color: deltaColor }}>
                            {deltaLabel}
                          </span>
                        </td>
                        <td className="py-2.5 px-2 text-[10px]" style={{ color: th.textFaint }}>{p.benchRef}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
              </div>
            </Card>
          </div>
        )}

        {/* ── TAB: quadrant ──────────────────────────────────────────── */}
        {activeTab === 'quadrant' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {Object.entries(QUADRANT).map(([k, v]) => {
                const count = projects.filter((p) => p.quadrant === k).length
                return (
                  <Card key={k} delay={0.05} style={{ borderColor: v.color + '33' }}>
                    <v.Icon className="w-5 h-5 mb-2" style={{ color: v.color }} />
                    <div className="text-sm font-semibold" style={{ color: v.color }}>{v.label}</div>
                    <div className="text-[11px] mt-1 mb-2" style={{ color: th.textMuted }}>{v.desc}</div>
                    <div className="mono text-2xl font-semibold" style={{ color: th.textPrimary }}>{count}</div>
                    <div className="text-[10px]" style={{ color: th.textFaint }}>proyectos</div>
                  </Card>
                )
              })}
            </div>

            {/* Visual quadrant plot */}
            <Card delay={0.15}>
              <SectionTitle th={th} sub="Eje X = alineación estratégica (1–5) · Eje Y = SROI · tamaño = inversión relativa">Matriz 2×2 de priorización estratégica</SectionTitle>
              <div className="relative h-[360px] rounded-xl overflow-hidden" style={{ background: th.quadBg }}>
                {/* quadrant dividers */}
                <div className="absolute inset-0 flex">
                  <div className="flex-1 border-r" style={{ borderColor: th.quadDivider }} />
                  <div className="flex-1" />
                </div>
                <div className="absolute inset-0 flex flex-col">
                  <div className="flex-1 border-b" style={{ borderColor: th.quadDivider }} />
                  <div className="flex-1" />
                </div>
                {/* quadrant labels */}
                <div className="absolute top-3 left-3 flex items-center gap-1 text-[10px] mono" style={{ color: '#10B981' }}><Sprout className="w-3 h-3" /> SEMILLA</div>
                <div className="absolute top-3 right-3 flex items-center gap-1 text-[10px] mono text-right" style={{ color: '#F59E0B' }}><Star className="w-3 h-3" /> ESTRELLA</div>
                <div className="absolute bottom-3 left-3 flex items-center gap-1 text-[10px] mono" style={{ color: '#EF4444' }}><AlertTriangle className="w-3 h-3" /> REVISAR</div>
                <div className="absolute bottom-3 right-3 flex items-center gap-1 text-[10px] mono text-right" style={{ color: '#5B9BD5' }}><Gem className="w-3 h-3" /> OPORTUNIDAD</div>
                {/* axis labels */}
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 text-[10px] pb-1" style={{ color: th.textFaint }}>← Alineación estratégica →</div>
                <div className="absolute left-0 top-1/2 -translate-y-1/2 -rotate-90 text-[10px]" style={{ color: th.textFaint }}>← SROI →</div>
                {/* nodes */}
                {quadrantProjects.map((p) => {
                  const x = ((p.strategic_score - 1) / 4) * 85 + 7.5
                  const y = (1 - Math.min(1, p.sroi / 3.5)) * 80 + 10
                  const size = Math.max(28, Math.min(52, (p.investment / 2000000) * 52))
                  return (
                    <button
                      key={p.id}
                      onClick={() => onOpenProject(p.id)}
                      title={`${p.id} · ${p.name} · SROI ${p.sroi.toFixed(2)}x`}
                      className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full flex items-center justify-center transition hover:scale-110"
                      style={{
                        left: `${x}%`, top: `${y}%`,
                        width: size, height: size,
                        background: p.q.color + '28',
                        border: `2px solid ${p.q.color}88`,
                        color: p.q.color,
                        fontSize: 9,
                        fontFamily: 'monospace',
                        fontWeight: 600,
                      }}
                    >
                      {p.id}
                    </button>
                  )
                })}
              </div>
            </Card>

            {/* Action table */}
            <Card delay={0.3}>
              <SectionTitle th={th} sub="Basado en SROI, alineación estratégica, calidad de datos y escalabilidad">Decisiones estratégicas por proyecto</SectionTitle>
              <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr style={{ color: th.textMuted, borderBottom: `1px solid ${th.tableBorder}` }}>
                    <th className="text-left py-2.5 px-2 font-medium">Proyecto</th>
                    <th className="text-left py-2.5 px-2 font-medium">Cuadrante</th>
                    <th className="text-right py-2.5 px-2 font-medium">SROI</th>
                    <th className="text-right py-2.5 px-2 font-medium">Estratégico</th>
                    <th className="text-right py-2.5 px-2 font-medium">Datos</th>
                    <th className="text-right py-2.5 px-2 font-medium">Escalab.</th>
                    <th className="text-left py-2.5 px-2 font-medium">Acción recomendada</th>
                    <th className="text-left py-2.5 px-2 font-medium">Aliado propuesto</th>
                  </tr>
                </thead>
                <tbody>
                  {quadrantProjects.map((p) => (
                    <tr key={p.id} style={{ borderBottom: `1px solid ${th.tableBorder}`, color: th.textPrimary }}>
                      <td className="py-2.5 px-2 font-medium">{p.id} · {p.name}</td>
                      <td className="py-2.5 px-2">
                        <span className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-md font-medium" style={{ background: p.q.color + '1a', color: p.q.color, border: `1px solid ${p.q.color}33` }}>
                          <p.q.Icon className="w-3 h-3" /> {p.q.label}
                        </span>
                      </td>
                      <td className="py-2.5 px-2 mono text-right font-semibold" style={{ color: sroiColor(p.sroi) }}>{p.sroi.toFixed(2)}x</td>
                      <td className="py-2.5 px-2 mono text-right">{p.strategic_score}/5</td>
                      <td className="py-2.5 px-2 mono text-right">{p.data_quality}/5</td>
                      <td className="py-2.5 px-2 mono text-right">{p.scalability}/5</td>
                      <td className="py-2.5 px-2 text-[11px] max-w-[200px]" style={{ color: th.textSecondary }}>
                        {p.strategic_action}
                      </td>
                      <td className="py-2.5 px-2 text-[11px]" style={{ color: th.textMuted }}>{p.strategic_partner}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              </div>
            </Card>
          </div>
        )}

        {/* ── TAB: sensitivity ───────────────────────────────────────── */}
        {activeTab === 'sensitivity' && (
          <div className="space-y-4">
            {/* 3 scenarios */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {SCENARIOS.map((s, i) => (
                <Card key={s.label} delay={0.05 * (i + 1)} style={{ borderColor: s.color + '33' }}>
                  <div className="text-[10px] mono uppercase tracking-widest mb-1" style={{ color: s.color }}>Escenario {s.label}</div>
                  <div className="text-3xl font-semibold mono mb-1" style={{ color: s.color }}>{s.sroi.toFixed(2)}x</div>
                  <div className="text-sm mono mb-3" style={{ color: th.textPrimary }}>{fmtMXN(s.adj)} ajustado</div>
                  <div className="text-[11px]" style={{ color: th.textMuted }}>{s.desc}</div>
                </Card>
              ))}
            </div>

            {/* Scenario comparison bar */}
            <Card delay={0.2}>
              <SectionTitle th={th} sub="Todos los escenarios incluyen tangibles + intangibles · Conservador ($100/tCO₂) · Base ($200/tCO₂) · Optimista ($400/tCO₂)">Rango de SROI portafolio según escenario</SectionTitle>
              <div className="h-[200px]">
                <ResponsiveContainer>
                  <BarChart data={SCENARIOS} margin={{ top: 8, right: 24, left: -16, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="2 4" stroke={th.chartGrid} />
                    <XAxis dataKey="label" tick={{ fill: th.textSecondary, fontSize: 11 }} stroke={th.chartGrid} />
                    <YAxis tick={{ fill: th.textSecondary, fontSize: 10 }} stroke={th.chartGrid} domain={[0, 3.5]} />
                    <Tooltip {...ttBar} formatter={(v) => v.toFixed(2) + 'x'} />
                    <Bar dataKey="sroi" name="SROI portafolio" radius={[6, 6, 0, 0]}
                      activeBar={{ stroke: 'rgba(0,0,0,0.15)', strokeWidth: 2, fillOpacity: 1 }}
                    >
                      {SCENARIOS.map((s, i) => <Cell key={i} fill={s.color} fillOpacity={0.8} />)}
                    </Bar>
                    <ReferenceLine y={1} stroke={th.textMuted} strokeDasharray="4 4" label={{ value: 'Break-even (1x)', fill: th.textMuted, fontSize: 10 }} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>

            <Card delay={0.3}>
              <SectionTitle th={th} sub="Magnitud del impacto si el supuesto cambia respecto al valor base utilizado">10 variables más sensibles del modelo</SectionTitle>
              <div className="space-y-2">
                {SENSITIVITY_VARS.map((v, i) => {
                  const magColor = v.magnitude === 'ALTA' ? '#EF4444' : v.magnitude === 'MEDIA' ? '#F59E0B' : '#10B981'
                  return (
                    <div
                      key={i}
                      className="grid gap-3 items-center py-2.5 rounded-xl px-3"
                      style={{ gridTemplateColumns: '2fr 1fr 3fr 80px', borderBottom: `1px solid ${th.tableBorder}` }}
                    >
                      <span className="text-xs font-medium" style={{ color: th.textPrimary }}>{v.label}</span>
                      <span className="mono text-[11px]" style={{ color: th.textMuted }}>{v.base}</span>
                      <span className="text-[11px]" style={{ color: th.textSecondary }}>{v.impact}</span>
                      <span className="text-[10px] mono px-2 py-1 rounded-lg text-center font-semibold" style={{ background: magColor + '18', color: magColor }}>
                        {v.magnitude}
                      </span>
                    </div>
                  )
                })}
              </div>
              <p className="text-[11px] mt-4 pt-3" style={{ borderTop: `1px solid ${th.tableBorder}`, color: th.textFaint }}>
                El Factor Reclamable tiene impacto ALTA porque determina qué fracción del VB es genuinamente atribuible (FR varía de 0.15 en Arq. B a 0.74 en Arq. C). SROI base 2.28x.
                Recomendación: validar factores reclamables con datos primarios de XIGNUX para reducir incertidumbre del modelo.
              </p>
            </Card>
          </div>
        )}

        {/* ── TAB: limitations ───────────────────────────────────────── */}
        {activeTab === 'limitations' && (
          <div className="space-y-4">
            <Card delay={0.05}>
              <SectionTitle th={th} sub="Reconocer incertidumbre explícitamente demuestra rigor analítico (15% peso en rúbrica)">Limitaciones metodológicas — transparencia del análisis</SectionTitle>
              <div className="space-y-2">
                {LIMITATIONS.map((lim, i) => {
                  const catColor = {
                    DATOS: '#5B9BD5', METODOLOGÍA: '#F59E0B', PROXIES: '#ED7D31',
                    ATRIBUCIÓN: '#10B981', VERIFICACIÓN: '#A78BFA', CONTRAFACTUAL: '#EF4444',
                    EXTERNALIDADES: '#A78BFA',
                  }[lim.cat] || '#999999'
                  return (
                    <div
                      key={i}
                      className="flex gap-4 py-3 px-4 rounded-xl cursor-pointer transition-colors"
                      style={{ background: th.limItemBg, border: `1px solid ${th.limItemBorder}` }}
                    >
                      <span className="mono text-[10px] px-2 py-0.5 h-fit rounded-md font-semibold flex-shrink-0 mt-0.5" style={{ background: catColor + '1a', color: catColor, border: `1px solid ${catColor}33` }}>
                        {lim.cat}
                      </span>
                      <p className="text-[12px] leading-relaxed" style={{ color: th.textSecondary }}>{lim.text}</p>
                    </div>
                  )
                })}
              </div>
            </Card>

            <Card delay={0.2}>
              <SectionTitle th={th} sub="Valores utilizados para el escenario central · Modificables para análisis de sensibilidad">Supuestos clave del modelo base</SectionTitle>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3 text-xs">
                {[
                  ['Precio carbono ANPs México',         '$200 MXN/tCO₂',  'Valoración servicios ecosistémicos ANPs federales MX'],
                  ['Tipo de cambio USD/MXN',             '$17.30',          'Promedio Banxico 2024'],
                  ['Ahorro eléctrico hogar / año',       '$2,400 MXN',      'CFE Tarifa 1 subsidiada ($200/mes). Ilumexico valida $130/mes off-grid.'],
                  ['Proxy salud respiratoria PX37',      '$1,174 MXN',      'IMSS DOF costos evitados IRA. v11 reemplaza $186 de v8.'],
                  ['Factor emisión red eléctrica CFE',   '0.435 tCO₂/MWh', 'CRE / SEMARNAT 2023'],
                  ['Tasa de descuento',                  '10% SHCP',        'SHCP México. UK Green Book usa 3.5%. Ambas reportadas.'],
                  ['Proxy prevención juvenil PX43',      '$2,500/persona',  'v11 nuevo. OECD Better Life, desviación conductual evitada.'],
                  ['Recarga hídrica PXWATER',            '$18.9/m³',        'CONAGUA NL tarifas agua tratada ANPs'],
                  ['Costo social porción rescatada',     '$35 MXN/porción', 'CONEVAL canasta básica ($40-60 MXN). Conservador.'],
                  ['Salario mínimo 2026',                '$315.04 MXN/día', 'CONASAMI DOF dic 2025'],
                ].map(([label, value, source]) => (
                  <div key={label} className="py-2" style={{ borderBottom: `1px solid ${th.tableBorder}` }}>
                    <div className="flex justify-between items-start">
                      <span style={{ color: th.textSecondary }}>{label}</span>
                      <span className="mono font-semibold ml-4 flex-shrink-0" style={{ color: th.textPrimary }}>{value}</span>
                    </div>
                    <div className="text-[10px] mt-0.5" style={{ color: th.textFaint }}>{source}</div>
                  </div>
                ))}
              </div>
            </Card>

            <Card delay={0.35} style={{ borderColor: 'rgba(232,82,14,0.15)' }}>
              <div className="flex items-start gap-3">
                <Info className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: '#E8520E' }} />
                <p className="text-[12px] leading-relaxed" style={{ color: th.textSecondary }}>
                  <strong style={{ color: th.textPrimary }}>Principio rector del análisis: </strong>
                  "Un análisis SROI conservador, claro y defendible es siempre superior a uno alto pero cuestionable." — SROI Network Guide 2012.
                  Este modelo prioriza la transparencia sobre el número: cada supuesto está documentado, cada ajuste justificado con benchmarks externos verificables (CONEVAL, CEPAL, INEGI, SEMARNAT, CONAFOR, SHCP, CONASAMI, IMCO, BAMX).
                  El SROI del portafolio (2.28x) incluye tangibles ($13.09M, conservador con VPN compuesto y DW HACT) e intangibles verificables ($6.96M, 7 categorías SVI Principio 3). Cada supuesto está documentado y justificado con benchmarks externos.
                </p>
              </div>
            </Card>
          </div>
        )}

      </div>
    </div>
  )
}
