import { ARCHETYPES } from '../../data/projects'
import { portfolioTotals, recomputeProject, fmtMXN, fmtMXNFull, sroiColor } from '../../lib/sroi'

export function simulate(text, projects, selectedId) {
  const t = text.toLowerCase()
  const tot = portfolioTotals(projects)
  const sorted = [...projects].sort((a, b) => b.sroi - a.sroi)
  const top = sorted[0], worst = sorted[sorted.length - 1]

  if (/(mayor|top|mejor|alto)\s*(sroi|proyecto|rendimiento)?|top 3 sroi/.test(t) && !t.includes('compara')) {
    const top3 = sorted.slice(0, 3)
    return [{
      role: 'bot',
      content: `Tu top de SROI lo lidera ${top.id} ${top.name} con SROI ${top.sroi.toFixed(2)}x. Genera ${fmtMXNFull(top.vAjustado)} de valor social ajustado contra ${fmtMXNFull(top.investment)} de inversión.`,
      table: {
        headers: ['#', 'ID', 'SROI', 'Inversión'],
        rows: top3.map((p, i) => [
          (i + 1).toString(), p.id,
          { text: p.sroi.toFixed(2) + 'x', color: sroiColor(p.sroi) },
          fmtMXN(p.investment),
        ]),
      },
      actions: [{ label: `Abrir ${top.id}`, primary: true, payload: { kind: 'open', id: top.id } }],
    }]
  }

  if (/(menor|peor|bajo)\s*(sroi|proyecto)?|riesgo|riesgos/.test(t) && !t.includes('compara')) {
    if (/riesgo/.test(t)) {
      const concentration = top.investment / tot.inv
      return [{
        role: 'bot',
        content: `Identifico 3 riesgos en tu portafolio:\n\n  1. Concentración en ${top.id}: representa el ${(concentration * 100).toFixed(0)}% de la inversión total.\n  2. Fragmentación en reforestación: 4 proyectos del arquetipo D con SROI promedio bajo. Convendría consolidar.\n  3. Eventos comunitarios (arquetipo B) con SROI <0.25x — el formato actual no genera valor medible.`,
      }]
    }
    return [{
      role: 'bot',
      content: `${worst.id} ${worst.name} es el de menor SROI: ${worst.sroi.toFixed(2)}x. Esto sugiere revisar el modelo de outcomes o considerar redirigir la inversión.`,
      actions: [{ label: `Abrir ${worst.id}`, primary: true, payload: { kind: 'open', id: worst.id } }],
    }]
  }

  const compareMatch =
    t.match(/compara\s+(p\d{2}).{0,5}?(p\d{2})/i) ||
    t.match(/(p\d{2}).{0,5}?vs.{0,5}?(p\d{2})/i)
  if (compareMatch) {
    const a = projects.find((p) => p.id === compareMatch[1].toUpperCase())
    const b = projects.find((p) => p.id === compareMatch[2].toUpperCase())
    if (a && b) {
      return [{
        role: 'bot',
        content: `Comparativo ${a.id} vs ${b.id}:`,
        table: {
          headers: ['Métrica', a.id, b.id],
          rows: [
            ['SROI', { text: a.sroi.toFixed(2) + 'x', color: sroiColor(a.sroi) }, { text: b.sroi.toFixed(2) + 'x', color: sroiColor(b.sroi) }],
            ['Inversión', fmtMXN(a.investment), fmtMXN(b.investment)],
            ['Valor ajust.', fmtMXN(a.vAjustado), fmtMXN(b.vAjustado)],
            ['Beneficiarios', a.direct_beneficiaries.toLocaleString('es-MX'), b.direct_beneficiaries.toLocaleString('es-MX')],
            ['Arquetipo', a.archetype, b.archetype],
          ],
        },
        actions: [
          { label: `Abrir ${a.id}`, payload: { kind: 'open', id: a.id } },
          { label: `Abrir ${b.id}`, primary: true, payload: { kind: 'open', id: b.id } },
        ],
      }]
    }
  }

  if (/(cuántos|cuantos).+(bajo|rojo)/.test(t)) {
    const low = projects.filter((p) => p.category === 'BAJO')
    return [{
      role: 'bot',
      content: `${low.length} de los ${projects.length} proyectos están en categoría BAJO (SROI <1x). Es esperable: eventos comunitarios y educación de cohorte amplia tienden a tener SROI bajo medible.`,
      actions: [{ label: 'Ver lista', payload: { kind: 'open', id: low[0].id } }],
    }]
  }

  if (/optimi|recomenda|cómo optimizo|como optimizo/.test(t)) {
    return [{
      role: 'bot',
      content: `5 acciones para subir tu SROI portafolio de ${tot.sroi.toFixed(2)}x a ~1.45x:\n\n  1. Aliarse con operador especializado para ${top.id} (reduce deadweight 10%→5%).\n  2. Consolidar reforestación: fusionar P12+P14 con P11.\n  3. Migrar P15 a un canal con menor displacement.\n  4. Discontinuar P08 — SROI 0.01x sin tracción.\n  5. Reasignar 30% del presupuesto de eventos comunitarios a P10.\n\n¿Quieres que aplique estas recomendaciones al modelo?`,
      actions: [
        { label: 'Aplicar todo', primary: true, payload: { kind: 'applyOpt' } },
        { label: 'Cancelar', payload: { kind: 'cancel' } },
      ],
    }]
  }

  if (/comparar arquetipos|arquetipo/.test(t)) {
    const byArch = {}
    projects.forEach((p) => {
      const a = (byArch[p.archetype] = byArch[p.archetype] || { inv: 0, adj: 0, n: 0 })
      a.inv += p.investment; a.adj += p.vAjustado; a.n += 1
    })
    return [{
      role: 'bot',
      content: 'Comparativo por arquetipo:',
      table: {
        headers: ['Arq', 'Nombre', 'n', 'SROI prom.'],
        rows: Object.entries(byArch).map(([k, v]) => {
          const sroi = v.adj / v.inv
          const name = ARCHETYPES[k].name
          return [
            k,
            name.length > 18 ? name.slice(0, 17) + '…' : name,
            v.n.toString(),
            { text: sroi.toFixed(2) + 'x', color: sroiColor(sroi) },
          ]
        }),
      },
    }]
  }

  const modMatch =
    t.match(/(deadweight|attribution|displacement|drop.?off|dropoff)\s+(?:de\s+)?(p\d{2})\s+(?:a\s+)?(\d{1,3})\s*%?/i) ||
    t.match(/(p\d{2})\s+(deadweight|attribution|displacement|drop.?off|dropoff)\s+(?:a\s+)?(\d{1,3})/i) ||
    t.match(/sube.+(deadweight|attribution|displacement|drop.?off|dropoff).+(p\d{2}).+(\d{1,3})/i)
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
        content: `Aplicando ${key}=${pct}% al proyecto ${id} ${proj.name}. Esto cambiaría su SROI de ${proj.sroi.toFixed(2)}x a aproximadamente ${after.sroi.toFixed(2)}x. ¿Confirmas?`,
        actions: [
          { label: 'Confirmar', primary: true, payload: { kind: 'applyAdj', id, adj: newAdj } },
          { label: 'Cancelar', payload: { kind: 'cancel' } },
        ],
      }]
    }
  }

  if (/qu[eé] es deadweight|expl[íi]came (deadweight|attribution|displacement|drop)/.test(t)) {
    return [{
      role: 'bot',
      content: `**Deadweight** mide qué tanto del outcome habría ocurrido sin tu intervención. Si plantas 100 árboles pero el municipio iba a plantar 30 de todos modos, tu deadweight es 30%. Se descuenta del valor bruto.`,
    }]
  }

  return [{
    role: 'bot',
    content: 'Aún no sé responder eso, pero puedo ayudarte con: comparar proyectos, sugerir optimizaciones, modificar parámetros, o explicar conceptos del modelo. ¿Por dónde quieres empezar?',
  }]
}
