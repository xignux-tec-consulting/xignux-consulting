const cardEntry = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
};

function Card({ children, className = "", style = {}, delay = 0 }) {
  return (
    <motion.div
      {...cardEntry}
      transition={{ duration: 0.4, delay, ease: "easeOut" }}
      whileHover={{ y: -3 }}
      className={`rounded-xl p-5 grad-border ${className}`}
      style={{ background: "rgba(19,25,41,0.8)", border: "1px solid rgba(255,255,255,0.05)", boxShadow: "0 4px 20px -8px rgba(0,0,0,0.4)", ...style }}
    >
      {children}
    </motion.div>
  );
}

const tooltipStyle = {
  contentStyle: { background: "#131929", border: "1px solid #1F2937", borderRadius: 8, fontSize: 12 },
  itemStyle: { color: "#F5F7FA" },
  labelStyle: { color: "#94A3B8" },
};

/* ============== PORTFOLIO DASHBOARD ============== */
function PortfolioDashboard({ projects, onOpenProject, onBackToGraph }) {
  const tot = portfolioTotals(projects);
  const [sortKey, setSortKey] = useState("sroi");
  const [sortDir, setSortDir] = useState("desc");
  const [filterArch, setFilterArch] = useState("ALL");

  const sortedProjects = useMemo(() => {
    let arr = [...projects];
    if (filterArch !== "ALL") arr = arr.filter(p => p.archetype === filterArch);
    arr.sort((a, b) => {
      const av = a[sortKey], bv = b[sortKey];
      if (typeof av === "string") return sortDir === "asc" ? av.localeCompare(bv) : bv.localeCompare(av);
      return sortDir === "asc" ? av - bv : bv - av;
    });
    return arr;
  }, [projects, sortKey, sortDir, filterArch]);

  const treemapData = useMemo(() => {
    return Object.entries(ARCHETYPES).map(([k, v]) => {
      const pp = projects.filter(p => p.archetype === k);
      if (!pp.length) return null;
      const inv = pp.reduce((a, p) => a + p.investment, 0);
      const adj = pp.reduce((a, p) => a + p.vAjustado, 0);
      const sroi = adj / inv;
      return { name: v.name, size: inv, sroi, color: sroiColor(sroi), arch: k, count: pp.length };
    }).filter(Boolean);
  }, [projects]);

  const top5 = useMemo(() => [...projects].sort((a, b) => b.sroi - a.sroi).slice(0, 5), [projects]);
  const distData = [
    { name: "Alto", value: tot.dist.ALTO || 0, color: "#10B981" },
    { name: "Medio", value: tot.dist.MEDIO || 0, color: "#F59E0B" },
    { name: "Bajo", value: tot.dist.BAJO || 0, color: "#EF4444" },
  ];

  return (
    <div className="absolute inset-0 overflow-y-auto">
      <div className="max-w-[1400px] mx-auto px-8 py-8">
        {/* header */}
        <motion.header
          animate={{ opacity: 1, y: 0 }}
          className="flex items-end justify-between mb-8"
        >
          <div>
            <div className="text-[10px] mono uppercase tracking-[0.2em]" style={{ color: "#94A3B8" }}>Portafolio · 2024</div>
            <h1 className="text-3xl font-semibold mt-1">Resumen de impacto social</h1>
            <div className="text-sm mt-1" style={{ color: "#94A3B8" }}>
              {tot.count} iniciativas · {fmtMXNFull(tot.inv)} inversión · SROI <span className="mono" style={{ color: sroiColor(tot.sroi) }}>{tot.sroi.toFixed(2)}x</span>
            </div>
          </div>
          <button
            onClick={onBackToGraph}
            className="text-xs px-3 py-2 rounded-lg flex items-center gap-1.5 hover:bg-white/5 transition"
            style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
          >
            <Network className="w-3.5 h-3.5" /> Volver al grafo
          </button>
        </motion.header>

        {/* KPI strip */}
        <div className="grid grid-cols-12 gap-4 mb-4">
          <Card className="col-span-3" delay={0.05}>
            <div className="text-[10px] mono uppercase tracking-wider" style={{ color: "#94A3B8" }}>SROI Portafolio</div>
            <div className="text-3xl font-semibold mt-1 mono" style={{ color: sroiColor(tot.sroi) }}>{tot.sroi.toFixed(2)}x</div>
            <div className="h-8 mt-2">
              <ResponsiveContainer>
                <LineChart data={[{x:0,y:0.78},{x:1,y:0.91},{x:2,y:0.86},{x:3,y:1.02},{x:4,y:tot.sroi}]}>
                  <RLine dataKey="y" stroke="#5B9BD5" strokeWidth={1.5} dot={false} type="monotone" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>
          <Card className="col-span-3" delay={0.1}>
            <div className="text-[10px] mono uppercase tracking-wider" style={{ color: "#94A3B8" }}>Inversión total</div>
            <div className="text-3xl font-semibold mt-1 mono">{fmtMXN(tot.inv)}</div>
            <div className="text-[11px] mt-1.5" style={{ color: "#94A3B8" }}>MXN · 2024</div>
          </Card>
          <Card className="col-span-3" delay={0.15}>
            <div className="text-[10px] mono uppercase tracking-wider" style={{ color: "#94A3B8" }}>Valor social ajustado</div>
            <div className="text-3xl font-semibold mt-1 mono">{fmtMXN(tot.adj)}</div>
            <div className="text-[11px] mt-1.5" style={{ color: "#10B981" }}>+{((tot.adj - tot.inv) / tot.inv * 100).toFixed(0)}% vs inversión</div>
          </Card>
          <Card className="col-span-3" delay={0.2}>
            <div className="text-[10px] mono uppercase tracking-wider" style={{ color: "#94A3B8" }}>Distribución</div>
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
                {distData.map(d => (
                  <div key={d.name} className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full" style={{background:d.color}} />{d.name}</span>
                    <span className="mono">{d.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>

        {/* Row 2 */}
        <div className="grid grid-cols-12 gap-4 mb-4">
          <Card className="col-span-8" delay={0.25}>
            <div className="flex justify-between items-baseline mb-3">
              <h3 className="text-sm font-semibold">Portafolio por arquetipo</h3>
              <div className="text-[10px] mono" style={{ color: "#94A3B8" }}>área = inversión · color = SROI</div>
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
                <button
                  key={p.id}
                  onClick={() => onOpenProject(p.id)}
                  className="w-full text-left group"
                >
                  <div className="flex justify-between items-center text-xs mb-1">
                    <span className="flex items-center gap-2">
                      <span className="mono w-4 text-[10px]" style={{ color: "#94A3B8" }}>{i + 1}</span>
                      <span className="group-hover:text-[#5B9BD5] transition">{p.id} · {p.name.length > 22 ? p.name.slice(0,21)+"…" : p.name}</span>
                    </span>
                    <span className="mono" style={{ color: sroiColor(p.sroi) }}>{p.sroi.toFixed(2)}x</span>
                  </div>
                  <div className="h-1 rounded-full overflow-hidden" style={{ background: "#1F2937" }}>
                    <div className="h-full rounded-full" style={{ width: `${Math.min(100, p.sroi/3.5*100)}%`, background: sroiColor(p.sroi) }} />
                  </div>
                </button>
              ))}
            </div>
          </Card>
        </div>

        {/* Row 3 - ranking */}
        <Card delay={0.35}>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold">Ranking completo</h3>
            <div className="flex items-center gap-2">
              <Filter className="w-3.5 h-3.5" style={{ color: "#94A3B8" }} />
              <select
                value={filterArch}
                onChange={(e) => setFilterArch(e.target.value)}
                className="text-[11px] mono px-2 py-1 rounded outline-none"
                style={{ background: "#1a2236", border: "1px solid #1F2937", color: "#F5F7FA" }}
              >
                <option value="ALL">Todos los arquetipos</option>
                {Object.entries(ARCHETYPES).map(([k, v]) => <option key={k} value={k}>{k} · {v.name}</option>)}
              </select>
            </div>
          </div>
          <table className="w-full text-xs">
            <thead>
              <tr style={{ color: "#94A3B8" }}>
                {[
                  { k: "id", l: "ID" }, { k: "name", l: "Proyecto" }, { k: "archetype", l: "Arq." },
                  { k: "investment", l: "Inversión" }, { k: "vAjustado", l: "Valor ajust." },
                  { k: "sroi", l: "SROI" }, { k: "category", l: "Categoría" },
                ].map((h) => (
                  <th
                    key={h.k}
                    onClick={() => { setSortKey(h.k); setSortDir(sortDir === "asc" ? "desc" : "asc"); }}
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
                  style={{ borderTop: "1px solid #1F2937" }}
                  onMouseEnter={(e) => e.currentTarget.style.background = "rgba(46,117,182,0.06)"}
                  onMouseLeave={(e) => e.currentTarget.style.background = ""}
                >
                  <td className="py-2.5 px-2 mono" style={{ color: "#94A3B8" }}>{p.id}</td>
                  <td className="py-2.5 px-2">{p.name}</td>
                  <td className="py-2.5 px-2">
                    <span className="mono text-[10px] px-1.5 py-0.5 rounded" style={{ background: ARCHETYPES[p.archetype].color + "33", color: ARCHETYPES[p.archetype].color }}>
                      {p.archetype}
                    </span>
                  </td>
                  <td className="py-2.5 px-2 mono">{fmtMXN(p.investment)}</td>
                  <td className="py-2.5 px-2 mono">{fmtMXN(p.vAjustado)}</td>
                  <td className="py-2.5 px-2 mono font-semibold" style={{ color: sroiColor(p.sroi) }}>{p.sroi.toFixed(2)}x</td>
                  <td className="py-2.5 px-2">
                    <span className="text-[10px] mono px-1.5 py-0.5 rounded" style={{ background: sroiColor(p.sroi) + "22", color: sroiColor(p.sroi) }}>
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
  );
}

function TreemapCell({ x, y, width, height, name, size, sroi, color, count }) {
  if (width < 30 || height < 20) return null;
  return (
    <g>
      <rect x={x} y={y} width={width} height={height} fill={color} fillOpacity={0.18} stroke={color} strokeWidth={1} />
      <rect x={x} y={y} width={width} height={4} fill={color} />
      {width > 70 && height > 50 && (
        <>
          <text x={x + 10} y={y + 22} fill="#F5F7FA" fontSize={11} fontWeight={500}>{name}</text>
          <text x={x + 10} y={y + 38} fill="#94A3B8" fontSize={10} fontFamily="monospace">{count} proyectos</text>
          <text x={x + 10} y={y + height - 10} fill={color} fontSize={14} fontWeight={600} fontFamily="monospace">{sroi.toFixed(2)}x</text>
        </>
      )}
    </g>
  );
}

/* ============== PROJECT DASHBOARD (drill-down) ============== */
function ProjectDashboard({ project, projects, onBack, onOpenProject }) {
  const arch = ARCHETYPES[project.archetype];
  const history = HISTORY_BY_PROJECT(project.id, project.sroi);

  // sensitivity: vary one adjustment from 0..0.6 and recompute
  const sensitivityData = useMemo(() => {
    const points = [];
    for (let pct = 0; pct <= 60; pct += 5) {
      const f = pct / 100;
      const baseFactor = (1 - project.adjustments.dp) * (1 - project.adjustments.dr);
      const dwSroi = (project.vBruto * (1 - f) * (1 - project.adjustments.at) * baseFactor) / project.investment;
      const atSroi = (project.vBruto * (1 - project.adjustments.dw) * (1 - f) * baseFactor) / project.investment;
      const drSroi = (project.vBruto * (1 - project.adjustments.dw) * (1 - project.adjustments.at) * (1 - project.adjustments.dp) * (1 - f)) / project.investment;
      points.push({ pct, dw: +dwSroi.toFixed(2), at: +atSroi.toFixed(2), dr: +drSroi.toFixed(2) });
    }
    return points;
  }, [project]);

  const benchmarkBars = [
    { name: "Mín. sector", value: arch.benchmark * 0.5 },
    { name: "Promedio sector", value: arch.benchmark },
    { name: "Máx. sector", value: arch.benchmark * 2.0 },
    { name: project.id, value: project.sroi },
  ];

  const stakeholderData = project.stakeholders.map((s, i) => ({
    name: s, value: 100 / project.stakeholders.length + (i % 2 === 0 ? 5 : -5),
  }));
  const stakeholderColors = ["#5B9BD5", "#ED7D31", "#10B981", "#F59E0B", "#A78BFA"];

  return (
    <motion.div
      animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
      className="absolute inset-0 overflow-y-auto z-40"
      style={{ background: "rgba(10,14,26,0.97)" }}
    >
      <div className="max-w-[1400px] mx-auto px-8 py-8">
        <motion.header animate={{ opacity: 1, y: 0 }} className="mb-6">
          <div className="flex items-center gap-2 text-[11px] mono mb-2" style={{ color: "#94A3B8" }}>
            <button onClick={onBack} className="hover:text-white transition flex items-center gap-1">
              <ArrowLeft className="w-3 h-3" /> Volver al grafo
            </button>
            <span>/</span>
            <span>Portafolio</span>
            <span>/</span>
            <span style={{ color: arch.color }}>Arq. {project.archetype}</span>
            <span>/</span>
            <span style={{ color: "#F5F7FA" }}>{project.id}</span>
          </div>
          <div className="flex items-end justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] mono px-2 py-1 rounded" style={{ background: arch.color + "33", color: arch.color, border: `1px solid ${arch.color}55` }}>
                  {project.id} · ARQ {project.archetype}
                </span>
                <span className="text-[10px] mono px-2 py-1 rounded" style={{ background: sroiColor(project.sroi) + "22", color: sroiColor(project.sroi), border: `1px solid ${sroiColor(project.sroi)}55` }}>
                  {project.category}
                </span>
                <span className="text-[10px] mono" style={{ color: "#94A3B8" }}>{project.region}</span>
              </div>
              <h1 className="text-3xl font-semibold mt-2">{project.name}</h1>
              <div className="text-sm mt-1" style={{ color: "#94A3B8" }}>{arch.name}</div>
            </div>
          </div>
        </motion.header>

        {/* KPI cards */}
        <div className="grid grid-cols-12 gap-4 mb-4">
          {[
            { l: "Inversión", v: fmtMXN(project.investment), sub: "MXN · 2024" },
            { l: "SROI", v: project.sroi.toFixed(2) + "x", color: sroiColor(project.sroi), sub: "Valor / Inversión" },
            { l: "Beneficiarios directos", v: project.direct_beneficiaries.toLocaleString("es-MX"), sub: "personas" },
            { l: "Valor social ajustado", v: fmtMXN(project.vAjustado), sub: `${(project.vAjustado/project.vBruto*100).toFixed(0)}% del bruto` },
          ].map((k, i) => (
            <Card key={k.l} className="col-span-3" delay={0.05 * (i + 1)}>
              <div className="text-[10px] mono uppercase tracking-wider" style={{ color: "#94A3B8" }}>{k.l}</div>
              <div className="text-3xl font-semibold mt-1 mono" style={{ color: k.color || "#F5F7FA" }}>{k.v}</div>
              <div className="text-[11px] mt-1.5" style={{ color: "#94A3B8" }}>{k.sub}</div>
            </Card>
          ))}
        </div>

        {/* Row 1 */}
        <div className="grid grid-cols-12 gap-4 mb-4">
          <Card className="col-span-8" delay={0.3}>
            <h3 className="text-sm font-semibold mb-3">Outcomes y proxies</h3>
            <table className="w-full text-xs">
              <thead style={{ color: "#94A3B8" }}>
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
                  const total = project.outcomes.reduce((a, x) => a + x.gross, 0);
                  const pct = (o.gross / total) * 100;
                  return (
                    <tr key={i} style={{ borderTop: "1px solid #1F2937" }}>
                      <td className="py-2.5">{o.description}</td>
                      <td className="text-right py-2.5 mono">{o.qty.toLocaleString("es-MX")}</td>
                      <td className="text-right py-2.5 mono">{fmtMXN(o.proxy)}</td>
                      <td className="text-right py-2.5 mono font-semibold">{fmtMXN(o.gross)}</td>
                      <td className="py-2.5 pl-3">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-1 rounded overflow-hidden" style={{ background: "#1F2937" }}>
                            <div className="h-full rounded" style={{ width: `${pct}%`, background: "linear-gradient(90deg,#2E75B6,#5B9BD5)" }} />
                          </div>
                          <span className="mono text-[10px] w-10 text-right" style={{ color: "#94A3B8" }}>{pct.toFixed(0)}%</span>
                        </div>
                      </td>
                    </tr>
                  );
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
                  <span style={{ color: "#94A3B8" }}>{d.name}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Row 2 */}
        <div className="grid grid-cols-12 gap-4 mb-4">
          <Card className="col-span-6" delay={0.4}>
            <h3 className="text-sm font-semibold mb-1">Sensibilidad de SROI</h3>
            <div className="text-[11px] mb-3" style={{ color: "#94A3B8" }}>Cómo varía el SROI al mover cada ajuste</div>
            <div className="h-[230px]">
              <ResponsiveContainer>
                <LineChart data={sensitivityData}>
                  <CartesianGrid strokeDasharray="2 4" stroke="#1F2937" />
                  <XAxis dataKey="pct" tick={{ fill: "#94A3B8", fontSize: 10 }} unit="%" stroke="#1F2937" />
                  <YAxis tick={{ fill: "#94A3B8", fontSize: 10 }} stroke="#1F2937" />
                  <Tooltip {...tooltipStyle} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <RLine type="monotone" dataKey="dw" name="Deadweight" stroke="#EF4444" strokeWidth={1.5} dot={false} />
                  <RLine type="monotone" dataKey="at" name="Attribution" stroke="#F59E0B" strokeWidth={1.5} dot={false} />
                  <RLine type="monotone" dataKey="dr" name="Drop-off" stroke="#ED7D31" strokeWidth={1.5} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>
          <Card className="col-span-6" delay={0.45}>
            <h3 className="text-sm font-semibold mb-1">Comparación con benchmark</h3>
            <div className="text-[11px] mb-3" style={{ color: "#94A3B8" }}>Posición frente al rango sectorial · Arq. {project.archetype}</div>
            <div className="h-[230px]">
              <ResponsiveContainer>
                <BarChart data={benchmarkBars} layout="vertical">
                  <CartesianGrid strokeDasharray="2 4" stroke="#1F2937" horizontal={false} />
                  <XAxis type="number" tick={{ fill: "#94A3B8", fontSize: 10 }} stroke="#1F2937" />
                  <YAxis type="category" dataKey="name" tick={{ fill: "#F5F7FA", fontSize: 11 }} stroke="#1F2937" width={110} />
                  <Tooltip {...tooltipStyle} />
                  <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                    {benchmarkBars.map((b, i) => (
                      <Cell key={i} fill={b.name === project.id ? sroiColor(project.sroi) : "#5B9BD5"} fillOpacity={b.name === project.id ? 1 : 0.45} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>

        {/* Row 3 - history */}
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
                <XAxis dataKey="year" tick={{ fill: "#94A3B8", fontSize: 10 }} stroke="#1F2937" />
                <YAxis tick={{ fill: "#94A3B8", fontSize: 10 }} stroke="#1F2937" />
                <Tooltip {...tooltipStyle} />
                <Area type="monotone" dataKey="sroi" stroke={sroiColor(project.sroi)} strokeWidth={2} fill="url(#histGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </motion.div>
  );
}
