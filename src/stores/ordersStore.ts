// ============================================================
// 校园轻集市 — 订单记录 (localStorage 缓存 + JSON Server 持久化)
// 刷新不丢、清缓存可恢复、换设备可同步
// ============================================================

import { ref, computed, watch } from 'vue'
import { defineStore } from 'pinia'
import { useUserStore } from '@/stores/userStore'
import request from '@/api/request'

const STORAGE_KEY = 'campus_market_orders'

export interface Order {
  id: number
  listingId: string | number
  title: string
  price: number
  quantity: number
  time: string
}

interface OrderRecord {
  id?: number | string
  userId: string | number
  listingId: string | number
  title: string
  price: number
  quantity: number
  time: string
}

function loadOrders(): Order[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch { return [] }
}

function saveOrders(orders: Order[]) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(orders)) } catch {}
}

export const useOrdersStore = defineStore('orders', () => {
  const orders = ref<Order[]>(loadOrders())
  const loading = ref(false)
  const synced = ref(false)

  const totalSpent = computed(() => {
    const total = orders.value.reduce((sum, o) => sum + o.price * o.quantity, 0)
    return '¥' + total
  })

  // 本地变更自动写 localStorage
  watch(orders, (val) => {
    saveOrders(val)
  }, { deep: true })

  /** 从 JSON Server 同步订单（登录后调用） */
  async function syncFromServer() {
    const uid = useUserStore().currentUserId
    if (!uid) return
    loading.value = true
    try {
      const res = await request.get<OrderRecord[]>('/orders', { params: { userId: String(uid) } })
      if (res.data.length > 0) {
        orders.value = res.data.map((r) => ({
          id: Number(r.id),
          listingId: r.listingId,
          title: r.title,
          price: r.price,
          quantity: r.quantity,
          time: r.time,
        }))
      } else if (orders.value.length > 0) {
        // 服务端无数据但本地有：上传本地数据到服务端（首次迁移）
        await Promise.all(orders.value.map((o) =>
          request.post('/orders', { userId: uid, listingId: o.listingId, title: o.title, price: o.price, quantity: o.quantity, time: o.time })
        ).map(p => p.catch(() => {})))
      }
      synced.value = true
    } catch {
      // API 不可用时保留本地数据
    } finally {
      loading.value = false
    }
  }

  function addOrder(item: { id: string | number; title: string; price: number; quantity: number }) {
    const uid = useUserStore().currentUserId
    const order: Order = {
      id: Date.now(),
      listingId: item.id,
      title: item.title,
      price: item.price,
      quantity: item.quantity,
      time: new Date().toLocaleString('zh-CN'),
    }
    orders.value.unshift(order)
    // 异步写 JSON Server
    if (uid) {
      request.post('/orders', { userId: uid, ...order }).catch(() => {})
    }
  }

  return { orders, loading, synced, totalSpent, syncFromServer, addOrder }
})
