export interface Theater {
  id: string
  theatre: string
  mall: string
  city: string
  screens: number
  capacity: number
  running: string[]
}

export const sampleTheaters: Theater[] = [
  {
    id: '1',
    theatre: 'PVR Cinemas',
    mall: 'Forum Vijaya Mall',
    city: 'Vijayawada',
    screens: 4,
    capacity: 800,
    running: ['Jawan', 'Pathaan', 'Animal', '12th Fail']
  },
  {
    id: '2',
    theatre: 'INOX',
    mall: 'Lulu Mall',
    city: 'Vijayawada',
    screens: 6,
    capacity: 1200,
    running: ['Jawan', 'Pathaan', 'Animal', '12th Fail', 'Dunki', 'Salaar']
  },
  {
    id: '3',
    theatre: 'Cinepolis',
    mall: 'Trendset Mall',
    city: 'Vijayawada',
    screens: 3,
    capacity: 600,
    running: ['Jawan', 'Pathaan', 'Animal']
  },
  {
    id: '4',
    theatre: 'PVR Cinemas',
    mall: 'Central Mall',
    city: 'Guntur',
    screens: 5,
    capacity: 1000,
    running: ['Jawan', 'Pathaan', 'Animal', '12th Fail', 'Dunki']
  },
  {
    id: '5',
    theatre: 'INOX',
    mall: 'Mega Mall',
    city: 'Guntur',
    screens: 4,
    capacity: 800,
    running: ['Jawan', 'Pathaan', 'Animal', '12th Fail']
  },
  {
    id: '6',
    theatre: 'Cinepolis',
    mall: 'City Center',
    city: 'Guntur',
    screens: 3,
    capacity: 600,
    running: ['Jawan', 'Pathaan', 'Animal']
  }
]

export const cities = ['Vijayawada', 'Guntur', 'Hyderabad', 'Bangalore', 'Mumbai', 'Delhi']

export const sampleShows = [
  {
    id: '1',
    movie: 'Jawan',
    theater: 'PVR Cinemas - Forum Vijaya Mall',
    showtime: '2024-01-15T19:00:00Z',
    price: 250,
    seats: 120,
    available: 45
  },
  {
    id: '2',
    movie: 'Pathaan',
    theater: 'INOX - Lulu Mall',
    showtime: '2024-01-15T20:30:00Z',
    price: 300,
    seats: 150,
    available: 23
  },
  {
    id: '3',
    movie: 'Animal',
    theater: 'Cinepolis - Trendset Mall',
    showtime: '2024-01-15T21:00:00Z',
    price: 280,
    seats: 100,
    available: 67
  }
]
