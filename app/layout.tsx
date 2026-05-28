import type { Metadata, Viewport } from 'next'
import { Nunito, Bitter } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { headers } from 'next/headers'
import { Web3Provider } from '@/lib/web3/context'
import './globals.css'

const nunito = Nunito({ 
  subsets: ['latin'],
  variable: '--font-nunito',
})

const bitter = Bitter({ 
  subsets: ['latin'],
  variable: '--font-bitter',
})

export const metadata: Metadata = {
  title: 'Raiz - Turismo Regenerativo na Chapada Diamantina',
  description: 'Contribua com a preservação da Chapada Diamantina e ganhe tokens Raiz para trocar por experiências únicas.',
  generator: 'v0.app',
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#4a7c59',
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const headersList = await headers()
  const cookies = headersList.get('cookie')

  return (
    <html lang="pt-BR" className={`${nunito.variable} ${bitter.variable} bg-background`}>
      <body className="font-sans antialiased min-h-screen">
        <Web3Provider cookies={cookies}>
          {children}
        </Web3Provider>
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
