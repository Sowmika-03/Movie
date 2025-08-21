'use client'

import React, { useMemo, useState } from 'react'
import { sampleShows } from '@/data/sampleData'
import { Button } from '@/components/ui/button'
import { useTickets } from '@/components/providers/TicketsProvider'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { formatDate, formatPrice } from '@/lib/utils'
import { useSearchParams, useRouter } from 'next/navigation'
import { useWallet } from '@/hooks/useWallet'
import { getLedgerInfo } from '@/lib/aptos'

export default function MarketPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const theaterFilter = searchParams.get('theater') || ''
  const [query, setQuery] = useState('')
  const { purchaseTicket } = useTickets()
  const { isConnected, account, signAndSubmitTransaction } = useWallet() as any
  const moduleAddress = process.env.NEXT_PUBLIC_ROYALTIX_MODULE_ADDRESS
  const isValidModuleAddress = useMemo(() =>
    !!moduleAddress && /^0x[0-9a-fA-F]{2,64}$/.test(moduleAddress)
  , [moduleAddress])

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

  const handlePurchase = async (show: typeof sampleShows[number]) => {
    let txHash: string | undefined
    if (isConnected && account) {
      try {
        if (isValidModuleAddress) {
          const payload = {
            type: 'entry_function_payload',
            function: `${moduleAddress}::tickets::mint`,
            type_arguments: [],
            arguments: [show.movie, show.theater, show.showtime, show.price],
          }
          const res = await signAndSubmitTransaction({ payload })
          txHash = res.hash
        } else {
          const ledger = await getLedgerInfo()
          txHash = `ledger-${ledger.chain_id}-${Date.now()}`
        }
      } catch (e) {
        // ignore chain errors for now
      }
    }

    const result = await purchaseTicket(show, txHash)
    if (!result.success) {
      alert(result.error)
      return
    }
    alert('Ticket purchased! Check My Tickets page.')
  }

  return (
    <div className="container mx-auto px-4 pt-24 pb-12">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Marketplace</h1>
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
                <Button className="w-full" variant="royaltix" onClick={() => handlePurchase(show)}>
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
    </div>
  )
}

