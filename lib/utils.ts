import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatPrice(price: number): string {
  return `₹${price.toFixed(2)}`
}

export function formatDate(date: string | Date): string {
  const d = new Date(date)
  return d.toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

export function calculateTimeUntil(showtime: string | Date): string {
  const now = new Date()
  const show = new Date(showtime)
  const diff = show.getTime() - now.getTime()
  
  if (diff <= 0) return 'Showtime passed'
  
  const hours = Math.floor(diff / (1000 * 60 * 60))
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
  
  if (hours > 0) {
    return `${hours}h ${minutes}m until showtime`
  }
  return `${minutes}m until showtime`
}

export function generateQRCode(data: string): string {
  // This would integrate with the qrcode library
  // For now, return a placeholder
  return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(data)}`
}