'use client'

import { Sprout, Leaf, TreePine, Users, MapPin } from 'lucide-react'

const ACTION_ICONS = {
  cleanup: Leaf,
  planting: TreePine,
  guide: Users,
  trail: MapPin,
}

const ACTION_LABELS = {
  cleanup: 'Limpeza',
  planting: 'Plantio',
  guide: 'Guia Local',
  trail: 'Trilha',
}

const ACTION_COLORS = {
  cleanup: 'bg-primary/10 text-primary',
  planting: 'bg-accent/10 text-accent',
  guide: 'bg-secondary text-secondary-foreground',
  trail: 'bg-muted text-muted-foreground',
}

interface ActionCardProps {
  action: {
    id: number
    type: string
    title: string
    description?: string | null
    photoUrl: string
    locationName?: string | null
    tokensEarned: number
    status: string
    createdAt: Date
  }
  showUser?: boolean
  userName?: string
}

export function ActionCard({ action, showUser, userName }: ActionCardProps) {
  const Icon = ACTION_ICONS[action.type as keyof typeof ACTION_ICONS] || Leaf
  const label = ACTION_LABELS[action.type as keyof typeof ACTION_LABELS] || action.type
  const colorClass = ACTION_COLORS[action.type as keyof typeof ACTION_COLORS] || ACTION_COLORS.cleanup

  return (
    <div className="bg-card rounded-xl border border-border overflow-hidden">
      {/* Photo */}
      <div className="aspect-video relative bg-muted">
        <img
          src={action.photoUrl}
          alt={action.title}
          className="w-full h-full object-cover"
        />
        {/* Badge */}
        <div className={`absolute top-3 left-3 px-3 py-1.5 rounded-full text-xs font-medium ${colorClass}`}>
          <span className="flex items-center gap-1.5">
            <Icon className="w-3.5 h-3.5" />
            {label}
          </span>
        </div>
        {/* Tokens */}
        <div className="absolute bottom-3 right-3 px-3 py-1.5 rounded-full bg-primary text-primary-foreground text-sm font-semibold flex items-center gap-1.5">
          <Sprout className="w-4 h-4" />
          +{action.tokensEarned}
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-2">
        <h3 className="font-semibold text-foreground">{action.title}</h3>
        
        {action.description && (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {action.description}
          </p>
        )}

        <div className="flex items-center justify-between pt-2">
          {action.locationName && (
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <MapPin className="w-3.5 h-3.5" />
              {action.locationName}
            </div>
          )}
          
          {showUser && userName && (
            <span className="text-xs text-muted-foreground">
              por {userName}
            </span>
          )}

          <span className="text-xs text-muted-foreground ml-auto">
            {new Date(action.createdAt).toLocaleDateString('pt-BR', {
              day: 'numeric',
              month: 'short',
            })}
          </span>
        </div>

        {action.status === 'pending' && (
          <div className="pt-2">
            <span className="text-xs px-2 py-1 rounded-full bg-secondary text-secondary-foreground">
              Aguardando aprovação
            </span>
          </div>
        )}
      </div>
    </div>
  )
}
