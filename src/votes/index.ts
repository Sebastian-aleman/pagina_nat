import { LocalVoteRepository } from './LocalVoteRepository'
import type { VoteRepository } from './VoteRepository'
import type { Vote } from '../types'
import { criterios } from '../data'

export const voteRepo: VoteRepository = new LocalVoteRepository()

export const newVote = (projectId: string, ratings: Record<string, number>): Vote => ({
  id: crypto.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(16).slice(2)}`,
  projectId,
  ratings,
  createdAt: new Date().toISOString(),
})

export function toCsv(votes: Vote[]): string {
  const esc = (s: string) => `"${s.replace(/"/g, '""')}"`
  const head = ['id', 'fecha', 'proyecto', ...criterios.map((c) => c.id)]
  const rows = votes.map((v) => [
    v.id, v.createdAt, v.projectId, ...criterios.map((c) => String(v.ratings[c.id] ?? '')),
  ])
  return '﻿' + [head, ...rows].map((r) => r.map(esc).join(',')).join('\r\n')
}
