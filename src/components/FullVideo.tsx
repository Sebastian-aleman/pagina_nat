import { useEffect, useRef, useState } from 'react'
import { useApp } from '../state'
import { tr } from '../i18n'

/**
 * Video a pantalla completa, en bucle y CON sonido.
 * Se abre por un toque del usuario, así que el navegador normalmente permite el audio.
 * Si aun así lo bloquea, arranca en silencio y muestra el botón para activar el sonido.
 */
export function FullVideo({ src, onClose }: { src: string; onClose: () => void }) {
  const { lang } = useApp()
  const t = tr(lang)
  const ref = useRef<HTMLVideoElement>(null)
  const [muted, setMuted] = useState(false)

  useEffect(() => {
    const v = ref.current
    if (!v) return
    v.muted = false
    v.play().catch(() => {
      v.muted = true
      setMuted(true)
      v.play().catch(() => {})
    })
  }, [src])

  const toggleSound = (e: React.MouseEvent) => {
    e.stopPropagation()
    const v = ref.current
    if (!v) return
    v.muted = !v.muted
    setMuted(v.muted)
    if (v.paused) v.play().catch(() => {})
  }

  return (
    <div className="video-full" onClick={onClose}>
      <video ref={ref} src={src} loop playsInline data-loop />
      <button className="btn sound" onClick={toggleSound}>
        {muted ? `🔇 ${t.soundOn}` : `🔊 ${t.soundOff}`}
      </button>
      <button className="btn round" onClick={(e) => { e.stopPropagation(); onClose() }} aria-label={t.close}>✕</button>
    </div>
  )
}
