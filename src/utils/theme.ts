import { ref } from 'vue'

export type ThemeMode = 'light' | 'dark'
const KEY = 'mall_admin_theme'

const stored = localStorage.getItem(KEY)
const initMode: ThemeMode = stored === 'dark' ? 'dark' : 'light'

export const themeMode = ref<ThemeMode>(initMode)

export const applyTheme = (mode: ThemeMode = themeMode.value) => {
  document.documentElement.setAttribute('data-theme', mode)
  localStorage.setItem(KEY, mode)
}

export const setThemeMode = (mode: ThemeMode) => {
  themeMode.value = mode
  applyTheme(mode)
}
