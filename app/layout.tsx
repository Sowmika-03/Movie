import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { WalletProvider } from '@/components/providers/WalletProvider'
import { TicketsProvider } from '@/components/providers/TicketsProvider'
import { Navbar } from '@/components/Navbar'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Royaltix - Decentralized Movie Ticketing',
  description: 'Decentralized Movie Ticketing DApp on Aptos Blockchain',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <WalletProvider>
          <TicketsProvider>
            <Navbar />
            {children}
          </TicketsProvider>
        </WalletProvider>
      </body>
    </html>
  )
}
