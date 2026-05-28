'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createRegenerativeAction } from '@/app/actions/raiz'
import { BottomNav } from '@/components/bottom-nav'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { 
  Camera, 
  MapPin, 
  Loader2, 
  Leaf, 
  TreePine, 
  Users, 
  Mountain,
  CheckCircle,
  WifiOff,
  Sprout
} from 'lucide-react'
import { cn } from '@/lib/utils'

const ACTION_TYPES = [
  { 
    id: 'cleanup', 
    icon: Leaf, 
    label: 'Limpeza de Trilha',
    description: 'Coletou lixo em áreas naturais',
    tokens: 30
  },
  { 
    id: 'planting', 
    icon: TreePine, 
    label: 'Plantio de Mudas',
    description: 'Plantou espécies nativas',
    tokens: 50
  },
  { 
    id: 'guide', 
    icon: Users, 
    label: 'Guia Local',
    description: 'Contratou condutor certificado',
    tokens: 40
  },
  { 
    id: 'trail', 
    icon: Mountain, 
    label: 'Trilha Sustentável',
    description: 'Participou de trilha documentada',
    tokens: 25
  },
]

interface PendingAction {
  id: string
  type: string
  title: string
  description: string
  photoUrl: string
  latitude: number
  longitude: number
  locationName: string
  createdAt: number
}

export default function RegisterActionPage() {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const [step, setStep] = useState<'type' | 'details' | 'success'>('type')
  const [selectedType, setSelectedType] = useState('')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [photoUrl, setPhotoUrl] = useState('')
  const [photoPreview, setPhotoPreview] = useState('')
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [locationName, setLocationName] = useState('')
  const [loading, setLoading] = useState(false)
  const [gettingLocation, setGettingLocation] = useState(false)
  const [isOffline, setIsOffline] = useState(false)
  const [pendingActions, setPendingActions] = useState<PendingAction[]>([])
  const [tokensEarned, setTokensEarned] = useState(0)

  // Check online status
  useEffect(() => {
    setIsOffline(!navigator.onLine)
    
    const handleOnline = () => {
      setIsOffline(false)
      syncPendingActions()
    }
    const handleOffline = () => setIsOffline(true)
    
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    
    // Load pending actions from localStorage
    const stored = localStorage.getItem('raiz_pending_actions')
    if (stored) {
      setPendingActions(JSON.parse(stored))
    }
    
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  // Sync pending actions when online
  const syncPendingActions = async () => {
    const stored = localStorage.getItem('raiz_pending_actions')
    if (!stored) return
    
    const actions: PendingAction[] = JSON.parse(stored)
    const remaining: PendingAction[] = []
    
    for (const action of actions) {
      try {
        await createRegenerativeAction({
          type: action.type,
          title: action.title,
          description: action.description,
          photoUrl: action.photoUrl,
          latitude: action.latitude,
          longitude: action.longitude,
          locationName: action.locationName,
        })
      } catch {
        remaining.push(action)
      }
    }
    
    if (remaining.length > 0) {
      localStorage.setItem('raiz_pending_actions', JSON.stringify(remaining))
    } else {
      localStorage.removeItem('raiz_pending_actions')
    }
    setPendingActions(remaining)
  }

  // Get current location
  const getLocation = () => {
    setGettingLocation(true)
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        })
        setLocationName('Chapada Diamantina, BA')
        setGettingLocation(false)
      },
      () => {
        // Default to Chapada Diamantina center
        setLocation({ lat: -12.4614, lng: -41.4647 })
        setLocationName('Chapada Diamantina, BA')
        setGettingLocation(false)
      },
      { enableHighAccuracy: true }
    )
  }

  // Handle photo capture/upload
  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onloadend = () => {
      const dataUrl = reader.result as string
      setPhotoPreview(dataUrl)
      setPhotoUrl(dataUrl)
    }
    reader.readAsDataURL(file)
  }

  // Submit action
  const handleSubmit = async () => {
    if (!selectedType || !title || !photoUrl || !location) return
    
    setLoading(true)
    const typeInfo = ACTION_TYPES.find(t => t.id === selectedType)
    
    try {
      if (isOffline) {
        // Save locally for later sync
        const pendingAction: PendingAction = {
          id: Date.now().toString(),
          type: selectedType,
          title,
          description,
          photoUrl,
          latitude: location.lat,
          longitude: location.lng,
          locationName,
          createdAt: Date.now(),
        }
        
        const updated = [...pendingActions, pendingAction]
        localStorage.setItem('raiz_pending_actions', JSON.stringify(updated))
        setPendingActions(updated)
        setTokensEarned(typeInfo?.tokens || 0)
        setStep('success')
      } else {
        await createRegenerativeAction({
          type: selectedType,
          title,
          description,
          photoUrl,
          latitude: location.lat,
          longitude: location.lng,
          locationName,
        })
        setTokensEarned(typeInfo?.tokens || 0)
        setStep('success')
      }
    } catch (error) {
      console.error('Error creating action:', error)
    } finally {
      setLoading(false)
    }
  }

  // Render step content
  const renderContent = () => {
    switch (step) {
      case 'type':
        return (
          <div className="space-y-4">
            <div className="text-center mb-6">
              <h1 className="text-xl font-serif font-bold text-foreground">
                Registrar Ação
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                Que tipo de ação regenerativa você realizou?
              </p>
            </div>

            {isOffline && (
              <div className="flex items-center gap-2 px-4 py-3 rounded-lg bg-secondary text-secondary-foreground mb-4">
                <WifiOff className="w-5 h-5" />
                <span className="text-sm">
                  Modo offline - sua ação será sincronizada quando houver conexão
                </span>
              </div>
            )}

            <div className="grid gap-3">
              {ACTION_TYPES.map((type) => (
                <button
                  key={type.id}
                  onClick={() => {
                    setSelectedType(type.id)
                    getLocation()
                    setStep('details')
                  }}
                  className={cn(
                    'flex items-start gap-4 p-4 rounded-xl border text-left transition-all',
                    'bg-card border-border hover:border-primary/50 hover:bg-primary/5'
                  )}
                >
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <type.icon className="w-6 h-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-foreground">{type.label}</h3>
                    <p className="text-sm text-muted-foreground mt-0.5">
                      {type.description}
                    </p>
                    <div className="flex items-center gap-1.5 mt-2">
                      <Sprout className="w-4 h-4 text-primary" />
                      <span className="text-sm font-medium text-primary">
                        +{type.tokens} Raiz
                      </span>
                    </div>
                  </div>
                </button>
              ))}
            </div>

            {pendingActions.length > 0 && (
              <div className="mt-6 p-4 rounded-xl bg-secondary/50 border border-border">
                <p className="text-sm text-foreground font-medium">
                  {pendingActions.length} ação(ões) aguardando sincronização
                </p>
              </div>
            )}
          </div>
        )

      case 'details':
        const typeInfo = ACTION_TYPES.find(t => t.id === selectedType)
        return (
          <div className="space-y-5">
            <div className="text-center mb-6">
              <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                {typeInfo && <typeInfo.icon className="w-7 h-7 text-primary" />}
              </div>
              <h1 className="text-xl font-serif font-bold text-foreground">
                {typeInfo?.label}
              </h1>
            </div>

            {/* Photo capture */}
            <div className="space-y-2">
              <Label className="text-foreground">Foto da ação *</Label>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handlePhotoChange}
                className="hidden"
              />
              
              {photoPreview ? (
                <div className="relative aspect-video rounded-xl overflow-hidden bg-muted">
                  <img
                    src={photoPreview}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute inset-0 bg-foreground/50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity"
                  >
                    <Camera className="w-8 h-8 text-background" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full aspect-video rounded-xl border-2 border-dashed border-border bg-muted/50 flex flex-col items-center justify-center gap-2 hover:border-primary/50 hover:bg-primary/5 transition-colors"
                >
                  <Camera className="w-10 h-10 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    Tirar foto ou escolher da galeria
                  </span>
                </button>
              )}
            </div>

            {/* Location */}
            <div className="space-y-2">
              <Label className="text-foreground">Localização *</Label>
              <div className="flex items-center gap-3 p-4 rounded-xl bg-muted border border-border">
                {gettingLocation ? (
                  <>
                    <Loader2 className="w-5 h-5 text-primary animate-spin" />
                    <span className="text-sm text-muted-foreground">
                      Obtendo localização...
                    </span>
                  </>
                ) : location ? (
                  <>
                    <MapPin className="w-5 h-5 text-primary" />
                    <span className="text-sm text-foreground">
                      {locationName || `${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}`}
                    </span>
                  </>
                ) : (
                  <>
                    <MapPin className="w-5 h-5 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      Localização não disponível
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title" className="text-foreground">Título *</Label>
              <Input
                id="title"
                placeholder="Ex: Limpeza na trilha do Pai Inácio"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="h-12 bg-card border-border"
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description" className="text-foreground">
                Descrição (opcional)
              </Label>
              <Textarea
                id="description"
                placeholder="Conte mais sobre sua ação..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="bg-card border-border resize-none"
              />
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <Button
                variant="outline"
                onClick={() => {
                  setStep('type')
                  setSelectedType('')
                  setPhotoUrl('')
                  setPhotoPreview('')
                  setTitle('')
                  setDescription('')
                }}
                className="flex-1 h-12 border-border text-foreground"
              >
                Voltar
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={!photoUrl || !title || !location || loading}
                className="flex-1 h-12 bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  'Registrar'
                )}
              </Button>
            </div>
          </div>
        )

      case 'success':
        return (
          <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-6">
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-6">
              <CheckCircle className="w-10 h-10 text-primary" />
            </div>
            
            <h1 className="text-2xl font-serif font-bold text-foreground mb-2">
              Ação Registrada!
            </h1>
            
            <p className="text-muted-foreground mb-6">
              {isOffline 
                ? 'Sua ação será sincronizada quando houver conexão'
                : 'Sua contribuição fortalece a Chapada Diamantina'
              }
            </p>

            <div className="flex items-center gap-2 px-6 py-4 rounded-2xl bg-primary/10 mb-8">
              <Sprout className="w-8 h-8 text-primary" />
              <span className="text-3xl font-bold text-primary">+{tokensEarned}</span>
              <span className="text-lg text-foreground">Raiz</span>
            </div>

            <div className="flex gap-3 w-full max-w-sm">
              <Button
                variant="outline"
                onClick={() => {
                  setStep('type')
                  setSelectedType('')
                  setPhotoUrl('')
                  setPhotoPreview('')
                  setTitle('')
                  setDescription('')
                }}
                className="flex-1 h-12 border-border text-foreground"
              >
                Nova ação
              </Button>
              <Button
                onClick={() => router.push('/carteira')}
                className="flex-1 h-12 bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                Ver carteira
              </Button>
            </div>
          </div>
        )
    }
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="px-5 py-6 safe-top">
        {renderContent()}
      </div>
      <BottomNav />
    </div>
  )
}
