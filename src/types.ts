export type Lang = 'es' | 'en'
export type L = { es: string; en: string }

export interface MediaItem {
  tipo: 'imagen' | 'video'
  archivo: string
  titulo?: L
}

export interface Proyecto {
  id: string
  demostrativo?: boolean
  nombre: L
  autores: string[]
  semestre: L
  descripcion: L
  proposito: L
  materiales: L[]
  queEs: L
  comoSeHizo: L
  comoFunciona: L
  media: MediaItem[]
}

export interface Criterio { id: string; nombre: L }

export interface Datos {
  muestra: { titulo: L; descripcion: L }
  votacion: { criterios: Criterio[] }
  proyectos: Proyecto[]
}

export interface Vote {
  id: string
  projectId: string
  createdAt: string
  ratings: Record<string, number>
}

export type Screen =
  | 'welcome' | 'vitrina' | 'catalogo' | 'detalle'
  | 'votacion' | 'muestra' | 'gracias' | 'pin' | 'admin'
