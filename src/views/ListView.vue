<script setup lang="ts">
const products = [
  { id: 1, title: '九成新《JavaScript高级程序设计》', price: '¥35', seller: '张三' },
  { id: 2, title: '折叠书桌 宿舍必备', price: '¥60', seller: '李四' },
  { id: 3, title: '机械键盘 Cherry轴', price: '¥120', seller: '王五' },
  { id: 4, title: '台灯 LED护眼', price: '¥25', seller: '赵六' },
]
</script>

<template>
  <section>
    <h2>商品列表</h2>
    <p>浏览校园二手商品，找到你需要的好物。</p>

    <ul class="product-list">
      <li v-for="item in products" :key="item.id" class="product-item">
        <router-link :to="'/detail/' + item.id">
          <strong>{{ item.title }}</strong>
          <span class="price">{{ item.price }}</span>
          <span class="seller">{{ item.seller }}</span>
        </router-link>
      </li>
    </ul>
  </section>
</template>

<style scoped>
.product-list {
  list-style: none;
  padding: 0;
  margin-top: 16px;
}
.product-item {
  margin-bottom: 8px;
}
.product-item a {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 12px 16px;
  border: 1px solid #e5e5e5;
  border-radius: 6px;
  text-decoration: none;
  color: #333;
  transition: background 0.2s;
}
.product-item a:hover {
  background: #f5f5f5;
}
.price {
  color: #e74c3c;
  font-weight: bold;
  margin-left: auto;
}
.seller {
  color: #999;
  font-size: 14px;
}
</style>
