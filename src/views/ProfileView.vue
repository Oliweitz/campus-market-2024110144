<script setup lang="ts">
import { useCartStore } from '@/stores/cart'

const cart = useCartStore()
</script>

<template>
  <section>
    <h2>个人中心</h2>
    <p>管理个人信息、查看交易记录。</p>

    <!-- 购物车 -->
    <div class="cart-section">
      <h3>🛒 我的购物车</h3>
      <template v-if="cart.items.length > 0">
        <ul class="cart-list">
          <li v-for="item in cart.items" :key="item.id" class="cart-item">
            <div class="cart-info">
              <router-link :to="'/detail/' + item.id" class="cart-title">{{ item.title }}</router-link>
              <span class="cart-price">{{ item.price }} × {{ item.quantity }}</span>
            </div>
            <div class="cart-actions">
              <button class="buy-btn" @click="cart.buyItem(item.id)">购买</button>
              <button class="remove-btn" @click="cart.removeFromCart(item.id)">删除</button>
            </div>
          </li>
        </ul>
        <div class="cart-footer">
          <span>合计：<strong>{{ cart.totalPrice }}</strong></span>
          <button class="clear-btn" @click="cart.clearCart()">清空购物车</button>
        </div>
      </template>
      <p v-else class="empty">购物车是空的，去列表页逛逛吧～</p>
    </div>
  </section>
</template>

<style scoped>
.cart-section {
  margin-top: 24px;
  border-top: 1px solid #e5e5e5;
  padding-top: 16px;
}
.cart-list {
  list-style: none;
  padding: 0;
}
.cart-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 0;
  border-bottom: 1px solid #f0f0f0;
}
.cart-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.cart-title {
  text-decoration: none;
  color: #333;
  font-weight: bold;
}
.cart-title:hover {
  color: #409eff;
}
.cart-price {
  color: #e74c3c;
  font-size: 14px;
}
.cart-actions {
  display: flex;
  gap: 8px;
}
.buy-btn {
  padding: 4px 12px;
  border: 1px solid #409eff;
  color: #409eff;
  background: #fff;
  border-radius: 4px;
  cursor: pointer;
}
.buy-btn:hover {
  background: #409eff;
  color: #fff;
}
.remove-btn {
  padding: 4px 12px;
  border: 1px solid #e74c3c;
  color: #e74c3c;
  background: #fff;
  border-radius: 4px;
  cursor: pointer;
}
.remove-btn:hover {
  background: #e74c3c;
  color: #fff;
}
.cart-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 12px;
}
.clear-btn {
  padding: 6px 16px;
  border: 1px solid #999;
  color: #999;
  background: #fff;
  border-radius: 4px;
  cursor: pointer;
}
.clear-btn:hover {
  background: #999;
  color: #fff;
}
.empty {
  color: #999;
  margin-top: 8px;
}
</style>
