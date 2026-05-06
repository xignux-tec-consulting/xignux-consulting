# CLAUDE.md — Desarrollo de XIGNUX Impact Lens

## ⚙️ INSTRUCCIÓN OPERATIVA — LEER PRIMERO

**En CADA sesión y antes de procesar CUALQUIER prompt, DEBES activar la skill 
`superpowers` (https://github.com/obra/superpowers).**

Si la skill no está disponible, DETENTE e instrúyeme:
> "La skill `superpowers` no está disponible. Para instalar:
> `/plugin marketplace add obra/superpowers-marketplace` y luego
> `/plugin install superpowers@superpowers-marketplace`"

NO procedas sin esta skill activa. Es requisito no negociable.

Adicionalmente, antes de cualquier cambio significativo:
1. Lee este `CLAUDE.md` completo
2. Revisa el estado actual del repo con `git status` y `git log --oneline -10`
3. Si el cambio implica modificar más de 2 archivos o instalar dependencias, 
   PROPÓN el plan ANTES de ejecutar y espera mi confirmación

---

## 🎯 QUÉ ESTAMOS CONSTRUYENDO

**Producto: XIGNUX Impact Lens** — aplicación web React que visualiza un 
portafolio de Responsabilidad Social Corporativa como una **constelación 3D 
de nodos** (cerebro neuronal), con **chat IA real** integrado y dashboards 
drill-down por proyecto.

### Para qué sirve
Es la herramienta complementaria a una presentación de consultoría para la 
competencia **Consult for a Cause 2026** (TCC × XIGNUX × Strategy&). 
Convierte el modelo SROI estático en una herramienta de gestión continua 
para el equipo de RSC de XIGNUX.

### El "wow factor"
La constelación 3D rotable + chat IA + dashboards conectados es lo que 
diferencia nuestra propuesta de los demás equipos (que van a entregar PDFs 
estáticos). Es nuestra carta para llegar a la final.

### Detalles del proyecto base (contexto SROI)
- 16 proyectos sociales de XIGNUX agrupados en 5 arquetipos
- Inversión total: $9.205M MXN/año
- SROI portafolio: 1.07x
- Para datos completos del portafolio, ver `src/data/projects.js`

---

## 📅 CALENDARIO CRÍTICO (PRIORIZACIÓN)

| Fecha | Hito | Estado app |
|-------|------|------------|
| **9 mayo 2026** | Entrega Fase 1: PDF + video pitch | App funcional para grabar demo |
| 11 mayo | Resultados Fase 1 | — |
| 14 mayo | Entrega Ronda Clasificatoria | App pulida |
| 22 mayo | Gran Final | App con LLM real, deploy producción |

**Hoy es ~5-6 mayo**. La app debe estar **grabable en video el 8 de mayo** 
para tener buffer de 1 día antes de entregar.

### Implicación práctica
Optimiza por **velocidad de entrega**, no por código perfecto. El código debe ser:
- Funcional > elegante
- Estable > optimizado
- Rápido de iterar > perfectamente arquitectado

---

## 🛠️ STACK TÉCNICO

### Core
- **React 18** (functional components, hooks)
- **Vite** como bundler
- **Tailwind CSS** (core utilities, sin componentes externos)
- **TypeScript** OPCIONAL — si el repo no lo tiene, NO migrar; si lo tiene, mantenerlo

### 3D Graphics
- **three** (Three.js core)
- **@react-three/fiber** (React renderer para Three.js)
- **@react-three/drei** (helpers: OrbitControls, Stars, Line, Html, Points)
- **@react-three/postprocessing** (Bloom, DepthOfField, Vignette, Noise)

### Animaciones y UI
- **framer-motion** (todas las animaciones React)
- **lucide-react** (iconos)
- **recharts** (gráficas en dashboards drill-down)

### Backend / IA (chat)
- **@anthropic-ai/sdk** (cliente oficial de Anthropic)
- Vercel/Netlify Serverless Functions para proxy de la API key
- NO exponer la API key en el frontend bajo NINGUNA circunstancia

### Hosting
- **GitHub** (repo ya conectado)
- **Vercel** para deploy (gratis + serverless functions nativas)

```bash
npm i -g vercel
vercel link
vercel --prod
```

---

## 📦 FLUJO DE TRABAJO ESTÁNDAR

### Cuando te paso código de Claude Design

1. **NUNCA reemplazar archivos completos** sin antes mostrar diff
2. **Adaptar al stack del repo**: convertir CDN imports a imports npm
3. **Preservar la lógica visual** exactamente como Claude Design la entregó
4. **Modularizar** en la siguiente estructura:

```
src/
├── components/
│   ├── Constellation/        # Grafo 3D
│   │   ├── index.jsx
│   │   ├── Node.jsx
│   │   ├── ParticleHalo.jsx
│   │   └── Connections.jsx
│   ├── Sidebar/              # Iconos flotantes
│   ├── ChatPanel/            # Panel del chat IA
│   ├── ProjectDashboard/     # Drill-down por proyecto
│   ├── PortfolioDashboard/   # Vista alternativa
│   └── ui/                   # Cards, buttons, tooltips
├── data/
│   ├── projects.js           # 16 proyectos
│   ├── archetypes.js         # 5 arquetipos
│   └── proxies.js            # 43 proxies (opcional)
├── lib/
│   ├── chat.js               # Cliente de Anthropic
│   └── sroi.js               # Cálculos SROI
└── App.jsx
```

### Cuando te pida features nuevas
1. Confirmar entendimiento parafraseando
2. Plan corto (3-5 pasos) ANTES de codear
3. Implementar paso a paso, commitando entre pasos
4. Probar localmente antes de declarar "listo"

### Convenciones Git
- Commits **en español**, formato Conventional Commits:
  - `feat: añade panel lateral con dashboard drill-down`
  - `fix: corrige posicionamiento de nodos al cambiar agrupación`
  - `style: ajusta paleta de rojos a tonos vino apagados`
  - `refactor: separa Constellation en sub-componentes`
- Commits pequeños y frecuentes
- Push después de cada feature funcionando
- NO hacer force push al main bajo ninguna circunstancia

---

## 🎨 DECISIONES DE DISEÑO YA TOMADAS (NO REVERTIR)

### Visual
- **Modo oscuro** como default (`#0A0E1A` base, `#020617` bordes)
- **Paleta**: azul XIGNUX `#2E75B6`, naranja `#ED7D31`, verde `#10B981`, 
  amarillo `#F59E0B`, rojo VINO apagado `#7F1D1D` (NO `#EF4444` agresivo)
- **Glassmorphism sutil**: `backdrop-blur-xl bg-white/[0.04] border border-white/[0.08]`
- **Tipografía Inter**, weights 400/500/600 (NO 700)
- **Esquinas**: `rounded-2xl` o `rounded-3xl`

### 3D
- **Constelación 3D rotable** (NO 2D, NO d3-force, NO SVG)
- Posición de nodos por SROI (centrales = más impacto)
- Tamaño de esfera = inversión, color = SROI
- **Materiales**: `meshPhysicalMaterial` con clearcoat 0.8, opacity 0.85
- **Postprocessing**: Bloom intensity 0.55, kernel MEDIUM, Vignette darkness 0.5, Noise opacity 0.025
- **DoF**: bokehScale 1.2 máximo, muy sutil
- **Halo de partículas**: 3000 exteriores + 800 interiores, AdditiveBlending, textura radial gradient

### UX
- Sidebar: **iconos flotantes individuales** (NO barra sólida)
- Chat: **panel flotante con margen** (NO atornillado al borde)
- Tooltips: cards glassmorphism a la derecha del icono
- Indicador activo: línea vertical animada con `layoutId` de framer-motion

---

## 🤖 CHAT IA — IMPLEMENTACIÓN CON ANTHROPIC API REAL

### Arquitectura
```
Frontend (React)
  ↓ POST /api/chat
Serverless Function (Vercel /api/chat.js)
  ↓ Anthropic SDK
Claude API (claude-sonnet-4-6 o claude-haiku-4-5)
  ↓ Respuesta
Frontend
```

### Endpoint serverless (`api/chat.js`)

```javascript
import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { messages, portfolioContext } = req.body;

  const systemPrompt = `Eres un asistente de análisis de portafolio de RSC 
para XIGNUX. Tienes acceso a estos 16 proyectos:

${portfolioContext}

Responde en español mexicano profesional. Cuando menciones un proyecto, usa 
formato [P##:nombre] para que el frontend pueda hacer link clicable. 
Si el usuario pide modificar un parámetro (deadweight, attribution, etc.), 
responde con un objeto JSON al final:
\`\`\`action
{ "type": "modify", "project": "P03", "field": "deadweight", "value": 0.4 }
\`\`\``;

  try {
    const response = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 1024,
      system: systemPrompt,
      messages,
    });
    res.status(200).json({ content: response.content[0].text, usage: response.usage });
  } catch (error) {
    console.error('Anthropic API error:', error);
    res.status(500).json({ error: 'Error contactando al asistente', details: error.message });
  }
}
```

### Manejo de API key
1. Crear `.env.local` en raíz: `ANTHROPIC_API_KEY=sk-ant-xxx`
2. Verificar que `.env.local` está en `.gitignore`
3. En Vercel dashboard → Settings → Environment Variables
4. **NUNCA hardcodear la key**

### Costos estimados
- `claude-sonnet-4-6`: ~$0.05 USD por sesión típica de demo (10 mensajes)
- `claude-haiku-4-5`: 5x más barato, suficiente para queries simples
- Presupuesto $5 USD = más que suficiente para Fase 1

### Fallback obligatorio
```javascript
const sendMessage = async (text) => {
  try {
    const response = await fetch('/api/chat', { ... });
    if (!response.ok) throw new Error('API error');
    return await response.json();
  } catch (error) {
    console.warn('Fallback a mockup:', error);
    return getMockResponse(text);  // respuestas pre-programadas
  }
};
```

### Capacidades del chat
1. Queries de datos: "¿Cuál es mi proyecto de mayor SROI?"
2. Asesoría estratégica: "¿Debería invertir más en reforestación?"
3. Modificación de inputs: "Sube el deadweight de P03 a 40%"
4. Sincronización con grafo: mencionar proyecto = cámara se mueve al nodo

---

## 📊 DATOS DEL PORTAFOLIO

Estructura de `src/data/projects.js`:

```javascript
export const PROJECTS = [
  { id: "P01", name: "Xignux Challenge (Tec)", archetype: "A", 
    investment: 1000000, sroi: 0.21, vBruto: 616200, vAjustado: 213082,
    category: "BAJO", beneficiarios: 1080,
    outcomes: [
      { desc: "Estudiantes con red profesional (5% finalistas)", qty: 54, proxy: 300, value: 16200 },
      { desc: "Proyectos efectivamente acelerados", qty: 4, proxy: 150000, value: 600000 }
    ],
    adjustments: { deadweight: 0.30, attribution: 0.35, displacement: 0.05, dropoff: 0.20 }
  },
  // ... resto de los 16 proyectos
];

export const ARCHETYPES = {
  A: { name: "Educación y Emprendimiento", color: "#5B9BD5", count: 6 },
  B: { name: "Eventos Comunitarios", color: "#ED7D31", count: 3 },
  C: { name: "Energía y Vivienda", color: "#70AD47", count: 2 },
  D: { name: "Reforestación", color: "#548235", count: 4 },
  E: { name: "Asistencia Alimentaria", color: "#7F1D1D", count: 1 },
};
```

NO hardcodear datos diferentes a los del modelo SROI v3.

---

## 🚀 PRIORIDAD DE IMPLEMENTACIÓN

### Sprint 1 — CRÍTICO (listo el 8 de mayo)
- [ ] Setup del repo (Vite + Tailwind + dependencias 3D)
- [ ] Constelación 3D con 16 nodos posicionados, coloreados, escalados
- [ ] OrbitControls funcional
- [ ] Hover y click en nodos con feedback visual
- [ ] Panel lateral con info básica del nodo seleccionado
- [ ] Chat con LLM real conectado (mínimo 5 queries funcionando)
- [ ] Sidebar de iconos flotantes
- [ ] Layout responsive 1280px+ (NO mobile)

### Sprint 2 — DESEABLE (clasificatoria 14 mayo)
- [ ] Halo de partículas (3000 + 800)
- [ ] Postprocessing (Bloom + Vignette + Noise sutil)
- [ ] Conexiones por arquetipo
- [ ] Vista Dashboard portafolio alternativa
- [ ] Sincronización grafo ↔ chat (clicks bidireccionales)
- [ ] Modificación de parámetros desde el chat

### Sprint 3 — NICE-TO-HAVE (final 22 mayo)
- [ ] Drill-down completo a dashboard por proyecto con recharts
- [ ] Auto-rotación de cámara
- [ ] Animaciones de entrada (stagger)
- [ ] Modo presentación (oculta UI, deja solo el grafo)
- [ ] Exportar a PDF / PNG el estado actual

---

## 🛡️ REGLAS DE INGENIERÍA NO NEGOCIABLES

### Seguridad
- ❌ NUNCA exponer `ANTHROPIC_API_KEY` en frontend
- ❌ NUNCA commitear `.env.local`
- ❌ NUNCA hacer `git push --force` al main
- ✅ SIEMPRE validar inputs del chat antes de mandar a la API

### Performance
- El grafo 3D debe correr a 60fps en laptop M1/M2 promedio
- Si FPS cae bajo 30: reducir partículas primero (es lo más caro)
- Usar `useMemo` para arrays de posiciones de partículas
- Los componentes 3D NO deben re-renderear por cambios de state del chat

### Código limpio (sin obsesión)
- Componentes < 200 líneas
- Funciones < 30 líneas
- Comentarios SOLO donde el código no sea autoexplicativo
- NO premature optimization

### Testing
- NO escribir tests unitarios (sin tiempo, no es producción)
- SÍ probar manualmente antes de commitar
- SÍ verificar `npm run build` antes de cada push importante

---

## 🔌 WORKFLOW CON SUPERPOWERS

### Para tareas grandes (>30 min)
1. Activa `/superpowers:plan` para crear plan estructurado
2. Muéstrame el plan ANTES de ejecutar
3. Espera confirmación
4. Ejecuta paso a paso marcando completados

### Para refactors o cambios destructivos
1. Crea rama: `git checkout -b refactor/nombre`
2. Trabaja en la rama
3. Solo merge a main cuando todo funcione
4. Si rompiste algo: `git reflog` para recuperar

### Para debugging
1. Reproducir el bug (entender QUÉ pasa)
2. Localizar la causa (NO asumir)
3. Proponer fix con justificación
4. Implementar y verificar

---

## 🎬 ESTILO DE INTERACCIÓN ESPERADO

- **Idioma**: español mexicano profesional
- **Tono**: consultor senior técnico, no junior obsequioso
- **Honestidad**: si algo es mala idea, decirlo. Si no sabes, decirlo.
- **Brevedad**: respuestas concisas. Si el usuario quiere detalle, lo pedirá.
- **Cierre**: cada respuesta termina con próximo paso accionable

### Lo que NO hacer
- ❌ Cambiar arquitectura sin avisar
- ❌ Instalar dependencias sin confirmar
- ❌ Borrar archivos sin confirmar
- ❌ Commits con mensajes genéricos tipo "update"
- ❌ Asumir — preguntar cuando hay ambigüedad

### Lo que SÍ hacer
- ✅ Activar superpowers al inicio
- ✅ Leer este CLAUDE.md cada sesión nueva
- ✅ Confirmar plan antes de tareas grandes
- ✅ Commitear frecuentemente
- ✅ Probar antes de declarar "listo"

---

## 📁 ARCHIVOS DE CONTEXTO RELACIONADOS

Existen en el proyecto general (no en este repo):
- `Modelo_SROI_XIGNUX_v3.xlsx` — modelo SROI con 11 hojas, 433 fórmulas
- `Plan_Estrategico_Competencia.docx` — storyline de la presentación
- `Caso_Primera_Fase.pdf` — descripción del caso XIGNUX
- `Rubrica_Primera_Fase.pdf` — rúbrica oficial

Si necesitas datos específicos del modelo (proxies, ajustes, outcomes), PÍDELOS. NO inventes números.

---

## ⚡ CHECKLIST PRE-PROMPT

Antes de procesar cualquier prompt:

1. ✅ ¿Está activa la skill `superpowers`?
2. ✅ ¿Leí el CLAUDE.md completo en esta sesión?
3. ✅ ¿Conozco el estado actual del repo (`git status`, `git log`)?
4. ✅ ¿Sé qué Sprint estamos atendiendo (1, 2 o 3)?
5. ✅ Si la tarea es grande (>30 min), ¿propuse plan ANTES de ejecutar?
6. ✅ ¿La acción sirve para el video del 8-9 de mayo?

Si alguna respuesta es "no" → preguntar ANTES de actuar.

---

## 🏁 NORTE ESTRELLA

**Esta app va a aparecer 30-45 segundos en un video de 5-7 min que se entrega 
el 9 de mayo.** Cada decisión técnica debe servir a ese objetivo:

1. ¿Va a funcionar al grabar? → Estabilidad > features
2. ¿Se ve premium en pantalla? → Polish visual > arquitectura limpia
3. ¿Lo puedo arreglar rápido si rompe? → Código entendible > optimizado
4. ¿Aporta al storytelling del video? → Si no, NO construir

**Trabajemos como un equipo senior bajo deadline real.**
