'use client'

import React from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useWallet } from '@/hooks/useWallet'

export default function HomePage() {
  const { isConnected } = useWallet()

  const features = [
    {
      icon: '🎬',
      title: 'Creator Dashboard',
      description: 'Monitor all ticket sales, resales, and revenue in real-time',
      href: '/dashboard',
      color: 'border-purple-500/30'
    },
    {
      icon: '📊',
      title: 'Advanced Analytics',
      description: 'Detailed insights with charts, KPIs, and performance metrics',
      href: '/analytics',
      color: 'border-blue-500/30'
    },
    {
      icon: '🎪',
      title: 'Marketplace',
      description: 'Browse primary ticket sales and resale marketplace',
      href: '/market',
      color: 'border-green-500/30'
    },
    {
      icon: '🎟️',
      title: 'My Tickets',
      description: 'View your tickets, list for resale, and access QR codes',
      href: '/tickets',
      color: 'border-yellow-500/30'
    },
    {
      icon: '🖼️',
      title: 'NFT Gallery',
      description: 'View your ticket NFTs in a beautiful gallery',
      href: '/nft-gallery',
      color: 'border-pink-500/30'
    }
  ]

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="container mx-auto px-4 pt-32 pb-20 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-royaltix-300 to-purple-400 bg-clip-text text-transparent">
            RoyalTix
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 mb-8">
            The Future of Movie Ticketing on Blockchain
          </p>
          <p className="text-lg text-gray-400 mb-12 max-w-2xl mx-auto">
            Complete transparency with resale tracking, creator royalties, and real-time analytics. 
            Every ticket transaction is recorded on-chain with full visibility for creators.
          </p>
          
          {!isConnected ? (
            <Button size="lg" className="text-lg px-8 py-4">
              Connect Wallet to Get Started
            </Button>
          ) : (
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild>
                <Link href="/market">🎪 Browse Marketplace</Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/dashboard">🎬 Creator Dashboard</Link>
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Features Grid */}
      <div className="container mx-auto px-4 pb-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">✨ Complete Ticketing Ecosystem</h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Everything you need for transparent, blockchain-powered movie ticketing with comprehensive resale tracking
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {features.map((feature, index) => (
            <Card key={index} className={`card-hover ${feature.color}`}>
              <CardHeader>
                <CardTitle className="flex items-center space-x-3">
                  <span className="text-3xl">{feature.icon}</span>
                  <span>{feature.title}</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-400 mb-4">{feature.description}</p>
                <Button asChild className="w-full">
                  <Link href={feature.href}>
                    Explore {feature.title}
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Key Benefits */}
      <div className="container mx-auto px-4 pb-20">
        <div className="glass-card p-8 max-w-4xl mx-auto">
          <h3 className="text-2xl font-bold mb-6 text-center">🚀 Key Benefits</h3>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <span className="text-xl">✅</span>
                <div>
                  <h4 className="font-semibold text-green-400">Complete Transparency</h4>
                  <p className="text-sm text-gray-400">Every ticket mint, resale, and usage is recorded on-chain</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <span className="text-xl">👑</span>
                <div>
                  <h4 className="font-semibold text-blue-400">Creator Royalties</h4>
                  <p className="text-sm text-gray-400">Earn 2% royalty on every resale automatically</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <span className="text-xl">🔒</span>
                <div>
                  <h4 className="font-semibold text-purple-400">Anti-Fraud</h4>
                  <p className="text-sm text-gray-400">QR codes tied to blockchain prevent counterfeiting</p>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <span className="text-xl">📈</span>
                <div>
                  <h4 className="font-semibold text-yellow-400">Real-time Analytics</h4>
                  <p className="text-sm text-gray-400">Comprehensive dashboard with sales metrics and trends</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <span className="text-xl">🔄</span>
                <div>
                  <h4 className="font-semibold text-pink-400">Controlled Resales</h4>
                  <p className="text-sm text-gray-400">Maximum 2 resales per ticket to prevent speculation</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <span className="text-xl">⚡</span>
                <div>
                  <h4 className="font-semibold text-orange-400">Instant Settlement</h4>
                  <p className="text-sm text-gray-400">Automatic payment distribution on every transaction</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
