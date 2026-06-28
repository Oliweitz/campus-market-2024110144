import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useListingsStore } from '@/stores/listings'
import { useOrdersStore } from '@/stores/orders'

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
    const cartItem = items.value.find(i => i.id === id)
    if (!cartItem) return
    // 记录订单
    const ordersStore = useOrdersStore()
    ordersStore.addOrder({ id: cartItem.id, title: cartItem.title, price: cartItem.price, quantity: cartItem.quantity })
    // 减少库存
    const listStore = useListingsStore()
    const listing = listStore.getById(id)
    if (listing && listing.stock !== undefined) {
      listing.stock = Math.max(0, listing.stock - cartItem.quantity)
    }
    // 库存归零则撤下
    if (listing && listing.stock === 0) {
      listStore.updateStatus(id, 'completed')
    }
    // 从购物车移除
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
