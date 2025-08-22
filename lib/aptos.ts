import { AptosClient, AptosAccount, HexString } from 'aptos'

export const APTOS_NODE_URL = process.env.NEXT_PUBLIC_APTOS_NODE_URL || 'https://fullnode.testnet.aptoslabs.com/v1'
export const MODULE_ADDRESS = process.env.NEXT_PUBLIC_ROYALTIX_MODULE_ADDRESS || '0x1'

export const aptos = new AptosClient(APTOS_NODE_URL)

export async function getLedgerInfo() {
  return aptos.getLedgerInfo()
}

// Types for blockchain events
export interface TicketMintedEvent {
  show_id: string
  seat_id: string
  to: string
  price: string
  timestamp: string
}

export interface TicketResoldEvent {
  show_id: string
  seat_id: string
  from: string
  to: string
  price: string
  royalty_to_creator: string
  resale_count: number
  timestamp: string
}

export interface TicketUsedEvent {
  show_id: string
  seat_id: string
  owner: string
  timestamp: string
}

export interface BlockchainTicket {
  id: string
  show_id: string
  seat_id: string
  movie: string
  theater: string
  showtime: string
  price: string
  resale_count: number
  creator: string
  owner: string
  is_used: boolean
  created_at: string
}

export interface BlockchainShow {
  id: string
  movie: string
  theater: string
  showtime: string
  base_price: string
  creator: string
  total_seats: string
  sold_seats: string
  royalty_percentage: number
  max_resale_hops: number
}

// Fetch events from the blockchain
export async function getTicketEvents(creatorAddress: string): Promise<{
  minted: TicketMintedEvent[]
  resold: TicketResoldEvent[]
  used: TicketUsedEvent[]
}> {
  try {
    const [mintedEvents, resoldEvents, usedEvents] = await Promise.all([
      aptos.getEventsByEventHandle(
        creatorAddress,
        `${MODULE_ADDRESS}::tickets::TicketMinted`,
        'ticket_minted_events'
      ),
      aptos.getEventsByEventHandle(
        creatorAddress,
        `${MODULE_ADDRESS}::tickets::TicketResold`,
        'ticket_resold_events'
      ),
      aptos.getEventsByEventHandle(
        creatorAddress,
        `${MODULE_ADDRESS}::tickets::TicketUsed`,
        'ticket_used_events'
      ),
    ])

    return {
      minted: mintedEvents.map((e: any) => e.data),
      resold: resoldEvents.map((e: any) => e.data),
      used: usedEvents.map((e: any) => e.data),
    }
  } catch (error) {
    console.error('Error fetching events:', error)
    return { minted: [], resold: [], used: [] }
  }
}

// Get shows for a creator
export async function getCreatorShows(creatorAddress: string): Promise<BlockchainShow[]> {
  try {
    const resource = await aptos.getAccountResource(
      creatorAddress,
      `${MODULE_ADDRESS}::tickets::TicketsStore`
    )
    return (resource.data as any).shows || []
  } catch (error) {
    console.error('Error fetching shows:', error)
    return []
  }
}

// Get user tickets
export async function getUserTickets(userAddress: string, creatorAddress: string): Promise<BlockchainTicket[]> {
  try {
    const result = await aptos.view({
      function: `${MODULE_ADDRESS}::tickets::get_user_tickets`,
      arguments: [userAddress, creatorAddress],
      type_arguments: []
    })
    return result[0] as BlockchainTicket[] || []
  } catch (error) {
    console.error('Error fetching user tickets:', error)
    return []
  }
}

// Get marketplace listings
export async function getMarketplaceListings(marketplaceAddress: string) {
  try {
    const result = await aptos.view({
      function: `${MODULE_ADDRESS}::tickets::get_marketplace_listings`,
      arguments: [marketplaceAddress],
      type_arguments: []
    })
    return result[0] || []
  } catch (error) {
    console.error('Error fetching marketplace listings:', error)
    return []
  }
}

// Transaction builders
export function buildMintTicketPayload(creatorAddress: string, showId: number, seatId: string) {
  return {
    type: 'entry_function_payload',
    function: `${MODULE_ADDRESS}::tickets::mint`,
    type_arguments: [],
    arguments: [creatorAddress, showId, seatId],
  }
}

export function buildCreateShowPayload(
  movie: string,
  theater: string,
  showtime: string,
  basePrice: number,
  totalSeats: number,
  royaltyPercentage: number,
  maxResaleHops: number
) {
  return {
    type: 'entry_function_payload',
    function: `${MODULE_ADDRESS}::tickets::create_show`,
    type_arguments: [],
    arguments: [movie, theater, showtime, basePrice, totalSeats, royaltyPercentage, maxResaleHops],
  }
}

export function buildListForResalePayload(marketplaceAddress: string, ticketId: number, price: number) {
  return {
    type: 'entry_function_payload',
    function: `${MODULE_ADDRESS}::tickets::list_for_resale`,
    type_arguments: [],
    arguments: [marketplaceAddress, ticketId, price],
  }
}

export function buildBuyResaleTicketPayload(marketplaceAddress: string, ticketId: number) {
  return {
    type: 'entry_function_payload',
    function: `${MODULE_ADDRESS}::tickets::buy_resale_ticket`,
    type_arguments: [],
    arguments: [marketplaceAddress, ticketId],
  }
}

export function buildUseTicketPayload(ticketOwner: string, ticketId: number) {
  return {
    type: 'entry_function_payload',
    function: `${MODULE_ADDRESS}::tickets::use_ticket`,
    type_arguments: [],
    arguments: [ticketOwner, ticketId],
  }
}


