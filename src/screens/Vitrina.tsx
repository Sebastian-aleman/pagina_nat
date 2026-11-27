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
  const { lang, index, setIndex, openProject, go } = useApp()
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

  // Mantiene visible la miniatura seleccionada en la tira
  const strip = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const box = strip.current
    const el = box?.children[index] as HTMLElement | undefined
    if (!box || !el) return
    // Solo mueve la tira (no el resto de la página)
    box.scrollTo({
      left: el.offsetLeft - (box.clientWidth - el.clientWidth) / 2,
      top: el.offsetTop - (box.clientHeight - el.clientHeight) / 2,
      behavior: 'smooth',
    })
  }, [index])

  return (
    <div className="screen vitrina">
      <div className="vitrina-meta">
        <h2>{txt(p.nombre, lang)}</h2>
        <div className="counter">{t.of(index + 1, N)}</div>
      </div>

      {/* Visor: ocupa todo el espacio libre; flechas encima del modelo */}
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
        <ModelViewer project={p} width="100%" height="100%" autoRotate interactive={false} onTouch={touch} />
        <button className="btn round nav-arrow left" onClick={() => goTo(index - 1)} aria-label={t.prev}>‹</button>
        <button className="btn round nav-arrow right" onClick={() => goTo(index + 1)} aria-label={t.next}>›</button>
      </div>

      <div className="vitrina-actions">
        <button className="btn big ghost" onClick={() => openProject(index)}>{t.viewProject}</button>
        {/* Evalúa el proyecto que se está mostrando ahora */}
        <button className="btn big" onClick={() => go('votacion')}>★ {t.evaluate}</button>
      </div>

      <div className="thumbs" ref={strip}>
        {proyectos.map((q, i) => (
          <button key={q.id} className={`thumb ${i === index ? 'on' : ''}`} onClick={() => goTo(i)} aria-label={txt(q.nombre, lang)}>
            <Thumb project={q} />
          </button>
        ))}
      </div>
    </div>
  )
}
