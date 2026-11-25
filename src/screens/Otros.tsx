import { useEffect, useState } from 'react'
import { useApp } from '../state'
import { tr } from '../i18n'
import { cfg, criterios, datos, txt } from '../data'
import { toCsv, voteRepo } from '../votes'
import type { Vote } from '../types'

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

export function Pin() {
  const { lang, go } = useApp()
  const t = tr(lang)
  const [v, setV] = useState('')
  const [bad, setBad] = useState(false)
  const len = cfg.adminPin.length

  const press = (d: string) => {
    const next = (v + d).slice(0, len)
    setBad(false)
    setV(next)
    if (next.length === len) {
      if (next === cfg.adminPin) go('admin')
      else { setBad(true); window.setTimeout(() => setV(''), 400) }
    }
  }

  return (
    <div className="screen thanks">
      <h2>{t.pin}</h2>
      <div className="pin-dots">{Array.from({ length: len }, (_, i) => <i key={i} className={i < v.length ? 'on' : ''} />)}</div>
      <p style={{ color: 'var(--danger)', height: 40 }}>{bad ? t.wrongPin : ''}</p>
      <div className="keypad">
        {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((d) => <button key={d} onClick={() => press(d)}>{d}</button>)}
        <button onClick={() => setV('')}>⌫</button>
        <button onClick={() => press('0')}>0</button>
        <span />
      </div>
      <button className="btn ghost" onClick={() => go('welcome')}>{t.cancel}</button>
    </div>
  )
}

export function Admin() {
  const { lang, goHome } = useApp()
  const t = tr(lang)
  const [votes, setVotes] = useState<Vote[]>([])
  useEffect(() => { voteRepo.list().then(setVotes) }, [])

  const avg = (id: string) =>
    votes.length ? (votes.reduce((s, v) => s + (v.ratings[id] ?? 0), 0) / votes.length).toFixed(2) : '—'

  const exportCsv = () => {
    const url = URL.createObjectURL(new Blob([toCsv(votes)], { type: 'text/csv;charset=utf-8' }))
    const a = document.createElement('a')
    a.href = url
    a.download = `inventarium-votos-${new Date().toISOString().slice(0, 10)}.csv`
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="screen">
      <h2>{t.admin}</h2>
      <div className="card tabpanel scroll">
        <h3>{votes.length} {t.votes}</h3>
        {votes.length === 0 ? <p className="soon">{t.noVotes}</p> : (
          <table>
            <thead><tr><th>Criterio</th><th>{t.average}</th></tr></thead>
            <tbody>{criterios.map((c) => <tr key={c.id}><td>{txt(c.nombre, lang)}</td><td>{avg(c.id)}</td></tr>)}</tbody>
          </table>
        )}
      </div>
      <button className="btn big" disabled={votes.length === 0} onClick={exportCsv}>{t.exportCsv}</button>
      <button className="btn ghost" onClick={goHome}>{t.exit}</button>
    </div>
  )
}
