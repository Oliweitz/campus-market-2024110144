<template>
  <div class="search-bar">
    <input
      :value="modelValue"
      type="text"
      :placeholder="placeholder"
      @input="handleInput"
    />

    <button
      v-if="modelValue"
      type="button"
      class="clear-btn"
      @click="$emit('update:modelValue', '')"
    >
      清空
    </button>
  </div>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    modelValue: string
    placeholder?: string
  }>(),
  {
    placeholder: '请输入关键词搜索',
  },
)

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

function handleInput(event: Event) {
  const target = event.target as HTMLInputElement
  emit('update:modelValue', target.value)
}
</script>

<style scoped>
.search-bar {
  display: flex;
  gap: 12px;
  padding: 16px;
  border-radius: 12px;
  background: #fff;
}

.search-bar input {
  flex: 1;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  padding: 10px 12px;
  font-size: 14px;
  outline: none;
  transition: border-color var(--transition);
}

.search-bar input:focus {
  border-color: var(--primary);
}

.clear-btn {
  border: none;
  border-radius: 8px;
  padding: 0 14px;
  cursor: pointer;
  background: #f3f4f6;
  color: #374151;
  font-size: 13px;
  transition: all var(--transition);
}

.clear-btn:hover {
  background: #e5e7eb;
}
</style>
