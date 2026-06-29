<template>
  <article class="item-card">
    <div class="item-card__top">
      <div class="item-card__img">
        <img v-if="image" :src="image" alt="" />
        <div v-else class="img-fb"></div>
      </div>
      <div class="item-card__main">
        <div class="item-card__header">
          <h3>{{ title }}</h3>
          <span v-if="tag" class="tag">{{ tag }}</span>
        </div>
        <p class="description">{{ description }}</p>
      </div>
    </div>

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
  image?: string
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

.item-card__top { display: flex; gap: 14px; }

.item-card__img {
  width: 100px; height: 75px; flex-shrink: 0;
  border-radius: 8px; overflow: hidden; background: #f0f0f0;
}
.item-card__img img { width: 100%; height: 100%; object-fit: cover; display: block; }
.img-fb { width: 100%; height: 100%; background: linear-gradient(135deg, #e8f0fe, #d2e3fc); }

.item-card__main { flex: 1; min-width: 0; }

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
