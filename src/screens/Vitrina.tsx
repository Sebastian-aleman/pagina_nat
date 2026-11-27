import { useCallback, useEffect, useRef } from 'react'
import { useApp } from '../state'
import { tr } from '../i18n'
import { cfg, proyectos, txt } from '../data'
import { ModelViewer } from '../components/ModelViewer'
import { preloadModel, releaseModel } from '../components/models'
import { Thumb } from '../components/ui'

const N = proyectos.length
const wrap = (i: number) => (i + N) % N

export function Vitrina() {
  const { lang, index, setIndex, openProject, landscape, go } = useApp()
  const t = tr(lang)
  const touched = useRef(false)
  const swipeX = useRef<number | null>(null)

  const touch = useCallback(() => { touched.current = true }, [])
  const goTo = useCallback((i: number) => { touch(); setIndex(wrap(i)) }, [setIndex, touch])

  // Avance automático: se reinicia (con espera mayor) al tocar
  useEffect(() => {
    const secs = touched.current ? cfg.autoAdvanceResumeSeconds : cfg.autoAdvanceSeconds
    touched.current = false
    const id = window.setTimeout(() => setIndex(wrap(index + 1)), secs * 1000)
    return () => window.clearTimeout(id)
  }, [index, setIndex])

  // Solo el modelo actual y sus vecinos en memoria
  useEffect(() => {
    const keep = new Set([wrap(index - 1), index, wrap(index + 1)])
    proyectos.forEach((p, i) => (keep.has(i) ? preloadModel(p) : releaseModel(p)))
  }, [index])

  const p = proyectos[index]

  return (
    <div className="screen vitrina">
      <div className="vitrina-meta">
        <h2>{txt(p.nombre, lang)}</h2>
        <div className="counter">{t.of(index + 1, N)}</div>
      </div>

      <div
        className="vwrap"
        onPointerDown={(e) => { swipeX.current = e.clientX; touch() }}
        onPointerUp={(e) => {
          if (swipeX.current === null) return
          const dx = e.clientX - swipeX.current
          swipeX.current = null
          if (Math.abs(dx) > 80) goTo(index + (dx < 0 ? 1 : -1))
        }}
      >
        <ModelViewer project={p} width={landscape ? '100%' : 968} height={landscape ? '100%' : 640} autoRotate interactive={false} onTouch={touch} />
      </div>

      <div className="carousel-controls">
        <button className="btn ghost" onClick={() => goTo(index - 1)}>‹ {t.prev}</button>
        <button className="btn" onClick={() => openProject(index)}>{t.viewProject}</button>
        <button className="btn ghost" onClick={() => goTo(index + 1)}>{t.next} ›</button>
      </div>

      {/* Evalúa el proyecto que se está mostrando ahora */}
      <button className="btn big vitrina-eval" onClick={() => go('votacion')}>★ {t.evaluate}</button>

      <div className="thumbs">
        {proyectos.map((q, i) => (
          <button key={q.id} className={`thumb ${i === index ? 'on' : ''}`} onClick={() => goTo(i)} aria-label={txt(q.nombre, lang)}>
            <Thumb project={q} />
          </button>
        ))}
      </div>
    </div>
  )
}
