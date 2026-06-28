<script setup lang="ts">
import { useRoute } from 'vue-router'

const route = useRoute()
const productId = route.params.id
</script>

<template>
  <section>
    <h2>商品详情</h2>
    <p>当前商品 ID：{{ productId }}</p>
    <p>查看商品详细信息、联系卖家。</p>
  </section>
</template>

<style scoped></style>
