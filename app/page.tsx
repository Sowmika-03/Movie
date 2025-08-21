'use client'

import React, { useState } from 'react'
import { TheaterCard } from '@/components/TheaterCard'
import { CitySelector } from '@/components/CitySelector'
import { sampleTheaters } from '@/data/sampleData'

export default function HomePage() {
  const [selectedCity, setSelectedCity] = useState('Vijayawada')
  const [searchQuery, setSearchQuery] = useState('')

  const filteredTheaters = sampleTheaters.filter(theater => 
    theater.city === selectedCity &&
    (searchQuery === '' || 
     theater.mall.toLowerCase().includes(searchQuery.toLowerCase()) ||
     theater.theatre.toLowerCase().includes(searchQuery.toLowerCase()) ||
     theater.running.some(movie => movie.toLowerCase().includes(searchQuery.toLowerCase())))
  )

  return (
    <div className="min-h-screen bg-dark-950">
      
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20">
        <div className="absolute inset-0 bg-gradient-to-br from-royaltix-900/50 via-dark-900/50 to-crown-900/50"></div>
        <div className="relative z-10 container mx-auto px-4 py-20 text-center">
          <div className="max-w-4xl mx-auto">
            {/* Logo */}
            <div className="flex justify-center mb-8">
              <div className="relative">
                <div className="w-24 h-24 bg-gradient-to-br from-royaltix-500 to-crown-500 rounded-2xl flex items-center justify-center animate-float">
                  <div className="w-12 h-12 text-white">🎫</div>
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 crown-gradient rounded-full flex items-center justify-center animate-glow">
                  <div className="w-5 h-5 text-white">👑</div>
                </div>
              </div>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold mb-6">
              <span className="text-gradient">Royaltix</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto">
              The future of movie ticketing is here. Buy, sell, and trade NFT movie tickets 
              with automatic royalties on the Aptos blockchain.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <button className="btn-primary text-lg px-8 py-4">
                🎬 Explore Shows
              </button>
              <button className="btn-secondary text-lg px-8 py-4">
                📈 View Analytics
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-dark-900/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Why Choose Royaltix?</h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Experience the next generation of movie ticketing with blockchain-powered features
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: "👑",
                title: "Automatic Royalties",
                description: "Creators earn 2% on every resale automatically"
              },
              {
                icon: "🎫",
                title: "NFT Tickets",
                description: "Unique, verifiable tickets stored on blockchain"
              },
              {
                icon: "👥",
                title: "Limited Resales",
                description: "Maximum 2 resales to prevent scalping"
              }
            ].map((feature, index) => (
              <div
                key={index}
                className="glass-card p-8 text-center card-hover"
              >
                <div className="w-16 h-16 royaltix-gradient rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <div className="text-3xl">{feature.icon}</div>
                </div>
                <h3 className="text-xl font-semibold mb-4">{feature.title}</h3>
                <p className="text-gray-400">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Theater Selection */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Find Your Perfect Show</h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Browse theaters and movies in your city
            </p>
          </div>

          {/* City Selector and Search */}
          <div className="flex flex-col md:flex-row gap-4 mb-12 justify-center items-center">
            <CitySelector 
              selectedCity={selectedCity} 
              onCityChange={setSelectedCity} 
            />
            <div className="relative">
              <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5">🔍</div>
              <input
                type="text"
                placeholder="Search movies, theaters, or malls..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input-field pl-12 w-80"
              />
            </div>
          </div>

          {/* Theater Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredTheaters.map((theater, index) => (
              <div key={index}>
                <TheaterCard theater={theater} />
              </div>
            ))}
          </div>

          {filteredTheaters.length === 0 && (
            <div className="text-center py-20">
              <div className="w-24 h-24 bg-dark-800 rounded-full flex items-center justify-center mx-auto mb-6">
                <div className="text-gray-400 text-4xl">🔍</div>
              </div>
              <h3 className="text-2xl font-semibold mb-2">No theaters found</h3>
              <p className="text-gray-400">Try adjusting your search or city selection</p>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-royaltix-900/20 to-crown-900/20">
        <div className="container mx-auto px-4 text-center">
          <div>
            <h2 className="text-4xl font-bold mb-6">Ready to Experience the Future?</h2>
            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
              Join thousands of moviegoers who are already using Royaltix for their entertainment needs
            </p>
            <button className="btn-primary text-lg px-8 py-4">
              Get Started Now
            </button>
          </div>
        </div>
      </section>
    </div>
  )
}
