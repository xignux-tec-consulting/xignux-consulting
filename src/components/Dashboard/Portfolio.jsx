import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Network, Filter, ArrowUpDown } from 'lucide-react'
import {
  ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell,
  Treemap,
} from 'recharts'
import { ARCHETYPES } from '../../data/projects'
import { portfolioTotals, fmtMXN, fmtMXNFull, sroiColor } from '../../lib/sroi'

const cardEntry = { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 } }

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

function TreemapCell({ x, y, width, height, name, size, sroi, color, count }) {
  if (width < 30 || height < 20) return null
  return (
    <g>
      <rect x={x} y={y} width={width} height={height} fill={color} fillOpacity={0.18} stroke={color} strokeWidth={1} />
      <rect x={x} y={y} width={width} height={4} fill={color} />
      {width > 70 && height > 50 && (
        <>
          <text x={x + 10} y={y + 22} fill="#F5F7FA" fontSize={11} fontWeight={500}>{name}</text>
          <text x={x + 10} y={y + 38} fill="#94A3B8" fontSize={10} fontFamily="monospace">{count} proyectos</text>
          <text x={x + 10} y={y + height - 10} fill={color} fontSize={14} fontWeight={600} fontFamily="monospace">{sroi?.toFixed(2)}x</text>
        </>
      )}
    </g>
  )
}

export default function PortfolioDashboard({ projects, onOpenProject, onBackToGraph }) {
  const tot = portfolioTotals(projects)
  const [sortKey, setSortKey] = useState('sroi')
  const [sortDir, setSortDir] = useState('desc')
  const [filterArch, setFilterArch] = useState('ALL')

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

  const treemapData = useMemo(() =>
    Object.entries(ARCHETYPES).map(([k, v]) => {
      const pp = projects.filter((p) => p.archetype === k)
      if (!pp.length) return null
      const inv = pp.reduce((a, p) => a + p.investment, 0)
      const adj = pp.reduce((a, p) => a + p.vAjustado, 0)
      const sroi = adj / inv
      return { name: v.name, size: inv, sroi, color: sroiColor(sroi), arch: k, count: pp.length }
    }).filter(Boolean),
  [projects])

  const top5 = useMemo(() => [...projects].sort((a, b) => b.sroi - a.sroi).slice(0, 5), [projects])
  const distData = [
    { name: 'Alto',  value: tot.dist.ALTO  || 0, color: '#10B981' },
    { name: 'Medio', value: tot.dist.MEDIO || 0, color: '#F59E0B' },
    { name: 'Bajo',  value: tot.dist.BAJO  || 0, color: '#EF4444' },
  ]

  const toggleSort = (key) => {
    if (sortKey === key) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    else { setSortKey(key); setSortDir('desc') }
  }

  return (
    <div className="absolute inset-0 overflow-y-auto">
      <div className="max-w-[1400px] mx-auto px-8 py-8">
        <motion.header animate={{ opacity: 1, y: 0 }} className="flex items-end justify-between mb-8">
          <div>
            <div className="text-[10px] mono uppercase tracking-[0.2em]" style={{ color: '#94A3B8' }}>Portafolio · 2024</div>
            <h1 className="text-3xl font-semibold mt-1">Resumen de impacto social</h1>
            <div className="text-sm mt-1" style={{ color: '#94A3B8' }}>
              {tot.count} iniciativas · {fmtMXNFull(tot.inv)} inversión · SROI{' '}
              <span className="mono" style={{ color: sroiColor(tot.sroi) }}>{tot.sroi.toFixed(2)}x</span>
            </div>
          </div>
          <button
            onClick={onBackToGraph}
            className="text-xs px-3 py-2 rounded-lg flex items-center gap-1.5 hover:bg-white/5 transition"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
          >
            <Network className="w-3.5 h-3.5" /> Volver al grafo
          </button>
        </motion.header>

        <div className="grid grid-cols-12 gap-4 mb-4">
          <Card className="col-span-3" delay={0.05}>
            <div className="text-[10px] mono uppercase tracking-wider" style={{ color: '#94A3B8' }}>SROI Portafolio</div>
            <div className="text-3xl font-semibold mt-1 mono" style={{ color: sroiColor(tot.sroi) }}>{tot.sroi.toFixed(2)}x</div>
            <div className="h-8 mt-2">
              <ResponsiveContainer>
                <LineChart data={[{x:0,y:0.78},{x:1,y:0.91},{x:2,y:0.86},{x:3,y:1.02},{x:4,y:tot.sroi}]}>
                  <Line dataKey="y" stroke="#5B9BD5" strokeWidth={1.5} dot={false} type="monotone" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>
          <Card className="col-span-3" delay={0.1}>
            <div className="text-[10px] mono uppercase tracking-wider" style={{ color: '#94A3B8' }}>Inversión total</div>
            <div className="text-3xl font-semibold mt-1 mono">{fmtMXN(tot.inv)}</div>
            <div className="text-[11px] mt-1.5" style={{ color: '#94A3B8' }}>MXN · 2024</div>
          </Card>
          <Card className="col-span-3" delay={0.15}>
            <div className="text-[10px] mono uppercase tracking-wider" style={{ color: '#94A3B8' }}>Valor social ajustado</div>
            <div className="text-3xl font-semibold mt-1 mono">{fmtMXN(tot.adj)}</div>
            <div className="text-[11px] mt-1.5" style={{ color: '#10B981' }}>
              +{((tot.adj - tot.inv) / tot.inv * 100).toFixed(0)}% vs inversión
            </div>
          </Card>
          <Card className="col-span-3" delay={0.2}>
            <div className="text-[10px] mono uppercase tracking-wider" style={{ color: '#94A3B8' }}>Distribución</div>
            <div className="flex items-center gap-3 mt-1">
              <div className="w-16 h-16">
                <ResponsiveContainer>
                  <PieChart>
                    <Pie data={distData} dataKey="value" innerRadius={20} outerRadius={30} strokeWidth={0}>
                      {distData.map((d, i) => <Cell key={i} fill={d.color} />)}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex-1 space-y-1 text-[11px]">
                {distData.map((d) => (
                  <div key={d.name} className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full" style={{ background: d.color }} />{d.name}
                    </span>
                    <span className="mono">{d.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-12 gap-4 mb-4">
          <Card className="col-span-8" delay={0.25}>
            <div className="flex justify-between items-baseline mb-3">
              <h3 className="text-sm font-semibold">Portafolio por arquetipo</h3>
              <div className="text-[10px] mono" style={{ color: '#94A3B8' }}>área = inversión · color = SROI</div>
            </div>
            <div className="h-[220px]">
              <ResponsiveContainer>
                <Treemap data={treemapData} dataKey="size" stroke="#0A0E1A" content={<TreemapCell />} />
              </ResponsiveContainer>
            </div>
          </Card>
          <Card className="col-span-4" delay={0.3}>
            <h3 className="text-sm font-semibold mb-3">Top 5 SROI</h3>
            <div className="space-y-2.5">
              {top5.map((p, i) => (
                <button key={p.id} onClick={() => onOpenProject(p.id)} className="w-full text-left group">
                  <div className="flex justify-between items-center text-xs mb-1">
                    <span className="flex items-center gap-2">
                      <span className="mono w-4 text-[10px]" style={{ color: '#94A3B8' }}>{i + 1}</span>
                      <span className="group-hover:text-[#5B9BD5] transition">
                        {p.id} · {p.name.length > 22 ? p.name.slice(0, 21) + '…' : p.name}
                      </span>
                    </span>
                    <span className="mono" style={{ color: sroiColor(p.sroi) }}>{p.sroi.toFixed(2)}x</span>
                  </div>
                  <div className="h-1 rounded-full overflow-hidden" style={{ background: '#1F2937' }}>
                    <div className="h-full rounded-full" style={{ width: `${Math.min(100, p.sroi / 3.5 * 100)}%`, background: sroiColor(p.sroi) }} />
                  </div>
                </button>
              ))}
            </div>
          </Card>
        </div>

        <Card delay={0.35}>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold">Ranking completo</h3>
            <div className="flex items-center gap-2">
              <Filter className="w-3.5 h-3.5" style={{ color: '#94A3B8' }} />
              <select
                value={filterArch}
                onChange={(e) => setFilterArch(e.target.value)}
                className="text-[11px] mono px-2 py-1 rounded outline-none"
                style={{ background: '#1a2236', border: '1px solid #1F2937', color: '#F5F7FA' }}
              >
                <option value="ALL">Todos los arquetipos</option>
                {Object.entries(ARCHETYPES).map(([k, v]) => (
                  <option key={k} value={k}>{k} · {v.name}</option>
                ))}
              </select>
            </div>
          </div>
          <table className="w-full text-xs">
            <thead>
              <tr style={{ color: '#94A3B8' }}>
                {[
                  { k: 'id', l: 'ID' }, { k: 'name', l: 'Proyecto' }, { k: 'archetype', l: 'Arq.' },
                  { k: 'investment', l: 'Inversión' }, { k: 'vAjustado', l: 'Valor ajust.' },
                  { k: 'sroi', l: 'SROI' }, { k: 'category', l: 'Categoría' },
                ].map((h) => (
                  <th
                    key={h.k}
                    onClick={() => toggleSort(h.k)}
                    className="text-left py-2 px-2 font-medium cursor-pointer hover:text-white transition select-none"
                  >
                    <span className="inline-flex items-center gap-1">{h.l} <ArrowUpDown className="w-3 h-3 opacity-50" /></span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sortedProjects.map((p) => (
                <tr
                  key={p.id}
                  onClick={() => onOpenProject(p.id)}
                  className="cursor-pointer transition"
                  style={{ borderTop: '1px solid #1F2937' }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(46,117,182,0.06)')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = '')}
                >
                  <td className="py-2.5 px-2 mono" style={{ color: '#94A3B8' }}>{p.id}</td>
                  <td className="py-2.5 px-2">{p.name}</td>
                  <td className="py-2.5 px-2">
                    <span className="mono text-[10px] px-1.5 py-0.5 rounded" style={{ background: ARCHETYPES[p.archetype].color + '33', color: ARCHETYPES[p.archetype].color }}>
                      {p.archetype}
                    </span>
                  </td>
                  <td className="py-2.5 px-2 mono">{fmtMXN(p.investment)}</td>
                  <td className="py-2.5 px-2 mono">{fmtMXN(p.vAjustado)}</td>
                  <td className="py-2.5 px-2 mono font-semibold" style={{ color: sroiColor(p.sroi) }}>{p.sroi.toFixed(2)}x</td>
                  <td className="py-2.5 px-2">
                    <span className="text-[10px] mono px-1.5 py-0.5 rounded" style={{ background: sroiColor(p.sroi) + '22', color: sroiColor(p.sroi) }}>
                      {p.category}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </div>
    </div>
  )
}
