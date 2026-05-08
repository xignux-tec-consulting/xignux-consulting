export const CAUSA_RAIZ = [
  { id: 1, driver: 'Factores de Retención (FR) conservadores', peso: 'ALTO',
    explicacion: 'FR va de 0.2668 (Arq. B Eventos) a 0.6808 (Arq. C Energía). Para A, B y D, >65% del valor bruto se descuenta. Calibrado con Krlev et al. 2013 (114 estudios SROI).',
    implicacion: 'Con FR uniforme de 0.40, el # de proyectos >1.0x baja de 4 a 3 — la variación refleja diferencias reales.' },
  { id: 2, driver: 'Dificultad estructural de monetización (B, D)', peso: 'ALTO',
    explicacion: 'Eventos generan bienestar subjetivo. Reforestación usa proxy carbono $10 USD/tCO₂ ($173 MXN) vs EPA $190 USD/tCO₂. Estos sectores tienen los outcomes más difíciles de monetizar.',
    implicacion: 'No es un defecto del modelo — es una limitación inherente del SROI para estos sectores.' },
  { id: 3, driver: 'Reducción del proxy de carbono ($465→$173 MXN/tCO₂)', peso: 'MEDIO-ALTO',
    explicacion: 'Reducción del 62.8%. Impacta directamente P11-P14 (reforestación). Usamos mercado voluntario MX ($10 USD) vs ARR BBB $26/tCO₂ que multiplicaría por 2.6×.',
    implicacion: 'Decisión conservadora deliberada. Con ARR BBB, P11 y P12 superarían 1.0×.' },
  { id: 4, driver: 'Alta inversión relativa al alcance medible', peso: 'MEDIO',
    explicacion: 'Varios proyectos tienen costos fijos altos (logística, plataforma, coordinación) que no escalan linealmente. P08 Academia Exploradores: $10,000/niño con SROI 0.07×.',
    implicacion: 'Reasignar de bajo SROI a alto SROI genera mejora inmediata sin costo adicional.' },
  { id: 5, driver: 'Outcomes intangibles excluidos sistemáticamente', peso: 'MEDIO',
    explicacion: 'El modelo excluye beneficios corporativos (marca, engagement empleados, licencia social, goodwill regulatorio). Externalidades v8 identificaron +$13.8M MXN no capturados.',
    implicacion: 'Si se incluyeran intangibles ($144M-$533M), SROI superaría 17:1.' },
]

export const SOLUCIONES_CREATIVAS = [
  { id: 'S1', nombre: 'Plataforma de Impacto Continuo con IA',
    descripcion: 'Dashboard único para los 15 proyectos con tracking longitudinal de beneficiarios, NLP en español, alertas <0.5× SROI, reportes NIS automáticos.',
    inversion: '$0.8M–$1.2M MXN', impacto: 'SROI de 0.97× a 1.15–1.30× en 12 meses. ROI plataforma: 3-5×.',
    conexion: 'Aprovecha cultura de ingeniería de datos de Viakable. Cumple NIS/CINIF 30 indicadores obligatorios 2025.' },
  { id: 'S2', nombre: 'Insetting de Carbono vía Viakable',
    descripcion: 'Transformar P14 (0.15×) de RSE aislada a insetting integrado en cadena de valor. Reforestación en zonas de cables.',
    inversion: '$1.5M–$2.0M MXN', impacto: 'SROI de P14 de 0.15× a 0.80–1.20×. Reducción 500-800 tCO₂/año.',
    conexion: 'Líneas de transmisión Viakable cruzan zonas rurales con riesgo de erosión. Ahorro de $2-5M/año en reparaciones evitadas.' },
  { id: 'S3', nombre: 'Co-Inversión con Bonos ODS Soberanos',
    descripcion: 'Alinear proyectos con categorías de gasto del Marco de Financiamiento Sostenible de México ($7,090M USD en 2025).',
    inversion: '$0.5M MXN en consultoría', impacto: 'Inversión social de $8.8M a $17.6M sin costo adicional. SROI a 1.40–1.60×.',
    conexion: 'P10 se alinea con justicia energética (Programa Sectorial Energía 2025-2030).' },
  { id: 'S4', nombre: 'Economía Circular Qualtia',
    descripcion: 'Donación ampliada a BAMX, nutrición laboral en plantas (ROI BCG 3.44×), Plan de Gestión Circular para cumplir LGEC 2026.',
    inversion: '$1.0M–$1.5M MXN', impacto: 'SROI de P15 a 1.50–2.00×. Ahorro $0.5-1M/año en disposición de residuos.',
    conexion: 'Qualtia produce harina, pan y botanas — residuos son directamente donables. LGEC 2026 exige Responsabilidad Extendida del Productor.' },
  { id: 'S5', nombre: 'Hub de Talento STEM Xignux-Tec',
    descripcion: 'Fusionar P01-P05 y P08 en pipeline de talento. Prácticas en Viakable, servicio social instalando paneles (P10).',
    inversion: '$0.6M–$0.9M MXN', impacto: 'SROI educativo de 0.07-0.50× a 0.80–1.50×. Pipeline 50-100 candidatos/año.',
    conexion: 'Viakable emplea 4,500+ y necesita ingenieros especializados. Talento homegrown tiene 40% menos rotación.' },
]

export const PLAN_IMPLEMENTACION = {
  resumen: {
    sroiActual: 0.97, sroiObjetivo: '1.45–1.65', mejora: '+49% a +70%',
    inversionPlan: '$7.25M–$10.35M MXN', roiPlan: '3-5×',
  },
  fases: [
    { id: 1, nombre: 'Quick Wins', meses: '1-3', presupuesto: '$1.2M MXN',
      acciones: [
        { id: 'QW1', accion: 'Auditoría NIS/CINIF', kpi: '30/30 IBSO mapeados', presupuesto: 350000 },
        { id: 'QW2', accion: 'Triage del portafolio', kpi: 'Clasificación completada', presupuesto: 50000 },
        { id: 'QW3', accion: 'Redireccionamiento presupuestal', kpi: '+$400K a P10, +$250K a P07', presupuesto: 0 },
        { id: 'QW4', accion: 'Selección plataforma IA', kpi: 'Plataforma seleccionada + piloto', presupuesto: 300000 },
        { id: 'QW5', accion: 'Comité de Gobernanza', kpi: 'Comité constituido con TOR', presupuesto: 50000 },
        { id: 'QW6', accion: 'Instrumentos de recolección', kpi: 'Instrumentos validados, piloto 30 encuestas', presupuesto: 200000 },
        { id: 'QW7', accion: 'Mapeo Bonos ODS', kpi: 'Documento de alineación + 2 reuniones', presupuesto: 100000 },
        { id: 'QW8', accion: 'Auditoría residuos Qualtia', kpi: '3 plantas auditadas', presupuesto: 150000 },
      ] },
    { id: 2, nombre: 'Optimización', meses: '4-6', presupuesto: '$2.95M MXN',
      acciones: [
        { id: 'OP1', accion: 'Despliegue plataforma completo', kpi: '15 proyectos integrados', presupuesto: 500000 },
        { id: 'OP2', accion: 'Rediseño P08 → Hub STEM', kpi: 'Currículo rediseñado, 1er cohorte', presupuesto: 200000 },
        { id: 'OP3', accion: 'Diseño insetting carbono', kpi: '10 zonas críticas, línea base Scope 3', presupuesto: 400000 },
        { id: 'OP4', accion: 'Rediseño P14 → Insetting', kpi: '5 ha piloto, 10 empleos rurales', presupuesto: 500000 },
        { id: 'OP5', accion: 'Rediseño P06 Gamer con Causa', kpi: 'Decisión go/no-go', presupuesto: 100000 },
        { id: 'OP6', accion: '1ª recolección evaluativa', kpi: '200 encuestas, tasa >65%', presupuesto: 300000 },
        { id: 'OP7', accion: 'Diseño economía circular Qualtia', kpi: 'Convenio BAMX firmado', presupuesto: 250000 },
        { id: 'OP8', accion: 'Escalamiento P10', kpi: '+20 sistemas (40→60 total)', presupuesto: 500000 },
        { id: 'OP9', accion: 'Borrador reporte NIS', kpi: '25+/30 indicadores con datos', presupuesto: 200000 },
      ] },
    { id: 3, nombre: 'Escala e Innovación', meses: '7-12', presupuesto: '$3.1M–$6.2M MXN',
      acciones: [
        { id: 'EI1', accion: 'Lanzamiento economía circular Qualtia', kpi: '1,000+ ton donadas, -5% ausentismo', presupuesto: 750000 },
        { id: 'EI2', accion: 'Lanzamiento Hub STEM', kpi: '20 practicantes, 3 candidatos', presupuesto: 500000 },
        { id: 'EI3', accion: 'Piloto reforestación insetting', kpi: '50 ha, 200-400 tCO₂/año', presupuesto: 800000 },
        { id: 'EI4', accion: 'Co-inversión Bonos ODS', kpi: 'Propuesta presentada', presupuesto: 400000 },
        { id: 'EI5', accion: '2ª recolección + re-evaluación SROI', kpi: 'SROI evaluativo calculado', presupuesto: 400000 },
        { id: 'EI6', accion: 'Reporte NIS final + aseguramiento', kpi: '30/30 IBSO, 0 observaciones', presupuesto: 350000 },
        { id: 'EI7', accion: 'Fondo Patrimonial de Impacto Social', kpi: 'Propuesta presentada', presupuesto: 200000 },
        { id: 'EI8', accion: 'Escalamiento P07 SumaRSE', kpi: '50+ empresas en red', presupuesto: 300000 },
      ] },
  ],
}

export const MONTE_CARLO = {
  iteraciones: 1000,
  variacion: { vb: 0.30, fr: 0.20 },
  percentiles: { p5: 0.80, p10: 0.82, p25: 0.88, p50: 0.95, p75: 1.02, p90: 1.08, p95: 1.12 },
  media: 0.95,
  stdDev: 0.096,
  probSroiMayor1: 0.295,
}

export const EXTERNALIDADES_NEGATIVAS = [
  { proyecto: 'P09', externalidad: 'Huella de carbono evento (~25 tCO₂e)', valor: -5000, tipo: 'Ambiental' },
  { proyecto: 'P10', externalidad: 'Efecto rebote energético (10%)', valor: -648695, tipo: 'Conductual' },
  { proyecto: 'P15', externalidad: 'Desplazamiento comercio local (7%)', valor: -61250, tipo: 'Económico' },
  { proyecto: 'P04', externalidad: 'Concentración de recursos', valor: -50000, tipo: 'Estructural' },
]

export const EXTERNALIDADES_POSITIVAS = [
  { proyecto: 'P10', externalidad: 'Alivio carga energética (ingreso liberado)', valor: 514800, tipo: 'Económico' },
  { proyecto: 'P10', externalidad: 'Ahorro DAC-CFE evitado', valor: 1200000, tipo: 'Económico' },
  { proyecto: 'P11/P12', externalidad: 'Servicios hidrológicos (i-Tree)', valor: 850000, tipo: 'Ambiental' },
  { proyecto: 'P11/P12', externalidad: 'Remoción PM2.5 (salud)', valor: 125000, tipo: 'Salud' },
  { proyecto: 'P01/P02', externalidad: 'Resiliencia no-ganadores (skills)', valor: 9146000, tipo: 'Capital humano' },
  { proyecto: 'P13', externalidad: 'Efectos red SumaRSE (multiplicador)', valor: 2000000, tipo: 'Institucional' },
]

export const INTANGIBLES = [
  { categoria: 'Marca empleadora', rangoBajo: 15000000, rangoAlto: 45000000 },
  { categoria: 'Employee Engagement', rangoBajo: 8000000, rangoAlto: 25000000 },
  { categoria: 'Licencia Social para Operar', rangoBajo: 50000000, rangoAlto: 200000000 },
  { categoria: 'Efectos de Red', rangoBajo: 3000000, rangoAlto: 10000000 },
  { categoria: 'Pipeline de Innovación', rangoBajo: 2000000, rangoAlto: 8000000 },
  { categoria: 'Resiliencia Comunitaria', rangoBajo: 5000000, rangoAlto: 15000000 },
  { categoria: 'Educación de Largo Plazo', rangoBajo: 20000000, rangoAlto: 60000000 },
  { categoria: 'Apreciación Mercado de Carbono', rangoBajo: 1000000, rangoAlto: 30000000 },
  { categoria: 'Goodwill Regulatorio', rangoBajo: 10000000, rangoAlto: 50000000 },
  { categoria: 'Brand Preference Consumidor', rangoBajo: 30000000, rangoAlto: 100000000 },
]

export const PAYBACK = [
  { id: 'P07', payback: 0.51, interpretacion: 'Recupera inversión en 6 meses' },
  { id: 'P03', payback: 0.77, interpretacion: 'Recupera en menos de 1 año' },
  { id: 'P15', payback: 1.25, interpretacion: 'Cercano al break-even en 1.25 años' },
  { id: 'P02', payback: 1.30, interpretacion: 'Recupera en 1.3 años' },
  { id: 'P01', payback: 1.34, interpretacion: 'Recupera en 1.3 años' },
  { id: 'P04', payback: 1.74, interpretacion: 'Recupera en 1.7 años' },
  { id: 'P11', payback: 1.74, interpretacion: 'Recupera en 1.7 años (post-corrección)' },
  { id: 'P13', payback: 1.94, interpretacion: 'Recupera en ~2 años' },
  { id: 'P12', payback: 2.00, interpretacion: 'Recupera en 2 años (validar proxy)' },
  { id: 'P05', payback: 2.42, interpretacion: 'Recupera en 2.4 años' },
  { id: 'P09', payback: 2.69, interpretacion: 'Recupera en 2.7 años' },
  { id: 'P10', payback: 5.14, interpretacion: 'Recupera en 5 años (10 años de beneficio)' },
]

export const CAPITAL_HUMANO = {
  nota: 'Capa complementaria al SROI central. NO se suma al 0.97×.',
  empleados: 31000,
  participacionesVoluntarias: 14103,
  horasVoluntariado: 25518,
  escenarios: [
    { label: 'Conservador', empleadosExpuestos: 3000, rotacionBase: 0.17, reduccionAtribuible: 0.005, costoReemplazo: 73500, ahorro: 187500 },
    { label: 'Base', empleadosExpuestos: 8000, rotacionBase: 0.25, reduccionAtribuible: 0.02, costoReemplazo: 116667, ahorro: 4666667 },
    { label: 'Optimista', empleadosExpuestos: 15000, rotacionBase: 0.35, reduccionAtribuible: 0.05, costoReemplazo: 210000, ahorro: 55125000 },
  ],
}
