import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import { useTheme } from '../../../lib/theme'
import Card from '../fields/Card'
import TabBar from '../fields/TabBar'
import SectionHeader from '../fields/SectionHeader'
import TextField from '../fields/TextField'
import TextArea from '../fields/TextArea'
import DateField from '../fields/DateField'
import SelectField from '../fields/SelectField'

const TABS = [
  { id: 'context',      label: 'Proyecto y Contexto' },
  { id: 'scope',        label: 'Alcance de la Medición' },
  { id: 'stakeholders', label: 'Stakeholders' },
]

const SCOPE_QUESTIONS = [
  { key: 'activity',       label: '¿Qué actividad se está considerando?',                placeholder: 'Describa el programa, proyecto o intervención...' },
  { key: 'audience',       label: '¿Quién va a utilizar la información?',                placeholder: 'Donantes, directivos, gobierno, stakeholders...' },
  { key: 'decision',       label: '¿Qué decisión será informada?',                      placeholder: 'Continuidad, expansión, ajustes, financiamiento...' },
  { key: 'reliability',    label: '¿Cuán fiables y detalladas deben ser las respuestas?', placeholder: 'Nivel de rigor requerido...' },
  { key: 'responder',      label: '¿Quién va a responder estas preguntas?',             placeholder: 'Equipo interno, consultor externo, mixto...' },
  { key: 'evaluativeType', label: '¿SROI evaluativo o prospectivo?',                    placeholder: 'Justifique la elección...' },
]

const ROLES = ['Beneficiario directo', 'Beneficiario indirecto', 'Inversor', 'Aliado', 'Comunidad', 'Voluntario', 'Otro']

const INIT = {
  projectName: '', description: '', startDate: '',
  scopeAnswers: { activity: '', audience: '', decision: '', reliability: '', responder: '', evaluativeType: '' },
  stakeholders: [],
}

export default function Step1_Scope() {
  const { th } = useTheme()
  const [activeTab, setActiveTab]       = useState('context')
  const [formData, setFormData]         = useState(INIT)
  const [newSH, setNewSH]               = useState({ name: '', role: '' })

  const tabIdx = TABS.findIndex((t) => t.id === activeTab)

  const setField      = (key, val) => setFormData((f) => ({ ...f, [key]: val }))
  const setScopeField = (key, val) => setFormData((f) => ({ ...f, scopeAnswers: { ...f.scopeAnswers, [key]: val } }))

  const addStakeholder = () => {
    if (!newSH.name.trim()) return
    setFormData((f) => ({ ...f, stakeholders: [...f.stakeholders, { ...newSH, id: Date.now() }] }))
    setNewSH({ name: '', role: '' })
  }
  const removeStakeholder = (id) =>
    setFormData((f) => ({ ...f, stakeholders: f.stakeholders.filter((s) => s.id !== id) }))

  return (
    <div className="space-y-5">
      <SectionHeader
        stepNumber={1}
        title="Establecer Alcance e Identificar Stakeholders"
        subtitle="Define el contexto del proyecto, el alcance de la medición SROI y las partes interesadas."
      />

      <Card className="overflow-hidden">
        <TabBar tabs={TABS} activeTab={activeTab} onChange={setActiveTab} />

        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.18 }}
            className="px-6 pt-6 pb-6 space-y-5"
          >
            {activeTab === 'context' && (
              <>
                <TextField label="Nombre del Proyecto" value={formData.projectName}
                  onChange={(v) => setField('projectName', v)}
                  placeholder="Ej. Programa de becas universitarias XIGNUX 2026" />
                <TextArea label="Descripción / Contexto de la medición" value={formData.description}
                  onChange={(v) => setField('description', v)} rows={4}
                  placeholder="Describa el proyecto, su alcance, la problemática que aborda y el contexto de la medición SROI..." />
                <DateField label="Fecha de inicio del Proyecto" value={formData.startDate}
                  onChange={(v) => setField('startDate', v)} />
              </>
            )}

            {activeTab === 'scope' && (
              <div className="space-y-5">
                {SCOPE_QUESTIONS.map(({ key, label, placeholder }, i) => (
                  <div key={key} className="flex gap-3">
                    <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-6"
                      style={{ background: th.accent }}>
                      <span className="text-[11px] font-semibold text-white">{i + 1}</span>
                    </div>
                    <div className="flex-1">
                      <TextArea label={label} value={formData.scopeAnswers[key]}
                        onChange={(v) => setScopeField(key, v)} rows={2} placeholder={placeholder} />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'stakeholders' && (
              <div className="space-y-5">
                <p className="text-[12px]" style={{ color: th.textMuted }}>
                  Agregue las partes interesadas del proyecto y asigne el rol de cada una en la medición SROI.
                </p>

                {/* Add form */}
                <div className="rounded-xl p-4 space-y-3"
                  style={{ background: th.hoverBg, border: `1px solid ${th.cardBorder}` }}>
                  <span className="text-[11px] uppercase tracking-wider font-medium" style={{ color: th.textSecondary }}>
                    Agregar Stakeholder
                  </span>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <TextField label="Nombre" value={newSH.name}
                      onChange={(v) => setNewSH((s) => ({ ...s, name: v }))}
                      placeholder="Nombre del stakeholder..." />
                    <SelectField label="Rol" value={newSH.role}
                      onChange={(v) => setNewSH((s) => ({ ...s, role: v }))}
                      options={ROLES} />
                  </div>
                  <div className="flex justify-end">
                    <button onClick={addStakeholder}
                      className="px-4 py-2 rounded-xl text-[12px] font-semibold"
                      style={{ background: th.accent, color: '#fff', boxShadow: '0 2px 8px -2px rgba(232,82,14,0.4)' }}>
                      + Agregar
                    </button>
                  </div>
                </div>

                {/* Stakeholder list */}
                {formData.stakeholders.length === 0
                  ? <p className="text-[12px] text-center py-4" style={{ color: th.textMuted }}>
                      No hay stakeholders agregados aún.
                    </p>
                  : <div className="space-y-2">
                      {formData.stakeholders.map((s) => (
                        <div key={s.id} className="flex items-center justify-between px-4 py-3 rounded-xl"
                          style={{ background: th.cardBg, border: `1px solid ${th.cardBorder}` }}>
                          <div>
                            <p className="text-[13px] font-medium" style={{ color: th.textPrimary }}>{s.name}</p>
                            <p className="text-[11px]" style={{ color: th.textMuted }}>{s.role || 'Sin rol'}</p>
                          </div>
                          <button onClick={() => removeStakeholder(s.id)}
                            className="w-7 h-7 rounded-lg flex items-center justify-center"
                            style={{ color: th.textMuted, background: th.hoverBg }}>
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                }
              </div>
            )}

            {/* Tab nav */}
            <div className="flex items-center justify-end gap-2 pt-4 border-t" style={{ borderColor: th.cardBorder }}>
              <button onClick={() => console.log('guardar', formData)}
                className="px-4 py-2 rounded-xl text-[12px] font-medium"
                style={{ background: th.cardBg, border: `1px solid ${th.cardBorder}`, color: th.textSecondary }}>
                Guardar
              </button>
              {tabIdx > 0 && (
                <button onClick={() => setActiveTab(TABS[tabIdx - 1].id)}
                  className="px-4 py-2 rounded-xl text-[12px] font-medium"
                  style={{ background: th.cardBg, border: `1px solid ${th.cardBorder}`, color: th.textPrimary }}>
                  Tab anterior
                </button>
              )}
              {tabIdx < TABS.length - 1 && (
                <button onClick={() => setActiveTab(TABS[tabIdx + 1].id)}
                  className="px-4 py-2 rounded-xl text-[12px] font-semibold"
                  style={{ background: th.accent, color: '#fff', boxShadow: '0 2px 10px -2px rgba(232,82,14,0.4)' }}>
                  Siguiente tab →
                </button>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      </Card>
    </div>
  )
}
