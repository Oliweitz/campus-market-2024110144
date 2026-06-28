<script setup lang="ts"></script>

<template>
  <section>
    <h2>数据看板</h2>
    <p>校园集市运营数据概览。</p>
    <div class="stats">
      <div class="stat-card">
        <strong>1,280</strong>
        <span>累计商品</span>
      </div>
      <div class="stat-card">
        <strong>856</strong>
        <span>已成交</span>
      </div>
      <div class="stat-card">
        <strong>342</strong>
        <span>活跃用户</span>
      </div>
      <div class="stat-card">
        <strong>98%</strong>
        <span>好评率</span>
      </div>
    </div>
  </section>
</template>

<style scoped>
.stats {
  display: flex;
  gap: 16px;
  margin-top: 16px;
  flex-wrap: wrap;
}
.stat-card {
  background: #f5f5f5;
  border-radius: 8px;
  padding: 20px 28px;
  text-align: center;
  min-width: 120px;
}
.stat-card strong {
  display: block;
  font-size: 24px;
  color: #409eff;
}
.stat-card span {
  font-size: 14px;
  color: #666;
}
</style>
