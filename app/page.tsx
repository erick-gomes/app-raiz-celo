import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { getAllApprovedActions } from './actions/raiz'
import { BottomNav } from '@/components/bottom-nav'
import { ActionCard } from '@/components/action-card'
import { Sprout, Leaf, TreePine, Users, MapPin } from 'lucide-react'

const STATS = [
  { icon: Leaf, label: 'Limpezas', value: '1.247' },
  { icon: TreePine, label: 'Mudas', value: '3.892' },
  { icon: Users, label: 'Guias', value: '156' },
  { icon: MapPin, label: 'Trilhas', value: '2.341' },
]

export default async function HomePage() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) redirect('/entrar')

  const actions = await getAllApprovedActions()

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="px-5 pt-6 pb-4 safe-top">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Olá,</p>
            <h1 className="text-xl font-semibold text-foreground">
              {session.user.name?.split(' ')[0] || 'Viajante'}
            </h1>
          </div>
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <Sprout className="w-5 h-5 text-primary" />
          </div>
        </div>
      </header>

      {/* Hero Banner */}
      <section className="px-5 mb-6">
        <div className="relative rounded-2xl overflow-hidden bg-primary/10 p-5">
          <div className="relative z-10">
            <h2 className="text-lg font-serif font-bold text-foreground mb-1">
              Chapada Diamantina
            </h2>
            <p className="text-sm text-muted-foreground mb-4">
              Cada ação regenerativa fortalece nossa terra
            </p>
            <div className="flex items-center gap-2">
              <Sprout className="w-5 h-5 text-primary" />
              <span className="text-sm font-medium text-foreground">
                Turismo que regenera
              </span>
            </div>
          </div>
          {/* Decorative elements */}
          <div className="absolute right-4 bottom-4 w-24 h-24 rounded-full bg-primary/10" />
          <div className="absolute right-8 bottom-8 w-16 h-16 rounded-full bg-secondary/50" />
        </div>
      </section>

      {/* Impact Stats */}
      <section className="px-5 mb-8">
        <h3 className="text-sm font-medium text-muted-foreground mb-3">
          Impacto da Comunidade
        </h3>
        <div className="grid grid-cols-4 gap-3">
          {STATS.map((stat) => (
            <div
              key={stat.label}
              className="bg-card rounded-xl border border-border p-3 text-center"
            >
              <stat.icon className="w-5 h-5 mx-auto mb-1.5 text-primary" />
              <p className="text-base font-bold text-foreground">{stat.value}</p>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Recent Actions Feed */}
      <section className="px-5">
        <h3 className="text-sm font-medium text-muted-foreground mb-3">
          Ações Recentes
        </h3>
        <div className="space-y-4">
          {actions.length === 0 ? (
            <div className="bg-card rounded-xl border border-border p-8 text-center">
              <Leaf className="w-12 h-12 mx-auto mb-3 text-muted-foreground/50" />
              <p className="text-muted-foreground">
                Nenhuma ação registrada ainda.
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Seja o primeiro a contribuir!
              </p>
            </div>
          ) : (
            actions.map((action) => (
              <ActionCard key={action.id} action={action} />
            ))
          )}
        </div>
      </section>

      <BottomNav />
    </div>
  )
}
