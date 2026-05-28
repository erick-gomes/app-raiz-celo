'use client'

import { createAppKit } from '@reown/appkit/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { type ReactNode } from 'react'
import { cookieToInitialState, WagmiProvider, type Config } from 'wagmi'
import { projectId, wagmiAdapter, networks } from './config'

// Setup queryClient
const queryClient = new QueryClient()

if (!projectId) {
  console.warn('Project ID is not defined')
}

// Metadata for the app
const metadata = {
  name: 'Raiz',
  description: 'Turismo Regenerativo na Chapada Diamantina',
  url: typeof window !== 'undefined' ? window.location.origin : 'https://raiz.app',
  icons: ['/icon.png']
}

// Initialize AppKit modal
createAppKit({
  adapters: [wagmiAdapter],
  projectId: projectId || '',
  networks,
  defaultNetwork: networks[0],
  metadata,
  features: {
    analytics: true,
    email: false,
    socials: false
  },
  themeMode: 'light',
  themeVariables: {
    '--w3m-color-mix': '#4A7C59',
    '--w3m-color-mix-strength': 20,
    '--w3m-accent': '#4A7C59',
    '--w3m-border-radius-master': '2px'
  }
})

interface Web3ProviderProps {
  children: ReactNode
  cookies: string | null
}

export function Web3Provider({ children, cookies }: Web3ProviderProps) {
  const initialState = cookieToInitialState(
    wagmiAdapter.wagmiConfig as Config,
    cookies
  )

  return (
    <WagmiProvider
      config={wagmiAdapter.wagmiConfig as Config}
      initialState={initialState}
    >
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </WagmiProvider>
  )
}
