'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { useWallet } from '@/hooks/useWallet'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { TicketDetailsModal } from '@/components/TicketDetailsModal'
import { 
  getTicketEvents, 
  getCreatorShows, 
  TicketMintedEvent, 
  TicketResoldEvent, 
  TicketUsedEvent,
  BlockchainShow 
} from '@/lib/aptos'
import { formatDate, formatPrice } from '@/lib/utils'

interface EventLogEntry {
  id: string
  type: 'minted' | 'resold' | 'used'
  timestamp: string
  showId: string
  seatId: string
  seller?: string
  buyer: string
  price?: string
  royalty?: string
}

export default function DashboardPage() {
  const { isConnected, account } = useWallet()
  const [events, setEvents] = useState<{
    minted: TicketMintedEvent[]
    resold: TicketResoldEvent[]
    used: TicketUsedEvent[]
  }>({ minted: [], resold: [], used: [] })
  const [shows, setShows] = useState<BlockchainShow[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedTicket, setSelectedTicket] = useState<any>(null)
  const [showTicketModal, setShowTicketModal] = useState(false)

  // Fetch data when connected
  useEffect(() => {
    if (isConnected && account) {
      fetchDashboardData()
    }
  }, [isConnected, account])

  const fetchDashboardData = async () => {
    if (!account) return
    
    setLoading(true)
    try {
      const [eventsData, showsData] = await Promise.all([
        getTicketEvents(account),
        getCreatorShows(account)
      ])
      setEvents(eventsData)
      setShows(showsData)
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  // Calculate KPIs
  const kpis = useMemo(() => {
    const totalTicketsSold = events.minted.length
    const totalResales = events.resold.length
    const totalTicketsUsed = events.used.length
    
    const primaryRevenue = events.minted.reduce((sum, event) => 
      sum + parseInt(event.price), 0
    )
    
    const royaltiesEarned = events.resold.reduce((sum, event) => 
      sum + parseInt(event.royalty_to_creator), 0
    )

    const totalSeatsAvailable = shows.reduce((sum, show) => 
      sum + parseInt(show.total_seats), 0
    )

    return {
      totalTicketsSold,
      totalSeatsAvailable,
      primaryRevenue,
      royaltiesEarned,
      totalResales,
      totalTicketsUsed,
    }
  }, [events, shows])

  // Prepare chart data
  const chartData = useMemo(() => {
    const dataMap = new Map<string, number>()
    
    // Add minted events
    events.minted.forEach(event => {
      const date = new Date(parseInt(event.timestamp) / 1000).toISOString().split('T')[0]
      dataMap.set(date, (dataMap.get(date) || 0) + 1)
    })
    
    // Add resold events
    events.resold.forEach(event => {
      const date = new Date(parseInt(event.timestamp) / 1000).toISOString().split('T')[0]
      dataMap.set(date, (dataMap.get(date) || 0) + 1)
    })

    const sortedData = Array.from(dataMap.entries())
      .map(([date, count]) => ({ date, tickets: count }))
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(-7) // Last 7 days

    return sortedData
  }, [events])

  // Combine all events for the log table
  const eventLog = useMemo(() => {
    const allEvents: EventLogEntry[] = []

    // Add minted events
    events.minted.forEach(event => {
      allEvents.push({
        id: `minted-${event.timestamp}`,
        type: 'minted',
        timestamp: event.timestamp,
        showId: event.show_id,
        seatId: event.seat_id,
        buyer: event.to,
        price: event.price,
      })
    })

    // Add resold events
    events.resold.forEach(event => {
      allEvents.push({
        id: `resold-${event.timestamp}`,
        type: 'resold',
        timestamp: event.timestamp,
        showId: event.show_id,
        seatId: event.seat_id,
        seller: event.from,
        buyer: event.to,
        price: event.price,
        royalty: event.royalty_to_creator,
      })
    })

    // Add used events
    events.used.forEach(event => {
      allEvents.push({
        id: `used-${event.timestamp}`,
        type: 'used',
        timestamp: event.timestamp,
        showId: event.show_id,
        seatId: event.seat_id,
        buyer: event.owner,
      })
    })

    return allEvents.sort((a, b) => parseInt(b.timestamp) - parseInt(a.timestamp))
  }, [events])

  const formatAddress = (addr: string) => {
    if (!addr) return ''
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`
  }

  const handleTicketClick = async (seatId: string, showId: string) => {
    // Find all events for this specific ticket
    const ticketHistory = eventLog
      .filter(event => event.seatId === seatId && event.showId === showId)
      .map(event => ({
        type: event.type,
        timestamp: event.timestamp,
        from: event.seller,
        to: event.buyer,
        price: event.price,
        royalty: event.royalty,
        data: event
      }))

    const show = shows.find(s => s.id === showId)
    
    setSelectedTicket({
      id: `${showId}-${seatId}`,
      seat_id: seatId,
      movie: show?.movie || 'Unknown',
      theater: show?.theater || 'Unknown',
      showtime: show?.showtime || '',
      show_id: showId,
      history: ticketHistory,
      maxResaleHops: show?.max_resale_hops || 2
    })
    setShowTicketModal(true)
  }

  if (!isConnected) {
    return (
      <div className="container mx-auto px-4 pt-24 pb-12">
        <div className="glass-card p-8 text-center">
          <h1 className="text-2xl font-bold mb-4">Creator Dashboard</h1>
          <p className="text-gray-400 mb-6">Connect your wallet to view your ticketing analytics and revenue.</p>
          <Button onClick={() => window.location.reload()}>Connect Wallet</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 pt-24 pb-12">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">🎬 Creator Dashboard</h1>
        <Button onClick={fetchDashboardData} disabled={loading}>
          {loading ? 'Loading...' : 'Refresh Data'}
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-royaltix-300">{kpis.totalTicketsSold}</div>
            <div className="text-xs text-gray-400">Tickets Sold</div>
            <div className="text-xs text-gray-500">
              {kpis.totalSeatsAvailable > 0 && `${kpis.totalTicketsSold} / ${kpis.totalSeatsAvailable}`}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-400">{formatPrice(kpis.primaryRevenue)}</div>
            <div className="text-xs text-gray-400">Primary Sales</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-blue-400">{formatPrice(kpis.royaltiesEarned)}</div>
            <div className="text-xs text-gray-400">Resale Royalties</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-yellow-400">{kpis.totalResales}</div>
            <div className="text-xs text-gray-400">Total Resales</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-purple-400">{kpis.totalTicketsUsed}</div>
            <div className="text-xs text-gray-400">Tickets Used</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-white">{shows.length}</div>
            <div className="text-xs text-gray-400">Total Shows</div>
          </CardContent>
        </Card>
      </div>

      {/* Sales Chart */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>📈 Tickets Sold Over Time</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis 
                  dataKey="date" 
                  stroke="#9CA3AF"
                  fontSize={12}
                />
                <YAxis stroke="#9CA3AF" fontSize={12} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1F2937', 
                    border: '1px solid #374151',
                    borderRadius: '8px' 
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="tickets" 
                  stroke="#8B5CF6" 
                  strokeWidth={2}
                  dot={{ fill: '#8B5CF6', strokeWidth: 2, r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Events Table */}
      <Card>
        <CardHeader>
          <CardTitle>📝 Event Log</CardTitle>
          <p className="text-sm text-gray-400">
            Complete transaction history for all your tickets
          </p>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-gray-400">Loading events...</div>
          ) : eventLog.length === 0 ? (
            <div className="text-center py-8 text-gray-400">No events found</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-700">
                    <th className="text-left py-3 px-2">Time (UTC)</th>
                    <th className="text-left py-3 px-2">Event</th>
                    <th className="text-left py-3 px-2">Show ID</th>
                    <th className="text-left py-3 px-2">Seat ID</th>
                    <th className="text-left py-3 px-2">Seller</th>
                    <th className="text-left py-3 px-2">Buyer</th>
                    <th className="text-left py-3 px-2">Price (APT)</th>
                    <th className="text-left py-3 px-2">Creator Royalty</th>
                  </tr>
                </thead>
                <tbody>
                  {eventLog.map(event => (
                    <tr 
                      key={event.id} 
                      className="border-b border-gray-800 hover:bg-gray-800/50 cursor-pointer transition-colors"
                      onClick={() => handleTicketClick(event.seatId, event.showId)}
                    >
                      <td className="py-3 px-2 text-gray-300">
                        {formatDate(new Date(parseInt(event.timestamp) / 1000).toISOString())}
                      </td>
                      <td className="py-3 px-2">
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${
                          event.type === 'minted' ? 'bg-green-500/20 text-green-400' :
                          event.type === 'resold' ? 'bg-blue-500/20 text-blue-400' :
                          'bg-purple-500/20 text-purple-400'
                        }`}>
                          {event.type === 'minted' ? 'Minted' : 
                           event.type === 'resold' ? 'Resold' : 'Used'}
                        </span>
                      </td>
                      <td className="py-3 px-2 text-gray-300">{event.showId}</td>
                      <td className="py-3 px-2 text-white font-mono">{event.seatId}</td>
                      <td className="py-3 px-2 text-gray-300">
                        {event.seller ? formatAddress(event.seller) : '–'}
                      </td>
                      <td className="py-3 px-2 text-gray-300">{formatAddress(event.buyer)}</td>
                      <td className="py-3 px-2 text-royaltix-300 font-semibold">
                        {event.price ? formatPrice(parseInt(event.price)) : '–'}
                      </td>
                      <td className="py-3 px-2 text-green-400 font-semibold">
                        {event.royalty ? formatPrice(parseInt(event.royalty)) : '–'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Ticket History Modal */}
      {selectedTicket && (
        <TicketDetailsModal
          isOpen={showTicketModal}
          onClose={() => setShowTicketModal(false)}
          ticket={selectedTicket}
          history={selectedTicket.history || []}
          maxResaleHops={selectedTicket.maxResaleHops || 2}
        />
      )}
    </div>
  )
}

function formatAddress(addr: string) {
  if (!addr) return ''
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`
}



