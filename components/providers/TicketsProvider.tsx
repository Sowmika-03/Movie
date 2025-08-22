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

  // Load tickets from localStorage on startup
  useEffect(() => {
    try {
      const stored = localStorage.getItem('royaltix_tickets')
      if (stored) {
        const parsedTickets = JSON.parse(stored)
        setTickets(parsedTickets)
        console.log('Loaded tickets from localStorage:', parsedTickets.length)
      }
    } catch (error) {
      console.error('Error loading tickets from localStorage:', error)
    }
  }, [])

  // Save tickets to localStorage whenever tickets change
  useEffect(() => {
    try {
      localStorage.setItem('royaltix_tickets', JSON.stringify(tickets))
      console.log('Saved tickets to localStorage:', tickets.length)
    } catch (error) {
      console.error('Error saving tickets to localStorage:', error)
    }
  }, [tickets])

  // Fetch user tickets from blockchain
  const refreshTickets = useCallback(async () => {
    if (!isConnected || !account) {
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

      // Merge with local tickets (blockchain tickets take precedence)
      setTickets(prev => {
        const merged = [...formattedTickets]
        // Add local tickets that aren't on blockchain yet
        prev.forEach(localTicket => {
          if (!formattedTickets.find(bt => bt.id === localTicket.id)) {
            merged.push(localTicket)
          }
        })
        return merged
      })
      
      console.log('Refreshed tickets from blockchain:', formattedTickets.length)
    } catch (error) {
      console.error('Error fetching tickets from blockchain:', error)
      // Keep local tickets if blockchain fetch fails
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
      // Create ticket locally for immediate display
      const newTicket: TicketItem = {
        id: `${show.id}-${Date.now()}`,
        showId: show.id,
        seatId: seatId,
        movie: show.movie,
        theater: show.theater,
        showtime: show.showtime,
        pricePaid: show.price,
        owner: account,
        purchasedAt: new Date().toISOString(),
        txHash: txHash,
        resaleCount: 0,
        isUsed: false,
        creator: show.creator || account,
        canResell: true,
      }

      // Add to local storage immediately
      setTickets(prev => [newTicket, ...prev])
      
      console.log('Ticket created locally:', newTicket)
      
      // Also try to refresh from blockchain (but don't block on this)
      try {
        await refreshTickets()
      } catch (refreshError) {
        console.log('Blockchain refresh failed, using local ticket:', refreshError)
      }
      
      return { success: true, ticket: newTicket }
    } catch (error) {
      console.error('Error creating ticket:', error)
      return { success: false, error: 'Failed to create ticket. Please try again.' }
    }
  }, [account, isConnected, refreshTickets])

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


