import { useEffect } from 'react'
import { useApp } from '../state'
import { tr } from '../i18n'
import { cfg, datos, txt } from '../data'

export function Muestra() {
  const { lang } = useApp()
  const t = tr(lang)
  const title = txt(datos.muestra.titulo, lang)
  const desc = txt(datos.muestra.descripcion, lang)
  return (
    <div className="screen">
      <h2>{title || t.museTitle}</h2>
      <div className="card tabpanel scroll">
        {desc ? <p>{desc}</p> : <p className="soon">{t.soon}</p>}
      </div>
    </div>
  )
}

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
