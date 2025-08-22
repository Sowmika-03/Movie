'use client'

import React, { useMemo, useState } from 'react'
import { useTickets } from '@/components/providers/TicketsProvider'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { formatDate, formatPrice, generateQRCode } from '@/lib/utils'
import Image from 'next/image'
import { useWallet } from '@/hooks/useWallet'
import Link from 'next/link'

export default function TicketsPage() {
  const { tickets, loading, listForResale } = useTickets()
  const { isConnected } = useWallet()
  const [selectedTicket, setSelectedTicket] = useState<any>(null)
  const [showResaleModal, setShowResaleModal] = useState(false)
  const [resalePrice, setResalePrice] = useState('')
  const [resaleLoading, setResaleLoading] = useState(false)

  const ordered = useMemo(() => 
    tickets.slice().sort((a, b) => b.purchasedAt.localeCompare(a.purchasedAt)), 
    [tickets]
  )

  const handleResale = async () => {
    if (!selectedTicket || !resalePrice) return

    setResaleLoading(true)
    try {
      const priceInOctas = Math.floor(parseFloat(resalePrice) * 100000000) // Convert APT to Octas
      const result = await listForResale(selectedTicket.id, priceInOctas)
      
      if (result.success) {
        alert('Ticket listed for resale successfully!')
        setShowResaleModal(false)
        setSelectedTicket(null)
        setResalePrice('')
      } else {
        alert(result.error || 'Failed to list ticket for resale')
      }
    } catch (error) {
      console.error('Error listing for resale:', error)
      alert('Failed to list ticket for resale')
    } finally {
      setResaleLoading(false)
    }
  }

  const openResaleModal = (ticket: any) => {
    setSelectedTicket(ticket)
    setShowResaleModal(true)
  }

  const getTicketStatus = (ticket: any) => {
    if (ticket.isUsed) return { text: 'USED', color: 'bg-purple-500/20 text-purple-400' }
    if (!ticket.canResell) return { text: 'MAX RESALES', color: 'bg-red-500/20 text-red-400' }
    return { text: 'ACTIVE', color: 'bg-green-500/20 text-green-400' }
  }

  return (
    <div className="container mx-auto px-4 pt-24 pb-12">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">My Tickets</h1>
        {loading && <div className="text-gray-400">Loading...</div>}
      </div>

      {!isConnected && (
        <div className="glass-card p-6 mb-6">
          <div className="text-gray-300">Connect your wallet to see your tickets.</div>
        </div>
      )}

      {isConnected && ordered.length === 0 && !loading ? (
        <div className="text-center text-gray-400 py-20">
          <div className="mb-4">You do not have any tickets yet.</div>
          <Link href="/market" className="btn-primary inline-block">Browse shows</Link>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {ordered.map(ticket => {
            const status = getTicketStatus(ticket)
            return (
              <Card key={ticket.id} className="card-hover">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-xl font-semibold">{ticket.movie}</h3>
                      <p className="text-gray-400 text-sm">{ticket.theater}</p>
                      <div className="mt-2">
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${status.color}`}>
                          {status.text}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-royaltix-300 font-semibold">{formatPrice(ticket.pricePaid)}</div>
                      <div className="text-xs text-gray-400">Purchased {formatDate(ticket.purchasedAt)}</div>
                      {ticket.resaleCount > 0 && (
                        <div className="text-xs text-blue-400 mt-1">
                          Resold {ticket.resaleCount} time{ticket.resaleCount > 1 ? 's' : ''}
                        </div>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="text-gray-300">
                      <div>Seat: <span className="font-mono text-white">{ticket.seatId}</span></div>
                      <div>Showtime: {formatDate(ticket.showtime)}</div>
                    </div>
                    
                    {ticket.txHash && (
                      <div className="text-xs text-gray-400 break-all">
                        Tx: <a 
                          className="underline hover:text-white" 
                          href={`https://explorer.aptoslabs.com/txn/${ticket.txHash}?network=testnet`} 
                          target="_blank" 
                          rel="noreferrer"
                        >
                          {ticket.txHash}
                        </a>
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

                    {/* Resale Button */}
                    {ticket.canResell && !ticket.isUsed && (
                      <Button 
                        className="w-full" 
                        variant="outline"
                        onClick={() => openResaleModal(ticket)}
                      >
                        🔄 List for Resale
                      </Button>
                    )}

                    {ticket.isUsed && (
                      <div className="text-center py-2">
                        <span className="text-purple-400 text-sm font-semibold">✅ Ticket Used</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* Resale Modal */}
      <Dialog open={showResaleModal} onOpenChange={setShowResaleModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>List Ticket for Resale</DialogTitle>
          </DialogHeader>
          
          {selectedTicket && (
            <div className="space-y-4">
              <div className="glass-card p-4">
                <h3 className="font-semibold">{selectedTicket.movie}</h3>
                <p className="text-sm text-gray-400">{selectedTicket.theater}</p>
                <p className="text-sm text-gray-400">Seat: {selectedTicket.seatId}</p>
                <p className="text-sm text-gray-400">
                  Original Price: {formatPrice(selectedTicket.pricePaid)}
                </p>
                <p className="text-sm text-gray-400">
                  Resales: {selectedTicket.resaleCount} / 2
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Resale Price (APT)
                </label>
                <Input
                  type="number"
                  placeholder="Enter price in APT"
                  value={resalePrice}
                  onChange={(e) => setResalePrice(e.target.value)}
                  min="0"
                  step="0.01"
                />
                <p className="text-xs text-gray-400 mt-1">
                  Creator will receive 2% royalty on this sale
                </p>
              </div>

              <div className="flex space-x-3">
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => setShowResaleModal(false)}
                >
                  Cancel
                </Button>
                <Button 
                  className="flex-1"
                  onClick={handleResale}
                  disabled={!resalePrice || resaleLoading}
                >
                  {resaleLoading ? 'Listing...' : 'List for Sale'}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

