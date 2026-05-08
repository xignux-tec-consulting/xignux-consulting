import { createContext, useContext, useState, useCallback, useEffect } from 'react'

const LIGHT = {
  pageBg:       '#F8F6F3',
  cardBg:       '#FFFFFF',
  cardBorder:   '#E5E0DA',
  headerBg:     'rgba(255,255,255,0.97)',
  headerBorder: '#E5E0DA',
  inputBg:      '#F8F6F3',
  inputBorder:  '#E5E0DA',
  textPrimary:  '#1A1A1A',
  textSecondary:'#666666',
  textMuted:    '#999999',
  accent:       '#E8520E',
  accentSoft:   'rgba(232,82,14,0.08)',
  accentBorder: 'rgba(232,82,14,0.25)',
  chartGrid:    '#E5E0DA',
  tableBorder:  '#E5E0DA',
  tooltipBg:    '#FFFFFF',
  tooltipBorder:'#E5E0DA',
  trackBg:      '#E5E0DA',
  hoverBg:      'rgba(0,0,0,0.03)',
  shadow:       '0 2px 12px -4px rgba(0,0,0,0.06)',
  headerShadow: '0 1px 3px rgba(0,0,0,0.04)',
  fogColor:     '#F0EDE8',
  sceneBg:      '#F0EDE8',
  pillBg:       '#F8F6F3',
  pillBorder:   '#E5E0DA',
  bubbleBg:     '#F8F6F3',
  chatBg:       'rgba(255,255,255,0.97)',
  panelBg:      'rgba(255,255,255,0.97)',
}

const DARK = {
  pageBg:       '#0A0E1A',
  cardBg:       'rgba(255,255,255,0.04)',
  cardBorder:   'rgba(255,255,255,0.08)',
  headerBg:     'rgba(10,14,26,0.95)',
  headerBorder: 'rgba(255,255,255,0.08)',
  inputBg:      'rgba(255,255,255,0.06)',
  inputBorder:  'rgba(255,255,255,0.1)',
  textPrimary:  '#F3F4F6',
  textSecondary:'#9CA3AF',
  textMuted:    '#6B7280',
  accent:       '#E8520E',
  accentSoft:   'rgba(232,82,14,0.15)',
  accentBorder: 'rgba(232,82,14,0.35)',
  chartGrid:    'rgba(255,255,255,0.08)',
  tableBorder:  'rgba(255,255,255,0.06)',
  tooltipBg:    '#1F2937',
  tooltipBorder:'rgba(255,255,255,0.1)',
  trackBg:      'rgba(255,255,255,0.08)',
  hoverBg:      'rgba(255,255,255,0.04)',
  shadow:       '0 2px 12px -4px rgba(0,0,0,0.3)',
  headerShadow: '0 1px 6px rgba(0,0,0,0.2)',
  fogColor:     '#0A0E1A',
  sceneBg:      '#0A0E1A',
  pillBg:       'rgba(255,255,255,0.06)',
  pillBorder:   'rgba(255,255,255,0.1)',
  bubbleBg:     'rgba(255,255,255,0.06)',
  chatBg:       'rgba(15,20,35,0.97)',
  panelBg:      'rgba(15,20,35,0.97)',
}

const ThemeContext = createContext({ dark: false, toggle: () => {}, th: LIGHT })

export function ThemeProvider({ children }) {
  const [dark, setDark] = useState(() => {
    try { return localStorage.getItem('xignux-dark') === '1' } catch { return false }
  })

  useEffect(() => {
    try { localStorage.setItem('xignux-dark', dark ? '1' : '0') } catch {}
    document.documentElement.classList.toggle('dark', dark)
  }, [dark])

  const toggle = useCallback(() => setDark((d) => !d), [])
  const th = dark ? DARK : LIGHT

  return (
    <ThemeContext.Provider value={{ dark, toggle, th }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  return useContext(ThemeContext)
}
