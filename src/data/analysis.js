export const CAUSA_RAIZ = [
  { id: 1, driver: 'Nuevos proxies tangibles v12 (PX_RC, PX44, PX46)', peso: 'ALTO',
    explicacion: 'v12 incorpora 3 proxies que aumentan significativamente el VA tangible: Replacement Cost PX_RC ($4,000/persona, P01-P02), ahorro erario CFE PX44 ($7,500/hogar/año, P10), y restauración ANP PX46 ($63,715/ha, P11/P13/P14). Estos proxies están respaldados por CONEVAL, CFE y CONANP.',
    implicacion: 'VA tangible sube de $6.64M a $13.09M. SROI tangible de 0.75x a 1.49x. P10 cuadruplica su SROI (1.68→4.02x) y P11 se convierte en el proyecto de mayor SROI (6.83x).' },
  { id: 2, driver: 'Fórmula VPN compuesta con drop-off (v9+)', peso: 'ALTO',
    explicacion: 'v9 aplica Σ[(1-DO)^(t-1)/(1+r)^t] en lugar de PV_annuity×(1-Drop). Esto reduce outcomes multi-año: P10 PV factor 8.32→6.14. Basado en Muñoz-Mora 2026 meta-análisis (mediana Drop 21.5%).',
    implicacion: 'Efecto más fuerte en P10 y arq. D. Compensado parcialmente por nuevos proxies v12.' },
  { id: 3, driver: 'DW y Drop-off Eventos ajustados (HACT)', peso: 'MEDIO-ALTO',
    explicacion: 'Arq. B: DW 35%→55% (alta sustituibilidad recreación MTY, HACT Wellbeing Valuation), Drop 40%→50% (bienestar hedónico efímero). FR baja de 0.2668 a 0.1539 (-42%). Afecta P06, P08, P09.',
    implicacion: 'Eventos representan $1.23M de inversión pero solo $575K de VA tangible (4.4% del portafolio). Con intangibles (marca, engagement) sí aportan.' },
  { id: 4, driver: 'Drop-off asimétrico reforestación (CONAFOR)', peso: 'MEDIO',
    explicacion: 'v9 usa 25%/año mortalidad años 1-3 (plántulas) y 2%/año años 4+ (árboles arraigados). CONAFOR supervivencia 34-63%. PV_D10 baja de 8.32 a 3.79 con modelo asimétrico.',
    implicacion: 'Más realista que drop-off plano. Arq. D SROI promedio 3.00x con v12 (incluye proxy ANP PX46).' },
  { id: 5, driver: 'Outcomes intangibles incluidos (v11+)', peso: 'RESUELTO',
    explicacion: 'v11 incorpora 7 categorías de intangibles (engagement, marca, SLO, talent pipeline, innovación, co-beneficios ambientales, resiliencia). SROI intangible = 0.79. Total = 2.28. Metodología: SVI Principio 3, HACT, WELLBY, UK Green Book.',
    implicacion: 'Intangibles aportan $6.96M de VA. SROI total 2.28x con tangibles v12 + intangibles v11.' },
]

export const SOLUCIONES_CREATIVAS = [
  { id: 'S1', nombre: 'Plataforma de Impacto Continuo con IA',
    descripcion: 'Dashboard único para los 15 proyectos con tracking longitudinal de beneficiarios, NLP en español para análisis cualitativo, alertas <0.5× SROI, reportes NIS automáticos. Piloto con P10, P07, P15.',
    inversion: '$0.8M–$1.2M MXN', impacto: 'SROI portafolio de 1.49× tangible a 2.50–3.00× total en 12 meses. ROI plataforma: 3-5×.',
    conexion: 'Aprovecha cultura de ingeniería de datos de Viakable. Cumple NIS/CINIF 30 indicadores obligatorios 2025.' },
  { id: 'S2', nombre: 'Insetting de Carbono vía Viakable',
    descripcion: 'Transformar P14 (1.84×) de proyecto aislado a insetting integrado en cadena de valor. Reforestación en zonas de cables para proteger infraestructura contra deslaves. Certificación Gold Standard o Plan Vivo.',
    inversion: '$1.5M–$2.0M MXN', impacto: 'SROI de P14 de 1.84× a 2.50–3.50× con insetting. Reducción 500-800 tCO₂/año. 20-30 empleos rurales.',
    conexion: 'Líneas de transmisión Viakable cruzan zonas rurales con riesgo de erosión. Ahorro de $2-5M/año en reparaciones evitadas. Cumple NIS Scope 3.' },
  { id: 'S3', nombre: 'Co-Inversión con Bonos ODS Soberanos',
    descripcion: 'Alinear proyectos con categorías de gasto del Marco de Financiamiento Sostenible de México ($7,090M USD en Bonos ODS 2025). Matching funds 1:1 con programas Bienestar.',
    inversion: '$0.5M MXN en consultoría', impacto: 'Inversión social de $8.8M a $17.6M sin costo adicional. SROI a 3.00–4.00×.',
    conexion: 'P10 se alinea con justicia energética (Programa Sectorial Energía 2025-2030).' },
  { id: 'S4', nombre: 'Economía Circular Qualtia',
    descripcion: 'Donación ampliada a BAMX, nutrición laboral en plantas (ROI BCG 3.44×), Plan de Gestión Circular para cumplir LGEC 2026. Medir impacto en productividad y ausentismo.',
    inversion: '$1.0M–$1.5M MXN', impacto: 'SROI de P15 a 2.00–3.00×. Ahorro $0.5-1M/año en disposición de residuos. Reducción ausentismo 10-15%.',
    conexion: 'Qualtia produce harina, pan y botanas — residuos son directamente donables. LGEC 2026 exige Responsabilidad Extendida del Productor.' },
  { id: 'S5', nombre: 'Hub de Talento STEM Xignux-Tec',
    descripcion: 'Fusionar P01-P05 y P08 en pipeline de talento. Prácticas profesionales en Viakable, servicio social instalando paneles (P10), tracking de conversión participante→empleado a 5 años.',
    inversion: '$0.6M–$0.9M MXN', impacto: 'SROI educativo de 0.41–1.53× tangible a 1.80–2.50× total. Pipeline 50-100 candidatos/año.',
    conexion: 'Viakable emplea 4,500+ y necesita ingenieros especializados. Talento homegrown tiene 40% menos rotación.' },
]

export const PLAN_IMPLEMENTACION = {
  resumen: {
    sroiActual: 2.25,
    sroiObjetivo: '3.00+', mejora: '+33% sobre SROI actual (v12.16)',
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
  variacion: { vb: 0.30, fr: 0.20, intang: 0.15 },
  percentiles: { p5: 1.86, p10: 1.95, p25: 2.10, p50: 2.25, p75: 2.40, p90: 2.53, p95: 2.62 },
  media: 2.25,
  stdDev: 0.22,
  probSroiMayor1: 0.9999,
  nota: 'Simulación sobre SROI total (tangible v12.16 + intangible) @10% SHCP. SROI central: 2.249x.',
}

export const EXTERNALIDADES_NEGATIVAS = [
  { proyecto: 'P09', externalidad: 'Huella de carbono evento (~50 tCO₂e, $173/tCO₂e)', valor: -8650, tipo: 'Ambiental' },
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

export const INTANGIBLES_POR_PROYECTO = {
  // Fuente: Modelo v12.16 hoja "Intangibles" fila 19 (PORTAFOLIO TOTAL)
  totales: { engage: 1800000, brand: 2330000, talent: 235548, slo: 1575000, innov: 435000, envCo: 208824, resil: 380000 },
  vaTotal: 6964372,
  sroiIntangible: 0.7910,
}

export const PAYBACK = [
  { id: 'P07', payback: 0.28, interpretacion: 'Recupera en 0.3 años (con intangibles)' },
  { id: 'P03', payback: 0.47, interpretacion: 'Recupera en 0.5 años (con intangibles)' },
  { id: 'P12', payback: 0.40, interpretacion: 'Recupera en 0.4 años (con intangibles)' },
  { id: 'P15', payback: 0.54, interpretacion: 'Recupera en 0.5 años (con intangibles)' },
  { id: 'P01', payback: 0.54, interpretacion: 'Recupera en 0.5 años (con intangibles)' },
  { id: 'P02', payback: 0.57, interpretacion: 'Recupera en 0.6 años (con intangibles)' },
  { id: 'P10', payback: 0.59, interpretacion: 'Recupera en 0.6 años (con intangibles)' },
  { id: 'P11', payback: 0.54, interpretacion: 'Recupera en 0.5 años (con intangibles)' },
  { id: 'P13', payback: 0.57, interpretacion: 'Recupera en 0.6 años (con intangibles)' },
  { id: 'P09', payback: 0.43, interpretacion: 'Recupera en 0.4 años (con intangibles)' },
  { id: 'P05', payback: 0.99, interpretacion: 'Recupera en ~1 año (con intangibles)' },
  { id: 'P04', payback: 1.13, interpretacion: 'Recupera en 1.1 años (con intangibles)' },
  { id: 'P06', payback: 1.07, interpretacion: 'Recupera en ~1 año (con intangibles)' },
  { id: 'P14', payback: 1.01, interpretacion: 'Recupera en ~1 año (con intangibles)' },
  { id: 'P08', payback: 2.44, interpretacion: 'Recupera en 2.4 años (con intangibles)' },
]

export const CAPITAL_HUMANO = {
  nota: 'Capa complementaria al SROI central. NO se suma al portafolio para evitar sobre-reclamación.',
  empleados: 31000,
  participacionesVoluntarias: 14103,
  horasVoluntariado: 25518,
  escenarios: [
    { label: 'Conservador', empleadosExpuestos: 3000, rotacionBase: 0.17, reduccionAtribuible: 0.005, costoReemplazo: 73500, ahorro: 187500 },
    { label: 'Base', empleadosExpuestos: 8000, rotacionBase: 0.25, reduccionAtribuible: 0.02, costoReemplazo: 116667, ahorro: 4666667 },
    { label: 'Optimista', empleadosExpuestos: 15000, rotacionBase: 0.35, reduccionAtribuible: 0.05, costoReemplazo: 210000, ahorro: 55125000 },
  ],
}

export const DOBLE_TASA = [
  { id: 'P10', sroiUK: 5.27, sroiSHCP: 4.04, cambio: -1.23, nota: 'Mayor impacto: outcomes a 10 años con VPN compuesto + CFE PX44 ($7,500/hogar)' },
  { id: 'P11', sroiUK: 8.93, sroiSHCP: 6.84, cambio: -2.09, nota: 'CO₂ $150/tCO₂ ANPs + ecoturismo PX13 $380 + ANP PX46 $63,715/ha' },
  { id: 'P12', sroiUK: 3.04, sroiSHCP: 2.33, cambio: -0.71, nota: 'CO₂ $150 + i-Tree $79 (PX39 actualizado). Intangibles dominan (63%).' },
  { id: 'P14', sroiUK: 2.43, sroiSHCP: 1.86, cambio: -0.57, nota: 'CO₂ $150 + voluntariado $169/hr (SMG 2026) + ANP PX46' },
  { id: 'PORTFOLIO', sroiUK: 1.95, sroiSHCP: 1.46, cambio: -0.49, nota: '12 de 15 proyectos superan SROI Total ≥1.0. 3 bajo umbral: P04, P06, P08.' },
]

export const MADUREZ_TEMPORAL = [
  { id: 'P04', madurez: 'ALTA', anos: 51, hallazgo: '186 premios desde 1974. Ganadores publicados en Nature.', clasificacion: 'institutional_legacy' },
  { id: 'P05', madurez: 'ALTA', anos: 10, hallazgo: '10 ediciones. Ganadores implementan en comunidades vulnerables.', clasificacion: 'proven_infrastructure' },
  { id: 'P07', madurez: 'ALTA', anos: 15, hallazgo: '30K+ impactados, $40M MXN, 100+ empresas ESR. Fundada post-Huracán Alex.', clasificacion: 'network_effects' },
  { id: 'P01', madurez: 'MEDIA', anos: 8, hallazgo: '1,245 proyectos, $6.5M MXN en 13 iniciativas.', clasificacion: 'scaling_pipeline' },
  { id: 'P02', madurez: 'MEDIA', anos: 4, hallazgo: 'Formato Shark Tank UANL. Tracking limitado.', clasificacion: 'early_growth' },
  { id: 'P03', madurez: 'MEDIA', anos: 6, hallazgo: 'Curso universitario desde 2020. Retención half-life 3-5 años.', clasificacion: 'education_decay' },
  { id: 'P09', madurez: 'MEDIA', anos: 8, hallazgo: '1,000+ corredores. Beneficios comunitarios/salud recurrente.', clasificacion: 'recurring_event' },
  { id: 'P06', madurez: 'BAJA', anos: 3, hallazgo: '3 ediciones. Evento efímero. Impacto restringido al año.', clasificacion: 'ephemeral_event' },
  { id: 'P08', madurez: 'BAJA', anos: 1, hallazgo: 'Solo 2 excursiones. Etapa piloto. Sin datos de persistencia.', clasificacion: 'pilot_stage' },
  { id: 'P10', madurez: 'BAJA/ALTA', anos: 3, hallazgo: 'Programa reciente PERO activo durable: paneles solares 20-25 años.', clasificacion: 'durable_asset' },
  { id: 'P11', madurez: 'BAJA/ALTA', anos: 3, hallazgo: '10K de 140K árboles. Activo ecológico persiste décadas.', clasificacion: 'durable_asset' },
  { id: 'P12', madurez: 'BAJA/ALTA', anos: 2, hallazgo: '4,200 árboles urbanos. Servicios ecosistémicos crecen con madurez.', clasificacion: 'durable_asset' },
  { id: 'P14', madurez: 'BAJA/ALTA', anos: 2, hallazgo: 'Voluntariado corporativo (2,160 hrs). Árboles persisten.', clasificacion: 'durable_asset' },
  { id: 'P15', madurez: 'BAJA', anos: 5, hallazgo: '25,000 porciones. Consumo inmediato. Sin proyección multi-año.', clasificacion: 'consumable_immediate' },
]

export const VALOR_COMPARTIDO = [
  { unidad: 'Viakable (Cables)', programa: 'P10 Energía para Todos', beneficioNegocio: 'Comunidades electrificadas = futuros clientes de cableado.', beneficioSocial: 'Acceso a energía limpia para 400+ personas, -25 tCO2/año.', cuantificacion: '$1.65M–$3.3M MXN en demanda futura.' },
  { unidad: 'Viakable (Cables)', programa: 'P14 Reforestación → Insetting', beneficioNegocio: 'Protección de infraestructura contra erosión/deslaves.', beneficioSocial: 'Empleo rural 20-30 empleos, biodiversidad, captura CO2.', cuantificacion: '$2-5M MXN/año en reparaciones evitadas.' },
  { unidad: 'Viakable (Cables)', programa: 'P01-P05 Educación → Hub STEM', beneficioNegocio: 'Pipeline de ingenieros pre-calificados. 40% menos rotación.', beneficioSocial: 'Formación STEM, movilidad social, 500+ estudiantes/año.', cuantificacion: '$1.5-6M MXN/año en reclutamiento evitado.' },
  { unidad: 'Qualtia (Alimentos)', programa: 'P15 Donativo + Economía Circular', beneficioNegocio: 'Ahorro en disposición de residuos. Cumplimiento LGEC 2026.', beneficioSocial: '25,000+ porciones/año para comunidades vulnerables.', cuantificacion: '$0.5-1M MXN/año en disposición + ROI 3.44× en nutrición laboral.' },
  { unidad: 'BYDSA (botanas)', programa: 'P15 Donativo + eventos comunitarios', beneficioNegocio: 'Marca con impacto social. Participación voluntaria 7.8%.', beneficioSocial: 'Comunidades atendidas con eventos y donaciones.', cuantificacion: 'Impacto en marca y lealtad del consumidor.' },
  { unidad: 'Voltway (electromovilidad)', programa: 'P10 Energía + transición energética', beneficioNegocio: 'Soluciones integrales de electromovilidad sustentable.', beneficioSocial: 'Movilidad limpia, reducción de emisiones en transporte.', cuantificacion: 'Conexión con justicia energética y P10.' },
]
