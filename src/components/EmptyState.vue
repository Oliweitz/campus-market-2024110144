<template>
  <div class="empty-state">
    <div class="empty-icon">📭</div>
    <p>{{ text }}</p>
    <span v-if="hint" class="hint">{{ hint }}</span>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  text: string
  hint?: string
}>()
</script>

<style scoped>
.empty-state {
  padding: 48px 32px;
  text-align: center;
  color: var(--text-light);
  background: var(--card-bg);
  border-radius: var(--radius-md);
  border: 1px dashed #d1d5db;
}

.empty-icon {
  font-size: 40px;
  margin-bottom: 12px;
}

.empty-state p {
  margin: 0;
  font-size: 15px;
  font-weight: 500;
  color: var(--text-light);
}

.hint {
  display: block;
  margin-top: 8px;
  font-size: 13px;
  color: var(--text-lighter);
}
</style>
