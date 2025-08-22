'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { useWallet } from '@/hooks/useWallet'

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { isConnected, account, connect, disconnect } = useWallet()

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen)

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-dark-900/80 backdrop-blur-md border-b border-white/10">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="relative">
              <div className="w-10 h-10 royaltix-gradient rounded-xl flex items-center justify-center animate-float">
                <span className="text-white text-lg">🎫</span>
              </div>
              <div className="absolute -top-1 -right-1 w-5 h-5 crown-gradient rounded-full flex items-center justify-center animate-glow">
                <span className="text-white text-xs">👑</span>
              </div>
            </div>
            <span className="text-2xl font-bold text-gradient">Royaltix</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link href="/" className="text-gray-300 hover:text-white transition-colors">
              Home
            </Link>
            <Link href="/dashboard" className="text-gray-300 hover:text-white transition-colors">
              Dashboard
            </Link>
            <Link href="/analytics" className="text-gray-300 hover:text-white transition-colors">
              Analytics
            </Link>
            <Link href="/tickets" className="text-gray-300 hover:text-white transition-colors">
              My Tickets
            </Link>
            <Link href="/market" className="text-gray-300 hover:text-white transition-colors">
              Marketplace
            </Link>
            <Link href="/admin" className="text-gray-300 hover:text-white transition-colors">
              Admin
            </Link>
          </div>

          {/* Wallet Connection */}
          <div className="hidden md:flex items-center space-x-4">
            {isConnected ? (
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2 bg-dark-800 px-3 py-2 rounded-lg">
                  <span className="text-royaltix-400">💳</span>
                  <span className="text-sm text-gray-300">
                    {account?.slice(0, 6)}...{account?.slice(-4)}
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={disconnect}
                  className="text-gray-400 hover:text-white"
                >
                  🚪
                </Button>
              </div>
            ) : (
              <Button
                variant="royaltix"
                size="lg"
                onClick={connect}
                className="flex items-center space-x-2"
              >
                <span>💳</span>
                <span>Connect Wallet</span>
              </Button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={toggleMenu}
            className="md:hidden p-2 text-gray-400 hover:text-white transition-colors"
          >
            {isMenuOpen ? '✕' : '☰'}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-white/10">
            <div className="py-4 space-y-4">
              <Link 
                href="/" 
                className="block text-gray-300 hover:text-white transition-colors px-4"
                onClick={() => setIsMenuOpen(false)}
              >
                Home
              </Link>
              <Link 
                href="/dashboard" 
                className="block text-gray-300 hover:text-white transition-colors px-4"
                onClick={() => setIsMenuOpen(false)}
              >
                Dashboard
              </Link>
              <Link 
                href="/analytics" 
                className="block text-gray-300 hover:text-white transition-colors px-4"
                onClick={() => setIsMenuOpen(false)}
              >
                Analytics
              </Link>
              <Link 
                href="/tickets" 
                className="block text-gray-300 hover:text-white transition-colors px-4"
                onClick={() => setIsMenuOpen(false)}
              >
                My Tickets
              </Link>
              <Link 
                href="/market" 
                className="block text-gray-300 hover:text-white transition-colors px-4"
                onClick={() => setIsMenuOpen(false)}
              >
                Marketplace
              </Link>
              <Link 
                href="/admin" 
                className="block text-gray-300 hover:text-white transition-colors px-4"
                onClick={() => setIsMenuOpen(false)}
              >
                Admin
              </Link>
              
              <div className="px-4 pt-4 border-t border-white/10">
                {isConnected ? (
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2 bg-dark-800 px-3 py-2 rounded-lg">
                      <span className="text-royaltix-400">💳</span>
                      <span className="text-sm text-gray-300">
                        {account?.slice(0, 6)}...{account?.slice(-4)}
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        disconnect()
                        setIsMenuOpen(false)
                      }}
                      className="w-full text-gray-400 hover:text-white"
                    >
                      🚪 Disconnect
                    </Button>
                  </div>
                ) : (
                  <Button
                    variant="royaltix"
                    size="lg"
                    onClick={() => {
                      connect()
                      setIsMenuOpen(false)
                    }}
                    className="w-full flex items-center justify-center space-x-2"
                  >
                    <span>💳</span>
                    <span>Connect Wallet</span>
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
