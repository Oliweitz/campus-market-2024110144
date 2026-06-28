import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

export const useFavoritesStore = defineStore('favorites', () => {
  const ids = ref<number[]>([])

  const count = computed(() => ids.value.length)

  function toggle(id: number) {
    const idx = ids.value.indexOf(id)
    if (idx === -1) {
      ids.value.push(id)
    } else {
      ids.value.splice(idx, 1)
    }
  }

  function isFavorited(id: number): boolean {
    return ids.value.includes(id)
  }

  function remove(id: number) {
    ids.value = ids.value.filter(i => i !== id)
  }

  return { ids, count, toggle, isFavorited, remove }
})
