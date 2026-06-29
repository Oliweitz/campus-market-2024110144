// ============================================================
// 校园轻集市 — 购物车 (localStorage 持久化)
// ============================================================

import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import { useOrdersStore } from '@/stores/orders'
import { useItemStore } from '@/stores/itemStore'

const STORAGE_KEY = 'campus_market_cart'

export interface CartItem {
  id: number | string
  title: string
  price: number
  stock: number
  quantity: number
}

function loadCart(): CartItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch { return [] }
}

export const useCartStore = defineStore('cart', () => {
  const items = ref<CartItem[]>(loadCart())

  const totalCount = computed(() => items.value.reduce((s, i) => s + i.quantity, 0))
  const totalPrice = computed(() => {
    const t = items.value.reduce((s, i) => s + i.price * i.quantity, 0)
    return `¥${t}`
  })

  // 自动持久化
  watch(items, (val) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(val))
  }, { deep: true })

  function addToCart(product: { id: number | string; title: string; price: number; stock: number }) {
    const exist = items.value.find((i) => i.id == product.id)
    if (exist) {
      if (exist.quantity < exist.stock) exist.quantity++
    } else {
      items.value.push({ ...product, quantity: 1 })
    }
  }

  function removeFromCart(id: number | string) {
    items.value = items.value.filter((i) => i.id != id)
  }

  function updateQuantity(id: number | string, qty: number) {
    const item = items.value.find((i) => i.id == id)
    if (!item) return
    if (qty <= 0) { removeFromCart(id); return }
    if (qty > item.stock) { item.quantity = item.stock; return }
    item.quantity = qty
  }

  async function buyItem(id: number | string) {
    const cartItem = items.value.find((i) => i.id == id)
    if (!cartItem) return
    const ordersStore = useOrdersStore()
    const itemStore = useItemStore()

    ordersStore.addOrder({ id: cartItem.id, title: cartItem.title, price: cartItem.price, quantity: cartItem.quantity })

    const listing = itemStore.getById(cartItem.id)
    if (listing && listing.stock !== undefined) {
      const newStock = Math.max(0, listing.stock - cartItem.quantity)
      await itemStore.updateStock(cartItem.id, newStock)
    }
    removeFromCart(id)
  }

  function clearCart() { items.value = [] }

  return { items, totalCount, totalPrice, addToCart, removeFromCart, updateQuantity, buyItem, clearCart }
})
