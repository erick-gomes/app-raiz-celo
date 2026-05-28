'use client'

import { useAppKit, useAppKitAccount, useAppKitNetwork } from '@reown/appkit/react'
import { Wallet, ChevronDown, ExternalLink, Copy, LogOut } from 'lucide-react'
import { useState } from 'react'
import { celo, celoAlfajores } from '@reown/appkit/networks'

export function WalletButton() {
  const { open } = useAppKit()
  const { address, isConnected } = useAppKitAccount()
  const { chainId, switchNetwork } = useAppKitNetwork()
  const [showMenu, setShowMenu] = useState(false)
  const [copied, setCopied] = useState(false)

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`
  }

  const copyAddress = async () => {
    if (address) {
      await navigator.clipboard.writeText(address)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const getNetworkName = () => {
    if (chainId === celo.id) return 'Celo'
    if (chainId === celoAlfajores.id) return 'Alfajores'
    return 'Rede Desconhecida'
  }

  const getExplorerUrl = () => {
    if (chainId === celo.id) return `https://celoscan.io/address/${address}`
    if (chainId === celoAlfajores.id) return `https://alfajores.celoscan.io/address/${address}`
    return '#'
  }

  if (!isConnected) {
    return (
      <button
        onClick={() => open()}
        className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 font-medium text-primary-foreground transition-all hover:bg-primary/90 active:scale-95"
      >
        <Wallet className="h-4 w-4" />
        <span>Conectar Wallet</span>
      </button>
    )
  }

  return (
    <div className="relative">
      <button
        onClick={() => setShowMenu(!showMenu)}
        className="flex items-center gap-2 rounded-xl border-2 border-primary/20 bg-card px-3 py-2 font-medium text-foreground transition-all hover:border-primary/40"
      >
        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10">
          <Wallet className="h-3.5 w-3.5 text-primary" />
        </div>
        <div className="flex flex-col items-start">
          <span className="text-xs text-muted-foreground">{getNetworkName()}</span>
          <span className="text-sm">{formatAddress(address || '')}</span>
        </div>
        <ChevronDown className={`h-4 w-4 transition-transform ${showMenu ? 'rotate-180' : ''}`} />
      </button>

      {showMenu && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setShowMenu(false)}
          />
          <div className="absolute right-0 top-full z-50 mt-2 w-64 rounded-xl border border-border bg-card p-2 shadow-lg">
            <div className="mb-2 border-b border-border pb-2">
              <p className="px-2 text-xs font-medium text-muted-foreground">Endereço</p>
              <p className="truncate px-2 text-sm font-mono">{address}</p>
            </div>

            <button
              onClick={copyAddress}
              className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-sm hover:bg-muted"
            >
              <Copy className="h-4 w-4" />
              <span>{copied ? 'Copiado!' : 'Copiar Endereço'}</span>
            </button>

            <a
              href={getExplorerUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-sm hover:bg-muted"
            >
              <ExternalLink className="h-4 w-4" />
              <span>Ver no Explorer</span>
            </a>

            <div className="my-2 border-t border-border pt-2">
              <p className="px-2 pb-1 text-xs font-medium text-muted-foreground">Trocar Rede</p>
              <button
                onClick={() => {
                  switchNetwork(celo)
                  setShowMenu(false)
                }}
                className={`flex w-full items-center gap-2 rounded-lg px-2 py-2 text-sm hover:bg-muted ${chainId === celo.id ? 'bg-primary/10 text-primary' : ''}`}
              >
                <div className="h-2 w-2 rounded-full bg-green-500" />
                <span>Celo Mainnet</span>
              </button>
              <button
                onClick={() => {
                  switchNetwork(celoAlfajores)
                  setShowMenu(false)
                }}
                className={`flex w-full items-center gap-2 rounded-lg px-2 py-2 text-sm hover:bg-muted ${chainId === celoAlfajores.id ? 'bg-primary/10 text-primary' : ''}`}
              >
                <div className="h-2 w-2 rounded-full bg-yellow-500" />
                <span>Alfajores Testnet</span>
              </button>
            </div>

            <div className="border-t border-border pt-2">
              <button
                onClick={() => {
                  open({ view: 'Account' })
                  setShowMenu(false)
                }}
                className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-sm text-destructive hover:bg-destructive/10"
              >
                <LogOut className="h-4 w-4" />
                <span>Desconectar</span>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
