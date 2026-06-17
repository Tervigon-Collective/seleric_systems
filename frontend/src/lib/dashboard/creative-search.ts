// Universal search for the Creative IQ module.
//
// Self-contained, dependency-free fuzzy matcher (fzy-inspired) plus an index
// builder over the three searchable entity kinds on the page: neuro tags, ads,
// and neuro categories. The matcher is tiered so that the most intuitive
// matches always outrank weaker ones:
//
//   exact  >  prefix  >  word-boundary substring  >  inner substring  >  fuzzy
//
// The fuzzy tier (a Smith–Waterman-style DP from jhawthorn/fzy) gives
// typo / acronym / "characters-in-order" tolerance so e.g. "emtrig" still finds
// "Emotional Triggers" and "scrcty" finds a "Scarcity" hack.

import type { AdRow } from "@/components/charts/AdPerformanceTable"
import type { ScoredTag } from "./neurotag-scorer"

export type SearchKind = "tag" | "ad" | "category"

export type CreativeSearchSelect =
  | { kind: "ad"; adId: string; adName: string }
  | { kind: "tag"; tagCode: string; hackName: string }
  | { kind: "category"; category: string }

interface SearchField {
  text: string
  weight: number
}

export interface SearchEntry {
  kind: SearchKind
  id: string
  title: string
  subtitle: string
  /** Strings to match against, each with a relative weight (title = 1). */
  fields: SearchField[]
  /** Magnitude signal (spend) used as a tie-breaker so big spenders surface first. */
  popularity: number
  metrics: { spend?: number; roas?: number; score?: number; count?: number; badge?: string }
  select: CreativeSearchSelect
}

export interface SearchHit {
  entry: SearchEntry
  score: number
  /** Character indices within `entry.title` to highlight. */
  positions: number[]
}

// ---------------------------------------------------------------------------
// Low-level matcher
// ---------------------------------------------------------------------------

const SEPARATORS = new Set([" ", "-", "_", "/", ".", "|", ":", ",", "(", ")", "[", "]"])

function isSep(ch: string): boolean { return SEPARATORS.has(ch) }
function isUpper(ch: string): boolean { return ch >= "A" && ch <= "Z" }
function isLower(ch: string): boolean { return ch >= "a" && ch <= "z" }
function isDigit(ch: string): boolean { return ch >= "0" && ch <= "9" }
function isAlnum(ch: string): boolean { return isUpper(ch) || isLower(ch) || isDigit(ch) }

function range(start: number, end: number): number[] {
  const out: number[] = []
  for (let i = start; i < end; i++) out.push(i)
  return out
}

// fzy scoring constants
const GAP_LEADING = -0.005
const GAP_INNER = -0.01
const GAP_TRAILING = -0.005
const MATCH_CONSECUTIVE = 1.0
const MATCH_SLASH = 0.9
const MATCH_WORD = 0.8
const MATCH_CAPITAL = 0.7
const MATCH_DOT = 0.6
const SCORE_MIN = -Infinity

/** Bonus for matching `ch` given the character immediately before it. */
function boundaryBonus(prev: string | undefined, ch: string): number {
  if (!isAlnum(ch)) return 0
  if (prev === undefined) return MATCH_SLASH // start of string = strong boundary
  if (prev === "/") return MATCH_SLASH
  if (prev === "-" || prev === "_" || prev === " ") return MATCH_WORD
  if (prev === ".") return MATCH_DOT
  if (isLower(prev) && isUpper(ch)) return MATCH_CAPITAL // camelCase
  return 0
}

/** Cheap pre-filter: is `q` a subsequence of `text`? (both lowercased) */
function isSubsequence(q: string, text: string): boolean {
  let k = 0
  for (let j = 0; j < text.length && k < q.length; j++) {
    if (text[j] === q[k]) k++
  }
  return k === q.length
}

/**
 * Full fzy DP with traceback. `query` must be lowercased; `textRaw` keeps its
 * original case so camelCase boundaries are detectable. Returns null if there
 * is no valid subsequence match.
 */
function fzyMatch(query: string, textRaw: string): { score: number; positions: number[] } | null {
  const n = textRaw.length
  const m = query.length
  if (m === 0) return { score: 0, positions: [] }
  if (m > n) return null

  const text = textRaw.toLowerCase()
  if (!isSubsequence(query, text)) return null

  const bonus = new Array<number>(n)
  for (let j = 0; j < n; j++) {
    bonus[j] = boundaryBonus(j === 0 ? undefined : textRaw[j - 1], textRaw[j])
  }

  // D[i][j] = best score ending with query[i] matched at text[j]
  // M[i][j] = best score for query[0..i] using text[0..j]
  const D: number[][] = Array.from({ length: m }, () => new Array<number>(n).fill(SCORE_MIN))
  const M: number[][] = Array.from({ length: m }, () => new Array<number>(n).fill(SCORE_MIN))

  for (let i = 0; i < m; i++) {
    let prevScore = SCORE_MIN
    const gap = i === m - 1 ? GAP_TRAILING : GAP_INNER
    const qc = query[i]
    for (let j = 0; j < n; j++) {
      if (qc === text[j]) {
        let score = SCORE_MIN
        if (i === 0) {
          score = j * GAP_LEADING + bonus[j]
        } else if (j > 0) {
          score = Math.max(
            M[i - 1][j - 1] + bonus[j],
            D[i - 1][j - 1] + MATCH_CONSECUTIVE,
          )
        }
        D[i][j] = score
        prevScore = Math.max(score, prevScore + gap)
        M[i][j] = prevScore
      } else {
        D[i][j] = SCORE_MIN
        prevScore += gap
        M[i][j] = prevScore
      }
    }
  }

  const score = M[m - 1][n - 1]
  if (!isFinite(score)) return null

  // Traceback for highlight positions.
  const positions = new Array<number>(m).fill(-1)
  let matchRequired = false
  let j = n - 1
  for (let i = m - 1; i >= 0; i--) {
    for (; j >= 0; j--) {
      if (D[i][j] !== SCORE_MIN && (matchRequired || D[i][j] === M[i][j])) {
        matchRequired = i > 0 && j > 0 && M[i][j] === D[i - 1][j - 1] + MATCH_CONSECUTIVE
        positions[i] = j
        j--
        break
      }
    }
  }
  return { score, positions: positions.filter((p) => p >= 0) }
}

/**
 * Tiered match of a single query against a single field. Returns a normalized
 * score in (0, 1] plus the matched character positions, or null for no match.
 * `query` must already be lowercased and trimmed.
 */
function scoreField(query: string, textRaw: string): { score: number; positions: number[] } | null {
  if (!query) return { score: 0, positions: [] }
  if (!textRaw) return null
  const text = textRaw.toLowerCase()

  if (text === query) return { score: 1, positions: range(0, query.length) }

  const idx = text.indexOf(query)
  if (idx !== -1) {
    const coverage = query.length / text.length
    const atStart = idx === 0
    const atBoundary = idx > 0 && isSep(textRaw[idx - 1])
    let tier: number
    if (atStart) tier = 0.85
    else if (atBoundary) tier = 0.72
    else tier = 0.55 - Math.min(idx, 20) * 0.005 // later occurrence = slightly worse
    const score = Math.min(0.97, tier + 0.12 * coverage)
    return { score, positions: range(idx, idx + query.length) }
  }

  const fz = fzyMatch(query, textRaw)
  if (!fz) return null
  // Normalize fzy's open-ended score into the [0.1, 0.5] band so fuzzy hits
  // always rank below any substring hit.
  const best = MATCH_SLASH + Math.max(0, query.length - 1) * MATCH_CONSECUTIVE
  const norm = best > 0 ? Math.max(0, Math.min(1, fz.score / best)) : 0
  return { score: 0.1 + 0.4 * norm, positions: fz.positions }
}

/** Best title positions to highlight, trying the whole query then each token. */
function highlightTitle(query: string, tokens: string[], title: string): number[] {
  const whole = scoreField(query, title)
  if (whole && whole.positions.length) return whole.positions
  const set = new Set<number>()
  for (const tok of tokens) {
    const r = scoreField(tok, title)
    if (r) r.positions.forEach((p) => set.add(p))
  }
  return [...set].sort((a, b) => a - b)
}

// ---------------------------------------------------------------------------
// Index + search
// ---------------------------------------------------------------------------

export function buildCreativeIndex(tags: ScoredTag[], ads: AdRow[]): SearchEntry[] {
  const entries: SearchEntry[] = []

  for (const t of tags) {
    if (!t.tag_code || t.tag_code === "__untagged__") continue
    entries.push({
      kind: "tag",
      id: t.tag_code,
      title: t.hack_name && t.hack_name !== "—" ? t.hack_name : t.tag_code,
      subtitle: `${t.tag_code} · ${t.category_name}`,
      fields: [
        { text: t.hack_name, weight: 1 },
        { text: t.tag_code, weight: 0.95 },
        { text: t.category_name, weight: 0.6 },
      ],
      popularity: t.spend,
      metrics: { spend: t.spend, roas: t.roas, score: t.score, badge: t.classification },
      select: { kind: "tag", tagCode: t.tag_code, hackName: t.hack_name },
    })
  }

  // Distinct neuro categories rolled up from the tag set.
  const cats = new Map<string, { spend: number; count: number }>()
  for (const t of tags) {
    const name = t.category_name
    if (!name || name === "—") continue
    const agg = cats.get(name) ?? { spend: 0, count: 0 }
    agg.spend += t.spend
    agg.count += 1
    cats.set(name, agg)
  }
  for (const [name, agg] of cats) {
    entries.push({
      kind: "category",
      id: name,
      title: name,
      subtitle: `${agg.count} tag${agg.count !== 1 ? "s" : ""}`,
      fields: [{ text: name, weight: 1 }],
      popularity: agg.spend,
      metrics: { spend: agg.spend, count: agg.count },
      select: { kind: "category", category: name },
    })
  }

  for (const a of ads) {
    if (!a.ad_id) continue
    const tagText = a.tags.map((t) => `${t.tag_code} ${t.hack_name}`).join(" ")
    entries.push({
      kind: "ad",
      id: a.ad_id,
      title: a.ad_name && a.ad_name !== "—" ? a.ad_name : a.ad_id,
      subtitle: a.campaign_name,
      fields: [
        { text: a.ad_name, weight: 1 },
        { text: tagText, weight: 0.7 },
        { text: a.campaign_name, weight: 0.6 },
        { text: a.adset_name, weight: 0.5 },
      ],
      popularity: a.spend,
      metrics: { spend: a.spend, roas: a.roas },
      select: { kind: "ad", adId: a.ad_id, adName: a.ad_name },
    })
  }

  return entries
}

/** Rank an index against a query. Multi-word queries require every token to
 *  match somewhere in the entry (AND semantics). */
export function searchCreative(index: SearchEntry[], rawQuery: string, limit = 12): SearchHit[] {
  const query = rawQuery.trim().toLowerCase()
  if (!query) return []
  const tokens = query.split(/\s+/).filter(Boolean)
  const maxPop = Math.max(1, ...index.map((e) => e.popularity || 0))

  const hits: SearchHit[] = []
  for (const entry of index) {
    // Best single-string match of the full query across the entry's fields.
    let whole = 0
    for (const f of entry.fields) {
      const r = scoreField(query, f.text)
      if (r) whole = Math.max(whole, r.score * f.weight)
    }

    // Token-AND: each token must hit some field; score = mean of per-token best.
    let tokenScore = 0
    if (tokens.length > 1) {
      let sum = 0
      let allMatched = true
      for (const tok of tokens) {
        let bestTok = 0
        for (const f of entry.fields) {
          const r = scoreField(tok, f.text)
          if (r) bestTok = Math.max(bestTok, r.score * f.weight)
        }
        if (bestTok === 0) { allMatched = false; break }
        sum += bestTok
      }
      if (allMatched) tokenScore = (sum / tokens.length) * 0.95
    }

    const base = Math.max(whole, tokenScore)
    if (base <= 0) continue

    const pop = (entry.popularity || 0) / maxPop
    hits.push({
      entry,
      score: base + pop * 0.03, // small magnitude tie-breaker
      positions: highlightTitle(query, tokens, entry.title),
    })
  }

  hits.sort((a, b) => b.score - a.score || b.entry.popularity - a.entry.popularity)
  return hits.slice(0, limit)
}
