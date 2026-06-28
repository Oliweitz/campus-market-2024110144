// ============================================================
// 校园轻集市 — 统计工具
// ============================================================

import type { Item, ItemType, ItemStatus } from '@/data/listings'
import { TYPE_LABELS, CAMPUS_LIST } from '@/data/listings'

export interface TypeStat {
  label: string
  key: ItemType
  count: number
  percent: number
}

export interface CampusStat {
  label: string
  count: number
  percent: number
}

export interface StatusStat {
  label: string
  key: ItemStatus
  count: number
  percent: number
}

/** 统计各类型数量及占比 */
export function countByType(items: Item[]): TypeStat[] {
  const types: ItemType[] = ['secondhand', 'lostfound', 'group', 'errand']
  const total = items.length || 1
  return types.map((key) => {
    const count = items.filter((i) => i.type === key).length
    return {
      label: TYPE_LABELS[key],
      key,
      count,
      percent: Math.round((count / total) * 100),
    }
  })
}

/** 统计各校区数量及占比 */
export function countByCampus(items: Item[]): CampusStat[] {
  const total = items.length || 1
  return CAMPUS_LIST.map((campus) => {
    const count = items.filter((i) => i.campus === campus).length
    return { label: campus, count, percent: Math.round((count / total) * 100) }
  }).filter((s) => s.count > 0)
}

/** 统计各状态数量及占比 */
export function countByStatus(items: Item[]): StatusStat[] {
  const statuses: ItemStatus[] = ['进行中', '已完成', '已关闭']
  const total = items.length || 1
  return statuses.map((key) => {
    const count = items.filter((i) => i.status === key).length
    return { label: key, key, count, percent: Math.round((count / total) * 100) }
  })
}

/** 获取热门信息 (按 viewCount 降序取前 N) */
export function getHotItems(items: Item[], topN = 5): Item[] {
  return [...items].sort((a, b) => b.viewCount - a.viewCount).slice(0, topN)
}

/** 获取最新信息 (按 createdAt 降序取前 N) */
export function getRecentItems(items: Item[], topN = 6): Item[] {
  return [...items].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).reverse().slice(0, topN)
}
