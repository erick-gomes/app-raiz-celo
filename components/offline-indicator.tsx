'use client'

import { WifiOff, Wifi, RefreshCw } from 'lucide-react'
import { useOfflineSync } from '@/hooks/use-offline-sync'
import { cn } from '@/lib/utils'

interface OfflineIndicatorProps {
  className?: string
}

export function OfflineIndicator({ className }: OfflineIndicatorProps) {
  const { isOnline, pendingCount, isSyncing } = useOfflineSync()

  if (isOnline && pendingCount === 0) return null

  return (
    <div
      className={cn(
        'fixed top-0 left-0 right-0 z-50 safe-top',
        className
      )}
    >
      <div
        className={cn(
          'flex items-center justify-center gap-2 py-2 px-4 text-sm font-medium',
          isOnline
            ? 'bg-secondary text-secondary-foreground'
            : 'bg-accent text-accent-foreground'
        )}
      >
        {isOnline ? (
          <>
            {isSyncing ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Sincronizando {pendingCount} ação(ões)...</span>
              </>
            ) : (
              <>
                <Wifi className="w-4 h-4" />
                <span>{pendingCount} ação(ões) pendente(s)</span>
              </>
            )}
          </>
        ) : (
          <>
            <WifiOff className="w-4 h-4" />
            <span>Modo offline - ações serão sincronizadas depois</span>
          </>
        )}
      </div>
    </div>
  )
}
