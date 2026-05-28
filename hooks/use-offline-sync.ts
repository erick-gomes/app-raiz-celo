'use client'

import { useState, useEffect, useCallback } from 'react'

interface PendingAction {
  id: string
  type: string
  title: string
  description: string
  photoUrl: string
  latitude: number
  longitude: number
  locationName: string
  createdAt: number
}

const STORAGE_KEY = 'raiz_pending_actions'

export function useOfflineSync() {
  const [isOnline, setIsOnline] = useState(true)
  const [pendingActions, setPendingActions] = useState<PendingAction[]>([])
  const [isSyncing, setIsSyncing] = useState(false)

  // Initialize online status and load pending actions
  useEffect(() => {
    setIsOnline(navigator.onLine)
    
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      try {
        setPendingActions(JSON.parse(stored))
      } catch {
        localStorage.removeItem(STORAGE_KEY)
      }
    }
  }, [])

  // Listen for online/offline events
  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  // Save action locally
  const saveLocally = useCallback((action: Omit<PendingAction, 'id' | 'createdAt'>) => {
    const newAction: PendingAction = {
      ...action,
      id: `local_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      createdAt: Date.now(),
    }

    setPendingActions((prev) => {
      const updated = [...prev, newAction]
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
      return updated
    })

    return newAction
  }, [])

  // Remove action from pending
  const removePending = useCallback((id: string) => {
    setPendingActions((prev) => {
      const updated = prev.filter((a) => a.id !== id)
      if (updated.length > 0) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
      } else {
        localStorage.removeItem(STORAGE_KEY)
      }
      return updated
    })
  }, [])

  // Clear all pending actions
  const clearPending = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY)
    setPendingActions([])
  }, [])

  // Sync pending actions
  const syncPending = useCallback(async (
    syncFn: (action: PendingAction) => Promise<void>
  ) => {
    if (!isOnline || pendingActions.length === 0 || isSyncing) return

    setIsSyncing(true)
    const failed: PendingAction[] = []

    for (const action of pendingActions) {
      try {
        await syncFn(action)
      } catch {
        failed.push(action)
      }
    }

    if (failed.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(failed))
      setPendingActions(failed)
    } else {
      localStorage.removeItem(STORAGE_KEY)
      setPendingActions([])
    }

    setIsSyncing(false)
  }, [isOnline, pendingActions, isSyncing])

  return {
    isOnline,
    pendingActions,
    pendingCount: pendingActions.length,
    isSyncing,
    saveLocally,
    removePending,
    clearPending,
    syncPending,
  }
}
