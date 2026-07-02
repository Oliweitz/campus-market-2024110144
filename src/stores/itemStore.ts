// ============================================================
// 校园轻集市 — 校园信息状态管理
// 数据源: JSON Server /items
// 注意: JSON Server 可能返回字符串或数字 id，所有比较统一用 ==
// ============================================================

import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { itemApi } from '@/api/itemApi'
import type { Item, ItemType, ItemStatus } from '@/data/listings'

export const useItemStore = defineStore('item', () => {
  const items = ref<Item[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  // ---- getters ----
  const activeItems = computed(() => items.value.filter((i) => i.status === '进行中'))
  const completedItems = computed(() => items.value.filter((i) => i.status === '已完成'))
  const totalCount = computed(() => items.value.length)

  function getByType(type: ItemType): Item[] {
    return items.value.filter((i) => i.type === type)
  }
  function getByPublisher(publisherId: number): Item[] {
    return items.value.filter((i) => i.publisherId == publisherId)
  }

  // ---- actions ----
  /** 加载全部 items */
  async function fetchItems(params?: { type?: ItemType; campus?: string; status?: ItemStatus; q?: string }) {
    loading.value = true
    error.value = null
    try {
      const res = await itemApi.getItems(params)
      items.value = res.data
    } catch (e) {
      error.value = '加载信息列表失败'
      console.error('[itemStore] fetchItems:', e)
    } finally {
      loading.value = false
    }
  }

  /** 根据 id 获取单条 */
  function getById(id: string | number): Item | undefined {
    return items.value.find((i) => i.id == id)
  }

  /** 从 API 获取单条（缓存无则加入，有则更新） */
  async function fetchById(id: string | number): Promise<Item | undefined> {
    loading.value = true
    try {
      const res = await itemApi.getItemById(id)
      const idx = items.value.findIndex((i) => i.id == id)
      if (idx !== -1) {
        items.value[idx] = res.data
      } else {
        items.value.push(res.data)
      }
      return res.data
    } catch (e) {
      error.value = '加载详情失败'
    } finally {
      loading.value = false
    }
  }

  /** 发布新信息 */
  async function createItem(data: Omit<Item, 'id'>): Promise<Item> {
    loading.value = true
    error.value = null
    try {
      const res = await itemApi.createItem(data)
      items.value.unshift(res.data)
      return res.data
    } catch (e) {
      error.value = '发布失败'
      throw e
    } finally {
      loading.value = false
    }
  }

  /** 上传图片，返回 { url: string } */
  async function uploadImage(file: File): Promise<{ url: string }> {
    const res = await itemApi.uploadImage(file)
    return res.data
  }

  /** 更新状态 */
  async function updateStatus(id: string | number, status: ItemStatus): Promise<boolean> {
    try {
      await itemApi.updateItemStatus(id, status)
      const item = items.value.find((i) => i.id == id)
      if (item) { item.status = status; item.updatedAt = new Date().toISOString() }
      return true
    } catch { return false }
  }

  /** 删除信息 */
  async function deleteItem(id: string | number): Promise<boolean> {
    try {
      await itemApi.deleteItem(id)
      items.value = items.value.filter((i) => i.id != id)
      return true
    } catch {
      error.value = '删除失败'
      return false
    }
  }

  /** 增加浏览量 */
  async function incrementView(id: string | number) {
    const item = items.value.find((i) => i.id == id)
    if (!item) return
    try { await itemApi.incrementViewCount(id, item.viewCount); item.viewCount++ } catch { /* 静默 */ }
  }

  /** 更新库存（通过 API 持久化） */
  async function updateStock(id: string | number, stock: number) {
    try {
      await itemApi.updateItem(id, { stock })
      const item = items.value.find((i) => i.id == id)
      if (item) item.stock = stock
    } catch { /* 静默 */ }
  }

  /** 收藏数联动 */
  function syncFavoriteCount(id: string | number, delta: 1 | -1) {
    const item = items.value.find((i) => i.id == id)
    if (item) item.favoriteCount = Math.max(0, item.favoriteCount + delta)
  }

  /** 拼单人数 +1 */
  async function joinGroup(id: string | number): Promise<boolean> {
    const item = items.value.find((i) => i.id == id)
    if (!item || item.type !== 'group') return false
    const cur = item.currentCount ?? 0
    const max = item.targetCount ?? Infinity
    if (cur >= max) return false
    try {
      await itemApi.updateItem(id, { currentCount: cur + 1 })
      item.currentCount = cur + 1
      if (cur + 1 >= max) await updateStatus(id, '已完成')
      return true
    } catch { return false }
  }

  return { items, loading, error, activeItems, completedItems, totalCount, getByType, getByPublisher, fetchItems, getById, fetchById, createItem, uploadImage, updateStatus, incrementView, syncFavoriteCount, joinGroup, deleteItem, updateStock }
})
