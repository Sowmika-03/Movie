'use client'

import React, { useState, useEffect } from 'react'
import { useWallet } from '@/hooks/useWallet'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { getCreatorShows, buildCreateShowPayload, BlockchainShow } from '@/lib/aptos'
import { formatDate, formatPrice } from '@/lib/utils'

export default function AdminPage() {
  const { isConnected, account, signAndSubmitTransaction } = useWallet() as any
  const [shows, setShows] = useState<BlockchainShow[]>([])
  const [loading, setLoading] = useState(false)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [creating, setCreating] = useState(false)
  const [formData, setFormData] = useState({
    movie: '',
    theater: '',
    showtime: '',
    basePrice: '',
    totalSeats: '',
    royaltyPercentage: '2',
    maxResaleHops: '2'
  })

  useEffect(() => {
    if (isConnected && account) {
      fetchShows()
    }
  }, [isConnected, account])

  const fetchShows = async () => {
    if (!account) return
    
    setLoading(true)
    try {
      const showsData = await getCreatorShows(account)
      setShows(showsData)
    } catch (error) {
      console.error('Error fetching shows:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateShow = async () => {
    if (!account) return
    
    setCreating(true)
    try {
      const payload = buildCreateShowPayload(
        formData.movie,
        formData.theater,
        formData.showtime,
        Math.floor(parseFloat(formData.basePrice) * 100000000), // Convert to Octas
        parseInt(formData.totalSeats),
        parseInt(formData.royaltyPercentage),
        parseInt(formData.maxResaleHops)
      )
      
      await signAndSubmitTransaction({ payload })
      
      // Reset form and close modal
      setFormData({
        movie: '',
        theater: '',
        showtime: '',
        basePrice: '',
        totalSeats: '',
        royaltyPercentage: '2',
        maxResaleHops: '2'
      })
      setShowCreateModal(false)
      
      // Refresh shows
      await fetchShows()
      
      alert('Show created successfully!')
    } catch (error) {
      console.error('Error creating show:', error)
      alert('Failed to create show. Please try again.')
    } finally {
      setCreating(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  if (!isConnected) {
    return (
      <div className="container mx-auto px-4 pt-24 pb-12">
        <div className="glass-card p-8 text-center">
          <h1 className="text-2xl font-bold mb-4">🎬 Show Management</h1>
          <p className="text-gray-400 mb-6">Connect your wallet to manage your shows and create new ones.</p>
          <Button onClick={() => window.location.reload()}>Connect Wallet</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 pt-24 pb-12">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">🎬 Show Management</h1>
        <div className="flex space-x-4">
          <Button onClick={fetchShows} disabled={loading} variant="outline">
            {loading ? 'Loading...' : 'Refresh'}
          </Button>
          <Button onClick={() => setShowCreateModal(true)}>
            ➕ Create New Show
          </Button>
        </div>
      </div>

      {/* Shows Grid */}
      {shows.length === 0 && !loading ? (
        <div className="text-center py-20">
          <div className="text-6xl mb-6 opacity-50">🎭</div>
          <h2 className="text-2xl font-semibold mb-4">No Shows Created</h2>
          <p className="text-gray-400 mb-8">Create your first show to start selling tickets</p>
          <Button onClick={() => setShowCreateModal(true)}>
            Create Your First Show
          </Button>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {shows.map(show => (
            <Card key={show.id} className="card-hover">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>{show.movie}</span>
                  <span className="text-sm font-normal text-gray-400">ID: {show.id}</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <p className="text-gray-400 text-sm">{show.theater}</p>
                    <p className="text-white">{formatDate(show.showtime)}</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-400">Base Price:</span>
                      <div className="text-royaltix-300 font-semibold">
                        {formatPrice(parseInt(show.base_price))}
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-400">Seats:</span>
                      <div className="text-white">{show.sold_seats} / {show.total_seats}</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-400">Royalty:</span>
                      <div className="text-blue-400">{show.royalty_percentage}%</div>
                    </div>
                    <div>
                      <span className="text-gray-400">Max Resales:</span>
                      <div className="text-yellow-400">{show.max_resale_hops}</div>
                    </div>
                  </div>

                  {/* Sales Progress */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-400">Sales Progress</span>
                      <span className="text-gray-400">
                        {parseInt(show.total_seats) > 0 ? 
                          Math.round((parseInt(show.sold_seats) / parseInt(show.total_seats)) * 100) : 0
                        }%
                      </span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-royaltix-500 to-purple-500 h-2 rounded-full transition-all duration-300"
                        style={{
                          width: `${parseInt(show.total_seats) > 0 ? 
                            (parseInt(show.sold_seats) / parseInt(show.total_seats)) * 100 : 0
                          }%`
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create Show Modal */}
      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Create New Show</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Movie Title</label>
              <Input
                placeholder="e.g., Avengers: Endgame"
                value={formData.movie}
                onChange={(e) => handleInputChange('movie', e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Theater</label>
              <Input
                placeholder="e.g., PVR Cinemas - Forum Mall"
                value={formData.theater}
                onChange={(e) => handleInputChange('theater', e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Show Time</label>
              <Input
                type="datetime-local"
                value={formData.showtime}
                onChange={(e) => handleInputChange('showtime', e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Base Price (APT)</label>
                <Input
                  type="number"
                  placeholder="250"
                  min="0"
                  step="0.01"
                  value={formData.basePrice}
                  onChange={(e) => handleInputChange('basePrice', e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Total Seats</label>
                <Input
                  type="number"
                  placeholder="100"
                  min="1"
                  value={formData.totalSeats}
                  onChange={(e) => handleInputChange('totalSeats', e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Royalty %</label>
                <Input
                  type="number"
                  placeholder="2"
                  min="0"
                  max="10"
                  value={formData.royaltyPercentage}
                  onChange={(e) => handleInputChange('royaltyPercentage', e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Max Resales</label>
                <Input
                  type="number"
                  placeholder="2"
                  min="0"
                  max="5"
                  value={formData.maxResaleHops}
                  onChange={(e) => handleInputChange('maxResaleHops', e.target.value)}
                />
              </div>
            </div>

            <div className="text-xs text-gray-400 bg-gray-800/50 p-3 rounded">
              💡 <strong>Tips:</strong>
              <ul className="mt-1 list-disc list-inside space-y-1">
                <li>Higher royalty % = more earnings on resales</li>
                <li>Lower max resales = less speculation</li>
                <li>Price is set in APT (Aptos tokens)</li>
              </ul>
            </div>

            <div className="flex space-x-3">
              <Button 
                variant="outline" 
                className="flex-1"
                onClick={() => setShowCreateModal(false)}
              >
                Cancel
              </Button>
              <Button 
                className="flex-1"
                onClick={handleCreateShow}
                disabled={!formData.movie || !formData.theater || !formData.showtime || 
                         !formData.basePrice || !formData.totalSeats || creating}
              >
                {creating ? 'Creating...' : 'Create Show'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}