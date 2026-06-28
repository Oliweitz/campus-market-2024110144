import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export interface CartItem {
  id: number
  title: string
  price: string
  stock: number
  quantity: number
}

export const useCartStore = defineStore('cart', () => {
  const items = ref<CartItem[]>([])

  const totalCount = computed(() => items.value.reduce((sum, i) => sum + i.quantity, 0))

  const totalPrice = computed(() => {
    const total = items.value.reduce((sum, i) => sum + parseFloat(i.price.replace('¥', '')) * i.quantity, 0)
    return `¥${total}`
  })

  function addToCart(product: Omit<CartItem, 'quantity'>) {
    const exist = items.value.find(i => i.id === product.id)
    if (exist) {
      if (exist.quantity < exist.stock) {
        exist.quantity++
      }
    } else {
      items.value.push({ ...product, quantity: 1 })
    }
  }

  function buyItem(id: number) {
    items.value = items.value.filter(i => i.id !== id)
  }

  function removeFromCart(id: number) {
    items.value = items.value.filter(i => i.id !== id)
  }

  function clearCart() {
    items.value = []
  }

  return { items, totalCount, totalPrice, addToCart, buyItem, removeFromCart, clearCart }
})
