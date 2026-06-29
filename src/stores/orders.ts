// ============================================================
// 校园轻集市 — 订单记录 (localStorage 持久化)
// ============================================================

import { ref, computed, watch } from 'vue'
import { defineStore } from 'pinia'

const STORAGE_KEY = 'campus_market_orders'

export interface Order {
  id: number
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

export const useOrdersStore = defineStore('orders', () => {
  const orders = ref<Order[]>(loadOrders())

  const totalSpent = computed(() => {
    const total = orders.value.reduce((sum, o) => sum + o.price * o.quantity, 0)
    return '¥' + total
  })

  // 自动持久化
  watch(orders, (val) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(val))
  }, { deep: true })

  function addOrder(item: { id: string | number; title: string; price: number; quantity: number }) {
    orders.value.unshift({
      id: Date.now(),
      listingId: item.id,
      title: item.title,
      price: item.price,
      quantity: item.quantity,
      time: new Date().toLocaleString('zh-CN'),
    })
  }

  return { orders, totalSpent, addOrder }
})
