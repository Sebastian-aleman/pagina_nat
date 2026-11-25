import { useCallback, useEffect, useMemo, useState } from 'react'
import { useApp } from '../state'
import { tr } from '../i18n'
import { cfg, criterios, txt } from '../data'
import { toCsv, voteRepo } from '../votes'
import { BadPinError } from '../votes/VoteRepository'
import type { Vote } from '../types'

// Sesión de administrador (solo en memoria; se pierde al recargar)
let session: { pin: string; votes: Vote[] } | null = null

export function Pin() {
  const { lang, go } = useApp()
  const t = tr(lang)
  const [v, setV] = useState('')
  const [msg, setMsg] = useState('')
  const [busy, setBusy] = useState(false)
  const len = cfg.adminPinLength

  const press = async (d: string) => {
    if (busy) return
    const next = (v + d).slice(0, len)
    setMsg('')
    setV(next)
    if (next.length < len) return
    setBusy(true)
    try {
      session = { pin: next, votes: await voteRepo.list(next) }
      setV('')
      go('admin')
    } catch (e) {
      setMsg(e instanceof BadPinError ? t.wrongPin : t.connError)
      window.setTimeout(() => setV(''), 400)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="screen thanks">
      <h2>{t.pin}</h2>
      <div className="pin-dots">{Array.from({ length: len }, (_, i) => <i key={i} className={i < v.length ? 'on' : ''} />)}</div>
      <p style={{ color: 'var(--danger)', height: 40 }}>{msg}</p>
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

const avgOf = (vs: Vote[], id: string) => (vs.length ? vs.reduce((s, v) => s + (v.ratings[id] ?? 0), 0) / vs.length : 0)

function Bar({ value, max, label }: { value: number; max: number; label: string }) {
  return (
    <div className="bar-row">
      <span className="bar-label">{label}</span>
      <div className="bar-track"><i style={{ width: `${max ? (value / max) * 100 : 0}%` }} /></div>
      <span className="bar-val">{value}</span>
    </div>
  )
}

export function Admin() {
  const { lang, goHome, go } = useApp()
  const t = tr(lang)
  const [votes, setVotes] = useState<Vote[]>(session?.votes ?? [])
  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState(false)
  const st = voteRepo.status()

  useEffect(() => { if (!session) go('pin') }, [go])

  const refresh = useCallback(async () => {
    if (!session) return
    setLoading(true)
    setErr(false)
    try {
      session.votes = await voteRepo.list(session.pin)
      setVotes([...session.votes])
    } catch { setErr(true) } finally { setLoading(false) }
  }, [])

  const stats = useMemo(() => {
    const per = criterios.map((c) => ({
      c,
      avg: avgOf(votes, c.id),
      dist: [1, 2, 3, 4, 5].map((n) => votes.filter((v) => v.ratings[c.id] === n).length),
    }))
    const overall = per.length ? per.reduce((s, p) => s + p.avg, 0) / per.length : 0
    // votos por hora (últimas 12 horas con datos)
    const byHour = new Map<string, number>()
    votes.forEach((v) => {
      const d = new Date(v.createdAt)
      const k = `${d.getMonth() + 1}/${d.getDate()} ${String(d.getHours()).padStart(2, '0')}h`
      byHour.set(k, (byHour.get(k) ?? 0) + 1)
    })
    return { per, overall, hours: [...byHour.entries()].slice(-12) }
  }, [votes])

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

  const maxHour = Math.max(1, ...stats.hours.map(([, n]) => n))
  const recent = [...votes].reverse().slice(0, 8)

  return (
    <div className="screen admin">
      <div className="topbar">
        <h2>{t.admin}</h2>
        <span className="badge" style={{ fontSize: 24 }}>
          {st.mode === 'cloud' ? t.storageCloud : t.storageLocal}{st.pending > 0 ? ` · ${st.pending} ${t.pending}` : ''}
        </span>
      </div>

      <div className="admin-body scroll">
        <div className="kpis">
          <div className="card kpi"><b>{votes.length}</b><span>{t.votes}</span></div>
          <div className="card kpi"><b>{votes.length ? stats.overall.toFixed(2) : '—'}</b><span>{t.overall}</span></div>
          <div className="card kpi"><b>{votes.length ? new Date(votes[votes.length - 1].createdAt).toLocaleTimeString(lang, { hour: '2-digit', minute: '2-digit' }) : '—'}</b><span>{t.lastVote}</span></div>
        </div>

        {votes.length === 0 ? (
          <div className="card tabpanel"><p className="soon">{t.noVotes}</p></div>
        ) : (
          <>
            <div className="card tabpanel">
              <h3>{t.byCriterion}</h3>
              {stats.per.map(({ c, avg, dist }) => (
                <div key={c.id} className="crit-stat">
                  <div className="crit-head"><b>{txt(c.nombre, lang)}</b><span>{avg.toFixed(2)} / 5</span></div>
                  {dist.map((n, i) => <Bar key={i} label={`${i + 1}★`} value={n} max={Math.max(...dist, 1)} />)}
                </div>
              ))}
            </div>
            <div className="card tabpanel">
              <h3>{t.perHour}</h3>
              {stats.hours.map(([h, n]) => <Bar key={h} label={h} value={n} max={maxHour} />)}
              <h3 style={{ marginTop: 16 }}>{t.recent}</h3>
              <table>
                <thead><tr><th>{t.when}</th>{criterios.map((c) => <th key={c.id}>{txt(c.nombre, lang).slice(0, 4)}</th>)}</tr></thead>
                <tbody>
                  {recent.map((v) => (
                    <tr key={v.id}>
                      <td>{new Date(v.createdAt).toLocaleString(lang, { dateStyle: 'short', timeStyle: 'short' })}</td>
                      {criterios.map((c) => <td key={c.id}>{v.ratings[c.id] ?? '—'}</td>)}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {err && <p style={{ color: 'var(--danger)' }}>{t.connError}</p>}
      <div className="admin-actions">
        <button className="btn" disabled={loading} onClick={refresh}>{loading ? '…' : `⟳ ${t.refresh}`}</button>
        <button className="btn" disabled={votes.length === 0} onClick={exportCsv}>{t.exportCsv}</button>
        <button className="btn ghost" onClick={() => { session = null; goHome() }}>{t.exit}</button>
      </div>
    </div>
  )
}
