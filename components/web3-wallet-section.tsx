'use client'

import { useRaizToken } from '@/hooks/use-raiz-token'
import { WalletButton } from '@/components/wallet-button'
import { Sprout, ExternalLink, AlertCircle, Coins, Wallet } from 'lucide-react'
import { celo, celoAlfajores } from '@reown/appkit/networks'

export function Web3WalletSection() {
  const { 
    balance, 
    isConnected, 
    address, 
    chainId,
    isTokenDeployed,
    tokenAddress
  } = useRaizToken()

  const getExplorerUrl = () => {
    if (chainId === celo.id) return `https://celoscan.io/address/${address}`
    if (chainId === celoAlfajores.id) return `https://alfajores.celoscan.io/address/${address}`
    return '#'
  }

  const getTokenExplorerUrl = () => {
    if (chainId === celo.id) return `https://celoscan.io/token/${tokenAddress}`
    if (chainId === celoAlfajores.id) return `https://alfajores.celoscan.io/token/${tokenAddress}`
    return '#'
  }

  const getNetworkName = () => {
    if (chainId === celo.id) return 'Celo Mainnet'
    if (chainId === celoAlfajores.id) return 'Celo Alfajores'
    return 'Conectando...'
  }

  return (
    <section className="px-5 mb-6">
      <h3 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
        <Wallet className="w-4 h-4" />
        Carteira Blockchain (Celo)
      </h3>

      {!isConnected ? (
        <div className="bg-card rounded-2xl border border-border p-6">
          <div className="text-center mb-4">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-primary/10 flex items-center justify-center">
              <Coins className="w-8 h-8 text-primary" />
            </div>
            <h4 className="font-semibold text-foreground mb-2">
              Conecte sua Wallet
            </h4>
            <p className="text-sm text-muted-foreground mb-4">
              Conecte uma wallet compatível com a rede Celo para ver seus tokens Raiz on-chain e realizar transações.
            </p>
          </div>
          <div className="flex justify-center">
            <WalletButton />
          </div>
          <p className="text-xs text-center text-muted-foreground mt-4">
            Compatível com MetaMask, WalletConnect e outras wallets EVM
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Connected Wallet Info */}
          <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 rounded-2xl border border-amber-200/50 dark:border-amber-800/50 p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-xs text-muted-foreground">Conectado em</p>
                <p className="font-medium text-foreground">{getNetworkName()}</p>
              </div>
              <WalletButton />
            </div>

            {/* On-chain Balance */}
            <div className="bg-card/80 backdrop-blur rounded-xl p-4 mb-4">
              <p className="text-xs text-muted-foreground mb-1">Saldo On-chain</p>
              {isTokenDeployed ? (
                <div className="flex items-center gap-2">
                  <Sprout className="w-6 h-6 text-primary" />
                  <span className="text-2xl font-bold text-foreground">{balance}</span>
                  <span className="text-lg text-muted-foreground">RAIZ</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
                  <AlertCircle className="w-4 h-4" />
                  <span className="text-sm">Token ainda não implantado</span>
                </div>
              )}
            </div>

            {/* Info Notice */}
            <div className="flex items-start gap-2 bg-primary/5 rounded-lg p-3">
              <AlertCircle className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
              <p className="text-xs text-muted-foreground">
                Os tokens Raiz acumulados no app serão sincronizados com a blockchain Celo periodicamente. 
                Seus tokens off-chain (mostrados acima) serão convertidos em tokens on-chain.
              </p>
            </div>

            {/* Explorer Links */}
            <div className="flex gap-3 mt-4">
              <a
                href={getExplorerUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-card border border-border px-3 py-2.5 text-sm font-medium text-foreground hover:bg-muted transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
                Ver Carteira
              </a>
              {isTokenDeployed && (
                <a
                  href={getTokenExplorerUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-card border border-border px-3 py-2.5 text-sm font-medium text-foreground hover:bg-muted transition-colors"
                >
                  <Sprout className="w-4 h-4" />
                  Ver Token
                </a>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
