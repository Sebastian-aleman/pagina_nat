import raw from './data/proyectos.json'
import config from './data/config.json'
import type { Datos, Lang, L, Proyecto } from './types'

export const datos = raw as unknown as Datos
export const cfg = config
export const proyectos: Proyecto[] = datos.proyectos
export const criterios = datos.votacion.criterios
export const demo = proyectos.find((p) => p.demostrativo) ?? null

export const txt = (v: L | undefined, lang: Lang): string => (v?.[lang] ?? '').trim()
export const modelBase = (p: Proyecto) => `/models/proyecto-${p.id}`
export const mediaUrl = (p: Proyecto, file: string) => `/media/proyecto-${p.id}/${file}`
export const thumbUrl = (p: Proyecto) => mediaUrl(p, 'miniatura.jpg')
