// ============================================================
// 校园轻集市 — 我的参与记录（拼单/跑腿）
// ============================================================

import { ref } from 'vue'
import { defineStore } from 'pinia'
import { useItemStore } from '@/stores/itemStore'

export interface MyRecord {
  id: number
  type: 'group' | 'errand'
  listingId: number
  title: string
  publisherId: number
}

export const useMyListStore = defineStore('mylist', () => {
  const items = ref<MyRecord[]>([])

  async function joinGroup(listing: { id: number; title: string; publisherId: number }) {
    if (items.value.find((i) => i.listingId === listing.id && i.type === 'group')) return
    const itemStore = useItemStore()
    const ok = await itemStore.joinGroup(listing.id)
    if (!ok) return
    items.value.push({
      id: Date.now(),
      type: 'group',
      listingId: listing.id,
      title: listing.title,
      publisherId: listing.publisherId,
    })
  }

  async function takeErrand(listing: { id: number; title: string; publisherId: number }) {
    if (items.value.find((i) => i.listingId === listing.id && i.type === 'errand')) return
    const itemStore = useItemStore()
    await itemStore.updateStatus(listing.id, '已完成')
    items.value.push({
      id: Date.now(),
      type: 'errand',
      listingId: listing.id,
      title: listing.title,
      publisherId: listing.publisherId,
    })
  }

  async function withdraw(id: number) {
    const record = items.value.find((i) => i.id === id)
    if (!record) return
    const itemStore = useItemStore()
    const listing = itemStore.getById(record.listingId)
    if (listing) {
      if (record.type === 'errand') {
        await itemStore.updateStatus(record.listingId, '进行中')
      } else if (record.type === 'group' && listing.currentCount !== undefined) {
        const newCount = Math.max(1, listing.currentCount - 1)
        listing.currentCount = newCount
        if (newCount < (listing.targetCount ?? 0)) {
          await itemStore.updateStatus(record.listingId, '进行中')
        }
      }
    }
    items.value = items.value.filter((i) => i.id !== id)
  }

  return { items, joinGroup, takeErrand, withdraw }
})
