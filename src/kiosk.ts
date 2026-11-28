import { useEffect, useRef, useState } from 'react'

const PORTRAIT = { w: 1080, h: 1920 }
const LANDSCAPE = { w: 1920, h: 1080 }

/**
 * Escala el escenario para que quepa en la ventana.
 * Ventana vertical (PROTO/tablet): 1080x1920. Ventana horizontal (computadora): 1920x1080.
 */
export function useStageScale() {
  const calc = () => {
    const landscape = window.innerWidth > window.innerHeight * 1.1
    const b = landscape ? LANDSCAPE : PORTRAIT
    return { landscape, w: b.w, h: b.h, scale: Math.min(window.innerWidth / b.w, window.innerHeight / b.h) }
  }
  const [s, setS] = useState(calc)
  useEffect(() => {
    const fit = () => setS(calc())
    window.addEventListener('resize', fit)
    return () => window.removeEventListener('resize', fit)
  }, [])
  return s
}

/** Hay algún video reproduciéndose (no se debe interrumpir). */
const videoPlaying = () =>
  // Los videos en bucle (data-loop) no cuentan: si no, la pantalla nunca volvería al inicio
  Array.from(document.querySelectorAll<HTMLVideoElement>('video:not([data-loop])')).some((v) => !v.paused && !v.ended)

/**
 * Llama a onIdle tras `seconds` sin actividad. Si hay un video en
 * reproducción, espera y vuelve a comprobar.
 */
export function useIdle(seconds: number, active: boolean, onIdle: () => void) {
  const cb = useRef(onIdle)
  cb.current = onIdle
  useEffect(() => {
    if (!active) return
    let timer: number
    const arm = () => {
      window.clearTimeout(timer)
      timer = window.setTimeout(check, seconds * 1000)
    }
    const check = () => {
      if (videoPlaying()) arm()
      else cb.current()
    }
    const events = ['pointerdown', 'pointermove', 'keydown', 'wheel', 'touchstart']
    events.forEach((e) => window.addEventListener(e, arm, { passive: true }))
    arm()
    return () => {
      window.clearTimeout(timer)
      events.forEach((e) => window.removeEventListener(e, arm))
    }
  }, [seconds, active])
}

/** Bloquea zoom, menú contextual, selección y gestos del navegador. */
export function installKioskGuards() {
  const stop = (e: Event) => e.preventDefault()
  document.addEventListener('contextmenu', stop)
  document.addEventListener('selectstart', stop)
  document.addEventListener('dragstart', stop)
  document.addEventListener('gesturestart', stop as EventListener)
  document.addEventListener('gesturechange', stop as EventListener)
  document.addEventListener('dblclick', stop)
  window.addEventListener('wheel', (e) => { if (e.ctrlKey) e.preventDefault() }, { passive: false })
  document.addEventListener('touchmove', (e) => { if (e.touches.length > 1) e.preventDefault() }, { passive: false })
  window.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && ['+', '-', '=', '0', '_'].includes(e.key)) e.preventDefault()
  })
}

export const goFullscreen = () => {
  if (!document.fullscreenElement) document.documentElement.requestFullscreen?.().catch(() => {})
}

export function registerServiceWorker() {
  if ('serviceWorker' in navigator && import.meta.env.PROD) {
    window.addEventListener('load', () => navigator.serviceWorker.register('/sw.js').catch(() => {}))
  }
}
