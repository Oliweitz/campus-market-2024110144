import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

export interface Order {
  id: number
  listingId: number
  title: string
  price: string
  quantity: number
  time: string
}

export const useOrdersStore = defineStore('orders', () => {
  const orders = ref<Order[]>([])

  const totalSpent = computed(() => {
    const total = orders.value.reduce((sum, o) => sum + parseFloat(o.price.replace('¥', '')) * o.quantity, 0)
    return '¥' + total
  })

  function addOrder(item: { id: number; title: string; price: string; quantity: number }) {
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
