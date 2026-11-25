import type { Vote } from '../types'
import type { VoteRepository } from './VoteRepository'

const KEY = 'inventarium.votes.v1'

export class LocalVoteRepository implements VoteRepository {
  private read(): Vote[] {
    try {
      const v = JSON.parse(localStorage.getItem(KEY) ?? '[]')
      return Array.isArray(v) ? v : []
    } catch {
      return []
    }
  }
  async add(vote: Vote): Promise<void> {
    const all = this.read()
    if (all.some((v) => v.id === vote.id)) return // idempotente: evita duplicados
    all.push(vote)
    localStorage.setItem(KEY, JSON.stringify(all))
  }
  async list(): Promise<Vote[]> {
    return this.read()
  }
}
