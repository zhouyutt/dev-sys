import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useGlobalStore = defineStore('global-store', () => {
  const isSidebarMinimized = ref(false)

  return {
    isSidebarMinimized
  }
})
