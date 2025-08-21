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
        const petra = anyWindow.aptos
        if (petra && await petra.isConnected()) {
          const info = await petra.account()
          setAccount(info?.address ?? null)
          setIsConnected(true)
        }
      } catch {}
    }
    init()
  }, [])

  const connect = async () => {
    const anyWindow = window as any
    if (!anyWindow.aptos) throw new Error('Petra wallet not found')
    const res = await anyWindow.aptos.connect()
    setAccount(res?.address ?? null)
    setIsConnected(true)
  }

  const disconnect = async () => {
    const anyWindow = window as any
    if (anyWindow.aptos?.disconnect) await anyWindow.aptos.disconnect()
    setAccount(null)
    setIsConnected(false)
  }

  const signAndSubmitTransaction = async (tx: any) => {
    const anyWindow = window as any
    if (!anyWindow.aptos) throw new Error('Petra wallet not found')
    const res = await anyWindow.aptos.signAndSubmitTransaction(tx)
    return { hash: res?.hash }
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
