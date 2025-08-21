'use client'

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { useWallet } from '@/hooks/useWallet'

export interface ShowItem {
	id: string
	movie: string
	theater: string
	showtime: string
	price: number
	seats: number
	available: number
}

export interface TicketItem {
	id: string
	showId: string
	movie: string
	theater: string
	showtime: string
	pricePaid: number
	owner: string
	purchasedAt: string
	txHash?: string
}

interface TicketsContextType {
	tickets: TicketItem[]
	purchaseTicket: (show: ShowItem, txHash?: string) => Promise<{ success: boolean; error?: string; ticket?: TicketItem }>
}

const TicketsContext = createContext<TicketsContextType | undefined>(undefined)

const STORAGE_KEY = 'royaltix.tickets'

export function TicketsProvider({ children }: { children: React.ReactNode }) {
	const { isConnected, account } = useWallet()
	const [tickets, setTickets] = useState<TicketItem[]>([])

	useEffect(() => {
		try {
			const raw = typeof window !== 'undefined' ? window.localStorage.getItem(STORAGE_KEY) : null
			if (raw) {
				const parsed: TicketItem[] = JSON.parse(raw)
				setTickets(parsed)
			}
		} catch {
			// ignore corrupted storage
		}
	}, [])

	useEffect(() => {
		try {
			if (typeof window !== 'undefined') {
				window.localStorage.setItem(STORAGE_KEY, JSON.stringify(tickets))
			}
		} catch {
			// ignore quota/storage errors
		}
	}, [tickets])

	const purchaseTicket = useCallback(async (show: ShowItem, txHash?: string) => {
		if (!isConnected || !account) {
			return { success: false, error: 'Please connect wallet to purchase.' }
		}

		const ticket: TicketItem = {
			id: `${show.id}-${Date.now()}`,
			showId: show.id,
			movie: show.movie,
			theater: show.theater,
			showtime: show.showtime,
			pricePaid: show.price,
			owner: account,
			purchasedAt: new Date().toISOString(),
			txHash,
		}

		setTickets(prev => [ticket, ...prev])
		return { success: true, ticket }
	}, [account, isConnected])

	const value = useMemo(() => ({ tickets, purchaseTicket }), [tickets, purchaseTicket])

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


