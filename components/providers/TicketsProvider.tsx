'use client'

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { useWallet } from '@/hooks/useWallet'
import { 
  getUserTickets, 
  getMarketplaceListings, 
  BlockchainTicket,
  buildMintTicketPayload,
  buildListForResalePayload,
  buildBuyResaleTicketPayload,
  MODULE_ADDRESS 
} from '@/lib/aptos'

export interface ShowItem {
  id: string
  movie: string
  theater: string
  showtime: string
  price: number
  seats: number
  available: number
  creator?: string
  royalty_percentage?: number
  max_resale_hops?: number
}

export interface TicketItem {
  id: string
  showId: string
  seatId: string
  movie: string
  theater: string
  showtime: string
  pricePaid: number
  owner: string
  purchasedAt: string
  txHash?: string
  resaleCount: number
  isUsed: boolean
  creator: string
  canResell: boolean
}

export interface MarketplaceListing {
  ticket_id: string
  seller: string
  price: number
  listed_at: string
  ticket_details: TicketItem
}

interface TicketsContextType {
  tickets: TicketItem[]
  marketplaceListings: MarketplaceListing[]
  loading: boolean
  purchaseTicket: (show: ShowItem, seatId: string, txHash?: string) => Promise<{ success: boolean; error?: string; ticket?: TicketItem }>
  listForResale: (ticketId: string, price: number) => Promise<{ success: boolean; error?: string }>
  buyResaleTicket: (ticketId: string) => Promise<{ success: boolean; error?: string }>
  refreshTickets: () => Promise<void>
  refreshMarketplace: () => Promise<void>
}

const TicketsContext = createContext<TicketsContextType | undefined>(undefined)

export function TicketsProvider({ children }: { children: React.ReactNode }) {
  const { isConnected, account, signAndSubmitTransaction } = useWallet() as any
  const [tickets, setTickets] = useState<TicketItem[]>([])
  const [marketplaceListings, setMarketplaceListings] = useState<MarketplaceListing[]>([])
  const [loading, setLoading] = useState(false)

  // Fetch user tickets from blockchain
  const refreshTickets = useCallback(async () => {
    if (!isConnected || !account) {
      setTickets([])
      return
    }

    setLoading(true)
    try {
      // For demo, using account as creator address - in production, you'd have a list of creators
      const blockchainTickets = await getUserTickets(account, account)
      
      const formattedTickets: TicketItem[] = blockchainTickets.map(ticket => ({
        id: ticket.id,
        showId: ticket.show_id,
        seatId: ticket.seat_id,
        movie: ticket.movie,
        theater: ticket.theater,
        showtime: ticket.showtime,
        pricePaid: parseInt(ticket.price),
        owner: ticket.owner,
        purchasedAt: new Date(parseInt(ticket.created_at) / 1000).toISOString(),
        resaleCount: ticket.resale_count,
        isUsed: ticket.is_used,
        creator: ticket.creator,
        canResell: ticket.resale_count < 2 && !ticket.is_used, // Assuming max 2 resales
      }))

      setTickets(formattedTickets)
    } catch (error) {
      console.error('Error fetching tickets:', error)
      setTickets([])
    } finally {
      setLoading(false)
    }
  }, [isConnected, account])

  // Fetch marketplace listings
  const refreshMarketplace = useCallback(async () => {
    if (!isConnected || !account) {
      setMarketplaceListings([])
      return
    }

    try {
      const listings = await getMarketplaceListings(account)
      // In a real implementation, you'd fetch ticket details for each listing
      setMarketplaceListings(listings)
    } catch (error) {
      console.error('Error fetching marketplace:', error)
      setMarketplaceListings([])
    }
  }, [isConnected, account])

  // Auto-refresh when wallet connects
  useEffect(() => {
    if (isConnected && account) {
      refreshTickets()
      refreshMarketplace()
    }
  }, [isConnected, account, refreshTickets, refreshMarketplace])

  // Purchase ticket (primary sale)
  const purchaseTicket = useCallback(async (show: ShowItem, seatId: string, txHash?: string) => {
    if (!isConnected || !account) {
      return { success: false, error: 'Please connect wallet to purchase.' }
    }

    try {
      if (!txHash) {
        // If no txHash provided, execute blockchain transaction
        const creatorAddress = show.creator || account // Fallback for demo
        const payload = buildMintTicketPayload(creatorAddress, parseInt(show.id), seatId)
        const result = await signAndSubmitTransaction({ payload })
        txHash = result.hash
      }

      // Refresh tickets after purchase
      await refreshTickets()
      
      return { success: true }
    } catch (error) {
      console.error('Error purchasing ticket:', error)
      return { success: false, error: 'Failed to purchase ticket. Please try again.' }
    }
  }, [account, isConnected, signAndSubmitTransaction, refreshTickets])

  // List ticket for resale
  const listForResale = useCallback(async (ticketId: string, price: number) => {
    if (!isConnected || !account) {
      return { success: false, error: 'Please connect wallet to list for resale.' }
    }

    try {
      const payload = buildListForResalePayload(account, parseInt(ticketId), price)
      await signAndSubmitTransaction({ payload })
      
      // Refresh both tickets and marketplace
      await Promise.all([refreshTickets(), refreshMarketplace()])
      
      return { success: true }
    } catch (error) {
      console.error('Error listing for resale:', error)
      return { success: false, error: 'Failed to list ticket for resale. Please try again.' }
    }
  }, [account, isConnected, signAndSubmitTransaction, refreshTickets, refreshMarketplace])

  // Buy resale ticket
  const buyResaleTicket = useCallback(async (ticketId: string) => {
    if (!isConnected || !account) {
      return { success: false, error: 'Please connect wallet to buy ticket.' }
    }

    try {
      const payload = buildBuyResaleTicketPayload(account, parseInt(ticketId))
      await signAndSubmitTransaction({ payload })
      
      // Refresh both tickets and marketplace
      await Promise.all([refreshTickets(), refreshMarketplace()])
      
      return { success: true }
    } catch (error) {
      console.error('Error buying resale ticket:', error)
      return { success: false, error: 'Failed to buy resale ticket. Please try again.' }
    }
  }, [account, isConnected, signAndSubmitTransaction, refreshTickets, refreshMarketplace])

  const value = useMemo(() => ({ 
    tickets, 
    marketplaceListings,
    loading,
    purchaseTicket, 
    listForResale,
    buyResaleTicket,
    refreshTickets,
    refreshMarketplace
  }), [
    tickets, 
    marketplaceListings,
    loading,
    purchaseTicket, 
    listForResale,
    buyResaleTicket,
    refreshTickets,
    refreshMarketplace
  ])

  return (
    <TicketsContext.Provider value={value}>
      {children}
    </TicketsContext.Provider>
  )
}

export function useTickets() {
  const ctx = useContext(TicketsContext)
  if (!ctx) throw new Error('useTickets must be used within a TicketsProvider')
  return ctx
}


