import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { getWallet, getMyActions, getMyRedemptions } from '@/app/actions/raiz'
import { BottomNav } from '@/components/bottom-nav'
import { ActionCard } from '@/components/action-card'
import { 
  Sprout, 
  TrendingUp, 
  TrendingDown, 
  History,
  Leaf,
  Award
} from 'lucide-react'

export default async function WalletPage() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) redirect('/entrar')

  const [wallet, actions, redemptions] = await Promise.all([
    getWallet(),
    getMyActions(),
    getMyRedemptions(),
  ])

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="px-5 pt-6 pb-4 safe-top">
        <h1 className="text-xl font-serif font-bold text-foreground">
          Carteira Raiz
        </h1>
      </header>

      {/* Balance Card */}
      <section className="px-5 mb-6">
        <div className="bg-primary rounded-2xl p-6 text-primary-foreground">
          <p className="text-sm opacity-80 mb-1">Saldo disponível</p>
          <div className="flex items-center gap-3 mb-4">
            <Sprout className="w-10 h-10" />
            <span className="text-4xl font-bold">{wallet.balance}</span>
            <span className="text-xl">Raiz</span>
          </div>
          
          <div className="flex gap-6 pt-4 border-t border-primary-foreground/20">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              <div>
                <p className="text-xs opacity-70">Total ganho</p>
                <p className="font-semibold">{wallet.totalEarned}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <TrendingDown className="w-4 h-4" />
              <div>
                <p className="text-xs opacity-70">Total gasto</p>
                <p className="font-semibold">{wallet.totalSpent}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* My Redemptions */}
      {redemptions.length > 0 && (
        <section className="px-5 mb-6">
          <h3 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
            <Award className="w-4 h-4" />
            Meus Resgates
          </h3>
          <div className="space-y-3">
            {redemptions.slice(0, 3).map(({ redemption, reward }) => (
              <div
                key={redemption.id}
                className="bg-card rounded-xl border border-border p-4"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-foreground">{reward.name}</h4>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {reward.partnerName}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1 text-primary">
                      <Sprout className="w-4 h-4" />
                      <span className="font-semibold">-{redemption.tokensSpent}</span>
                    </div>
                  </div>
                </div>
                {redemption.redemptionCode && (
                  <div className="mt-3 pt-3 border-t border-border">
                    <p className="text-xs text-muted-foreground mb-1">Código de resgate:</p>
                    <p className="font-mono text-sm font-medium text-foreground bg-muted px-3 py-2 rounded-lg">
                      {redemption.redemptionCode}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* My Actions */}
      <section className="px-5">
        <h3 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
          <History className="w-4 h-4" />
          Minhas Ações
        </h3>
        <div className="space-y-4">
          {actions.length === 0 ? (
            <div className="bg-card rounded-xl border border-border p-8 text-center">
              <Leaf className="w-12 h-12 mx-auto mb-3 text-muted-foreground/50" />
              <p className="text-muted-foreground">
                Você ainda não registrou nenhuma ação.
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Comece a contribuir para ganhar tokens Raiz!
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
