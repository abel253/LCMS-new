// composables/useAuth.ts
import { useAuthStore } from '@/stores/auth'
import { storeToRefs } from 'pinia'

export const useAuth = () => {
  const authStore = useAuthStore()
  const { user, token } = storeToRefs(authStore)

  return {
    user,
    token,
    isAuthenticated: computed(() => !!token.value),
    userRole: computed(() => user.value?.role || user.value?.userType),
    login: authStore.login,
    logout: authStore.logout,
    init: authStore.init,
  }
}
