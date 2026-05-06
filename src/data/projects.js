export const ARCHETYPES = {
  A: { name: 'Educación y Emprendimiento', color: '#5B9BD5', count: 6, benchmark: 1.4 },
  B: { name: 'Eventos Comunitarios',       color: '#ED7D31', count: 3, benchmark: 0.5 },
  C: { name: 'Energía y Vivienda',         color: '#70AD47', count: 1, benchmark: 2.5 },
  D: { name: 'Reforestación',              color: '#548235', count: 4, benchmark: 1.2 },
  E: { name: 'Asistencia Alimentaria',     color: '#C00000', count: 1, benchmark: 3.0 },
}

const mkOutcomes = (rows) =>
  rows.map((r) => ({
    description: r[0], qty: r[1], proxy: r[2], unit: r[3] || 'MXN/persona',
    gross: r[1] * r[2],
  }))

export const PROJECTS = [
  {
    id: 'P01', name: 'Reto de Innovación Universitaria', archetype: 'A',
    investment: 1000000, sroi: 0.21, vBruto: 616200, vAjustado: 213082, category: 'BAJO',
    direct_beneficiaries: 480, region: 'NL · MX',
    adjustments: { dw: 0.30, at: 0.35, dp: 0.05, dr: 0.20 },
    outcomes: mkOutcomes([
      ['Estudiantes con habilidad emprendedora', 320, 1200],
      ['Mentores capacitados', 40, 4500],
      ['Proyectos prototipados', 22, 7000],
    ]),
    stakeholders: ['Estudiantes', 'Mentores', 'Universidad', 'Aliados industria'],
  },
  {
    id: 'P02', name: 'Tiger Tank — Programa Universitario', archetype: 'A',
    investment: 250000, sroi: 0.67, vBruto: 481500, vAjustado: 166503, category: 'BAJO',
    direct_beneficiaries: 210, region: 'NL · MX',
    adjustments: { dw: 0.25, at: 0.30, dp: 0.05, dr: 0.15 },
    outcomes: mkOutcomes([
      ['Equipos finalistas con plan de negocio', 18, 9500],
      ['Estudiantes capacitados', 200, 1100],
      ['Conexiones con inversionistas', 12, 7800],
    ]),
    stakeholders: ['Estudiantes', 'Profesores', 'Inversionistas'],
  },
  {
    id: 'P03', name: 'Cátedra de Ingeniería Aplicada', archetype: 'A',
    investment: 215000, sroi: 1.13, vBruto: 700000, vAjustado: 242060, category: 'MEDIO',
    direct_beneficiaries: 95, region: 'NL · MX',
    adjustments: { dw: 0.20, at: 0.30, dp: 0.05, dr: 0.15 },
    outcomes: mkOutcomes([
      ['Tesistas dirigidos', 14, 18500],
      ['Publicaciones académicas', 6, 28000],
      ['Estudiantes con beca', 8, 27000],
    ]),
    stakeholders: ['Profesores', 'Tesistas', 'Industria'],
  },
  {
    id: 'P04', name: 'Premio Nacional de Investigación', archetype: 'A',
    investment: 1050000, sroi: 0.56, vBruto: 1705000, vAjustado: 589589, category: 'BAJO',
    direct_beneficiaries: 65, region: 'Nacional',
    adjustments: { dw: 0.30, at: 0.35, dp: 0.05, dr: 0.20 },
    outcomes: mkOutcomes([
      ['Investigadores reconocidos', 12, 65000],
      ['Visibilidad mediática (alcance)', 850000, 0.8],
      ['Proyectos escalados', 5, 45000],
    ]),
    stakeholders: ['Investigadores', 'Universidades', 'Prensa'],
  },
  {
    id: 'P05', name: 'Premio de Energías Alternativas', archetype: 'A',
    investment: 560000, sroi: 0.40, vBruto: 640000, vAjustado: 221312, category: 'BAJO',
    direct_beneficiaries: 38, region: 'NL · MX',
    adjustments: { dw: 0.30, at: 0.35, dp: 0.05, dr: 0.20 },
    outcomes: mkOutcomes([
      ['Proyectos finalistas con tracción', 6, 48000],
      ['Estudiantes capacitados', 30, 1100],
      ['Patentes en proceso', 2, 130000],
    ]),
    stakeholders: ['Estudiantes', 'Universidad', 'Industria energía'],
  },
  {
    id: 'P06', name: 'Gamer con Causa', archetype: 'B',
    investment: 480000, sroi: 0.12, vBruto: 230000, vAjustado: 57477, category: 'BAJO',
    direct_beneficiaries: 1200, region: 'Nacional',
    adjustments: { dw: 0.40, at: 0.35, dp: 0.05, dr: 0.25 },
    outcomes: mkOutcomes([
      ['Asistentes con experiencia comunitaria', 1200, 95],
      ['Donativos generados', 1, 80000],
      ['Voluntarios activos', 35, 950],
    ]),
    stakeholders: ['Asistentes', 'Voluntarios', 'Marcas patrocinadoras'],
  },
  {
    id: 'P07', name: 'Red de Aliados Sociales NL', archetype: 'A',
    investment: 250000, sroi: 1.45, vBruto: 1050000, vAjustado: 363090, category: 'MEDIO',
    direct_beneficiaries: 320, region: 'NL · MX',
    adjustments: { dw: 0.20, at: 0.30, dp: 0.05, dr: 0.15 },
    outcomes: mkOutcomes([
      ['OSCs fortalecidas', 28, 18500],
      ['Capacitaciones impartidas', 120, 1800],
      ['Convenios firmados', 14, 22000],
    ]),
    stakeholders: ['OSCs', 'Funcionarios', 'Empresas aliadas'],
  },
  {
    id: 'P08', name: 'Academia de Exploradores Jóvenes', archetype: 'B',
    investment: 400000, sroi: 0.01, vBruto: 24000, vAjustado: 5998, category: 'BAJO',
    direct_beneficiaries: 240, region: 'NL · MX',
    adjustments: { dw: 0.45, at: 0.40, dp: 0.05, dr: 0.30 },
    outcomes: mkOutcomes([
      ['Niños con experiencia formativa', 240, 80],
      ['Talleres impartidos', 12, 400],
    ]),
    stakeholders: ['Niños', 'Familias', 'Talleristas'],
  },
  {
    id: 'P09', name: 'Carrera Energiza la Vida 5K', archetype: 'B',
    investment: 350000, sroi: 0.21, vBruto: 300000, vAjustado: 74970, category: 'BAJO',
    direct_beneficiaries: 2800, region: 'NL · MX',
    adjustments: { dw: 0.40, at: 0.35, dp: 0.05, dr: 0.25 },
    outcomes: mkOutcomes([
      ['Asistentes activados físicamente', 2800, 85],
      ['Donativo a hospital', 1, 60000],
      ['Visibilidad de marca (impresiones)', 1500000, 0.01],
    ]),
    stakeholders: ['Corredores', 'Patrocinadores', 'Hospital beneficiario'],
  },
  {
    id: 'P10', name: 'Energía para Comunidades Rurales', archetype: 'C',
    investment: 2000000, sroi: 3.08, vBruto: 20034000, vAjustado: 6166465, category: 'ALTO',
    direct_beneficiaries: 4200, region: 'Sierra · MX',
    adjustments: { dw: 0.10, at: 0.30, dp: 0.05, dr: 0.10 },
    outcomes: mkOutcomes([
      ['Hogares electrificados', 1050, 14500],
      ['Reducción de gasto en velas/diésel', 1050, 3800],
      ['Niños con horas adicionales de estudio', 2100, 850],
      ['CO₂ evitado (toneladas)', 380, 1200],
    ]),
    stakeholders: ['Familias rurales', 'Operador local', 'Gobierno municipal'],
  },
  {
    id: 'P11', name: 'Reforestación Ruta Monarca', archetype: 'D',
    investment: 200000, sroi: 2.03, vBruto: 1030000, vAjustado: 406721, category: 'ALTO',
    direct_beneficiaries: 8500, region: 'Michoacán · MX',
    adjustments: { dw: 0.20, at: 0.30, dp: 0.05, dr: 0.15 },
    outcomes: mkOutcomes([
      ['Hectáreas reforestadas', 42, 18500],
      ['Servicios ecosistémicos (valor)', 1, 240000],
      ['Empleos rurales temporales', 28, 4500],
    ]),
    stakeholders: ['Comunidades ejidales', 'Pronatura', 'Visitantes'],
  },
  {
    id: 'P12', name: 'Adopta un Árbol', archetype: 'D',
    investment: 200000, sroi: 0.52, vBruto: 261000, vAjustado: 103062, category: 'BAJO',
    direct_beneficiaries: 1100, region: 'NL · MX',
    adjustments: { dw: 0.30, at: 0.35, dp: 0.05, dr: 0.20 },
    outcomes: mkOutcomes([
      ['Árboles plantados con seguimiento', 850, 280],
      ['Voluntarios sensibilizados', 220, 95],
    ]),
    stakeholders: ['Voluntarios', 'Vecinos', 'Municipio'],
  },
  {
    id: 'P13', name: 'Alianza Parque Metropolitano', archetype: 'D',
    investment: 700000, sroi: 0.57, vBruto: 1006300, vAjustado: 397363, category: 'BAJO',
    direct_beneficiaries: 12000, region: 'NL · MX',
    adjustments: { dw: 0.30, at: 0.35, dp: 0.05, dr: 0.20 },
    outcomes: mkOutcomes([
      ['Visitantes anuales', 12000, 65],
      ['Senderos rehabilitados (km)', 6, 28000],
      ['Especies endémicas monitoreadas', 14, 4500],
    ]),
    stakeholders: ['Visitantes', 'Patronato', 'Biólogos'],
  },
  {
    id: 'P14', name: 'Reforestación Tepotzotlán', archetype: 'D',
    investment: 650000, sroi: 0.08, vBruto: 139500, vAjustado: 55085, category: 'BAJO',
    direct_beneficiaries: 320, region: 'EdoMex · MX',
    adjustments: { dw: 0.45, at: 0.40, dp: 0.05, dr: 0.30 },
    outcomes: mkOutcomes([
      ['Árboles sobrevivientes a 12 meses', 310, 380],
      ['Voluntarios participantes', 180, 130],
    ]),
    stakeholders: ['Voluntarios', 'Comunidad local'],
  },
  {
    id: 'P15', name: 'Donativo Asistencia Alimentaria', archetype: 'E',
    investment: 500000, sroi: 0.64, vBruto: 897500, vAjustado: 320408, category: 'BAJO',
    direct_beneficiaries: 6500, region: 'Nacional',
    adjustments: { dw: 0.30, at: 0.35, dp: 0.05, dr: 0.20 },
    outcomes: mkOutcomes([
      ['Despensas entregadas', 6500, 120],
      ['Familias con seguridad alimentaria temporal', 1200, 95],
    ]),
    stakeholders: ['Familias receptoras', 'Banco de alimentos'],
  },
]
