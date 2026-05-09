import { ARCHETYPES } from '../../data/projects'
import { portfolioTotals, recomputeProject, fmtMXN, fmtMXNFull, sroiColor } from '../../lib/sroi'

function archStats(projects) {
  const byArch = {}
  projects.forEach((p) => {
    const a = (byArch[p.archetype] = byArch[p.archetype] || { inv: 0, adj: 0, bruto: 0, n: 0, benef: 0 })
    a.inv += p.investment; a.adj += p.vTotal; a.bruto += p.vBruto; a.n += 1; a.benef += p.direct_beneficiaries
  })
  return byArch
}

export function simulate(text, projects, selectedId) {
  const t = text.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
  const tot = portfolioTotals(projects)
  const sorted = [...projects].sort((a, b) => b.sroi - a.sroi)
  const top = sorted[0], worst = sorted[sorted.length - 1]

  // ── Specific project query: "datos de P01", "cuéntame de P03", "info P05" ──
  const projectMatch = t.match(/(?:datos|info|cuentame|dime|detalle|resumen)\s*(?:de(?:l)?\s+)?(p\d{2})/i) ||
    t.match(/(p\d{2})\s*(?:datos|info|detalle|resumen)/i)
  if (projectMatch) {
    const id = (projectMatch[1] || projectMatch[2]).toUpperCase()
    const p = projects.find((x) => x.id === id)
    if (p) {
      const arch = ARCHETYPES[p.archetype]
      return [{
        role: 'bot',
        content: `${p.id} ${p.name}\n\nArquetipo ${p.archetype} (${arch.name}). Inversión: ${fmtMXNFull(p.investment)}. SROI: ${p.sroi.toFixed(2)}x (${p.category}). Genera ${fmtMXNFull(p.vTotal)} de valor social total a ${p.direct_beneficiaries.toLocaleString('es-MX')} beneficiarios directos.\n\nFactores de ajuste: DW ${Math.round(p.adjustments.dw * 100)}%, AT ${Math.round(p.adjustments.at * 100)}%, DP ${Math.round(p.adjustments.dp * 100)}%, DR ${Math.round(p.adjustments.dr * 100)}%.`,
        actions: [
          { label: `Ver dashboard ${p.id}`, primary: true, payload: { kind: 'openDash', id: p.id } },
        ],
      }]
    }
  }

  // ── Top SROI ──
  if (/(mayor|top|mejor|alto)\s*(sroi|proyecto|rendimiento)?|top 3 sroi/.test(t) && !t.includes('compara')) {
    const top3 = sorted.slice(0, 3)
    return [{
      role: 'bot',
      content: `Tu top de SROI lo lidera ${top.id} ${top.name} con SROI ${top.sroi.toFixed(2)}x. Genera ${fmtMXNFull(top.vTotal)} de valor social total contra ${fmtMXNFull(top.investment)} de inversión.`,
      table: {
        headers: ['#', 'ID', 'SROI', 'Inversión'],
        rows: top3.map((p, i) => [
          (i + 1).toString(), p.id,
          { text: p.sroi.toFixed(2) + 'x', color: sroiColor(p.sroi) },
          fmtMXN(p.investment),
        ]),
      },
      actions: [{ label: `Ver ${top.id}`, primary: true, payload: { kind: 'openDash', id: top.id } }],
    }]
  }

  // ── Worst / Risks ──
  if (/(menor|peor|bajo)\s*(sroi|proyecto)?|riesgo|riesgos/.test(t) && !t.includes('compara')) {
    if (/riesgo/.test(t)) {
      const concentration = top.investment / tot.inv
      return [{
        role: 'bot',
        content: `Identifico 3 riesgos en tu portafolio:\n\n  1. Concentración en ${top.id}: representa el ${(concentration * 100).toFixed(0)}% de la inversión total.\n  2. Fragmentación en reforestación: 4 proyectos del arquetipo D con SROI promedio 1.56x. Podrían consolidarse vía insetting para mejorar eficiencia.\n  3. Eventos comunitarios (arquetipo B): FR bajo (0.15) por DW 55% y Drop 50%. Intangibles (marca, engagement) compensan parcialmente.`,
      }]
    }
    const bottom3 = sorted.slice(-3).reverse()
    return [{
      role: 'bot',
      content: `Los 3 proyectos con menor SROI:`,
      table: {
        headers: ['ID', 'Proyecto', 'SROI', 'Categoría'],
        rows: bottom3.map((p) => [
          p.id, p.name.length > 25 ? p.name.slice(0, 24) + '…' : p.name,
          { text: p.sroi.toFixed(2) + 'x', color: sroiColor(p.sroi) },
          p.category,
        ]),
      },
      actions: [{ label: `Ver ${worst.id}`, primary: true, payload: { kind: 'openDash', id: worst.id } }],
    }]
  }

  // ── Compare two projects ──
  const compareMatch =
    t.match(/compara\s+(p\d{2}).{0,5}?(p\d{2})/i) ||
    t.match(/(p\d{2}).{0,5}?vs.{0,5}?(p\d{2})/i)
  if (compareMatch) {
    const a = projects.find((p) => p.id === compareMatch[1].toUpperCase())
    const b = projects.find((p) => p.id === compareMatch[2].toUpperCase())
    if (a && b) {
      const winner = a.sroi > b.sroi ? a : b
      return [{
        role: 'bot',
        content: `Comparativo ${a.id} vs ${b.id}:`,
        table: {
          headers: ['Métrica', a.id, b.id],
          rows: [
            ['SROI', { text: a.sroi.toFixed(2) + 'x', color: sroiColor(a.sroi) }, { text: b.sroi.toFixed(2) + 'x', color: sroiColor(b.sroi) }],
            ['Inversión', fmtMXN(a.investment), fmtMXN(b.investment)],
            ['Valor total', fmtMXN(a.vTotal), fmtMXN(b.vTotal)],
            ['Beneficiarios', a.direct_beneficiaries.toLocaleString('es-MX'), b.direct_beneficiaries.toLocaleString('es-MX')],
            ['Arquetipo', ARCHETYPES[a.archetype].name, ARCHETYPES[b.archetype].name],
          ],
        },
        actions: [
          { label: `Ver ${a.id}`, payload: { kind: 'openDash', id: a.id } },
          { label: `Ver ${b.id}`, primary: true, payload: { kind: 'openDash', id: b.id } },
        ],
      }]
    }
  }

  // ── Investment by category / archetype ──
  if (/inversion\s*(por|de)\s*(categor|arquetipo|tipo)|cuanto\s*(inviert|gast).*(categor|arquetipo)|distribucion.*inversion/.test(t)) {
    const byArch = archStats(projects)
    return [{
      role: 'bot',
      content: `Distribución de inversión por arquetipo (total: ${fmtMXNFull(tot.inv)}):`,
      table: {
        headers: ['Arq', 'Nombre', 'Inversión', '% del total', 'SROI'],
        rows: Object.entries(byArch).map(([k, v]) => {
          const sroi = v.adj / v.inv
          return [
            k,
            ARCHETYPES[k].name.length > 18 ? ARCHETYPES[k].name.slice(0, 17) + '…' : ARCHETYPES[k].name,
            fmtMXN(v.inv),
            (v.inv / tot.inv * 100).toFixed(0) + '%',
            { text: sroi.toFixed(2) + 'x', color: sroiColor(sroi) },
          ]
        }),
      },
    }]
  }

  // ── What to scale ──
  if (/que\s*(proyecto|programa)?\s*(escalar|crecer|expandir|ampliar)|donde\s*(escalar|crecer)|escalar/.test(t)) {
    const scalable = sorted.filter((p) => p.sroi >= 1 && p.scalability >= 4).slice(0, 3)
    if (scalable.length === 0) {
      return [{ role: 'bot', content: 'Actualmente ningún proyecto combina SROI ≥1x con alta escalabilidad. Recomiendo primero mejorar la eficiencia de los proyectos de mayor SROI antes de escalar.' }]
    }
    return [{
      role: 'bot',
      content: `Proyectos con mayor potencial de escalamiento (SROI ≥1x + alta escalabilidad):`,
      table: {
        headers: ['ID', 'Proyecto', 'SROI', 'Escalab.'],
        rows: scalable.map((p) => [
          p.id,
          p.name.length > 22 ? p.name.slice(0, 21) + '…' : p.name,
          { text: p.sroi.toFixed(2) + 'x', color: sroiColor(p.sroi) },
          '★'.repeat(p.scalability),
        ]),
      },
      actions: [{ label: `Ver ${scalable[0].id}`, primary: true, payload: { kind: 'openDash', id: scalable[0].id } }],
    }]
  }

  // ── Where to invest additional budget ──
  if (/donde\s*invertir|presupuesto\s*(adicional|extra)|mas\s*inversion|reasignar|redirigir/.test(t)) {
    const efficient = sorted.filter((p) => p.sroi >= 1).slice(0, 3)
    return [{
      role: 'bot',
      content: `Para maximizar impacto con presupuesto adicional, recomiendo:\n\n  1. ${efficient[0]?.id || 'N/A'} — SROI ${efficient[0]?.sroi.toFixed(2)}x, cada peso adicional genera alto retorno social.\n  2. Consolidar reforestación (Arq. D): fusionar proyectos pequeños para economías de escala.\n  3. Redirigir de eventos comunitarios (Arq. B, SROI <0.25x) hacia proyectos de energía y vivienda (Arq. C).`,
      actions: efficient[0] ? [{ label: `Ver ${efficient[0].id}`, primary: true, payload: { kind: 'openDash', id: efficient[0].id } }] : [],
    }]
  }

  // ── What to reevaluate / discontinue ──
  if (/reevaluar|eliminar|discontinuar|quitar|que\s*proyectos?\s*(revisar|evaluar)|baja\s*prioridad/.test(t)) {
    const lowPerf = projects.filter((p) => p.sroi < 0.5 && p.quadrant === 'REVISAR')
    if (lowPerf.length === 0) {
      return [{ role: 'bot', content: 'No hay proyectos en cuadrante REVISAR con SROI <0.5x actualmente. El portafolio está relativamente equilibrado.' }]
    }
    return [{
      role: 'bot',
      content: `Proyectos a reevaluar (SROI <0.5x + cuadrante REVISAR):`,
      table: {
        headers: ['ID', 'Proyecto', 'SROI', 'Inversión'],
        rows: lowPerf.map((p) => [
          p.id,
          p.name.length > 22 ? p.name.slice(0, 21) + '…' : p.name,
          { text: p.sroi.toFixed(2) + 'x', color: sroiColor(p.sroi) },
          fmtMXN(p.investment),
        ]),
      },
      actions: lowPerf[0] ? [{ label: `Ver ${lowPerf[0].id}`, primary: true, payload: { kind: 'openDash', id: lowPerf[0].id } }] : [],
    }]
  }

  // ── Efficiency by investment / cost-benefit ──
  if (/eficiencia|costo.beneficio|costo.*efectiv|rendimiento.*inversion|valor.*peso/.test(t)) {
    const byEfficiency = [...projects].sort((a, b) => (b.vTotal / b.investment) - (a.vTotal / a.investment)).slice(0, 5)
    return [{
      role: 'bot',
      content: `Top 5 por eficiencia (valor total por peso invertido):`,
      table: {
        headers: ['ID', 'Proyecto', 'SROI', '$/$ invertido'],
        rows: byEfficiency.map((p) => [
          p.id,
          p.name.length > 20 ? p.name.slice(0, 19) + '…' : p.name,
          { text: p.sroi.toFixed(2) + 'x', color: sroiColor(p.sroi) },
          '$' + p.sroi.toFixed(2),
        ]),
      },
      actions: [{ label: `Ver ${byEfficiency[0].id}`, primary: true, payload: { kind: 'openDash', id: byEfficiency[0].id } }],
    }]
  }

  // ── What is SROI ──
  if (/que\s*(es|significa)\s*sroi|sroi\s*que\s*(es|significa)|explicame\s*sroi|define\s*sroi/.test(t)) {
    return [{
      role: 'bot',
      content: `**SROI (Social Return on Investment)** mide cuánto valor social genera cada peso invertido.\n\nFórmula: SROI = Valor Social Ajustado ÷ Inversión Total\n\nInterpretación:\n  • SROI 2.0x → por cada $1 invertido, se generan $2 de valor social\n  • SROI 1.0x → punto de equilibrio social\n  • SROI <1.0x → el valor social medible es menor que la inversión\n\nTu portafolio tiene SROI ${tot.sroi.toFixed(2)}x. El valor se ajusta con 4 factores: deadweight, attribution, displacement y drop-off.`,
    }]
  }

  // ── What is deadweight ──
  if (/que\s*(es|significa)\s*deadweight|explicame\s*deadweight|deadweight/.test(t) && !/sube|baja|modifica|cambia|p\d{2}/.test(t)) {
    return [{
      role: 'bot',
      content: `**Deadweight** mide qué porcentaje del resultado habría ocurrido sin tu intervención.\n\nEjemplo: si plantas 100 árboles pero el municipio iba a plantar 30 de todos modos, tu deadweight es 30%. Se descuenta del valor bruto.\n\nUn deadweight alto (>40%) indica que el proyecto compite con iniciativas que ya existen. Un deadweight bajo (<15%) sugiere que tu intervención es realmente única.`,
    }]
  }

  // ── What is attribution ──
  if (/que\s*(es|significa)\s*attribution|explicame\s*attribution|attribution/.test(t) && !/sube|baja|modifica|cambia|p\d{2}/.test(t)) {
    return [{
      role: 'bot',
      content: `**Attribution** mide qué porcentaje del resultado se debe a otros actores además de ti.\n\nEjemplo: si un estudiante consigue empleo tras tu programa de formación, pero también asistió a otros cursos, la attribution descuenta la porción atribuible a esos otros programas.\n\nAttribution alto (>30%) indica que hay co-inversores o programas paralelos. No es necesariamente malo — puede indicar un ecosistema saludable.`,
    }]
  }

  // ── What is displacement ──
  if (/que\s*(es|significa)\s*displacement|explicame\s*displacement|displacement/.test(t) && !/sube|baja|modifica|cambia|p\d{2}/.test(t)) {
    return [{
      role: 'bot',
      content: `**Displacement** mide si tu intervención desplaza un problema en vez de resolverlo.\n\nEjemplo: si reubicas comercio informal de una calle, pero se mueven a otra, el displacement es alto. Estás moviendo el problema, no eliminándolo.\n\nDisplacement alto (>10%) es una señal de alerta: indica que el impacto neto podría ser menor al medido.`,
    }]
  }

  // ── What is drop-off ──
  if (/que\s*(es|significa)\s*(drop.?off|dropoff)|explicame\s*(drop.?off|dropoff)|drop.?off/.test(t) && !/sube|baja|modifica|cambia|p\d{2}/.test(t)) {
    return [{
      role: 'bot',
      content: `**Drop-off** mide cuánto se deteriora el impacto con el tiempo.\n\nEjemplo: si capacitas a 100 personas pero al año siguiente solo 80 siguen usando esas habilidades, tu drop-off es 20%.\n\nDrop-off alto (>25%) indica que el impacto es temporal. Para reducirlo, considera programas de seguimiento o modelos de refuerzo.`,
    }]
  }

  // ── Why does a project have low/high SROI ──
  const whyMatch = t.match(/por\s*que\s*(p\d{2}).*(bajo|alto|poco|mucho|buen|mal)/i) ||
    t.match(/por\s*que.*(bajo|alto).*(p\d{2})/i) ||
    t.match(/(p\d{2}).*(por\s*que.*(bajo|alto|poco))/i)
  if (whyMatch) {
    const idMatch = t.match(/p\d{2}/i)
    if (idMatch) {
      const p = projects.find((x) => x.id === idMatch[0].toUpperCase())
      if (p) {
        const totalAdj = 1 - ((1 - p.adjustments.dw) * (1 - p.adjustments.at) * (1 - p.adjustments.dp) * (1 - p.adjustments.dr))
        const highestAdj = Object.entries(p.adjustments).sort((a, b) => b[1] - a[1])[0]
        const adjNames = { dw: 'Deadweight', at: 'Attribution', dp: 'Displacement', dr: 'Drop-off' }
        if (p.sroi < 1) {
          return [{
            role: 'bot',
            content: `${p.id} ${p.name} tiene SROI ${p.sroi.toFixed(2)}x (bajo) por estas razones:\n\n  1. Ajuste combinado de −${Math.round(totalAdj * 100)}%: el factor más alto es ${adjNames[highestAdj[0]]} (${Math.round(highestAdj[1] * 100)}%).\n  2. Relación inversión/outcomes: invierte ${fmtMXNFull(p.investment)} pero genera ${fmtMXNFull(p.vBruto)} de valor bruto.\n  3. Su valor total es ${fmtMXNFull(p.vTotal)}, un ${Math.round((p.vTotal / p.investment) * 100)}% de la inversión.\n\nPara mejorarlo: reducir ${adjNames[highestAdj[0]]} mediante alianzas estratégicas o reformular los outcomes.`,
            actions: [{ label: `Ver dashboard ${p.id}`, primary: true, payload: { kind: 'openDash', id: p.id } }],
          }]
        } else {
          return [{
            role: 'bot',
            content: `${p.id} ${p.name} tiene SROI ${p.sroi.toFixed(2)}x (${p.category}) porque:\n\n  1. Genera ${fmtMXNFull(p.vBruto)} de valor bruto con solo ${fmtMXNFull(p.investment)} de inversión.\n  2. Sus ajustes combinados son moderados (−${Math.round(totalAdj * 100)}%), conservando ${Math.round((1 - totalAdj) * 100)}% del valor.\n  3. Tiene ${p.direct_beneficiaries.toLocaleString('es-MX')} beneficiarios directos con proxies bien valorados.`,
            actions: [{ label: `Ver dashboard ${p.id}`, primary: true, payload: { kind: 'openDash', id: p.id } }],
          }]
        }
      }
    }
  }

  // ── Beneficiary stats ──
  if (/beneficiar|cuantas?\s*personas|alcance|impacto\s*(total|directo)/.test(t)) {
    const totalBenef = projects.reduce((a, p) => a + p.direct_beneficiaries, 0)
    const topBenef = [...projects].sort((a, b) => b.direct_beneficiaries - a.direct_beneficiaries).slice(0, 3)
    return [{
      role: 'bot',
      content: `El portafolio alcanza ${totalBenef.toLocaleString('es-MX')} beneficiarios directos en total.`,
      table: {
        headers: ['ID', 'Proyecto', 'Beneficiarios'],
        rows: topBenef.map((p) => [
          p.id,
          p.name.length > 22 ? p.name.slice(0, 21) + '…' : p.name,
          p.direct_beneficiaries.toLocaleString('es-MX'),
        ]),
      },
    }]
  }

  // ── How many low ──
  if (/(cuantos|cuantas).+(bajo|rojo)/.test(t)) {
    const low = projects.filter((p) => p.category === 'BAJO')
    return [{
      role: 'bot',
      content: `${low.length} de los ${projects.length} proyectos están en categoría BAJO (SROI <1x). Es esperable: eventos comunitarios y educación de cohorte amplia tienden a tener SROI bajo medible.`,
      actions: [{ label: 'Ver lista', payload: { kind: 'openDash', id: low[0].id } }],
    }]
  }

  // ── Optimization ──
  if (/optimi|recomenda|como\s*optimizo|como\s*mejoro|mejorar\s*(el\s*)?portafolio/.test(t)) {
    return [{
      role: 'bot',
      content: `5 acciones para subir tu SROI de ${tot.sroi.toFixed(2)}x:\n\n  1. Escalar P10 Energía para Todos — replicar en más comunidades con Iluméxico.\n  2. Consolidar reforestación: fusionar P12+P14 bajo insetting Viakable.\n  3. Redirigir presupuesto de P06 ($480K, SROI ${projects.find(p=>p.id==='P06')?.sroi.toFixed(2)||'0.21'}x) hacia P07 SumaRSE.\n  4. Rediseñar P08 ($400K, SROI ${projects.find(p=>p.id==='P08')?.sroi.toFixed(2)||'0.08'}x) — buscar escala o Hub STEM.\n  5. Ampliar P15 con Red BAMX + economía circular Qualtia.\n\n¿Quieres que aplique estas recomendaciones al modelo?`,
      actions: [
        { label: 'Aplicar todo', primary: true, payload: { kind: 'applyOpt' } },
        { label: 'Cancelar', payload: { kind: 'cancel' } },
      ],
    }]
  }

  // ── Compare archetypes ──
  if (/comparar?\s*arquetipos?|arquetipos?/.test(t)) {
    const byArch = archStats(projects)
    return [{
      role: 'bot',
      content: 'Comparativo por arquetipo:',
      table: {
        headers: ['Arq', 'Nombre', 'n', 'Inversión', 'SROI'],
        rows: Object.entries(byArch).map(([k, v]) => {
          const sroi = v.adj / v.inv
          const name = ARCHETYPES[k].name
          return [
            k,
            name.length > 18 ? name.slice(0, 17) + '…' : name,
            v.n.toString(),
            fmtMXN(v.inv),
            { text: sroi.toFixed(2) + 'x', color: sroiColor(sroi) },
          ]
        }),
      },
    }]
  }

  // ── Modify adjustment ──
  const modMatch =
    t.match(/(deadweight|attribution|displacement|drop.?off|dropoff)\s+(?:de\s+)?(p\d{2})\s+(?:a\s+)?(\d{1,3})\s*%?/i) ||
    t.match(/(p\d{2})\s+(deadweight|attribution|displacement|drop.?off|dropoff)\s+(?:a\s+)?(\d{1,3})/i) ||
    t.match(/sube.+(deadweight|attribution|displacement|drop.?off|dropoff).+(p\d{2}).+(\d{1,3})/i) ||
    t.match(/baja.+(deadweight|attribution|displacement|drop.?off|dropoff).+(p\d{2}).+(\d{1,3})/i) ||
    t.match(/cambia.+(deadweight|attribution|displacement|drop.?off|dropoff).+(p\d{2}).+(\d{1,3})/i) ||
    t.match(/modifica.+(deadweight|attribution|displacement|drop.?off|dropoff).+(p\d{2}).+(\d{1,3})/i)
  if (modMatch) {
    let key, id, pct
    if (/p\d{2}/i.test(modMatch[1])) { id = modMatch[1].toUpperCase(); key = modMatch[2]; pct = modMatch[3] }
    else { key = modMatch[1]; id = modMatch[2].toUpperCase(); pct = modMatch[3] }
    const map = { deadweight: 'dw', attribution: 'at', displacement: 'dp', dropoff: 'dr', 'drop-off': 'dr', 'drop off': 'dr' }
    const k = map[key.toLowerCase().replace(/-/g, '')] || map[key.toLowerCase()]
    const proj = projects.find((p) => p.id === id)
    if (proj && k) {
      const newAdj = { [k]: Math.min(0.95, parseInt(pct) / 100) }
      const after = recomputeProject(proj, newAdj)
      return [{
        role: 'bot',
        content: `Aplicando ${key}=${pct}% al proyecto ${id} ${proj.name}. Esto cambiaría su SROI de ${proj.sroi.toFixed(2)}x a ${after.sroi.toFixed(2)}x. ¿Confirmas?`,
        actions: [
          { label: 'Confirmar', primary: true, payload: { kind: 'applyAdj', id, adj: newAdj } },
          { label: 'Cancelar', payload: { kind: 'cancel' } },
        ],
      }]
    }
  }

  // ── Portfolio summary ──
  if (/portafolio|resumen\s*(general|total)|vision\s*general|overview/.test(t)) {
    const totalBenef = projects.reduce((a, p) => a + p.direct_beneficiaries, 0)
    return [{
      role: 'bot',
      content: `Resumen del portafolio XIGNUX:\n\n  • ${projects.length} proyectos activos en 6 arquetipos\n  • Inversión total: ${fmtMXNFull(tot.inv)}\n  • SROI portafolio: ${tot.sroi.toFixed(2)}x (tangible + intangible)\n  • Valor social total: ${fmtMXNFull(tot.adj)}\n  • Beneficiarios directos: ${totalBenef.toLocaleString('es-MX')}\n  • Distribución: ${tot.dist.ALTO || 0} ALTO, ${tot.dist.MEDIO || 0} MEDIO, ${tot.dist.BAJO || 0} BAJO`,
    }]
  }

  // ── Fallback ──
  return [{
    role: 'bot',
    content: 'Puedo ayudarte con:\n\n  • Consultar datos: "Top 3 SROI", "Datos de P01", "Beneficiarios totales"\n  • Comparar: "Compara P01 vs P03", "Comparar arquetipos", "Eficiencia por inversión"\n  • Estrategia: "Qué proyectos escalar", "Dónde invertir más", "Qué reevaluar"\n  • Explicar: "Qué es SROI", "Qué es deadweight", "Por qué P01 tiene bajo SROI"\n  • Modificar: "Deadweight de P03 a 40%"\n\n¿Qué quieres explorar?',
  }]
}
