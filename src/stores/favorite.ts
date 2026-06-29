// ============================================================
// 校园轻集市 — 收藏状态管理
// 数据源: JSON Server /favorites
// 注意: 所有 id 比较统一用 ==
// ============================================================

import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { favoriteApi } from '@/api/favoriteApi'
import { useUserStore } from '@/stores/user'
import { useItemStore } from '@/stores/itemStore'
import type { Favorite } from '@/data/listings'

export const useFavoriteStore = defineStore('favorite', () => {
  const favorites = ref<Favorite[]>([])
  const loading = ref(false)

  const count = computed(() => favorites.value.length)
  const favoritedIds = computed(() => new Set(favorites.value.map((f) => f.itemId)))

  async function fetchFavorites() {
    const uid = useUserStore().currentUserId
    if (!uid) return
    loading.value = true
    try {
      const res = await favoriteApi.getFavoritesByUser(uid)
      favorites.value = res.data
    } catch (e) {
      console.error('[favoriteStore] fetchFavorites:', e)
    } finally { loading.value = false }
  }

  function isFavorited(itemId: string | number): boolean {
    return favorites.value.some((f) => f.itemId == itemId)
  }

  async function toggle(itemId: string | number): Promise<boolean> {
    const uid = useUserStore().currentUserId
    if (!uid) return false
    const itemStore = useItemStore()

    const existing = favorites.value.find((f) => f.itemId == itemId)
    if (existing) {
      try {
        await favoriteApi.removeFavorite(existing.id)
        favorites.value = favorites.value.filter((f) => f.id != existing.id)
        itemStore.syncFavoriteCount(itemId, -1)
        return false
      } catch { return true }
    } else {
      try {
        const res = await favoriteApi.addFavorite({ userId: uid, itemId })
        favorites.value.push(res.data)
        itemStore.syncFavoriteCount(itemId, 1)
        return true
      } catch { return false }
    }
  }

  async function remove(itemId: string | number) { await toggle(itemId) }

  return { favorites, loading, count, favoritedIds, fetchFavorites, isFavorited, toggle, remove }
})
