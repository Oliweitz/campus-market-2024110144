// ============================================================
// 校园轻集市 — 购物车 (localStorage 缓存 + JSON Server 持久化)
// 刷新不丢、清缓存可恢复、换设备可同步
// ============================================================

import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import { useUserStore } from '@/stores/userStore'
import { useOrdersStore } from '@/stores/orders'
import { useItemStore } from '@/stores/itemStore'
import { cartApi } from '@/api/cartApi'

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

function saveCart(items: CartItem[]) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(items)) } catch {}
}

export const useCartStore = defineStore('cart', () => {
  const items = ref<CartItem[]>(loadCart())
  const loading = ref(false)
  const synced = ref(false)

  const totalCount = computed(() => items.value.reduce((s, i) => s + i.quantity, 0))
  const totalPrice = computed(() => {
    const t = items.value.reduce((s, i) => s + i.price * i.quantity, 0)
    return `¥${t}`
  })

  // 本地变更自动写 localStorage（保留离线能力）
  watch(items, (val) => {
    saveCart(val)
  }, { deep: true })

  /** 从 JSON Server 同步购物车（登录后调用） */
  async function syncFromServer() {
    const uid = useUserStore().currentUserId
    if (!uid) return
    loading.value = true
    try {
      const res = await cartApi.getByUser(uid)
      if (res.data.length > 0) {
        // 服务端有数据：以服务端为准
        items.value = res.data.map((r) => ({
          id: r.itemId,
          title: r.title,
          price: r.price,
          stock: r.stock,
          quantity: r.quantity,
        }))
      } else if (items.value.length > 0) {
        // 服务端无数据但本地有：上传本地数据到服务端（首次迁移）
        await Promise.all(items.value.map((item) =>
          cartApi.add({ userId: uid, itemId: item.id, title: item.title, price: item.price, stock: item.stock, quantity: item.quantity })
        ).map(p => p.catch(() => {})))
      }
      synced.value = true
    } catch {
      // API 不可用时保留本地数据
    } finally {
      loading.value = false
    }
  }

  function addToCart(product: { id: number | string; title: string; price: number; stock: number }) {
    const uid = useUserStore().currentUserId
    const exist = items.value.find((i) => i.id == product.id)
    if (exist) {
      if (exist.quantity < exist.stock) {
        exist.quantity++
        if (uid) cartApi.update(String(exist.id), { quantity: exist.quantity }).catch(() => {})
      }
    } else {
      items.value.push({ ...product, quantity: 1 })
      if (uid) {
        cartApi.add({ userId: uid, itemId: product.id, title: product.title, price: product.price, stock: product.stock, quantity: 1 }).catch(() => {})
      }
    }
  }

  function removeFromCart(id: number | string) {
    items.value = items.value.filter((i) => i.id != id)
    const uid = useUserStore().currentUserId
    if (uid) cartApi.remove(id).catch(() => {})
  }

  function updateQuantity(id: number | string, qty: number) {
    const item = items.value.find((i) => i.id == id)
    if (!item) return
    if (qty <= 0) { removeFromCart(id); return }
    if (qty > item.stock) { item.quantity = item.stock; return }
    item.quantity = qty
    const uid = useUserStore().currentUserId
    if (uid) cartApi.update(id, { quantity: qty }).catch(() => {})
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

  function clearCart() {
    items.value = []
    const uid = useUserStore().currentUserId
    if (uid) cartApi.clearByUser(uid).catch(() => {})
  }

  return { items, loading, synced, totalCount, totalPrice, syncFromServer, addToCart, removeFromCart, updateQuantity, buyItem, clearCart }
})
