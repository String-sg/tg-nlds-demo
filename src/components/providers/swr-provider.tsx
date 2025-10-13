'use client'

import { SWRConfig } from 'swr'
import type { ReactNode } from 'react'

interface SWRProviderProps {
  children: ReactNode
}

export function SWRProvider({ children }: SWRProviderProps) {
  return (
    <SWRConfig
      value={{
        // Cache data for 5 minutes before considering it stale
        dedupingInterval: 300000,

        // Revalidate when window regains focus
        revalidateOnFocus: true,

        // Revalidate when network reconnects
        revalidateOnReconnect: true,

        // Don't revalidate on mount if data exists
        revalidateIfStale: false,

        // Keep previous data while revalidating
        keepPreviousData: true,

        // Retry on error with exponential backoff
        errorRetryCount: 3,
        errorRetryInterval: 5000,

        // Show loading state for first 200ms to avoid flashing
        loadingTimeout: 200,

        // Default fetcher is not needed as we'll use custom fetchers per hook
      }}
    >
      {children}
    </SWRConfig>
  )
}
