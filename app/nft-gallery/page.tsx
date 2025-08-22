'use client'

import React, { useMemo } from 'react'
import { useTickets } from '@/components/providers/TicketsProvider'
import { Card, CardContent } from '@/components/ui/card'
import { formatDate, formatPrice, generateQRCode } from '@/lib/utils'
import Image from 'next/image'
import { useWallet } from '@/hooks/useWallet'
import Link from 'next/link'

export default function NFTGalleryPage() {
  const { tickets, loading } = useTickets()
  const { isConnected } = useWallet()

  const orderedTickets = useMemo(() => 
    tickets.slice().sort((a, b) => b.purchasedAt.localeCompare(a.purchasedAt)), 
    [tickets]
  )

  const getStatusBadge = (ticket: any) => {
    if (ticket.isUsed) {
      return <span className="absolute top-3 right-3 px-2 py-1 bg-purple-500/80 text-white text-xs font-semibold rounded">✅ USED</span>
    }
    if (ticket.resaleCount > 0) {
      return <span className="absolute top-3 right-3 px-2 py-1 bg-blue-500/80 text-white text-xs font-semibold rounded">🔄 RESOLD</span>
    }
    return <span className="absolute top-3 right-3 px-2 py-1 bg-green-500/80 text-white text-xs font-semibold rounded">✨ ACTIVE</span>
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-950 via-dark-900 to-purple-950/20">
      <div className="container mx-auto px-4 pt-24 pb-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-royaltix-300 to-purple-400 bg-clip-text text-transparent">
            🖼️ NFT Gallery
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Your movie tickets as beautiful, verifiable NFTs on the Aptos blockchain
          </p>
        </div>

        {!isConnected && (
          <div className="glass-card p-8 text-center max-w-md mx-auto">
            <div className="text-6xl mb-4">🔐</div>
            <h2 className="text-xl font-semibold mb-2">Connect Your Wallet</h2>
            <p className="text-gray-400 mb-6">Connect your wallet to view your NFT ticket collection</p>
            <Link href="/" className="btn-primary inline-block">
              Connect Wallet
            </Link>
          </div>
        )}

        {isConnected && orderedTickets.length === 0 && !loading && (
          <div className="text-center py-20">
            <div className="text-8xl mb-6 opacity-50">🎫</div>
            <h2 className="text-2xl font-semibold mb-4">No Tickets Yet</h2>
            <p className="text-gray-400 mb-8">Start your collection by purchasing tickets from the marketplace</p>
            <Link href="/market" className="btn-primary inline-block">
              Browse Marketplace
            </Link>
          </div>
        )}

        {loading && (
          <div className="text-center py-20">
            <div className="text-6xl mb-4 animate-pulse">⏳</div>
            <p className="text-gray-400">Loading your NFT collection...</p>
          </div>
        )}

        {isConnected && orderedTickets.length > 0 && (
          <>
            {/* Collection Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12 max-w-2xl mx-auto">
              <div className="glass-card p-4 text-center">
                <div className="text-2xl font-bold text-royaltix-300">{orderedTickets.length}</div>
                <div className="text-xs text-gray-400">Total NFTs</div>
              </div>
              <div className="glass-card p-4 text-center">
                <div className="text-2xl font-bold text-green-400">
                  {orderedTickets.filter(t => !t.isUsed).length}
                </div>
                <div className="text-xs text-gray-400">Active</div>
              </div>
              <div className="glass-card p-4 text-center">
                <div className="text-2xl font-bold text-blue-400">
                  {orderedTickets.filter(t => t.resaleCount > 0).length}
                </div>
                <div className="text-xs text-gray-400">Resold</div>
              </div>
              <div className="glass-card p-4 text-center">
                <div className="text-2xl font-bold text-purple-400">
                  {orderedTickets.filter(t => t.isUsed).length}
                </div>
                <div className="text-xs text-gray-400">Used</div>
              </div>
            </div>

            {/* NFT Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {orderedTickets.map(ticket => (
                <Card key={ticket.id} className="relative card-hover bg-gradient-to-br from-gray-900 to-gray-800 border-gray-700 overflow-hidden group">
                  {getStatusBadge(ticket)}
                  
                  {/* NFT Image */}
                  <div className="relative h-48 bg-gradient-to-br from-royaltix-600/20 to-purple-600/20 flex items-center justify-center">
                    <div className="absolute inset-0 bg-gradient-to-br from-transparent to-black/20"></div>
                    <Image
                      src={generateQRCode(ticket.id)}
                      alt="Ticket NFT"
                      width={120}
                      height={120}
                      className="rounded-lg border border-white/20 shadow-lg"
                    />
                    
                    {/* Movie Title Overlay */}
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                      <h3 className="text-white font-bold text-lg">{ticket.movie}</h3>
                    </div>
                  </div>

                  <CardContent className="p-4">
                    <div className="space-y-3">
                      {/* Theater and Seat */}
                      <div>
                        <p className="text-gray-400 text-sm">{ticket.theater}</p>
                        <p className="text-white font-mono font-semibold">Seat: {ticket.seatId}</p>
                      </div>

                      {/* Showtime */}
                      <div className="text-sm text-gray-300">
                        🗓️ {formatDate(ticket.showtime)}
                      </div>

                      {/* Price and Purchase Info */}
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="text-royaltix-300 font-semibold">{formatPrice(ticket.pricePaid)}</div>
                          <div className="text-xs text-gray-400">Paid Price</div>
                        </div>
                        <div className="text-right">
                          <div className="text-white text-sm">{formatDate(ticket.purchasedAt)}</div>
                          <div className="text-xs text-gray-400">Purchased</div>
                        </div>
                      </div>

                      {/* Resale History */}
                      {ticket.resaleCount > 0 && (
                        <div className="glass-card p-2">
                          <div className="text-xs text-blue-400">
                            🔄 Resold {ticket.resaleCount} time{ticket.resaleCount > 1 ? 's' : ''}
                          </div>
                        </div>
                      )}

                      {/* Transaction Hash */}
                      {ticket.txHash && (
                        <div className="text-xs text-gray-500 break-all">
                          <a 
                            className="underline hover:text-gray-300 transition-colors" 
                            href={`https://explorer.aptoslabs.com/txn/${ticket.txHash}?network=testnet`} 
                            target="_blank" 
                            rel="noreferrer"
                          >
                            View on Explorer 🔗
                          </a>
                        </div>
                      )}

                      {/* NFT Metadata */}
                      <div className="border-t border-gray-700 pt-3 text-xs space-y-1">
                        <div className="flex justify-between">
                          <span className="text-gray-400">Token ID:</span>
                          <span className="text-white font-mono">{ticket.id}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Show ID:</span>
                          <span className="text-white">{ticket.showId}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Creator:</span>
                          <span className="text-white font-mono">{ticket.creator.slice(0, 8)}...</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>

                  {/* Hover Effect */}
                  <div className="absolute inset-0 bg-gradient-to-t from-royaltix-600/0 to-royaltix-600/0 group-hover:from-royaltix-600/10 group-hover:to-transparent transition-all duration-300"></div>
                </Card>
              ))}
            </div>

            {/* Collection Summary */}
            <div className="mt-12 text-center">
              <div className="glass-card p-6 max-w-md mx-auto">
                <h3 className="text-lg font-semibold mb-2">🏆 Collection Value</h3>
                <div className="text-2xl font-bold text-royaltix-300">
                  {formatPrice(orderedTickets.reduce((sum, ticket) => sum + ticket.pricePaid, 0))}
                </div>
                <p className="text-sm text-gray-400 mt-2">
                  Total value of {orderedTickets.length} ticket NFT{orderedTickets.length > 1 ? 's' : ''}
                </p>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}