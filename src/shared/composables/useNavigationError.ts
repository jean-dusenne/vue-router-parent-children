import { onBeforeUnmount, ref } from 'vue'
import { useRouter } from 'vue-router'

export function useNavigationError() {
  const router = useRouter()
  const navigationError = ref('')
  const removeErrorListener = router.onError((error) => {
    navigationError.value = error instanceof Error ? error.message : String(error)
  })
  const removeAfterEachHook = router.afterEach((_to, _from, failure) => {
    if (!failure) navigationError.value = ''
  })

  onBeforeUnmount(() => {
    removeErrorListener()
    removeAfterEachHook()
  })

  return { navigationError }
}
