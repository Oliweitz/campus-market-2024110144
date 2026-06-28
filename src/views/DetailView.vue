<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useCartStore } from '@/stores/cart'

const route = useRoute()
const router = useRouter()
const cart = useCartStore()

const mockProducts: Record<string, { id: number; title: string; price: string; seller: string; desc: string; stock: number }> = {
  '1': { id: 1, title: '九成新《JavaScript高级程序设计》', price: '¥35', seller: '张三', desc: '几乎全新，仅翻阅过前两章，无笔记无折痕。', stock: 1 },
  '2': { id: 2, title: '折叠书桌 宿舍必备', price: '¥60', seller: '李四', desc: '桌面平整，折叠方便，不占空间，八成新。', stock: 1 },
  '3': { id: 3, title: '机械键盘 Cherry轴', price: '¥120', seller: '王五', desc: 'Cherry茶轴，全键无冲，RGB背光，使用半年。', stock: 3 },
  '4': { id: 4, title: '台灯 LED护眼', price: '¥25', seller: '赵六', desc: '三档亮度调节，无频闪，适合宿舍学习使用。', stock: 5 },
}

const productId = computed(() => route.params.id as string)
const product = computed(() => mockProducts[productId.value])
const cartItem = computed(() => cart.items.find(i => i.id === product.value?.id))
const canAdd = computed(() => {
  if (!product.value) return false
  if (!cartItem.value) return true
  return cartItem.value.quantity < product.value.stock
})

function handleAddToCart() {
  if (!product.value) return
  cart.addToCart({
    id: product.value.id,
    title: product.value.title,
    price: product.value.price,
    stock: product.value.stock,
  })
}
</script>

<template>
  <section>
    <button class="back-btn" @click="router.back()">← 返回</button>

    <template v-if="product">
      <h2>{{ product.title }}</h2>
      <p class="price">{{ product.price }}</p>
      <p class="seller">卖家：{{ product.seller }}</p>
      <p class="desc">{{ product.desc }}</p>
      <p class="stock">
        库存：{{ product.stock }} 件
        <span v-if="cartItem">（已加购 {{ cartItem.quantity }} 件）</span>
      </p>

      <button class="add-btn" :disabled="!canAdd" @click="handleAddToCart">
        {{ canAdd ? '加入购物车' : '已达库存上限' }}
      </button>
    </template>
    <template v-else>
      <h2>商品详情</h2>
      <p>商品 ID：{{ productId }} — 未找到该商品。</p>
    </template>

    <!-- 购物车悬浮窗 -->
    <div v-if="cart.totalCount > 0" class="cart-float">
      <router-link to="/profile" class="cart-link">
        🛒 {{ cart.totalCount }} 件 | {{ cart.totalPrice }}
      </router-link>
    </div>
  </section>
</template>

<style scoped>
.back-btn {
  padding: 6px 16px;
  border: 1px solid #ccc;
  background: #fff;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  margin-bottom: 12px;
}
.back-btn:hover {
  background: #f0f0f0;
}

.price {
  font-size: 24px;
  color: #e74c3c;
  font-weight: bold;
}
.seller {
  color: #999;
}
.desc {
  margin-top: 12px;
  line-height: 1.6;
  color: #555;
}
.stock {
  margin-top: 12px;
  color: #666;
  font-size: 14px;
}
.add-btn {
  margin-top: 20px;
  padding: 10px 32px;
  font-size: 16px;
  background: #409eff;
  color: #fff;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}
.add-btn:hover {
  background: #337ecc;
}
.add-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.cart-float {
  position: fixed;
  right: 24px;
  bottom: 24px;
  background: #409eff;
  padding: 12px 20px;
  border-radius: 24px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}
.cart-link {
  color: #fff;
  text-decoration: none;
  font-size: 15px;
  font-weight: bold;
}
</style>
