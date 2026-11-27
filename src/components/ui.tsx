import { useEffect, useState } from 'react'
import { sketchfabThumb, sketchfabUid } from './Sketchfab'
import type { Proyecto } from '../types'
import { thumbUrl } from '../data'
import { useApp } from '../state'
import { tr } from '../i18n'
import type { Screen } from '../types'

export const Icon = {
  vitrina: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2 3 7v10l9 5 9-5V7z" /><path d="M3 7l9 5 9-5M12 12v10" /></svg>
  ),
  catalogo: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="3" width="7" height="7" rx="2" /><rect x="14" y="3" width="7" height="7" rx="2" /><rect x="3" y="14" width="7" height="7" rx="2" /><rect x="14" y="14" width="7" height="7" rx="2" /></svg>
  ),
  votacion: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"><path d="m12 3 2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z" /></svg>
  ),
}

const NAV: { id: 'vitrina' | 'catalogo' | 'votacion' }[] = [
  { id: 'vitrina' }, { id: 'catalogo' }, { id: 'votacion' },
]

export function BottomNav() {
  const { lang, screen, go } = useApp()
  const t = tr(lang)
  const active: Screen = screen === 'detalle' || screen === 'welcome' ? 'vitrina' : screen
  return (
    <nav className="bottombar">
      {NAV.map((n) => (
        <button key={n.id} className={active === n.id ? 'on' : ''} onClick={() => go(n.id)}>
          {Icon[n.id]}
          {t.nav[n.id]}
        </button>
      ))}
    </nav>
  )
}

/** Miniatura como imagen (nunca un visor 3D). Si falta, muestra el número. */
export function Thumb({ project, className = 'ph' }: { project: Proyecto; className?: string }) {
  // 1) miniatura local  2) miniatura de Sketchfab  3) número del proyecto
  const [step, setStep] = useState(0)
  const [sf, setSf] = useState<string | null>(null)
  useEffect(() => {
    if (step !== 1) return
    const uid = sketchfabUid(project)
    if (!uid) { setStep(2); return }
    let alive = true
    sketchfabThumb(uid).then((u) => { if (!alive) return; if (u) setSf(u); else setStep(2) })
    return () => { alive = false }
  }, [step, project])
  if (step === 0) return <img src={thumbUrl(project)} alt="" draggable={false} onError={() => setStep(1)} />
  if (step === 1 && sf) return <img src={sf} alt="" draggable={false} onError={() => setStep(2)} />
  return <div className={className}>{project.id}</div>
}

export function LangSwitch() {
  const { lang, setLang } = useApp()
  return (
    <div className="lang">
      <button className={lang === 'es' ? 'on' : ''} onClick={() => setLang('es')}>ES</button>
      <button className={lang === 'en' ? 'on' : ''} onClick={() => setLang('en')}>EN</button>
    </div>
  )
}

export function Stars({ value, onChange, label }: { value: number; onChange: (v: number) => void; label: string }) {
  return (
    <div className="stars" role="radiogroup" aria-label={label}>
      {[1, 2, 3, 4, 5].map((n) => (
        <button key={n} className={`star ${n <= value ? 'on' : ''}`} onClick={() => onChange(n)} aria-label={`${n}`}>
          <svg viewBox="0 0 24 24" fill="currentColor"><path d="m12 2.5 2.9 6 6.6.9-4.8 4.6 1.2 6.5L12 17.4 6.1 20.5l1.2-6.5L2.5 9.4l6.6-.9z" /></svg>
        </button>
      ))}
    </div>
  )
}
