'use client'

import React, { useState } from 'react'
import { cities } from '@/data/sampleData'
import { Button } from '@/components/ui/button'

interface CitySelectorProps {
  selectedCity: string
  onCityChange: (city: string) => void
}

export function CitySelector({ selectedCity, onCityChange }: CitySelectorProps) {
  const [isOpen, setIsOpen] = useState(false)

  const toggleDropdown = () => setIsOpen(!isOpen)

  const handleCitySelect = (city: string) => {
    onCityChange(city)
    setIsOpen(false)
  }

  return (
    <div className="relative">
      <Button
        variant="outline"
        onClick={toggleDropdown}
        className="flex items-center space-x-2 bg-dark-800 border-dark-600 text-white hover:bg-dark-700 hover:border-dark-500 min-w-[200px]"
      >
        <span className="text-royaltix-400">📍</span>
        <span>{selectedCity}</span>
        <span className={`transition-transform ${isOpen ? 'rotate-180' : ''}`}>▼</span>
      </Button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-dark-800 border border-dark-600 rounded-xl shadow-lg z-50 max-h-60 overflow-y-auto">
          {cities.map((city) => (
            <button
              key={city}
              onClick={() => handleCitySelect(city)}
              className={`w-full px-4 py-3 text-left hover:bg-dark-700 transition-colors ${
                city === selectedCity
                  ? 'bg-royaltix-500/20 text-royaltix-300 border-l-4 border-royaltix-500'
                  : 'text-gray-300'
              }`}
            >
              {city}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
