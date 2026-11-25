import { useRef } from 'react'
import { useApp } from '../state'
import { tr } from '../i18n'
import { cfg } from '../data'
import { goFullscreen } from '../kiosk'
import { LangSwitch } from '../components/ui'

export function Welcome() {
  const { lang, go } = useApp()
  const t = tr(lang)
  const taps = useRef<number[]>([])

  // Acceso oculto de administrador: N toques seguidos en el logo
  const onLogo = () => {
    const now = Date.now()
    taps.current = [...taps.current.filter((x) => now - x < 3000), now]
    if (taps.current.length >= cfg.adminTaps) {
      taps.current = []
      go('pin')
    }
  }

  return (
    <div className="screen welcome">
      <LangSwitch />
      <img className="logo" src="/logo.png" alt="Inventarium" onClick={onLogo} draggable={false} />
      <h2 className="muted" style={{ fontSize: 40, fontWeight: 600 }}>{t.subtitle}</h2>
      <p>{t.welcomeText}</p>
      <button className="btn big" onClick={() => { goFullscreen(); go('vitrina') }}>{t.start}</button>
    </div>
  )
}
