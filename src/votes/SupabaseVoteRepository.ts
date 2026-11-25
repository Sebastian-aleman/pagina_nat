import type { Vote } from '../types'
import { BadPinError, type RepoStatus, type VoteRepository } from './VoteRepository'

const QUEUE = 'inventarium.queue.v1'

const readQueue = (): Vote[] => {
  try {
    const v = JSON.parse(localStorage.getItem(QUEUE) ?? '[]')
    return Array.isArray(v) ? v : []
  } catch {
    return []
  }
}
const writeQueue = (q: Vote[]) => {
  try { localStorage.setItem(QUEUE, JSON.stringify(q)) } catch { /* sin espacio: se reintenta */ }
}

/**
 * Guarda los votos en Supabase (REST, sin dependencias).
 * Si no hay conexión, el voto queda en una cola local y se envía solo
 * cuando vuelve internet. Ver docs/supabase.sql para la tabla y la función.
 */
export class SupabaseVoteRepository implements VoteRepository {
  private flushing = false

  constructor(private url: string, private key: string) {
    window.addEventListener('online', () => void this.flush())
    window.setInterval(() => void this.flush(), 60_000)
    void this.flush()
  }

  private headers(extra: Record<string, string> = {}) {
    return { apikey: this.key, Authorization: `Bearer ${this.key}`, 'Content-Type': 'application/json', ...extra }
  }

  async add(vote: Vote) {
    const q = readQueue()
    if (!q.some((v) => v.id === vote.id)) writeQueue([...q, vote])
    void this.flush() // sin await: el visitante no espera a la red
  }

  private async flush() {
    if (this.flushing) return
    const q = readQueue()
    if (q.length === 0) return
    this.flushing = true
    try {
      // Un voto por petición: así un duplicado no bloquea a los demás.
      for (const v of q) {
        const res = await fetch(`${this.url}/rest/v1/votes`, {
          method: 'POST',
          headers: this.headers({ Prefer: 'return=minimal' }),
          body: JSON.stringify({ id: v.id, project_id: v.projectId, ratings: v.ratings, created_at: v.createdAt }),
        })
        // 409 = ese id ya estaba guardado (reintento): cuenta como enviado
        if (res.ok || res.status === 409) writeQueue(readQueue().filter((x) => x.id !== v.id))
        else break // error del servidor: reintenta más tarde, sin perder el voto
      }
    } catch { /* sin conexión: queda en cola */ } finally {
      this.flushing = false
    }
  }

  async list(pin: string): Promise<Vote[]> {
    const res = await fetch(`${this.url}/rest/v1/rpc/admin_votes`, {
      method: 'POST',
      headers: this.headers(),
      body: JSON.stringify({ p_pin: pin }),
    })
    if (!res.ok) {
      const text = await res.text().catch(() => '')
      if (text.includes('bad_pin')) throw new BadPinError()
      throw new Error(`Error ${res.status}`)
    }
    const rows = (await res.json()) as { id: string; project_id: string; ratings: Record<string, number>; created_at: string }[]
    return rows.map((r) => ({ id: r.id, projectId: r.project_id, ratings: r.ratings, createdAt: r.created_at }))
  }

  status(): RepoStatus { return { mode: 'cloud', pending: readQueue().length } }
}
