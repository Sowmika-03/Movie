'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { useWallet } from '@/hooks/useWallet'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell
} from 'recharts'
import { 
  getTicketEvents, 
  getCreatorShows, 
  TicketMintedEvent, 
  TicketResoldEvent, 
  TicketUsedEvent,
  BlockchainShow 
} from '@/lib/aptos'
import { formatDate, formatPrice } from '@/lib/utils'

export default function AnalyticsPage() {
  const { isConnected, account } = useWallet()
  const [events, setEvents] = useState<{
    minted: TicketMintedEvent[]
    resold: TicketResoldEvent[]
    used: TicketUsedEvent[]
  }>({ minted: [], resold: [], used: [] })
  const [shows, setShows] = useState<BlockchainShow[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (isConnected && account) {
      fetchAnalyticsData()
    }
  }, [isConnected, account])

  const fetchAnalyticsData = async () => {
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
      console.error('Error fetching analytics data:', error)
    } finally {
      setLoading(false)
    }
  }

  // KPIs
  const analytics = useMemo(() => {
    const totalTicketsSold = events.minted.length
    const totalResales = events.resold.length
    const totalTicketsUsed = events.used.length
    
    const primaryRevenue = events.minted.reduce((sum, event) => 
      sum + parseInt(event.price), 0
    )
    
    const royaltiesEarned = events.resold.reduce((sum, event) => 
      sum + parseInt(event.royalty_to_creator), 0
    )

    const resaleRevenue = events.resold.reduce((sum, event) => 
      sum + parseInt(event.price), 0
    )

    const totalRevenue = primaryRevenue + royaltiesEarned
    const averageTicketPrice = totalTicketsSold > 0 ? primaryRevenue / totalTicketsSold : 0
    const averageResalePrice = totalResales > 0 ? resaleRevenue / totalResales : 0
    const utilizationRate = totalTicketsSold > 0 ? (totalTicketsUsed / totalTicketsSold) * 100 : 0

    return {
      totalTicketsSold,
      primaryRevenue,
      royaltiesEarned,
      totalRevenue,
      totalResales,
      totalTicketsUsed,
      averageTicketPrice,
      averageResalePrice,
      utilizationRate
    }
  }, [events])

  // Daily sales chart data
  const dailySalesData = useMemo(() => {
    const dataMap = new Map<string, { date: string; primary: number; resales: number; revenue: number }>()
    
    events.minted.forEach(event => {
      const date = new Date(parseInt(event.timestamp) / 1000).toISOString().split('T')[0]
      const existing = dataMap.get(date) || { date, primary: 0, resales: 0, revenue: 0 }
      existing.primary += 1
      existing.revenue += parseInt(event.price)
      dataMap.set(date, existing)
    })
    
    events.resold.forEach(event => {
      const date = new Date(parseInt(event.timestamp) / 1000).toISOString().split('T')[0]
      const existing = dataMap.get(date) || { date, primary: 0, resales: 0, revenue: 0 }
      existing.resales += 1
      existing.revenue += parseInt(event.royalty_to_creator)
      dataMap.set(date, existing)
    })

    return Array.from(dataMap.values())
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(-14) // Last 14 days
  }, [events])

  // Revenue by show
  const showRevenueData = useMemo(() => {
    const revenueMap = new Map<string, { show: string; primary: number; royalties: number }>()
    
    events.minted.forEach(event => {
      const show = shows.find(s => s.id === event.show_id)
      const showName = show ? `${show.movie} - ${show.theater.substring(0, 20)}` : `Show ${event.show_id}`
      const existing = revenueMap.get(showName) || { show: showName, primary: 0, royalties: 0 }
      existing.primary += parseInt(event.price)
      revenueMap.set(showName, existing)
    })
    
    events.resold.forEach(event => {
      const show = shows.find(s => s.id === event.show_id)
      const showName = show ? `${show.movie} - ${show.theater.substring(0, 20)}` : `Show ${event.show_id}`
      const existing = revenueMap.get(showName) || { show: showName, primary: 0, royalties: 0 }
      existing.royalties += parseInt(event.royalty_to_creator)
      revenueMap.set(showName, existing)
    })

    return Array.from(revenueMap.values())
      .sort((a, b) => (b.primary + b.royalties) - (a.primary + a.royalties))
      .slice(0, 10) // Top 10 shows
  }, [events, shows])

  // Resale activity pie chart
  const resaleData = useMemo(() => {
    const resaleCountMap = new Map<number, number>()
    
    events.resold.forEach(event => {
      const count = event.resale_count
      resaleCountMap.set(count, (resaleCountMap.get(count) || 0) + 1)
    })

    return Array.from(resaleCountMap.entries()).map(([hop, count]) => ({
      name: `${hop}${hop === 1 ? 'st' : hop === 2 ? 'nd' : 'rd'} Resale`,
      value: count
    }))
  }, [events])

  const COLORS = ['#8B5CF6', '#06B6D4', '#10B981', '#F59E0B', '#EF4444']

  if (!isConnected) {
    return (
      <div className="container mx-auto px-4 pt-24 pb-12">
        <div className="glass-card p-8 text-center">
          <h1 className="text-2xl font-bold mb-4">📊 Analytics</h1>
          <p className="text-gray-400 mb-6">Connect your wallet to view detailed analytics.</p>
          <Button onClick={() => window.location.reload()}>Connect Wallet</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 pt-24 pb-12">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">📊 Advanced Analytics</h1>
        <Button onClick={fetchAnalyticsData} disabled={loading}>
          {loading ? 'Loading...' : 'Refresh Data'}
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-8">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-royaltix-300">{analytics.totalTicketsSold}</div>
            <div className="text-xs text-gray-400">Total Tickets Sold</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-400">{formatPrice(analytics.primaryRevenue)}</div>
            <div className="text-xs text-gray-400">Primary Revenue</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-blue-400">{formatPrice(analytics.royaltiesEarned)}</div>
            <div className="text-xs text-gray-400">Resale Royalties</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-purple-400">{formatPrice(analytics.totalRevenue)}</div>
            <div className="text-xs text-gray-400">Total Revenue</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-orange-400">{analytics.utilizationRate.toFixed(1)}%</div>
            <div className="text-xs text-gray-400">Utilization Rate</div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Grid */}
      <div className="grid lg:grid-cols-2 gap-8 mb-8">
        {/* Daily Sales Trend */}
        <Card>
          <CardHeader>
            <CardTitle>📈 Daily Sales & Revenue Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={dailySalesData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="date" stroke="#9CA3AF" fontSize={12} />
                  <YAxis stroke="#9CA3AF" fontSize={12} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1F2937', 
                      border: '1px solid #374151',
                      borderRadius: '8px' 
                    }}
                  />
                  <Line type="monotone" dataKey="primary" stroke="#8B5CF6" name="Primary Sales" strokeWidth={2} />
                  <Line type="monotone" dataKey="resales" stroke="#06B6D4" name="Resales" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Revenue by Show */}
        <Card>
          <CardHeader>
            <CardTitle>💰 Revenue by Show</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={showRevenueData} layout="horizontal">
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis type="number" stroke="#9CA3AF" fontSize={12} />
                  <YAxis type="category" dataKey="show" stroke="#9CA3AF" fontSize={10} width={120} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1F2937', 
                      border: '1px solid #374151',
                      borderRadius: '8px' 
                    }}
                  />
                  <Bar dataKey="primary" stackId="a" fill="#8B5CF6" name="Primary Sales" />
                  <Bar dataKey="royalties" stackId="a" fill="#06B6D4" name="Royalties" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Resale Activity */}
        <Card>
          <CardHeader>
            <CardTitle>🔄 Resale Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={resaleData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}`}
                  >
                    {resaleData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Performance Metrics */}
        <Card>
          <CardHeader>
            <CardTitle>📊 Performance Metrics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Avg Ticket Price:</span>
                <span className="text-white font-semibold">{formatPrice(analytics.averageTicketPrice)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Avg Resale Price:</span>
                <span className="text-white font-semibold">{formatPrice(analytics.averageResalePrice)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Resale Rate:</span>
                <span className="text-white font-semibold">
                  {analytics.totalTicketsSold > 0 ? ((analytics.totalResales / analytics.totalTicketsSold) * 100).toFixed(1) : 0}%
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Total Shows:</span>
                <span className="text-white font-semibold">{shows.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Utilization Rate:</span>
                <span className="text-white font-semibold">{analytics.utilizationRate.toFixed(1)}%</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Revenue Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>💵 Revenue Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="glass-card p-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Primary Sales:</span>
                  <span className="text-green-400 font-semibold">{formatPrice(analytics.primaryRevenue)}</span>
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {((analytics.primaryRevenue / analytics.totalRevenue) * 100 || 0).toFixed(1)}% of total
                </div>
              </div>
              
              <div className="glass-card p-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Resale Royalties:</span>
                  <span className="text-blue-400 font-semibold">{formatPrice(analytics.royaltiesEarned)}</span>
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {((analytics.royaltiesEarned / analytics.totalRevenue) * 100 || 0).toFixed(1)}% of total
                </div>
              </div>

              <div className="border-t border-gray-700 pt-3">
                <div className="flex justify-between items-center">
                  <span className="text-white font-semibold">Total Revenue:</span>
                  <span className="text-royaltix-300 font-bold text-lg">{formatPrice(analytics.totalRevenue)}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity Summary */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>🕒 Recent Activity Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="space-y-3">
              <h4 className="font-semibold text-green-400">Recent Mints</h4>
              {events.minted.slice(0, 5).map((event, index) => (
                <div key={index} className="text-sm glass-card p-2">
                  <div className="flex justify-between">
                    <span className="font-mono">{event.seat_id}</span>
                    <span className="text-royaltix-300">{formatPrice(parseInt(event.price))}</span>
                  </div>
                  <div className="text-xs text-gray-400">
                    {formatDate(new Date(parseInt(event.timestamp) / 1000).toISOString())}
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-3">
              <h4 className="font-semibold text-blue-400">Recent Resales</h4>
              {events.resold.slice(0, 5).map((event, index) => (
                <div key={index} className="text-sm glass-card p-2">
                  <div className="flex justify-between">
                    <span className="font-mono">{event.seat_id}</span>
                    <span className="text-royaltix-300">{formatPrice(parseInt(event.price))}</span>
                  </div>
                  <div className="text-xs text-gray-400">
                    Royalty: {formatPrice(parseInt(event.royalty_to_creator))}
                  </div>
                  <div className="text-xs text-gray-400">
                    {formatDate(new Date(parseInt(event.timestamp) / 1000).toISOString())}
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-3">
              <h4 className="font-semibold text-purple-400">Recently Used</h4>
              {events.used.slice(0, 5).map((event, index) => (
                <div key={index} className="text-sm glass-card p-2">
                  <div className="font-mono">{event.seat_id}</div>
                  <div className="text-xs text-gray-400">
                    {formatDate(new Date(parseInt(event.timestamp) / 1000).toISOString())}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}