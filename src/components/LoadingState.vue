<template>
  <div class="loading-state">
    <div class="spinner"></div>
    <p>{{ text }}</p>
  </div>
</template>

<script setup lang="ts">
withDefaults(defineProps<{ text?: string }>(), {
  text: '加载中...',
})
</script>

<style scoped>
.loading-state {
  padding: 32px;
  text-align: center;
  color: #6b7280;
  background: #fff;
  border-radius: 12px;
}

.spinner {
  width: 28px;
  height: 28px;
  margin: 0 auto 12px;
  border: 3px solid #e5e7eb;
  border-top-color: #2563eb;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

.loading-state p {
  margin: 0;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
