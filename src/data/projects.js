// ============================================================
// DATOS DEL PORTAFOLIO XIGNUX — Modelo SROI v12.16 FASE2 FINAL
// Fuente autoritativa: Modelo_SROI_XIGNUX_v12.16_FASE2_FINAL.xlsx
// Hoja "Modelo" (resumen filas 86-100), "Intangibles", "Ajustes", "Acciones"
// ============================================================

export const ARCHETYPES = {
  A_STEM: { name: 'Educación STEM',            color: '#3B82F6', count: 2, benchmarkLow: 0.50, benchmarkMid: 1.50, benchmarkHigh: 3.00 },
  A:      { name: 'Educación y Emprendimiento', color: '#5B9BD5', count: 4, benchmarkLow: 0.50, benchmarkMid: 1.50, benchmarkHigh: 3.00 },
  B:      { name: 'Eventos Comunitarios',       color: '#ED7D31', count: 3, benchmarkLow: 0.30, benchmarkMid: 1.00, benchmarkHigh: 1.80 },
  C:      { name: 'Energía y Vivienda',         color: '#70AD47', count: 1, benchmarkLow: 1.50, benchmarkMid: 2.50, benchmarkHigh: 4.00 },
  D:      { name: 'Reforestación',              color: '#548235', count: 4, benchmarkLow: 0.80, benchmarkMid: 1.50, benchmarkHigh: 2.50 },
  E:      { name: 'Asistencia Alimentaria',     color: '#7F1D1D', count: 1, benchmarkLow: 2.00, benchmarkMid: 3.50, benchmarkHigh: 5.00 },
}

// FR = (1-DW) × (1-Attr) × (1-Disp) × (1-Drop)
export const ADJUSTMENTS = {
  A_STEM: { dw: 0.18, at: 0.32, dp: 0.05, dr: 0.25 }, // FR = 0.39729
  A:      { dw: 0.28, at: 0.32, dp: 0.05, dr: 0.25 }, // FR = 0.34884
  B:      { dw: 0.55, at: 0.28, dp: 0.05, dr: 0.50 }, // FR = 0.15390
  C:      { dw: 0.00, at: 0.18, dp: 0.05, dr: 0.05 }, // FR = 0.74005
  D:      { dw: 0.12, at: 0.42, dp: 0.10, dr: 0.20 }, // FR = 0.36749
  E:      { dw: 0.18, at: 0.22, dp: 0.12, dr: 0.00 }, // FR = 0.56285
}

const mkOutcomes = (rows) =>
  rows.map((r) => ({
    description: r[0], qty: r[1], proxy: r[2], pvFactor: r[3] || 1,
    unit: r[4] || 'MXN/unidad',
    gross: r[1] * r[2] * (r[3] || 1),
  }))

export const PROJECTS = [
  // ── P01 ──────────────────────────────────────────────────────────────────
  // v12.16: O1 "Mejora competencias técnicas" ELIMINADO (v12b). Proxy PX_RC=$4,000.
  {
    id: 'P01',
    name: 'Xignux Challenge (Tec)',
    archetype: 'A_STEM',
    investment: 1000000,
    sroi: 1.52408462,       // SROI Total (tang + intang)
    vBruto: 1308000,        // 4×150K + 177×4K
    vAjustado: 519655.32,   // VA Tangible — Modelo resumen fila 86
    vIntangible: 1004429.30,
    vTotal: 1524084.62,
    category: 'MEDIO',
    direct_beneficiaries: 1080,
    region: 'NL · MX',
    adjustments: ADJUSTMENTS.A_STEM,
    quadrant: 'SEMILLA',
    composite_score: 3.55,
    strategic_score: 4,
    data_quality: 4,
    scalability: 4,
    risk: 3,
    potential: 3,
    intangibles: { engage: 204429, brand: 400000, talent: 150000, slo: 0, innov: 250000, envCo: 0, resil: 0 },
    outcomes: mkOutcomes([
      // [ELIMINADO v12b] Mejora en competencias técnicas y profesionales (finalistas) → qty=0
      ['Incremento en adopción tecnológica por el mercado (proyectos ganadores)', 4, 150000, 1, 'MXN/proyecto'],
      ['Costo de reemplazo — diplomado innovación/design thinking evitado (decil superior 12%)', 177, 4000, 1, 'MXN/persona'],
    ]),
    stakeholders: ['54 finalistas', '1,026 no-finalistas', 'Tec de Monterrey', '4 proyectos ganadores'],
    strategic_action: 'REDISEÑAR — pivotar de evento a programa con seguimiento de carrera (becas integrales ~$15K MXN/cohorte)',
    strategic_partner: 'Tec de Monterrey + Endeavor MX',
  },

  // ── P02 ──────────────────────────────────────────────────────────────────
  {
    id: 'P02',
    name: 'Tiger Tank (UANL)',
    archetype: 'A_STEM',
    investment: 250000,
    sroi: 1.82323912,
    vBruto: 589500,         // 21×1.5K + 3×150K + 27×4K
    vAjustado: 234202.46,
    vIntangible: 221607.33,
    vTotal: 455809.78,
    category: 'MEDIO',
    direct_beneficiaries: 70,
    region: 'NL · MX',
    adjustments: ADJUSTMENTS.A_STEM,
    quadrant: 'ESTRELLA',
    composite_score: 3.45,
    strategic_score: 3,
    data_quality: 3,
    scalability: 4,
    risk: 3,
    potential: 3,
    intangibles: { engage: 51107, brand: 100000, talent: 10500, slo: 0, innov: 60000, envCo: 0, resil: 0 },
    outcomes: mkOutcomes([
      ['Mejora en capacidades de innovación (finalistas)', 21, 1500, 1, 'MXN/persona'],
      ['Incremento en adopción tecnológica por el mercado (proyectos ganadores)', 3, 150000, 1, 'MXN/proyecto'],
      ['Costo de reemplazo — diplomado innovación evitado (decil superior 12%)', 27, 4000, 1, 'MXN/persona'],
    ]),
    stakeholders: ['21 finalistas UANL', '49 participantes', '3 proyectos reconocidos'],
    strategic_action: 'MANTENER + INSTRUMENTAR — Tiger Tank: nicho universidad pública, tracking de egresados',
    strategic_partner: 'UANL',
  },

  // ── P03 ──────────────────────────────────────────────────────────────────
  {
    id: 'P03',
    name: 'Cátedra Jorge L. Garza (UDEM)',
    archetype: 'A',
    investment: 215000,
    sroi: 2.14191953,
    vBruto: 810000,         // 50×5K + 3×150K + 550×200
    vAjustado: 282560.40,
    vIntangible: 177952.30,
    vTotal: 460512.70,
    category: 'ALTO',
    direct_beneficiaries: 50,
    region: 'NL · MX',
    adjustments: ADJUSTMENTS.A,
    quadrant: 'ESTRELLA',
    composite_score: 3.55,
    strategic_score: 3,
    data_quality: 3,
    scalability: 3,
    risk: 4,
    potential: 4,
    intangibles: { engage: 43952, brand: 80000, talent: 54000, slo: 0, innov: 0, envCo: 0, resil: 0 },
    outcomes: mkOutcomes([
      ['Desarrollo de competencias académicas especializadas (estudiantes)', 50, 5000, 1, 'MXN/alumno'],
      ['Avance en conocimiento aplicado y adopción de investigación', 3, 150000, 1, 'MXN/proyecto'],
      ['Incremento en conocimiento académico (asistentes a eventos)', 550, 200, 1, 'MXN/asistente'],
    ]),
    stakeholders: ['50 estudiantes activos', '3 proyectos de investigación', '550 asistentes a eventos'],
    strategic_action: 'MANTENER — Cátedra UDEM: costo-eficiente, multiplicador documentado (550 asistentes)',
    strategic_partner: 'UDEM (lead) + XIGNUX (sponsor)',
  },

  // ── P04 ──────────────────────────────────────────────────────────────────
  // v12.16: proxy PX05 actualizado $150K→$100K (CONACYT/SECIHTI premios nacionales).
  // SROI Tang bajó de 0.58x a 0.40x. Legado fundacional — no tocar presupuesto.
  {
    id: 'P04',
    name: 'Premio Rómulo Garza',
    archetype: 'A',
    investment: 1050000,
    sroi: 0.70324985,       // SROI Total
    vBruto: 1199500,        // 11×100K + 11×5K + 63×1.5K - 50K
    vAjustado: 418433.58,
    vIntangible: 319978.77,
    vTotal: 738412.35,
    category: 'BAJO',
    direct_beneficiaries: 11,
    region: 'Nacional',
    adjustments: ADJUSTMENTS.A,
    quadrant: 'SEMILLA',
    composite_score: 3.10,
    strategic_score: 3,
    data_quality: 3,
    scalability: 3,
    risk: 3,
    potential: 4,
    intangibles: { engage: 214651, brand: 100000, talent: 5328, slo: 0, innov: 0, envCo: 0, resil: 0 },
    outcomes: mkOutcomes([
      ['Valor investigación premiada', 11, 100000, 1, 'MXN/investigación'],
      ['Difusión y apropiación del conocimiento por la comunidad académica', 11, 5000, 1, 'MXN/publicación'],
      ['Incremento en motivación y aspiración profesional (no premiados)', 63, 1500, 1, 'MXN/persona'],
      ['(NEGATIVO) Concentración de recursos', 1, -50000, 1, 'MXN'],
    ]),
    stakeholders: ['11 investigadores premiados', '63 no-premiados', 'Comunidad académica Tec'],
    strategic_action: 'REPLANTEAR KPIs (NO TOCAR) — LEGADO FUNDACIONAL 49 años. SROI 0.70x refleja medición pobre, no programa malo. Rediseñar outcome (transferencia tecnológica, IP industrial), no presupuesto.',
    strategic_partner: 'Tec de Monterrey + SECIHTI',
  },

  // ── P05 ──────────────────────────────────────────────────────────────────
  {
    id: 'P05',
    name: 'Premio Xignux–UDEM Energía',
    archetype: 'A',
    investment: 560000,
    sroi: 1.01486287,
    vBruto: 670000,         // 2×300K + 8×5K + 200×150
    vAjustado: 233722.80,
    vIntangible: 334600.41,
    vTotal: 568323.21,
    category: 'MEDIO',
    direct_beneficiaries: 210,
    region: 'NL · MX',
    adjustments: ADJUSTMENTS.A,
    quadrant: 'SEMILLA',
    composite_score: 3.30,
    strategic_score: 4,
    data_quality: 3,
    scalability: 3,
    risk: 3,
    potential: 4,
    intangibles: { engage: 114480, brand: 80000, talent: 15120, slo: 0, innov: 125000, envCo: 0, resil: 0 },
    outcomes: mkOutcomes([
      ['Avance en soluciones energéticas aplicables al mercado', 2, 300000, 1, 'MXN/proyecto'],
      ['Mejora en competencias de investigación energética (finalistas)', 8, 5000, 1, 'MXN/persona'],
      ['Incremento en conciencia sobre innovación energética (asistentes)', 200, 150, 1, 'MXN/persona'],
    ]),
    stakeholders: ['2 proyectos premiados', '8 finalistas', '200 asistentes', 'UDEM'],
    strategic_action: 'REVISAR — Premio UDEM Energía: 2 proyectos premiados a $560K = $280K/proyecto, costo alto para SROI marginal',
    strategic_partner: 'UDEM + sector energético',
  },

  // ── P06 ──────────────────────────────────────────────────────────────────
  // Nota v12.16: PX43 prevención riesgo sigue incluido pendiente revisión % participantes en riesgo real.
  {
    id: 'P06',
    name: 'Gamer con Causa',
    archetype: 'B',
    investment: 480000,
    sroi: 0.93046263,
    vBruto: 640000,         // 4×50K + 100×300 + 200×800 + 100×2.5K
    vAjustado: 98496,
    vIntangible: 348126.06,
    vTotal: 446622.06,
    category: 'BAJO',
    direct_beneficiaries: 404,
    region: 'NL / Digital',
    adjustments: ADJUSTMENTS.B,
    quadrant: 'REVISAR',
    composite_score: 2.30,
    strategic_score: 2,
    data_quality: 2,
    scalability: 3,
    risk: 2,
    potential: 3,
    intangibles: { engage: 98126, brand: 250000, talent: 0, slo: 0, innov: 0, envCo: 0, resil: 0 },
    outcomes: mkOutcomes([
      ['Fortalecimiento OSCs', 4, 50000, 1, 'MXN/OSC'],
      ['Desarrollo de conciencia social y compromiso cívico (gamers)', 100, 300, 1, 'MXN/persona'],
      ['Servicio social beneficiarios', 200, 800, 1, 'MXN/persona'],
      ['Prevención riesgo social juvenil (participantes activos)', 100, 2500, 1, 'MXN/persona'],
    ]),
    stakeholders: ['4 OSCs fortalecidas', '100 gamers', '200 personas beneficiadas'],
    strategic_action: 'PAUSAR / SUNSET ORDENADO — SROI Total <1.0, sin alineación estratégica clara con negocio Xignux',
    strategic_partner: 'OSCs beneficiarias (transición ordenada)',
  },

  // ── P07 ──────────────────────────────────────────────────────────────────
  // v12.16: proxy PX10 actualizado $150→$185/sesión (CIEP 2026 + IPC), Año 2 $120→$148.
  {
    id: 'P07',
    name: 'Red SumaRSE Nuevo León',
    archetype: 'A',
    investment: 250000,
    sroi: 3.83560994,
    vBruto: 1599000,        // 12×50K + 3000×185 + 3000×148
    vAjustado: 557795.16,
    vIntangible: 401107.33,
    vTotal: 958902.49,
    category: 'ALTO',
    direct_beneficiaries: 3000,
    region: 'NL · MX',
    adjustments: ADJUSTMENTS.A,
    quadrant: 'ESTRELLA',
    composite_score: 4.00,
    strategic_score: 4,
    data_quality: 4,
    scalability: 5,
    risk: 4,
    potential: 4,
    intangibles: { engage: 51107, brand: 200000, talent: 0, slo: 0, innov: 0, envCo: 0, resil: 150000 },
    outcomes: mkOutcomes([
      ['Mejora en competencias pedagógicas (maestros capacitados)', 12, 50000, 1, 'MXN/docente'],
      ['Enriquecimiento infantil Año 1', 3000, 185, 1, 'MXN/niño'],
      ['Enriquecimiento infantil Año 2 (80% retención)', 3000, 148, 1, 'MXN/niño'],
    ]),
    stakeholders: ['12 maestros capacitados', '~3,000 niños beneficiados', '12 escuelas Monterrey'],
    strategic_action: 'MANTENER + INSTRUMENTAR — SumaRSE: medir multiplicador real con escuelas, escalar a más estados',
    strategic_partner: 'Red SumaRSE + Mejora Tu Escuela',
  },

  // ── P08 ──────────────────────────────────────────────────────────────────
  // v12.16: O2 "Prevención riesgo social juvenil" ELIMINADO (v12b).
  // PX43 condicionado a '15-25 años zona riesgo'; población P08 son niños — mismatch de cohorte.
  {
    id: 'P08',
    name: 'Academia Exploradores Xignux',
    archetype: 'B',
    investment: 400000,
    sroi: 0.37094330,
    vBruto: 104000,         // 40×600 + 40×2000 (prevención eliminada)
    vAjustado: 16005.60,
    vIntangible: 132371.72,
    vTotal: 148377.32,
    category: 'BAJO',
    direct_beneficiaries: 40,
    region: 'NL · MX',
    adjustments: ADJUSTMENTS.B,
    quadrant: 'REVISAR',
    composite_score: 2.25,
    strategic_score: 2,
    data_quality: 3,
    scalability: 2,
    risk: 3,
    potential: 3,
    intangibles: { engage: 81772, brand: 50000, talent: 600, slo: 0, innov: 0, envCo: 0, resil: 0 },
    outcomes: mkOutcomes([
      ['Educación informal niños', 40, 600, 1, 'MXN/niño'],
      // [ELIMINADO v12b] Prevención riesgo social juvenil (niños activos) — mismatch cohorte
      ['Engagement familiar', 40, 2000, 1, 'MXN/familia'],
    ]),
    stakeholders: ['40 niños hijos de energizadores', '40 familias', 'Cerro Grande Natura'],
    strategic_action: 'PAUSAR / SUNSET ORDENADO — SROI 0.37x, $10K/niño insostenible. Evaluar fusión con Hub STEM Viakable.',
    strategic_partner: 'Fusionar con Hub STEM Viakable',
  },

  // ── P09 ──────────────────────────────────────────────────────────────────
  // v12.16: "Prevención riesgo social" ELIMINADO (v12.1, corredores adultos clase media ≠ PX43).
  // Proxy recreativo actualizado $300→$450 (Carrera Roshfrans Chapultepec oct-2025, Nivel 1 preferencia revelada).
  {
    id: 'P09',
    name: 'Carrera Xignux: Energiza la vida',
    archetype: 'B',
    investment: 350000,
    sroi: 1.29961149,
    vBruto: 541350,         // 1000×450 + 1000×100 + 50×(-173)
    vAjustado: 83313.77,
    vIntangible: 371550.26,
    vTotal: 454864.02,
    category: 'MEDIO',
    direct_beneficiaries: 1000,
    region: 'NL · MX',
    adjustments: ADJUSTMENTS.B,
    quadrant: 'REVISAR',
    composite_score: 2.95,
    strategic_score: 3,
    data_quality: 4,
    scalability: 3,
    risk: 3,
    potential: 2,
    intangibles: { engage: 71550, brand: 300000, talent: 0, slo: 0, innov: 0, envCo: 0, resil: 0 },
    outcomes: mkOutcomes([
      ['Valor recreativo corredores', 1000, 450, 1, 'MXN/persona'],
      // [ELIMINADO v12.1] Prevención riesgo social juvenil — NO aplica a adultos clase media
      ['Cohesión comunitaria', 1000, 100, 1, 'MXN/persona'],
      ['(NEGATIVO) Huella de carbono evento (~50 tCO₂e)', 50, -173, 1, 'MXN/tCO₂e'],
    ]),
    stakeholders: ['1,000+ corredores adultos', 'Familias', 'Sponsors', 'Comunidad Monterrey'],
    strategic_action: 'REDISEÑAR — Carrera: integrar plataforma wellness 365 días (Wellhub-like) para medir impacto continuo en salud',
    strategic_partner: 'Operación interna + plataforma wellness',
  },

  // ── P10 ──────────────────────────────────────────────────────────────────
  // v12.16: PX37 salud respiratoria $1,174→$1,298 (IMSS DOF dic-2025).
  // PX03 carbono $200→$150/tCO₂ (Ecosystem Marketplace SOVCM 2024-25).
  // Outcomes CO₂ y salud usan C_R (FR=0.779) por ahorro recurrente sin drop-off.
  {
    id: 'P10',
    name: 'Energía para Todos',
    archetype: 'C',
    investment: 2000000,
    sroi: 4.04211783,
    vBruto: 8458653,        // suma outcomes con PV (ver Modelo fila 42-47)
    vAjustado: 6591377.07,
    vIntangible: 1492858.60,
    vTotal: 8084235.67,
    category: 'ALTO',
    direct_beneficiaries: 418,
    region: 'NL rural — Linares, Montemorelos, China, Dr. Arroyo, Gral. Zuazua',
    adjustments: ADJUSTMENTS.C,
    quadrant: 'ESTRELLA',
    composite_score: 4.65,
    strategic_score: 5,
    data_quality: 4,
    scalability: 5,
    risk: 4,
    potential: 4,
    intangibles: { engage: 408859, brand: 250000, talent: 0, slo: 600000, innov: 0, envCo: 104000, resil: 130000 },
    outcomes: mkOutcomes([
      ['Ahorro energético hogares Tarifa 1 (10 años VPN, DO 5%)', 130, 2400, 5.12774, 'MXN/familia/año'],
      ['Reducción CO₂ (10 años VPN, $150/tCO₂ ANPs México)', 73, 150, 5.12774, 'MXN/tCO₂'],
      ['Mejora salud respiratoria (10 años VPN, IMSS $1,298/consulta)', 130, 1298, 5.12774, 'MXN/persona'],
      ['(NEGATIVO) Efecto rebote energético 10%', 1, -259478, 1, 'MXN'],
      ['Alivio carga energética (ingreso liberado)', 130, 1584, 1, 'MXN/hogar'],
      ['Ahorro erario público — subsidio CFE evitado ($7,500/hogar/año, 10 años VPN)', 130, 7500, 6.14457, 'MXN/hogar/año'],
    ]),
    stakeholders: ['130 viviendas', '418 personas', 'Ecosistema / CO₂', 'Erario público'],
    strategic_action: 'ESCALAR (FLAGSHIP) — Energía para Todos: doblar capital. Core business + 4 prioridades fundación + KPIs duros medibles',
    strategic_partner: 'Iluméxico (11K familias atendidas)',
  },

  // ── P11 ──────────────────────────────────────────────────────────────────
  // v12.16: PX03 carbono $200→$150/tCO₂; PX13 ecoturismo $200→$380 (CONANP costo de viaje);
  // PX39 i-Tree $85→$79 (USDA Forest Service Corvallis/Jiangsu confirmado).
  {
    id: 'P11',
    name: 'Reforestación Mariposa Monarca',
    archetype: 'D',
    investment: 200000,
    sroi: 6.84437659,
    vBruto: 2459181,        // suma outcomes con PV
    vAjustado: 1106510.46,
    vIntangible: 262364.86,
    vTotal: 1368875.32,
    category: 'ALTO',
    direct_beneficiaries: 0,
    region: 'Michoacán — Santuario Mariposa Monarca',
    adjustments: ADJUSTMENTS.D,
    quadrant: 'ESTRELLA',
    composite_score: 3.30,
    strategic_score: 3,
    data_quality: 3,
    scalability: 3,
    risk: 4,
    potential: 4,
    intangibles: { engage: 40886, brand: 60000, talent: 0, slo: 150000, innov: 0, envCo: 11479, resil: 0 },
    outcomes: mkOutcomes([
      ['Captura CO₂ forestal (10 años VPN, $150/tCO₂ ANPs)', 70, 150, 3.19534, 'MXN/tCO₂'],
      ['Ecoturismo (140 turistas atribuibles)', 140, 380, 1, 'MXN/visitante'],
      ['Biodiversidad (10,000 árboles × 7% atrib.)', 700, 50, 1, 'MXN/árbol'],
      ['Servicios hidrológicos i-Tree ($79/árbol)', 700, 79, 1, 'MXN/árbol'],
      ['Recarga hídrica (m³ agua infiltrada)', 5000, 18.9, 1, 'MXN/m³'],
      ['Retención suelo (m³ sedimento evitado)', 200, 69.3, 1, 'MXN/m³'],
      ['Restauración forestal evitada (9 ha × $63,715/ha ANPs)', 9, 63715, 3.79079, 'MXN/ha'],
    ]),
    stakeholders: ['Ecosistema Monarca', 'Ejidos locales', 'CPKC', 'Club Rotario', 'Turistas'],
    strategic_action: 'ESCALAR — Mariposa Monarca es flagship por SROI más alto del portafolio (6.84x); alianza CPKC+Rotario probada',
    strategic_partner: 'Pronatura + Reforestamos México + CPKC',
  },

  // ── P12 ──────────────────────────────────────────────────────────────────
  // v12.16: PX03 carbono $200→$150/tCO₂; PX39 i-Tree $100→$79 (USDA confirmado).
  {
    id: 'P12',
    name: 'Programa Adopta un Árbol',
    archetype: 'D',
    investment: 200000,
    sroi: 2.33421033,
    vBruto: 465227,         // 42×150×2.6551 + 100×600 + 4200×79 + 3000×18.9
    vAjustado: 172502.21,
    vIntangible: 294339.86,
    vTotal: 466842.07,
    category: 'ALTO',
    direct_beneficiaries: 0,
    region: 'NL · MX (comunidades Viakable)',
    adjustments: ADJUSTMENTS.D,
    quadrant: 'ESTRELLA',
    composite_score: 3.50,
    strategic_score: 3,
    data_quality: 2,
    scalability: 3,
    risk: 4,
    potential: 4,
    intangibles: { engage: 40886, brand: 80000, talent: 0, slo: 150000, innov: 0, envCo: 23454, resil: 0 },
    outcomes: mkOutcomes([
      ['Captura CO₂ urbano (5 años VPN, $150/tCO₂ ANPs)', 42, 150, 2.65512, 'MXN/tCO₂'],
      ['Voluntariado corporativo', 100, 600, 1, 'MXN/voluntario'],
      ['Servicios ecosistémicos urbanos i-Tree ($79/árbol)', 4200, 79, 1, 'MXN/árbol'],
      ['Recarga hídrica urbana', 3000, 18.9, 1, 'MXN/m³'],
    ]),
    stakeholders: ['Energizadores', 'Vecinos', 'Escuelas', 'Comunidades Viakable'],
    strategic_action: 'MANTENER + INSTRUMENTAR — Adopta un Árbol: alinear con comunidades Viakable, validar proxy i-Tree con datos locales',
    strategic_partner: 'Pronatura (consolidación con P11)',
  },

  // ── P13 ──────────────────────────────────────────────────────────────────
  // v12.16: PX03 carbono $200→$150/tCO₂; servicios ecosistémicos $50,000→$3,500 (PSA CONANP, más conservador).
  {
    id: 'P13',
    name: 'Alianza Parque Chipinque',
    archetype: 'D',
    investment: 700000,
    sroi: 2.51190789,
    vBruto: 2397215,        // suma outcomes con PV
    vAjustado: 991897.01,
    vIntangible: 766438.51,
    vTotal: 1758335.52,
    category: 'ALTO',
    direct_beneficiaries: 5000,
    region: 'NL · MX — Parque Chipinque',
    adjustments: ADJUSTMENTS.D,
    quadrant: 'OPORTUNIDAD',
    composite_score: 2.80,
    strategic_score: 3,
    data_quality: 2,
    scalability: 2,
    risk: 3,
    potential: 3,
    intangibles: { engage: 143101, brand: 120000, talent: 0, slo: 450000, innov: 0, envCo: 53338, resil: 0 },
    outcomes: mkOutcomes([
      ['Educación ambiental visitantes', 5000, 200, 1, 'MXN/visitante'],
      ['Captura CO₂ parque ($150/tCO₂ ANPs)', 1.435, 150, 1, 'MXN/tCO₂'],
      ['Servicios ecosistémicos conservación (PSA CONANP)', 1, 3500, 1, 'MXN'],
      ['Recarga hídrica Chipinque', 8000, 18.9, 1, 'MXN/m³'],
      ['Retención suelo Chipinque', 500, 69.3, 1, 'MXN/m³'],
      ['Restauración forestal evitada (5 ha × $63,715/ha ANPs)', 5, 63715, 3.79079, 'MXN/ha'],
    ]),
    stakeholders: ['5,000 visitantes educados', 'Comunidad Monterrey', 'Científicos ciudadanos', 'ZMM'],
    strategic_action: 'MANTENER — Chipinque: outcome de licencia social para operar en NL (SLO). Mejorar medición educación ambiental.',
    strategic_partner: 'Parque Chipinque (alianza activa)',
  },

  // ── P14 ──────────────────────────────────────────────────────────────────
  // v12.16: PX03 carbono $200→$150/tCO₂; voluntariado $150→$169/hr (SMG 2026 $315/día ÷ 8 × 4.3× calificación).
  {
    id: 'P14',
    name: 'Reforestación Tepotzotlán',
    archetype: 'D',
    investment: 650000,
    sroi: 1.86265870,
    vBruto: 1809238,        // suma outcomes con PV
    vAjustado: 776296.11,
    vIntangible: 434432.05,
    vTotal: 1210728.15,
    category: 'MEDIO',
    direct_beneficiaries: 270,
    region: 'Estado de México — Tepotzotlán',
    adjustments: ADJUSTMENTS.D,
    quadrant: 'REVISAR',
    composite_score: 2.25,
    strategic_score: 2,
    data_quality: 3,
    scalability: 2,
    risk: 3,
    potential: 3,
    intangibles: { engage: 132879, brand: 60000, talent: 0, slo: 225000, innov: 0, envCo: 16553, resil: 0 },
    outcomes: mkOutcomes([
      ['Captura CO₂ (5 años VPN, $150/tCO₂ ANPs)', 12.95, 150, 2.65512, 'MXN/tCO₂'],
      ['Voluntariado corporativo (2,160 horas × $169/hr SMG 2026)', 2160, 169, 1, 'MXN/hora'],
      ['Servicios ecosistémicos comunidad (bosque templado $135K/ha)', 1, 135000, 1, 'MXN'],
      ['Recarga hídrica', 4000, 18.9, 1, 'MXN/m³'],
      ['Retención suelo', 300, 69.3, 1, 'MXN/m³'],
      ['Restauración forestal evitada (5 ha × $63,715/ha ANPs)', 5, 63715, 3.79079, 'MXN/ha'],
    ]),
    stakeholders: ['270 voluntarios corporativos', 'Comunidad Tepotzotlán', 'Presa La Concepción'],
    strategic_action: 'REVISAR — Tepotzotlán: voluntariado corporativo OK pero outcome forestal débil. Evaluar insetting integrado en cadena de valor Viakable.',
    strategic_partner: 'Voluntarios Viakable → Insetting Viakable',
  },

  // ── P15 ──────────────────────────────────────────────────────────────────
  // v12.16: PX15 proxy alimentario $35→$52/porción (CONEVAL + precios minoristas Zwan/KIR/Caperucita 2025).
  // SROI total sube de 1.84x a 2.32x.
  {
    id: 'P15',
    name: 'Donativo de alimentos Qualtia',
    archetype: 'E',
    investment: 500000,
    sroi: 2.31632346,
    vBruto: 1343075,        // 25000×52 + 25×173 + 500×200 - 61250
    vAjustado: 755947.08,
    vIntangible: 402214.65,
    vTotal: 1158161.73,
    category: 'ALTO',
    direct_beneficiaries: 25000,
    region: 'Nacional — OSCs alimentarias',
    adjustments: ADJUSTMENTS.E,
    quadrant: 'ESTRELLA',
    composite_score: 4.05,
    strategic_score: 5,
    data_quality: 4,
    scalability: 5,
    risk: 4,
    potential: 3,
    intangibles: { engage: 102215, brand: 200000, talent: 0, slo: 0, innov: 0, envCo: 0, resil: 100000 },
    outcomes: mkOutcomes([
      ['Seguridad alimentaria (porciones)', 25000, 52, 1, 'MXN/porción'],
      ['Reducción residuos CO₂ ($10 USD/tCO₂)', 25, 173, 1, 'MXN/tCO₂'],
      ['Bienestar hogares', 500, 200, 1, 'MXN/hogar'],
      ['(NEGATIVO) Desplazamiento 7% comercio local', 1, -61250, 1, 'MXN'],
    ]),
    stakeholders: ['25,000 porciones/año', 'OSCs distribuidoras BAMX', 'Comunidades vulnerables'],
    strategic_action: 'MANTENER — Donativo Qualtia: alineado con core business nutrición. Ampliar volumen y certificar LGEC 2026.',
    strategic_partner: 'Red BAMX (53 bancos, +6M beneficiarios)',
  },
]
