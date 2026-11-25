import { LocalVoteRepository } from './LocalVoteRepository'
import { SupabaseVoteRepository } from './SupabaseVoteRepository'
import type { VoteRepository } from './VoteRepository'
import type { Vote } from '../types'
import { criterios } from '../data'

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined
const key = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

/** Con las dos variables de entorno usa la nube; sin ellas, guarda solo en este navegador. */
export const voteRepo: VoteRepository = url && key ? new SupabaseVoteRepository(url, key) : new LocalVoteRepository()

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
