import { reactive, watch } from 'vue'
import { themePalette, limePalette, validHex } from '@/utils/themeColor'

/* 外观设置：主题（浅色 / 深色 / 跟随系统）、表格密度、导航轨折叠。持久化在本机浏览器。 */
export type ThemeMode = 'light' | 'dark' | 'auto'
export type Density = 'comfy' | 'regular' | 'compact'

export interface Appearance {
  theme: ThemeMode
  density: Density
  railCollapsed: boolean
  layout: 'side' | 'top' | 'mixed' | 'dual'
  contentWidth: 'full' | 'boxed'
  showBreadcrumb: boolean
  reduceMotion: boolean
  accent: 'blue' | 'violet' | 'teal' | 'lime' | 'custom'
  customColor: string
  surfaceStyle: 'glass' | 'flat'
}

const STORAGE_KEY = 'scaffold.appearance'
const DEFAULTS: Appearance = { theme: 'light', density: 'regular', railCollapsed: false, layout: 'side', contentWidth: 'full', showBreadcrumb: true, reduceMotion: false, accent: 'lime', customColor: '#d45d9e', surfaceStyle: 'glass' }

function load(): Appearance {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const saved = JSON.parse(raw) as Partial<Appearance>
      return {
        theme: (['light', 'dark', 'auto'] as const).includes(saved.theme as ThemeMode) ? saved.theme as ThemeMode : DEFAULTS.theme,
        density: (['comfy', 'regular', 'compact'] as const).includes(saved.density as Density) ? saved.density as Density : DEFAULTS.density,
        railCollapsed: Boolean(saved.railCollapsed),
        layout: ['side', 'top', 'mixed', 'dual'].includes(saved.layout ?? '') ? saved.layout! : 'side',
        contentWidth: saved.contentWidth === 'boxed' ? 'boxed' : 'full',
        showBreadcrumb: saved.showBreadcrumb !== false,
        reduceMotion: saved.reduceMotion === true,
        accent: ['blue','violet','teal','lime','custom'].includes(saved.accent ?? '') ? saved.accent! : DEFAULTS.accent,
        customColor: validHex(saved.customColor) ? saved.customColor : DEFAULTS.customColor,
        surfaceStyle: saved.surfaceStyle === 'flat' ? 'flat' : 'glass',
      }
    }
  } catch { /* 存储不可用时使用默认值 */ }
  return { ...DEFAULTS }
}

export const appearance = reactive<Appearance>(load())

const darkQuery = window.matchMedia('(prefers-color-scheme: dark)')

function resolvedTheme() {
  if (appearance.theme === 'auto') return darkQuery.matches ? 'dark' : 'light'
  return appearance.theme
}

function apply() {
  const root = document.documentElement
  root.dataset.theme = resolvedTheme()
  const presets = { blue: '#236de9', violet: '#7952c7', teal: '#087e83', lime: '#82dd2d', custom: appearance.customColor }
  for (const [key,value] of Object.entries(appearance.accent === 'lime' ? limePalette(resolvedTheme() === 'dark') : themePalette(presets[appearance.accent], resolvedTheme() === 'dark'))) root.style.setProperty(key,value)
  root.dataset.accent = appearance.accent
  root.dataset.surfaceStyle = appearance.surfaceStyle
  root.dataset.density = appearance.density
  root.dataset.contentWidth = appearance.contentWidth
  root.dataset.reduceMotion = String(appearance.reduceMotion)
}

watch(() => [appearance.theme, appearance.density, appearance.contentWidth, appearance.reduceMotion, appearance.accent, appearance.customColor, appearance.surfaceStyle], apply, { immediate: true })
darkQuery.addEventListener('change', () => { if (appearance.theme === 'auto') apply() })

watch(appearance, (value) => {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(value)) } catch { /* 忽略 */ }
}, { deep: true })

export function resetAppearance() { Object.assign(appearance, DEFAULTS) }
