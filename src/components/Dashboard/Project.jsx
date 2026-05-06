import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft } from 'lucide-react'
import {
  ResponsiveContainer, LineChart, Line, AreaChart, Area,
  BarChart, Bar, PieChart, Pie, Cell,
  CartesianGrid, XAxis, YAxis, Tooltip, Legend,
} from 'recharts'
import { ARCHETYPES } from '../../data/projects'
import { HISTORY_BY_PROJECT, fmtMXN, sroiColor } from '../../lib/sroi'

const cardEntry = { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 } }
const tooltipStyle = {
  contentStyle: { background: '#131929', border: '1px solid #1F2937', borderRadius: 8, fontSize: 12 },
  itemStyle: { color: '#F5F7FA' },
  labelStyle: { color: '#94A3B8' },
}

function Card({ children, className = '', style = {}, delay = 0 }) {
  return (
    <motion.div
      {...cardEntry}
      transition={{ duration: 0.4, delay, ease: 'easeOut' }}
      whileHover={{ y: -3 }}
      className={`rounded-xl p-5 grad-border ${className}`}
      style={{ background: 'rgba(19,25,41,0.8)', border: '1px solid rgba(255,255,255,0.05)', boxShadow: '0 4px 20px -8px rgba(0,0,0,0.4)', ...style }}
    >
      {children}
    </motion.div>
  )
}

export default function ProjectDashboard({ project, projects, onBack }) {
  const arch = ARCHETYPES[project.archetype]
  const history = HISTORY_BY_PROJECT(project.id, project.sroi)

  const sensitivityData = useMemo(() => {
    const points = []
    for (let pct = 0; pct <= 60; pct += 5) {
      const f = pct / 100
      const baseFactor = (1 - project.adjustments.dp) * (1 - project.adjustments.dr)
      const dwSroi = (project.vBruto * (1 - f) * (1 - project.adjustments.at) * baseFactor) / project.investment
      const atSroi = (project.vBruto * (1 - project.adjustments.dw) * (1 - f) * baseFactor) / project.investment
      const drSroi = (project.vBruto * (1 - project.adjustments.dw) * (1 - project.adjustments.at) * (1 - project.adjustments.dp) * (1 - f)) / project.investment
      points.push({ pct, dw: +dwSroi.toFixed(2), at: +atSroi.toFixed(2), dr: +drSroi.toFixed(2) })
    }
    return points
  }, [project])

  const benchmarkBars = [
    { name: 'Mín. sector',     value: arch.benchmark * 0.5 },
    { name: 'Promedio sector', value: arch.benchmark },
    { name: 'Máx. sector',    value: arch.benchmark * 2.0 },
    { name: project.id,        value: project.sroi },
  ]

  const stakeholderColors = ['#5B9BD5', '#ED7D31', '#10B981', '#F59E0B', '#A78BFA']
  const stakeholderData = project.stakeholders.map((s, i) => ({
    name: s, value: 100 / project.stakeholders.length + (i % 2 === 0 ? 5 : -5),
  }))

  return (
    <motion.div
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
      className="absolute inset-0 overflow-y-auto z-40"
      style={{ background: 'rgba(10,14,26,0.97)' }}
    >
      <div className="max-w-[1400px] mx-auto px-8 py-8">
        <motion.header animate={{ opacity: 1, y: 0 }} className="mb-6">
          <div className="flex items-center gap-2 text-[11px] mono mb-2" style={{ color: '#94A3B8' }}>
            <button onClick={onBack} className="hover:text-white transition flex items-center gap-1">
              <ArrowLeft className="w-3 h-3" /> Volver al grafo
            </button>
            <span>/</span><span>Portafolio</span>
            <span>/</span>
            <span style={{ color: arch.color }}>Arq. {project.archetype}</span>
            <span>/</span>
            <span style={{ color: '#F5F7FA' }}>{project.id}</span>
          </div>
          <div className="flex items-end justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] mono px-2 py-1 rounded" style={{ background: arch.color + '33', color: arch.color, border: `1px solid ${arch.color}55` }}>
                  {project.id} · ARQ {project.archetype}
                </span>
                <span className="text-[10px] mono px-2 py-1 rounded" style={{ background: sroiColor(project.sroi) + '22', color: sroiColor(project.sroi), border: `1px solid ${sroiColor(project.sroi)}55` }}>
                  {project.category}
                </span>
                <span className="text-[10px] mono" style={{ color: '#94A3B8' }}>{project.region}</span>
              </div>
              <h1 className="text-3xl font-semibold mt-2">{project.name}</h1>
              <div className="text-sm mt-1" style={{ color: '#94A3B8' }}>{arch.name}</div>
            </div>
          </div>
        </motion.header>

        <div className="grid grid-cols-12 gap-4 mb-4">
          {[
            { l: 'Inversión',              v: fmtMXN(project.investment),       sub: 'MXN · 2024' },
            { l: 'SROI',                   v: project.sroi.toFixed(2) + 'x',    color: sroiColor(project.sroi), sub: 'Valor / Inversión' },
            { l: 'Beneficiarios directos', v: project.direct_beneficiaries.toLocaleString('es-MX'), sub: 'personas' },
            { l: 'Valor social ajustado',  v: fmtMXN(project.vAjustado),        sub: `${(project.vAjustado / project.vBruto * 100).toFixed(0)}% del bruto` },
          ].map((k, i) => (
            <Card key={k.l} className="col-span-3" delay={0.05 * (i + 1)}>
              <div className="text-[10px] mono uppercase tracking-wider" style={{ color: '#94A3B8' }}>{k.l}</div>
              <div className="text-3xl font-semibold mt-1 mono" style={{ color: k.color || '#F5F7FA' }}>{k.v}</div>
              <div className="text-[11px] mt-1.5" style={{ color: '#94A3B8' }}>{k.sub}</div>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-12 gap-4 mb-4">
          <Card className="col-span-8" delay={0.3}>
            <h3 className="text-sm font-semibold mb-3">Outcomes y proxies</h3>
            <table className="w-full text-xs">
              <thead style={{ color: '#94A3B8' }}>
                <tr>
                  <th className="text-left py-2 font-medium">Descripción</th>
                  <th className="text-right py-2 font-medium">Cantidad</th>
                  <th className="text-right py-2 font-medium">Proxy</th>
                  <th className="text-right py-2 font-medium">Valor bruto</th>
                  <th className="text-right py-2 font-medium pl-3">Contribución</th>
                </tr>
              </thead>
              <tbody>
                {project.outcomes.map((o, i) => {
                  const total = project.outcomes.reduce((a, x) => a + x.gross, 0)
                  const pct = (o.gross / total) * 100
                  return (
                    <tr key={i} style={{ borderTop: '1px solid #1F2937' }}>
                      <td className="py-2.5">{o.description}</td>
                      <td className="text-right py-2.5 mono">{o.qty.toLocaleString('es-MX')}</td>
                      <td className="text-right py-2.5 mono">{fmtMXN(o.proxy)}</td>
                      <td className="text-right py-2.5 mono font-semibold">{fmtMXN(o.gross)}</td>
                      <td className="py-2.5 pl-3">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-1 rounded overflow-hidden" style={{ background: '#1F2937' }}>
                            <div className="h-full rounded" style={{ width: `${pct}%`, background: 'linear-gradient(90deg,#2E75B6,#5B9BD5)' }} />
                          </div>
                          <span className="mono text-[10px] w-10 text-right" style={{ color: '#94A3B8' }}>{pct.toFixed(0)}%</span>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </Card>
          <Card className="col-span-4" delay={0.35}>
            <h3 className="text-sm font-semibold mb-2">Stakeholders</h3>
            <div className="h-[200px]">
              <ResponsiveContainer>
                <PieChart>
                  <Pie data={stakeholderData} dataKey="value" innerRadius={45} outerRadius={75} strokeWidth={0}>
                    {stakeholderData.map((d, i) => <Cell key={i} fill={stakeholderColors[i % stakeholderColors.length]} />)}
                  </Pie>
                  <Tooltip {...tooltipStyle} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-1 text-[11px] mt-2">
              {stakeholderData.map((d, i) => (
                <div key={d.name} className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full" style={{ background: stakeholderColors[i % stakeholderColors.length] }} />
                  <span style={{ color: '#94A3B8' }}>{d.name}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-12 gap-4 mb-4">
          <Card className="col-span-6" delay={0.4}>
            <h3 className="text-sm font-semibold mb-1">Sensibilidad de SROI</h3>
            <div className="text-[11px] mb-3" style={{ color: '#94A3B8' }}>Cómo varía el SROI al mover cada ajuste</div>
            <div className="h-[230px]">
              <ResponsiveContainer>
                <LineChart data={sensitivityData}>
                  <CartesianGrid strokeDasharray="2 4" stroke="#1F2937" />
                  <XAxis dataKey="pct" tick={{ fill: '#94A3B8', fontSize: 10 }} unit="%" stroke="#1F2937" />
                  <YAxis tick={{ fill: '#94A3B8', fontSize: 10 }} stroke="#1F2937" />
                  <Tooltip {...tooltipStyle} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Line type="monotone" dataKey="dw" name="Deadweight"  stroke="#EF4444" strokeWidth={1.5} dot={false} />
                  <Line type="monotone" dataKey="at" name="Attribution" stroke="#F59E0B" strokeWidth={1.5} dot={false} />
                  <Line type="monotone" dataKey="dr" name="Drop-off"    stroke="#ED7D31" strokeWidth={1.5} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>
          <Card className="col-span-6" delay={0.45}>
            <h3 className="text-sm font-semibold mb-1">Comparación con benchmark</h3>
            <div className="text-[11px] mb-3" style={{ color: '#94A3B8' }}>Posición frente al rango sectorial · Arq. {project.archetype}</div>
            <div className="h-[230px]">
              <ResponsiveContainer>
                <BarChart data={benchmarkBars} layout="vertical">
                  <CartesianGrid strokeDasharray="2 4" stroke="#1F2937" horizontal={false} />
                  <XAxis type="number" tick={{ fill: '#94A3B8', fontSize: 10 }} stroke="#1F2937" />
                  <YAxis type="category" dataKey="name" tick={{ fill: '#F5F7FA', fontSize: 11 }} stroke="#1F2937" width={110} />
                  <Tooltip {...tooltipStyle} />
                  <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                    {benchmarkBars.map((b, i) => (
                      <Cell key={i} fill={b.name === project.id ? sroiColor(project.sroi) : '#5B9BD5'} fillOpacity={b.name === project.id ? 1 : 0.45} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>

        <Card delay={0.5}>
          <h3 className="text-sm font-semibold mb-3">Histórico SROI</h3>
          <div className="h-[200px]">
            <ResponsiveContainer>
              <AreaChart data={history}>
                <defs>
                  <linearGradient id="histGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={sroiColor(project.sroi)} stopOpacity={0.4} />
                    <stop offset="100%" stopColor={sroiColor(project.sroi)} stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="2 4" stroke="#1F2937" />
                <XAxis dataKey="year" tick={{ fill: '#94A3B8', fontSize: 10 }} stroke="#1F2937" />
                <YAxis tick={{ fill: '#94A3B8', fontSize: 10 }} stroke="#1F2937" />
                <Tooltip {...tooltipStyle} />
                <Area type="monotone" dataKey="sroi" stroke={sroiColor(project.sroi)} strokeWidth={2} fill="url(#histGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </motion.div>
  )
}
