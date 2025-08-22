'use client'

import React, { createContext, useContext, useEffect, useMemo, ReactNode, useState } from 'react'

interface WalletContextType {
  isConnected: boolean
  account: string | null
  connect: () => Promise<void>
  disconnect: () => void
  signAndSubmitTransaction: (tx: any) => Promise<{ hash: string }>
}

export const WalletContext = createContext<WalletContextType | undefined>(undefined)

export function WalletProvider({ children }: { children: ReactNode }) {
  const [account, setAccount] = useState<string | null>(null)
  const [isConnected, setIsConnected] = useState<boolean>(false)

  useEffect(() => {
    const init = async () => {
      try {
        const anyWindow = window as any
        const petra = anyWindow.aptos || anyWindow.petra
        if (petra && await petra.isConnected()) {
          const info = await petra.account()
          setAccount(info?.address ?? null)
          setIsConnected(!!info?.address)
          console.log('Wallet auto-connected:', info?.address)
        }
      } catch (error) {
        console.log('No wallet auto-connection:', error)
      }
    }
    init()
  }, [])

  const connect = async () => {
    try {
      const anyWindow = window as any
      const petra = anyWindow.aptos || anyWindow.petra
      
      if (!petra) {
        alert('🔴 Please install Petra Wallet extension first!\n\nGo to: https://petra.app')
        throw new Error('Petra wallet not found')
      }

      console.log('Attempting to connect wallet...')
      const res = await petra.connect()
      console.log('Wallet connection result:', res)
      
      if (res?.address) {
        setAccount(res.address)
        setIsConnected(true)
        alert(`✅ Wallet connected successfully!\nAddress: ${res.address.slice(0, 10)}...`)
      } else {
        throw new Error('Failed to get wallet address')
      }
    } catch (error: any) {
      console.error('Wallet connection failed:', error)
      alert(`❌ Wallet connection failed: ${error.message}`)
      throw error
    }
  }

  const disconnect = async () => {
    try {
      const anyWindow = window as any
      const petra = anyWindow.aptos || anyWindow.petra
      if (petra?.disconnect) {
        await petra.disconnect()
      }
      setAccount(null)
      setIsConnected(false)
      console.log('Wallet disconnected')
    } catch (error) {
      console.error('Disconnect error:', error)
    }
  }

  const signAndSubmitTransaction = async (tx: any) => {
    try {
      const anyWindow = window as any
      const petra = anyWindow.aptos || anyWindow.petra
      
      if (!petra) {
        throw new Error('Petra wallet not found')
      }

      if (!isConnected || !account) {
        throw new Error('Wallet not connected')
      }

      console.log('Submitting transaction:', tx)
      
      // This should trigger Petra popup for user approval
      const res = await petra.signAndSubmitTransaction(tx)
      console.log('Transaction submitted:', res)
      
      if (!res?.hash) {
        throw new Error('Transaction failed - no hash returned')
      }

      return { hash: res.hash }
    } catch (error: any) {
      console.error('Transaction error:', error)
      throw error
    }
  }

  const value = useMemo<WalletContextType>(() => ({
    isConnected,
    account,
    connect,
    disconnect,
    signAndSubmitTransaction,
  }), [isConnected, account])

  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  )
}

export function useWallet() {
  const context = useContext(WalletContext)
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider')
  }
  return context
}
