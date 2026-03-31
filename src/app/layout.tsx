import type { Metadata } from 'next'
import { Raleway, Geist_Mono } from 'next/font/google'
import { Header } from './components/Header'
import { AppProviders } from './providers'
import './globals.css'

const raleway = Raleway({
  variable: '--font-raleway',
  subsets: ['latin', 'cyrillic'],
  weight: ['400', '500', '600', '700', '800'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'InVision',
  description: 'InVision — checking applicants much more easier',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`dark ${raleway.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">
        <AppProviders>
          <Header />
          {children}
        </AppProviders>
      </body>
    </html>
  )
}
