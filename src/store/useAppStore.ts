import { create } from 'zustand'

interface AppState {
  darkMode: boolean
  companyId: string
  setDarkMode: (v: boolean) => void
  setCompanyId: (id: string) => void
}

export const useAppStore = create<AppState>((set) => ({
  darkMode: true,
  companyId: '',
  setDarkMode: (v) => set({ darkMode: v }),
  setCompanyId: (companyId) => set({ companyId }),
}))
