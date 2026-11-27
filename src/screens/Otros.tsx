import { useEffect } from 'react'
import { useApp } from '../state'
import { tr } from '../i18n'
import { cfg } from '../data'

export function Gracias() {
  const { lang, goHome } = useApp()
  const t = tr(lang)
  useEffect(() => {
    const id = window.setTimeout(goHome, cfg.thanksSeconds * 1000)
    return () => window.clearTimeout(id)
  }, [goHome])
  return (
    <div className="screen thanks">
      <div className="check">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m5 12.5 4.5 4.5L19 7.5" /></svg>
      </div>
      <h1 style={{ fontSize: 72 }}>{t.thanksTitle}</h1>
      <p className="muted">{t.thanksText}</p>
      <button className="btn big" onClick={goHome}>OK</button>
    </div>
  )
}
