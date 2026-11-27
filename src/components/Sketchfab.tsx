import { useEffect, useState } from 'react'
import type { Proyecto } from '../types'
import { useApp } from '../state'
import { tr } from '../i18n'

/** Extrae el ID (32 caracteres hex) de un enlace completo de Sketchfab o de un ID suelto. */
export function sketchfabUid(p: Proyecto): string | null {
  const m = (p.sketchfab ?? '').match(/([0-9a-f]{32})/i)
  return m ? m[1].toLowerCase() : null
}

const thumbCache = new Map<string, Promise<string | null>>()

/** Miniatura del modelo desde la API pública de Sketchfab (se guarda para no repetir la consulta). */
export function sketchfabThumb(uid: string): Promise<string | null> {
  let hit = thumbCache.get(uid)
  if (!hit) {
    const key = `inventarium.sfthumb.${uid}`
    hit = (async () => {
      try {
        const saved = localStorage.getItem(key)
        if (saved) return saved
      } catch { /* sin almacenamiento */ }
      try {
        const res = await fetch(`https://api.sketchfab.com/v3/models/${uid}`)
        if (!res.ok) return null
        const j = (await res.json()) as { thumbnails?: { images?: { url: string; width: number }[] } }
        const imgs = (j.thumbnails?.images ?? []).filter((i) => i.width >= 400).sort((a, b) => a.width - b.width)
        const url = imgs[0]?.url ?? j.thumbnails?.images?.[0]?.url ?? null
        if (url) try { localStorage.setItem(key, url) } catch { /* ok */ }
        return url
      } catch {
        return null
      }
    })()
    thumbCache.set(uid, hit)
  }
  return hit
}

interface Props {
  uid: string
  interactive: boolean
  autoRotate: boolean
  reloadKey: number
}

/** Visor embebido de Sketchfab (requiere internet). */
export function SketchfabEmbed({ uid, interactive, autoRotate, reloadKey }: Props) {
  const { lang } = useApp()
  const t = tr(lang)
  const [loaded, setLoaded] = useState(false)
  const [online, setOnline] = useState(navigator.onLine)

  useEffect(() => {
    const on = () => setOnline(true)
    const off = () => setOnline(false)
    window.addEventListener('online', on)
    window.addEventListener('offline', off)
    return () => { window.removeEventListener('online', on); window.removeEventListener('offline', off) }
  }, [])

  useEffect(() => setLoaded(false), [uid, reloadKey])

  const params = new URLSearchParams({
    autostart: '1', preload: '1', transparent: '1', dnt: '1',
    ui_infos: '0', ui_controls: '0', ui_stop: '0', ui_inspector: '0', ui_settings: '0',
    ui_help: '0', ui_hint: '0', ui_vr: '0', ui_ar: '0', ui_annotations: '0',
    ui_fullscreen: '0', ui_watermark_link: '0', ui_loading: '0',
    ...(autoRotate ? { autospin: '0.3' } : {}),
  })

  if (!online) {
    return (
      <div className="viewer-overlay">
        <div className="badge warn">{t.needsInternet}</div>
      </div>
    )
  }

  return (
    <>
      <iframe
        key={`${uid}-${reloadKey}`}
        className="sketchfab"
        title="Sketchfab"
        src={`https://sketchfab.com/models/${uid}/embed?${params}`}
        allow="autoplay; fullscreen; xr-spatial-tracking"
        onLoad={() => setLoaded(true)}
        // En la vitrina el carrusel necesita los toques (deslizar / pausar)
        style={{ pointerEvents: interactive ? 'auto' : 'none' }}
      />
      {!loaded && (
        <div className="viewer-overlay">
          <div className="badge">{t.loading}</div>
        </div>
      )}
    </>
  )
}
