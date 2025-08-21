'use client'

import React, { useMemo } from 'react'
import { useTickets } from '@/components/providers/TicketsProvider'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { formatDate, formatPrice, generateQRCode } from '@/lib/utils'
import Image from 'next/image'
import { useWallet } from '@/hooks/useWallet'
import Link from 'next/link'

export default function TicketsPage() {
  const { tickets } = useTickets()
  const { isConnected } = useWallet()

  const ordered = useMemo(() => tickets.slice().sort((a, b) => b.purchasedAt.localeCompare(a.purchasedAt)), [tickets])

  return (
    <div className="container mx-auto px-4 pt-24 pb-12">
      <h1 className="text-3xl font-bold mb-6">My Tickets</h1>

      {!isConnected && (
        <div className="glass-card p-6 mb-6">
          <div className="text-gray-300">Connect your wallet to see your tickets.</div>
        </div>
      )}

      {ordered.length === 0 ? (
        <div className="text-center text-gray-400 py-20">
          <div className="mb-4">You do not have any tickets yet.</div>
          <Link href="/market" className="btn-primary inline-block">Browse shows</Link>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {ordered.map(ticket => (
            <Card key={ticket.id} className="card-hover">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-xl font-semibold">{ticket.movie}</h3>
                    <p className="text-gray-400 text-sm">{ticket.theater}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-royaltix-300 font-semibold">{formatPrice(ticket.pricePaid)}</div>
                    <div className="text-xs text-gray-400">Purchased {formatDate(ticket.purchasedAt)}</div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-gray-300">Showtime: {formatDate(ticket.showtime)}</div>
                  {ticket.txHash && (
                    <div className="text-xs text-gray-400 break-all">
                      Tx: <a className="underline hover:text-white" href={`https://explorer.aptoslabs.com/txn/${ticket.txHash}?network=testnet`} target="_blank" rel="noreferrer">{ticket.txHash}</a>
                    </div>
                  )}
                  <div className="flex items-center justify-center">
                    <Image
                      src={generateQRCode(ticket.id)}
                      alt="Ticket QR Code"
                      width={160}
                      height={160}
                      className="rounded-lg border border-white/10"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

