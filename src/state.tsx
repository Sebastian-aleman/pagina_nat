import { createContext, useContext } from 'react'
import type { Lang, Screen } from './types'

export interface AppState {
  landscape: boolean                  // diseño horizontal (computadora)
  lang: Lang
  setLang: (l: Lang) => void
  screen: Screen
  go: (s: Screen) => void
  index: number                       // proyecto actual en la vitrina
  setIndex: (i: number) => void
  openProject: (i: number) => void    // abre el detalle del proyecto i
  ratings: Record<string, number>     // voto pendiente (se borra por inactividad)
  setRating: (criterio: string, v: number) => void
  clearRatings: () => void
  goHome: () => void
}

export const AppCtx = createContext<AppState>(null as unknown as AppState)
export const useApp = () => useContext(AppCtx)
