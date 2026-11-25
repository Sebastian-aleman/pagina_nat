import type { Vote } from '../types'

/**
 * Interfaz de almacenamiento de votos. Las pantallas solo usan esto.
 * Para conectar Supabase: crear SupabaseVoteRepository implementando
 * esta interfaz y cambiarlo en `votes/index.ts`. No se toca ninguna pantalla.
 */
export interface VoteRepository {
  add(vote: Vote): Promise<void>
  list(): Promise<Vote[]>
}
