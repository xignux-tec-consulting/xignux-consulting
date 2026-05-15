import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTheme } from '../../../lib/theme'
import SectionHeader from '../fields/SectionHeader'
import TabBar from '../fields/TabBar'
import Card from '../fields/Card'
import TabInputs from './Step2/TabInputs'
import TabActivities from './Step2/TabActivities'
import TabBeneficiaries from './Step2/TabBeneficiaries'
import TabImpactMap from './Step2/TabImpactMap'

const TABS = [
  { id: 'inputs',        label: 'Inversiones (Inputs)' },
  { id: 'activities',    label: 'Actividades y Productos' },
  { id: 'beneficiaries', label: 'Beneficiarios y Cambios' },
  { id: 'impact',        label: 'Mapa de Impacto' },
]

export default function Step2_OutcomeMap({ value, onChange, stakeholders, onSave, onGoToStep1 }) {
  const { th } = useTheme()
  const [activeTab, setActiveTab] = useState('inputs')
  const tabIdx = TABS.findIndex(t => t.id === activeTab)

  const tabProps = { value, onChange, stakeholders, onSave, onGoToStep1 }

  return (
    <div className="space-y-5">
      <SectionHeader
        stepNumber={2}
        title="Crear Mapa de Outcomes"
        subtitle="Registre los insumos, actividades, productos y beneficiarios del proyecto."
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
            {activeTab === 'inputs'        && <TabInputs        {...tabProps} />}
            {activeTab === 'activities'    && <TabActivities    {...tabProps} />}
            {activeTab === 'beneficiaries' && <TabBeneficiaries {...tabProps} />}
            {activeTab === 'impact'        && <TabImpactMap     {...tabProps} />}

            {/* Tab nav */}
            <div className="flex items-center justify-end gap-2 pt-4 border-t"
              style={{ borderColor: th.cardBorder }}>
              <button onClick={onSave}
                className="px-4 py-2 rounded-xl text-[12px] font-medium"
                style={{ background: th.cardBg, border: `1px solid ${th.cardBorder}`, color: th.textSecondary,
                  cursor: 'pointer' }}>
                Guardar
              </button>
              {tabIdx > 0 && (
                <button onClick={() => setActiveTab(TABS[tabIdx - 1].id)}
                  className="px-4 py-2 rounded-xl text-[12px] font-medium"
                  style={{ background: th.cardBg, border: `1px solid ${th.cardBorder}`, color: th.textPrimary,
                    cursor: 'pointer' }}>
                  Tab anterior
                </button>
              )}
              {tabIdx < TABS.length - 1 && (
                <button onClick={() => setActiveTab(TABS[tabIdx + 1].id)}
                  className="px-4 py-2 rounded-xl text-[12px] font-semibold"
                  style={{ background: th.accent, color: '#fff',
                    boxShadow: '0 2px 10px -2px rgba(232,82,14,0.4)', cursor: 'pointer' }}>
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
