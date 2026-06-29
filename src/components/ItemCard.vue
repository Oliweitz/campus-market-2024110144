<template>
  <article class="item-card">
    <div class="item-card__header">
      <h3>{{ title }}</h3>
      <span v-if="tag" class="tag">{{ tag }}</span>
    </div>

    <p class="description">{{ description }}</p>

    <div class="meta">
      <span v-if="location">📍 {{ location }}</span>
      <span v-if="time">🕐 {{ time }}</span>
    </div>

    <div v-if="$slots.footer" class="footer">
      <slot name="footer" />
    </div>
  </article>
</template>

<script setup lang="ts">
defineProps<{
  title: string
  description: string
  tag?: string
  location?: string
  time?: string
}>()
</script>

<style scoped>
.item-card {
  padding: 18px;
  border-radius: var(--radius-md);
  background: var(--card-bg);
  border: 1px solid #e5e7eb;
  box-shadow: var(--shadow-sm);
  transition: all var(--transition);
}

.item-card:hover {
  box-shadow: var(--shadow-md);
  transform: translateY(-1px);
}

.item-card__header {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  align-items: center;
}

.item-card h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: var(--text);
}

.tag {
  padding: 4px 10px;
  border-radius: 999px;
  background: var(--primary-light);
  color: var(--primary);
  font-size: 12px;
  font-weight: 500;
  white-space: nowrap;
}

.description {
  margin: 12px 0;
  color: var(--text-light);
  line-height: 1.6;
  font-size: 14px;
}

.meta {
  display: flex;
  gap: 16px;
  color: var(--text-lighter);
  font-size: 13px;
}

.footer {
  margin-top: 14px;
  padding-top: 12px;
  border-top: 1px solid #f0f0f0;
}
</style>
