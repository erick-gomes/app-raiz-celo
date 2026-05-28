'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { authClient } from '@/lib/auth-client'
import { BottomNav } from '@/components/bottom-nav'
import { Button } from '@/components/ui/button'
import { 
  User, 
  LogOut, 
  Sprout,
  MapPin,
  Info,
  ChevronRight,
  Loader2
} from 'lucide-react'

export default function ProfilePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const { data: session } = authClient.useSession()

  const handleSignOut = async () => {
    setLoading(true)
    try {
      await authClient.signOut()
      router.push('/entrar')
      router.refresh()
    } catch (error) {
      console.error('Error signing out:', error)
    } finally {
      setLoading(false)
    }
  }

  const menuItems = [
    {
      icon: Info,
      label: 'Sobre o Raiz',
      description: 'Conheça o projeto de turismo regenerativo',
      action: () => {},
    },
    {
      icon: MapPin,
      label: 'Parceiros',
      description: 'Veja os parceiros da Chapada Diamantina',
      action: () => {},
    },
  ]

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="px-5 pt-6 pb-4 safe-top">
        <h1 className="text-xl font-serif font-bold text-foreground">
          Perfil
        </h1>
      </header>

      {/* Profile Card */}
      <section className="px-5 mb-6">
        <div className="bg-card rounded-2xl border border-border p-5">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              {session?.user?.image ? (
                <img 
                  src={session.user.image} 
                  alt={session.user.name || ''} 
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <User className="w-8 h-8 text-primary" />
              )}
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground">
                {session?.user?.name || 'Viajante'}
              </h2>
              <p className="text-sm text-muted-foreground">
                {session?.user?.email}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="px-5 mb-6">
        <div className="bg-primary/5 rounded-2xl p-5 border border-primary/10">
          <div className="flex items-start gap-3">
            <Sprout className="w-6 h-6 text-primary flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-foreground mb-1">
                Turismo Regenerativo
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                O Raiz é um movimento para transformar o turismo na Chapada Diamantina. 
                Cada ação sua ajuda a preservar e regenerar um dos ecossistemas mais 
                importantes do Brasil.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Menu Items */}
      <section className="px-5 mb-6">
        <div className="bg-card rounded-2xl border border-border overflow-hidden">
          {menuItems.map((item, index) => (
            <button
              key={item.label}
              onClick={item.action}
              className={`w-full flex items-center gap-4 p-4 text-left hover:bg-muted/50 transition-colors ${
                index !== menuItems.length - 1 ? 'border-b border-border' : ''
              }`}
            >
              <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                <item.icon className="w-5 h-5 text-muted-foreground" />
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-foreground">{item.label}</h4>
                <p className="text-xs text-muted-foreground">{item.description}</p>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </button>
          ))}
        </div>
      </section>

      {/* Sign Out */}
      <section className="px-5">
        <Button
          variant="outline"
          onClick={handleSignOut}
          disabled={loading}
          className="w-full h-12 border-destructive/30 text-destructive hover:bg-destructive/10 hover:text-destructive"
        >
          {loading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <>
              <LogOut className="w-5 h-5 mr-2" />
              Sair da conta
            </>
          )}
        </Button>
      </section>

      {/* Version */}
      <footer className="px-5 mt-8 text-center">
        <p className="text-xs text-muted-foreground">
          Raiz v1.0.0 - Chapada Diamantina, BA
        </p>
      </footer>

      <BottomNav />
    </div>
  )
}
