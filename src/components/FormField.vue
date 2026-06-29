<template>
  <label class="form-field">
    <span class="label">
      {{ label }}
      <em v-if="required">*</em>
    </span>

    <slot />

    <span v-if="error" class="error">{{ error }}</span>
  </label>
</template>

<script setup lang="ts">
defineProps<{
  label: string
  required?: boolean
  error?: string
}>()
</script>

<style scoped>
.form-field {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.label {
  font-size: 14px;
  color: #374151;
  font-weight: 500;
}

.label em {
  color: #ef4444;
  font-style: normal;
  margin-left: 4px;
}

.error {
  color: #ef4444;
  font-size: 13px;
}
</style>
