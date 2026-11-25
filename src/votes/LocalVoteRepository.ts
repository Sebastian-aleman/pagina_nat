import type { Vote } from '../types'
import { BadPinError, type RepoStatus, type VoteRepository } from './VoteRepository'
import { cfg } from '../data'

const KEY = 'inventarium.votes.v1'

export function readLocalVotes(): Vote[] {
  try {
    const v = JSON.parse(localStorage.getItem(KEY) ?? '[]')
    return Array.isArray(v) ? v : []
  } catch {
    return []
  }
}

export function writeLocalVote(vote: Vote) {
  const all = readLocalVotes()
  if (all.some((v) => v.id === vote.id)) return // idempotente: evita duplicados
  all.push(vote)
  localStorage.setItem(KEY, JSON.stringify(all))
}

/** Modo sin nube: los votos quedan solo en este navegador. */
export class LocalVoteRepository implements VoteRepository {
  async add(vote: Vote) { writeLocalVote(vote) }
  async list(pin: string) {
    if (pin !== cfg.adminPin) throw new BadPinError()
    return readLocalVotes()
  }
  status(): RepoStatus { return { mode: 'local', pending: 0 } }
}
