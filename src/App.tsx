import { useCallback, useEffect, useMemo, useState } from 'react'
import { AppCtx, type AppState } from './state'
import type { Lang, Screen } from './types'
import { cfg, proyectos } from './data'
import { useIdle, useStageScale } from './kiosk'
import { ErrorBoundary } from './components/ErrorBoundary'
import { BottomNav } from './components/ui'
import { Welcome } from './screens/Welcome'
import { Vitrina } from './screens/Vitrina'
import { Catalogo } from './screens/Catalogo'
import { Detalle } from './screens/Detalle'
import { Votacion } from './screens/Votacion'
import { Gracias } from './screens/Otros'
import { Admin, Pin } from './screens/Admin'

const NO_NAV: Screen[] = ['welcome', 'gracias', 'pin', 'admin']

function Router({ screen }: { screen: Screen }) {
  switch (screen) {
    case 'welcome': return <Welcome />
    case 'vitrina': return <Vitrina />
    case 'catalogo': return <Catalogo />
    case 'detalle': return <Detalle />
    case 'votacion': return <Votacion />
    case 'gracias': return <Gracias />
    case 'pin': return <Pin />
    case 'admin': return <Admin />
  }
}

/** Si algo falla, se reinicia solo a los pocos segundos. */
function Recover({ reset }: { reset: () => void }) {
  useEffect(() => {
    const id = window.setTimeout(reset, 3000)
    return () => window.clearTimeout(id)
  }, [reset])
  return <div className="fatal"><h2>Inventarium</h2><p className="muted">…</p></div>
}

export default function App() {
  const { scale, landscape, w, h } = useStageScale()
  const [lang, setLang] = useState<Lang>('es')
  // Enlace para el equipo: abrir la página con #admin va directo al PIN
  const [screen, setScreen] = useState<Screen>(() => (location.hash === '#admin' ? 'pin' : 'welcome'))
  const [index, setIndex] = useState(0)
  const [ratings, setRatings] = useState<Record<string, number>>({})
  const [bootKey, setBootKey] = useState(0)

  const go = useCallback((s: Screen) => setScreen(s), [])
  const clearRatings = useCallback(() => setRatings({}), [])
  const setRating = useCallback((c: string, v: number) => setRatings((r) => ({ ...r, [c]: v })), [])
  const openProject = useCallback((i: number) => { setIndex(i); setScreen('detalle') }, [])

  // Vuelve al inicio, descarta el voto sin confirmar y restablece el idioma
  const goHome = useCallback(() => {
    setRatings({})
    setIndex(0)
    setLang('es')
    setScreen('welcome')
  }, [])

  useIdle(cfg.idleSeconds, screen !== 'welcome' && screen !== 'pin' && screen !== 'admin', goHome)

  // Entrar o salir de la votación en curso no debe dejar votos a medias
  useEffect(() => { if (screen !== 'votacion') setRatings((r) => (Object.keys(r).length ? {} : r)) }, [screen])

  const state = useMemo<AppState>(
    () => ({ landscape, lang, setLang, screen, go, index, setIndex, openProject, ratings, setRating, clearRatings, goHome }),
    [landscape, lang, screen, go, index, openProject, ratings, setRating, clearRatings, goHome],
  )

  return (
    <AppCtx.Provider value={state}>
      <div className={`stage ${landscape ? 'landscape' : ''}`} style={{ ['--scale' as string]: scale, width: w, height: h }}>
        <ErrorBoundary
          key={bootKey}
          fallback={() => <Recover reset={() => { goHome(); setBootKey((k) => k + 1) }} />}
        >
          <Router screen={screen} />
          {!NO_NAV.includes(screen) && proyectos.length > 0 && <BottomNav />}
        </ErrorBoundary>
      </div>
    </AppCtx.Provider>
  )
}
