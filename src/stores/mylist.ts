import { ref } from 'vue'
import { defineStore } from 'pinia'
import { useListingsStore } from '@/stores/listings'

export interface MyRecord {
  id: number
  type: 'pintuan' | 'paotui'
  listingId: number
  title: string
  poster: string
}

export const useMyListStore = defineStore('mylist', () => {
  const items = ref<MyRecord[]>([])

  function addPintuan(listing: { id: number; title: string; poster: string }) {
    if (items.value.find(i => i.listingId === listing.id && i.type === 'pintuan')) return
    const store = useListingsStore()
    if (!store.incrementCount(listing.id)) return
    items.value.push({ id: Date.now(), type: 'pintuan', listingId: listing.id, title: listing.title, poster: listing.poster })
    // 拼单满员后自动撤下
    const updated = store.getById(listing.id)
    if (updated && updated.currentCount !== undefined && updated.targetCount !== undefined && updated.currentCount >= updated.targetCount) {
      store.updateStatus(listing.id, 'completed')
    }
  }

  function addPaotui(listing: { id: number; title: string; poster: string }) {
    if (items.value.find(i => i.listingId === listing.id && i.type === 'paotui')) return
    const store = useListingsStore()
    items.value.push({ id: Date.now(), type: 'paotui', listingId: listing.id, title: listing.title, poster: listing.poster })
    // 接单后跑腿从列表撤下
    store.updateStatus(listing.id, 'completed')
  }

  function withdraw(id: number) {
    const record = items.value.find(i => i.id === id)
    if (!record) return
    const store = useListingsStore()
    const listing = store.getById(record.listingId)
    if (listing) {
      if (record.type === 'paotui') {
        // 退出跑腿，任务回到列表
        store.updateStatus(record.listingId, 'active')
      } else if (record.type === 'pintuan' && listing.currentCount !== undefined) {
        // 退出拼单，人数减一，若之前满员则恢复
        listing.currentCount = Math.max(1, listing.currentCount - 1)
        if (listing.currentCount < (listing.targetCount ?? 0)) {
          store.updateStatus(record.listingId, 'active')
        }
      }
    }
    items.value = items.value.filter(i => i.id !== id)
  }

  return { items, addPintuan, addPaotui, withdraw }
})
