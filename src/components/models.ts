import { useGLTF } from '@react-three/drei'
import type { Proyecto } from '../types'
import { modelBase } from '../data'

export const DRACO_PATH = '/draco/'

const cache = new Map<string, Promise<string | null>>()

/** Comprueba que el archivo exista de verdad (el servidor puede devolver index.html). */
async function exists(url: string): Promise<boolean> {
  const ctl = new AbortController()
  try {
    const r = await fetch(url, { signal: ctl.signal })
    const ct = r.headers.get('content-type') ?? ''
    return r.ok && !ct.includes('text/html')
  } catch {
    return false
  } finally {
    ctl.abort() // no descargar el cuerpo completo
  }
}

/** Devuelve la URL del modelo (.glb o .gltf) o null si no hay archivo. */
export function resolveModel(p: Proyecto): Promise<string | null> {
  const key = p.id
  let hit = cache.get(key)
  if (!hit) {
    hit = (async () => {
      for (const ext of ['glb', 'gltf']) {
        const url = `${modelBase(p)}.${ext}`
        if (await exists(url)) return url
      }
      return null
    })()
    cache.set(key, hit)
  }
  return hit
}

export function forgetModelLookup(p: Proyecto) {
  cache.delete(p.id)
}

export function preloadModel(p: Proyecto) {
  resolveModel(p).then((url) => { if (url) useGLTF.preload(url, DRACO_PATH) })
}

/** Libera la memoria GPU/CPU de un modelo que ya no está cerca. */
export function releaseModel(p: Proyecto) {
  resolveModel(p).then((url) => {
    if (!url) return
    try { useGLTF.clear(url) } catch { /* ya liberado */ }
  })
}
