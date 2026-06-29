<template>
  <div class="app-layout">
    <slot />
  </div>
</template>

<style scoped>
.app-layout {
  display: flex;
  flex-direction: column;
  gap: 20px;
}
</style>
