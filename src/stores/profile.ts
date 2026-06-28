import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

export interface LocalProfile {
  nickname: string
  college: string
  campus: string
  role: string
  creditScore: number
}

export const useProfileStore = defineStore('profile', () => {
  const profile = ref<LocalProfile>({
    nickname: '张三',
    college: '计算机学院',
    campus: '南校区',
    role: '学生',
    creditScore: 95,
  })

  const isCreated = computed(() => profile.value.nickname.length > 0)

  function updateProfile(data: Partial<LocalProfile>) {
    Object.assign(profile.value, data)
  }

  return { profile, isCreated, updateProfile }
})
