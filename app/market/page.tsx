'use client'

import React, { useMemo, useState, useEffect } from 'react'
import { sampleShows } from '@/data/sampleData'
import { Button } from '@/components/ui/button'
import { useTickets } from '@/components/providers/TicketsProvider'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { formatDate, formatPrice } from '@/lib/utils'
import { useSearchParams, useRouter } from 'next/navigation'
import { useWallet } from '@/hooks/useWallet'
import { getLedgerInfo } from '@/lib/aptos'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

export default function MarketPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const theaterFilter = searchParams.get('theater') || ''
  const [query, setQuery] = useState('')
  const { purchaseTicket, marketplaceListings, buyResaleTicket, refreshMarketplace } = useTickets()
  const { isConnected, account, signAndSubmitTransaction } = useWallet() as any
  const moduleAddress = process.env.NEXT_PUBLIC_ROYALTIX_MODULE_ADDRESS
  const isValidModuleAddress = useMemo(() =>
    !!moduleAddress && /^0x[0-9a-fA-F]{2,64}$/.test(moduleAddress)
  , [moduleAddress])

  useEffect(() => {
    refreshMarketplace()
  }, [refreshMarketplace])

  const filteredShows = useMemo(() => {
    return sampleShows.filter(show => {
      const matchesTheater = theaterFilter ? show.theater.toLowerCase().includes(theaterFilter.toLowerCase()) : true
      const q = query.toLowerCase()
      const matchesQuery = q
        ? show.movie.toLowerCase().includes(q) || show.theater.toLowerCase().includes(q)
        : true
      return matchesTheater && matchesQuery
    })
  }, [theaterFilter, query])

  const handleClearFilter = () => {
    const params = new URLSearchParams(searchParams.toString())
    params.delete('theater')
    router.push(`/market${params.size ? `?${params.toString()}` : ''}`)
  }

  const handlePrimaryPurchase = async (show: typeof sampleShows[number]) => {
    // Generate a seat ID (in real app, user would select seat)
    const seatId = `S${Math.floor(Math.random() * 10) + 1}-R${Math.floor(Math.random() * 20) + 1}-C${Math.floor(Math.random() * 15) + 1}`
    
    let txHash: string | undefined
    if (isConnected && account) {
      try {
        if (isValidModuleAddress) {
          const payload = {
            type: 'entry_function_payload',
            function: `${moduleAddress}::tickets::mint`,
            type_arguments: [],
            arguments: [account, parseInt(show.id), seatId], // Using account as creator for demo
          }
          const res = await signAndSubmitTransaction({ payload })
          txHash = res.hash
        } else {
          const ledger = await getLedgerInfo()
          txHash = `ledger-${ledger.chain_id}-${Date.now()}`
        }
      } catch (e) {
        console.error('Blockchain transaction failed:', e)
      }
    }

    const result = await purchaseTicket({
      ...show,
      creator: account, // Using account as creator for demo
      royalty_percentage: 2,
      max_resale_hops: 2
    }, seatId, txHash)
    
    if (!result.success) {
      alert(result.error)
      return
    }
    alert('Ticket purchased! Check My Tickets page.')
  }

  const handleResalePurchase = async (listing: any) => {
    const result = await buyResaleTicket(listing.ticket_id)
    if (!result.success) {
      alert(result.error)
      return
    }
    alert('Resale ticket purchased! Check My Tickets page.')
  }

  const formatAddress = (addr: string) => {
    if (!addr) return ''
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`
  }

  return (
    <div className="container mx-auto px-4 pt-24 pb-12">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">🎪 Marketplace</h1>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="flex-1">
          <Input
            placeholder="Search by movie or theater"
            value={query}
            onChange={e => setQuery(e.target.value)}
          />
        </div>
        {theaterFilter && (
          <Button variant="outline" onClick={handleClearFilter}>Clear filter: {theaterFilter}</Button>
        )}
      </div>

      <Tabs defaultValue="primary" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="primary">🎟️ Primary Sales</TabsTrigger>
          <TabsTrigger value="resale">🔄 Resale Market ({marketplaceListings.length})</TabsTrigger>
        </TabsList>
        
        {/* Primary Sales Tab */}
        <TabsContent value="primary" className="space-y-6">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredShows.map(show => (
              <Card key={show.id} className="card-hover">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-xl font-semibold">{show.movie}</h3>
                      <p className="text-gray-400">{show.theater}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-royaltix-300 font-semibold">{formatPrice(show.price)}</div>
                      <div className="text-xs text-gray-400">{show.available} / {show.seats} left</div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="text-gray-300">Showtime: {formatDate(show.showtime)}</div>
                    <Button className="w-full" variant="royaltix" onClick={() => handlePrimaryPurchase(show)}>
                      Purchase Ticket
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredShows.length === 0 && (
            <div className="text-center text-gray-400 py-20">No shows found.</div>
          )}
        </TabsContent>

        {/* Resale Market Tab */}
        <TabsContent value="resale" className="space-y-6">
          {marketplaceListings.length === 0 ? (
            <div className="text-center text-gray-400 py-20">
              <div className="mb-4">No tickets available for resale.</div>
              <Button onClick={refreshMarketplace} variant="outline">
                Refresh Marketplace
              </Button>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {marketplaceListings.map(listing => (
                <Card key={`${listing.ticket_id}-${listing.listed_at}`} className="card-hover border-blue-500/30">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-xl font-semibold">{listing.ticket_details?.movie || 'Unknown Movie'}</h3>
                        <p className="text-gray-400">{listing.ticket_details?.theater || 'Unknown Theater'}</p>
                        <div className="mt-2">
                          <span className="px-2 py-1 rounded text-xs font-semibold bg-blue-500/20 text-blue-400">
                            🔄 RESALE
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-royaltix-300 font-semibold">{formatPrice(listing.price)}</div>
                        <div className="text-xs text-gray-400">
                          Seller: {formatAddress(listing.seller)}
                        </div>
                        <div className="text-xs text-gray-400">
                          Listed: {formatDate(new Date(parseInt(listing.listed_at) / 1000).toISOString())}
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="text-gray-300">
                        <div>Seat: <span className="font-mono text-white">{listing.ticket_details?.seatId || 'Unknown'}</span></div>
                        <div>Showtime: {formatDate(listing.ticket_details?.showtime || '')}</div>
                        {listing.ticket_details?.resaleCount !== undefined && (
                          <div className="text-xs text-blue-400">
                            Resold {listing.ticket_details.resaleCount} time{listing.ticket_details.resaleCount > 1 ? 's' : ''}
                          </div>
                        )}
                      </div>
                      
                      <div className="text-xs text-gray-400 bg-gray-800/50 p-2 rounded">
                        💡 Creator receives 2% royalty on this purchase
                      </div>
                      
                      <Button 
                        className="w-full" 
                        variant="royaltix" 
                        onClick={() => handleResalePurchase(listing)}
                      >
                        Buy Resale Ticket
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

