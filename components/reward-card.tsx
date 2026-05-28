'use client'

import { Sprout, Store, Home, MapPin } from 'lucide-react'
import { Button } from '@/components/ui/button'

const CATEGORY_ICONS = {
  hospedagem: Home,
  artesanato: Sprout,
  passeio: MapPin,
  parceiro: Store,
}

const CATEGORY_LABELS = {
  hospedagem: 'Hospedagem',
  artesanato: 'Artesanato',
  passeio: 'Passeio',
  parceiro: 'Parceiro',
}

interface RewardCardProps {
  reward: {
    id: number
    name: string
    description?: string | null
    category: string
    tokenCost: number
    imageUrl?: string | null
    partnerName?: string | null
    stock?: number | null
  }
  userBalance: number
  onRedeem: (rewardId: number) => void
  isLoading?: boolean
}

export function RewardCard({ reward, userBalance, onRedeem, isLoading }: RewardCardProps) {
  const Icon = CATEGORY_ICONS[reward.category as keyof typeof CATEGORY_ICONS] || Store
  const categoryLabel = CATEGORY_LABELS[reward.category as keyof typeof CATEGORY_LABELS] || reward.category
  const canAfford = userBalance >= reward.tokenCost
  const outOfStock = reward.stock !== null && reward.stock <= 0

  return (
    <div className="bg-card rounded-xl border border-border overflow-hidden">
      {/* Image */}
      <div className="aspect-[4/3] relative bg-muted">
        {reward.imageUrl ? (
          <img
            src={reward.imageUrl}
            alt={reward.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-primary/5">
            <Icon className="w-16 h-16 text-primary/30" />
          </div>
        )}
        
        {/* Category badge */}
        <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-card/90 backdrop-blur-sm text-xs font-medium text-foreground flex items-center gap-1.5">
          <Icon className="w-3.5 h-3.5" />
          {categoryLabel}
        </div>

        {/* Stock indicator */}
        {reward.stock !== null && (
          <div className={`absolute top-3 right-3 px-2.5 py-1 rounded-full text-xs font-medium ${
            outOfStock 
              ? 'bg-destructive/90 text-destructive-foreground' 
              : reward.stock <= 5 
                ? 'bg-secondary text-secondary-foreground'
                : 'bg-card/90 backdrop-blur-sm text-foreground'
          }`}>
            {outOfStock ? 'Esgotado' : `${reward.stock} restantes`}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        <div>
          <h3 className="font-semibold text-foreground">{reward.name}</h3>
          {reward.partnerName && (
            <p className="text-xs text-muted-foreground mt-0.5">
              {reward.partnerName}
            </p>
          )}
        </div>

        {reward.description && (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {reward.description}
          </p>
        )}

        {/* Price and action */}
        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-1.5">
            <Sprout className="w-5 h-5 text-primary" />
            <span className="text-lg font-bold text-foreground">{reward.tokenCost}</span>
            <span className="text-sm text-muted-foreground">Raiz</span>
          </div>

          <Button
            onClick={() => onRedeem(reward.id)}
            disabled={!canAfford || outOfStock || isLoading}
            size="sm"
            className={canAfford && !outOfStock 
              ? 'bg-primary hover:bg-primary/90 text-primary-foreground' 
              : 'bg-muted text-muted-foreground'
            }
          >
            {outOfStock ? 'Esgotado' : canAfford ? 'Resgatar' : 'Saldo insuficiente'}
          </Button>
        </div>
      </div>
    </div>
  )
}
