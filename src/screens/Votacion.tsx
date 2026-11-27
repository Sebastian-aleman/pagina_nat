import { useRef, useState } from 'react'
import { useApp } from '../state'
import { tr } from '../i18n'
import { criterios, proyectos, txt } from '../data'
import { newVote, voteRepo } from '../votes'
import { Stars } from '../components/ui'

export function Votacion() {
  const { lang, index, ratings, setRating, clearRatings, go } = useApp()
  const t = tr(lang)
  const [saving, setSaving] = useState(false)
  const lock = useRef(false)

  // Se evalúa el proyecto que se estaba mostrando (vitrina, detalle o catálogo)
  const project = proyectos[index]

  const complete = criterios.every((c) => ratings[c.id] >= 1)

  const confirm = async () => {
    if (!complete || lock.current) return // bloquea doble toque
    lock.current = true
    setSaving(true)
    try {
      await voteRepo.add(newVote(project.id, { ...ratings }))
      clearRatings()
      go('gracias')
    } finally {
      lock.current = false
      setSaving(false)
    }
  }

  return (
    <div className="screen votacion">
      <div>
        <h2>{t.voteTitle}: {txt(project.nombre, lang)}</h2>
        <p className="muted" style={{ marginTop: 8 }}>{t.voteHint}</p>
      </div>
      <div className="criteria">
      {criterios.map((c) => (
        <div className="card criterion" key={c.id}>
          <h3>{txt(c.nombre, lang)}</h3>
          <Stars value={ratings[c.id] ?? 0} onChange={(v) => setRating(c.id, v)} label={txt(c.nombre, lang)} />
        </div>
      ))}
      </div>
      <div className="vote-actions">
        <button className="btn ghost big" onClick={() => go('vitrina')}>‹ {t.back}</button>
        <button className="btn big" disabled={!complete || saving} onClick={confirm}>
          {saving ? t.saving : t.confirm}
        </button>
      </div>
    </div>
  )
}
