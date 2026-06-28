// ============================================================
// 校园轻集市 — 购物车 (UI 临时状态)
// ============================================================

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useOrdersStore } from '@/stores/orders'
import { useItemStore } from '@/stores/itemStore'

export interface CartItem {
  id: number | string
  title: string
  price: number
  stock: number    // 商品库存上限
  quantity: number
}

export const useCartStore = defineStore('cart', () => {
  const items = ref<CartItem[]>([])

  const totalCount = computed(() => items.value.reduce((s, i) => s + i.quantity, 0))
  const totalPrice = computed(() => {
    const t = items.value.reduce((s, i) => s + i.price * i.quantity, 0)
    return `¥${t}`
  })

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

  /** 购买：生成订单 → 扣库存(PATCH API) → 库存归零仍保留在列表中 → 从购物车移除 */
  async function buyItem(id: number | string) {
    const cartItem = items.value.find((i) => i.id == id)
    if (!cartItem) return
    const ordersStore = useOrdersStore()
    const itemStore = useItemStore()

    // 创建订单
    ordersStore.addOrder({ id: cartItem.id, title: cartItem.title, price: cartItem.price, quantity: cartItem.quantity })

    // 扣库存（通过 API 持久化）
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
