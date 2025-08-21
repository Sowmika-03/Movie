'use client'

import React from 'react'
import { Theater } from '@/data/sampleData'
import { Card, CardHeader, CardContent } from '@/components/ui/card'
import Link from 'next/link'

interface TheaterCardProps {
  theater: Theater
}

export function TheaterCard({ theater }: TheaterCardProps) {
  return (
    <div className="transition-all duration-300 hover:transform hover:scale-105 hover:shadow-xl hover:shadow-royaltix-500/20">
      <Card className="card-hover h-full">
        <CardHeader>
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-xl font-bold text-white mb-2">{theater.theatre}</h3>
              <div className="flex items-center text-gray-400 mb-2">
                <span className="mr-2">📍</span>
                <span>{theater.mall}</span>
              </div>
              <div className="flex items-center text-gray-400">
                <span className="mr-2">🏙️</span>
                <span>{theater.city}</span>
              </div>
            </div>
            <div className="text-right">
              <div className="flex items-center text-royaltix-400 mb-1">
                <span className="mr-1">⭐</span>
                <span className="text-sm font-semibold">Premium</span>
              </div>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center text-gray-400">
                <span className="mr-2">👥</span>
                <span className="text-sm">Capacity</span>
              </div>
              <span className="text-white font-semibold">{theater.capacity}</span>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center text-gray-400">
                <span className="mr-2">🎬</span>
                <span className="text-sm">Screens</span>
              </div>
              <span className="text-white font-semibold">{theater.screens}</span>
            </div>
            
            <div className="pt-4 border-t border-white/10">
              <h4 className="text-sm font-semibold text-gray-300 mb-2">Now Running</h4>
              <div className="flex flex-wrap gap-2">
                {theater.running.slice(0, 3).map((movie, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-royaltix-500/20 text-royaltix-300 text-xs rounded-lg border border-royaltix-500/30"
                  >
                    {movie}
                  </span>
                ))}
                {theater.running.length > 3 && (
                  <span className="px-2 py-1 bg-dark-700 text-gray-400 text-xs rounded-lg">
                    +{theater.running.length - 3} more
                  </span>
                )}
              </div>
            </div>
            
            <Link href={{ pathname: '/market', query: { theater: `${theater.theatre} - ${theater.mall}` } }} className="w-full inline-block">
              <span className="w-full btn-primary inline-flex justify-center mt-4">View Shows</span>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
