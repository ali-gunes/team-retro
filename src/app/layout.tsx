import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from '@/components/theme-provider'
import { PastelBackgroundProvider } from '@/components/pastel-background-provider'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Team Retro - Real-time Retrospectives',
  description: 'Collaborate with your team in real-time. Share thoughts, vote on ideas, and run interactive polls to make your retrospectives more engaging and productive.',
  icons: {
    icon: '/logo_teamretro.png',
    shortcut: '/logo_teamretro.png',
    apple: '/logo_teamretro.png',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <PastelBackgroundProvider>
            {children}
          </PastelBackgroundProvider>
        </ThemeProvider>
      </body>
    </html>
  )
} 