// ============================================================
// 校园轻集市 — 订单记录 (UI 临时状态)
// ============================================================

import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

export interface Order {
  id: number
  listingId: string | number
  title: string
  price: number
  quantity: number
  time: string
}

export const useOrdersStore = defineStore('orders', () => {
  const orders = ref<Order[]>([])

  const totalSpent = computed(() => {
    const total = orders.value.reduce((sum, o) => sum + o.price * o.quantity, 0)
    return '¥' + total
  })

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
