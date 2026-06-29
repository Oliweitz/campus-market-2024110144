<template>
  <div class="error-state">
    <h3>加载失败</h3>
    <p>{{ message }}</p>
    <button v-if="showRetry" type="button" @click="$emit('retry')">
      重新加载
    </button>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  message: string
  showRetry?: boolean
}>()

defineEmits<{
  retry: []
}>()
</script>

<style scoped>
.error-state {
  padding: 32px;
  text-align: center;
  color: #991b1b;
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 12px;
}

.error-state h3 {
  margin: 0 0 8px;
}

.error-state p {
  margin: 0 0 16px;
}

.error-state button {
  border: none;
  border-radius: 8px;
  padding: 8px 14px;
  cursor: pointer;
  background: #dc2626;
  color: #fff;
}
</style>
