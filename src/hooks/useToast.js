import { useState, useCallback } from 'react'
export function useToast() {
  const [toast, setToast] = useState(null)
  const showToast = useCallback((msg, ms=2600) => {
    setToast(msg)
    setTimeout(() => setToast(null), ms)
  }, [])
  return { toast, showToast }
}
