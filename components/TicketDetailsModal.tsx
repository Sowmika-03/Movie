'use client'

import React from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { formatDate, formatPrice } from '@/lib/utils'
import { TicketMintedEvent, TicketResoldEvent, TicketUsedEvent } from '@/lib/aptos'

interface TicketHistory {
  type: 'minted' | 'resold' | 'used'
  timestamp: string
  from?: string
  to: string
  price?: string
  royalty?: string
  data: TicketMintedEvent | TicketResoldEvent | TicketUsedEvent
}

interface TicketDetailsModalProps {
  isOpen: boolean
  onClose: () => void
  ticket: {
    id: string
    seat_id: string
    movie: string
    theater: string
    showtime: string
    show_id: string
  }
  history: TicketHistory[]
  maxResaleHops: number
}

export function TicketDetailsModal({ 
  isOpen, 
  onClose, 
  ticket, 
  history,
  maxResaleHops 
}: TicketDetailsModalProps) {
  const sortedHistory = history.sort((a, b) => 
    parseInt(a.timestamp) - parseInt(b.timestamp)
  )

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'minted': return '🎟️'
      case 'resold': return '🔄'
      case 'used': return '✅'
      default: return '📝'
    }
  }

  const getEventColor = (type: string) => {
    switch (type) {
      case 'minted': return 'text-green-400'
      case 'resold': return 'text-blue-400'
      case 'used': return 'text-purple-400'
      default: return 'text-gray-400'
    }
  }

  const formatAddress = (addr: string) => {
    if (!addr) return ''
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`
  }

  const isResaleBlocked = () => {
    const resaleCount = history.filter(h => h.type === 'resold').length
    return resaleCount >= maxResaleHops
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            Ticket History: {ticket.seat_id}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Ticket Info */}
          <div className="glass-card p-4">
            <h3 className="text-lg font-semibold mb-3">{ticket.movie}</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-400">Theater:</span>
                <div className="text-white">{ticket.theater}</div>
              </div>
              <div>
                <span className="text-gray-400">Show Time:</span>
                <div className="text-white">{formatDate(ticket.showtime)}</div>
              </div>
              <div>
                <span className="text-gray-400">Seat:</span>
                <div className="text-white">{ticket.seat_id}</div>
              </div>
              <div>
                <span className="text-gray-400">Show ID:</span>
                <div className="text-white">{ticket.show_id}</div>
              </div>
            </div>
          </div>

          {/* Resale Status */}
          <div className="glass-card p-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Resale Status:</span>
              <div className="text-right">
                <div className="text-white">
                  {history.filter(h => h.type === 'resold').length} / {maxResaleHops} resales used
                </div>
                {isResaleBlocked() && (
                  <div className="text-red-400 text-xs">Max resales reached</div>
                )}
              </div>
            </div>
          </div>

          {/* Transaction History */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold">Transaction History</h4>
            
            {sortedHistory.length === 0 ? (
              <div className="text-center text-gray-400 py-8">
                No transaction history available
              </div>
            ) : (
              <div className="space-y-3">
                {sortedHistory.map((event, index) => (
                  <div key={index} className="glass-card p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3">
                        <span className="text-2xl">{getEventIcon(event.type)}</span>
                        <div>
                          <div className={`font-semibold capitalize ${getEventColor(event.type)}`}>
                            {event.type === 'minted' ? 'Ticket Minted' : 
                             event.type === 'resold' ? 'Ticket Resold' : 
                             'Ticket Used'}
                          </div>
                          <div className="text-xs text-gray-400 mt-1">
                            {formatDate(new Date(parseInt(event.timestamp) / 1000).toISOString())}
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-right text-sm">
                        {event.type === 'minted' && (
                          <div>
                            <div className="text-white">To: {formatAddress(event.to)}</div>
                            <div className="text-royaltix-300 font-semibold">
                              {formatPrice(parseInt(event.price || '0'))}
                            </div>
                          </div>
                        )}
                        
                        {event.type === 'resold' && (
                          <div>
                            <div className="text-white">
                              {formatAddress(event.from || '')} → {formatAddress(event.to)}
                            </div>
                            <div className="text-royaltix-300 font-semibold">
                              {formatPrice(parseInt(event.price || '0'))}
                            </div>
                            {event.royalty && (
                              <div className="text-xs text-gray-400">
                                Royalty: {formatPrice(parseInt(event.royalty))}
                              </div>
                            )}
                          </div>
                        )}
                        
                        {event.type === 'used' && (
                          <div>
                            <div className="text-white">Used by: {formatAddress(event.to)}</div>
                            <div className="text-green-400 text-xs font-semibold">
                              ATTENDED
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}