import type { Vote } from '../types'

export class BadPinError extends Error {
  constructor() { super('PIN incorrecto') }
}

export interface RepoStatus {
  mode: 'cloud' | 'local'   // dónde se guardan los votos
  pending: number           // votos aún sin enviar a la nube
}

/**
 * Interfaz de almacenamiento de votos. Las pantallas solo usan esto.
 * - add: guarda un voto (idempotente por id).
 * - list: devuelve todos los votos; exige el PIN de administrador.
 *   Lanza BadPinError si el PIN no es válido.
 */
export interface VoteRepository {
  add(vote: Vote): Promise<void>
  list(pin: string): Promise<Vote[]>
  status(): RepoStatus
}
