'use client'

import { useState, useEffect } from 'react'
import { getRewards, getWallet, redeemReward } from '@/app/actions/raiz'
import { BottomNav } from '@/components/bottom-nav'
import { RewardCard } from '@/components/reward-card'
import { Button } from '@/components/ui/button'
import { 
  Sprout, 
  Home, 
  Store, 
  MapPin,
  Loader2,
  CheckCircle,
  X
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Reward, TokenWallet } from '@/lib/db/schema'

const CATEGORIES = [
  { id: 'all', label: 'Todos', icon: Store },
  { id: 'hospedagem', label: 'Hospedagem', icon: Home },
  { id: 'artesanato', label: 'Artesanato', icon: Sprout },
  { id: 'passeio', label: 'Passeios', icon: MapPin },
]

export default function StorePage() {
  const [rewards, setRewards] = useState<Reward[]>([])
  const [wallet, setWallet] = useState<TokenWallet | null>(null)
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [loading, setLoading] = useState(true)
  const [redeeming, setRedeeming] = useState<number | null>(null)
  const [successModal, setSuccessModal] = useState<{ code: string; rewardName: string } | null>(null)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [rewardsData, walletData] = await Promise.all([
        getRewards(),
        getWallet(),
      ])
      setRewards(rewardsData)
      setWallet(walletData)
    } catch (error) {
      console.error('Error loading store data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleRedeem = async (rewardId: number) => {
    setRedeeming(rewardId)
    try {
      const reward = rewards.find(r => r.id === rewardId)
      const result = await redeemReward(rewardId)
      setSuccessModal({ 
        code: result.redemptionCode, 
        rewardName: reward?.name || 'Recompensa' 
      })
      await loadData()
    } catch (error) {
      console.error('Error redeeming reward:', error)
      alert(error instanceof Error ? error.message : 'Erro ao resgatar recompensa')
    } finally {
      setRedeeming(null)
    }
  }

  const filteredRewards = selectedCategory === 'all' 
    ? rewards 
    : rewards.filter(r => r.category === selectedCategory)

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="px-5 pt-6 pb-4 safe-top">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-serif font-bold text-foreground">
            Loja de Resgates
          </h1>
          {wallet && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10">
              <Sprout className="w-4 h-4 text-primary" />
              <span className="font-semibold text-primary">{wallet.balance}</span>
            </div>
          )}
        </div>
      </header>

      {/* Category Filter */}
      <section className="px-5 mb-6">
        <div className="flex gap-2 overflow-x-auto pb-2 -mx-5 px-5 scrollbar-hide">
          {CATEGORIES.map((category) => (
            <Button
              key={category.id}
              variant="outline"
              size="sm"
              onClick={() => setSelectedCategory(category.id)}
              className={cn(
                'flex-shrink-0 gap-1.5 rounded-full border-border',
                selectedCategory === category.id
                  ? 'bg-primary text-primary-foreground border-primary hover:bg-primary/90 hover:text-primary-foreground'
                  : 'bg-card text-foreground hover:bg-muted'
              )}
            >
              <category.icon className="w-4 h-4" />
              {category.label}
            </Button>
          ))}
        </div>
      </section>

      {/* Rewards Grid */}
      <section className="px-5">
        <div className="grid gap-4">
          {filteredRewards.length === 0 ? (
            <div className="bg-card rounded-xl border border-border p-8 text-center">
              <Store className="w-12 h-12 mx-auto mb-3 text-muted-foreground/50" />
              <p className="text-muted-foreground">
                Nenhuma recompensa disponível nesta categoria.
              </p>
            </div>
          ) : (
            filteredRewards.map((reward) => (
              <RewardCard
                key={reward.id}
                reward={reward}
                userBalance={wallet?.balance || 0}
                onRedeem={handleRedeem}
                isLoading={redeeming === reward.id}
              />
            ))
          )}
        </div>
      </section>

      {/* Success Modal */}
      {successModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-5 bg-foreground/50">
          <div className="bg-card rounded-2xl p-6 w-full max-w-sm relative">
            <button
              onClick={() => setSuccessModal(null)}
              className="absolute top-4 right-4 text-muted-foreground hover:text-foreground"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-primary" />
              </div>
              
              <h2 className="text-xl font-serif font-bold text-foreground mb-2">
                Resgate Confirmado!
              </h2>
              
              <p className="text-sm text-muted-foreground mb-4">
                {successModal.rewardName}
              </p>

              <div className="bg-muted rounded-xl p-4 mb-6">
                <p className="text-xs text-muted-foreground mb-2">
                  Seu código de resgate:
                </p>
                <p className="font-mono text-lg font-bold text-foreground">
                  {successModal.code}
                </p>
              </div>

              <p className="text-xs text-muted-foreground mb-4">
                Apresente este código ao parceiro para resgatar seu benefício.
              </p>

              <Button
                onClick={() => setSuccessModal(null)}
                className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                Entendi
              </Button>
            </div>
          </div>
        </div>
      )}

      <BottomNav />
    </div>
  )
}
