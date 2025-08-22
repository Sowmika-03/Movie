# 🎬 RoyalTix - Blockchain Movie Ticketing DApp

## 🌟 Overview

RoyalTix is a comprehensive decentralized movie ticketing platform built on the Aptos blockchain. It provides complete transparency for ticket sales, resales, and usage with automatic creator royalties and anti-fraud protection.

## ✨ Key Features

### 🎟️ Complete Ticket Lifecycle Tracking
- **Primary Sales**: Direct ticket purchases from creators
- **Resale Marketplace**: Secondary market with controlled resales (max 2 hops)
- **Usage Tracking**: QR code verification at theaters
- **Full Transparency**: Every transaction recorded on-chain

### 👑 Creator Benefits
- **Automatic Royalties**: Earn 2% on every resale transaction
- **Real-time Analytics**: Comprehensive dashboard with sales metrics
- **Event Logging**: Complete visibility into all ticket transactions
- **Revenue Tracking**: Primary sales + resale royalties

### 🔒 Anti-Fraud Protection
- **Blockchain Verification**: All tickets are NFTs on Aptos blockchain
- **QR Code Security**: Cryptographic QR codes tied to blockchain
- **Ownership Verification**: Immutable ownership records
- **Usage Prevention**: Tickets can only be used once

### 📊 Analytics & Insights
- **KPI Dashboard**: Sales, revenue, utilization metrics
- **Event Log Table**: Complete transaction history
- **Sales Charts**: Daily trends and patterns
- **Ticket History**: Individual ticket lifecycle tracking

## 🏗️ Architecture

### Blockchain (Move Smart Contract)
- **Location**: `/blockchain/sources/tickets.move`
- **Events**: `TicketMinted`, `TicketResold`, `TicketUsed`
- **Functions**: Create shows, mint tickets, resale system, usage tracking
- **Features**: Automatic royalty distribution, hop limit enforcement

### Frontend (Next.js)
- **Framework**: Next.js 14 with TypeScript
- **Styling**: Tailwind CSS with custom theming
- **State Management**: React Context for tickets and wallet
- **Charts**: Recharts for analytics visualization
- **UI Components**: Radix UI primitives

## 📱 Pages & Features

### 🏠 Home Page (`/`)
- Feature showcase
- System benefits
- Quick navigation to all sections

### 🎬 Creator Dashboard (`/dashboard`)
- **KPI Cards**: Total sales, revenue, royalties, utilization
- **Event Log Table**: Complete transaction history
- **Sales Chart**: Tickets sold over time
- **Ticket History Modal**: Click any ticket to see full lifecycle

### 📊 Advanced Analytics (`/analytics`)
- **Performance Metrics**: Average prices, resale rates
- **Revenue Breakdown**: Primary vs royalty revenue
- **Daily Trends**: Sales and revenue charts
- **Resale Activity**: Distribution of resale hops
- **Recent Activity**: Latest mints, resales, and usage

### 🎪 Marketplace (`/market`)
- **Primary Sales Tab**: Direct from creators
- **Resale Market Tab**: Secondary marketplace
- **Search & Filter**: Find specific shows
- **Integrated Purchasing**: One-click buying with wallet

### 🎟️ My Tickets (`/tickets`)
- **Ticket Gallery**: All owned tickets with QR codes
- **Resale Functionality**: List tickets for resale
- **Status Tracking**: Active, resold, used states
- **Transaction Links**: Direct links to blockchain explorer

### 🖼️ NFT Gallery (`/nft-gallery`)
- **Beautiful Display**: Gallery view of ticket NFTs
- **Collection Stats**: Total value, active tickets
- **Status Indicators**: Visual status badges
- **Metadata Display**: Token IDs, creators, transaction hashes

### 🎭 Show Management (`/admin`)
- **Create Shows**: Full show creation with parameters
- **Manage Inventory**: Track sales progress
- **Revenue Monitoring**: Per-show performance
- **Configurable Settings**: Royalties, resale limits

## 🔗 Smart Contract Functions

### Entry Functions
```move
// Initialize the contract
public entry fun init(account: &signer)

// Create a new show
public entry fun create_show(creator: &signer, movie: String, theater: String, showtime: String, base_price: u64, total_seats: u64, royalty_percentage: u8, max_resale_hops: u8)

// Mint a ticket (primary sale)
public entry fun mint(buyer: &signer, creator_addr: address, show_id: u64, seat_id: String)

// List ticket for resale
public entry fun list_for_resale(seller: &signer, marketplace_addr: address, ticket_id: u64, price: u64)

// Buy resale ticket
public entry fun buy_resale_ticket(buyer: &signer, marketplace_addr: address, ticket_id: u64)

// Use ticket at theater
public entry fun use_ticket(theater: &signer, ticket_owner: address, ticket_id: u64)
```

### View Functions
```move
// Get user's tickets
public fun get_user_tickets(user_addr: address, store_addr: address): vector<Ticket>

// Get all shows
public fun get_shows(store_addr: address): vector<Show>

// Get marketplace listings
public fun get_marketplace_listings(marketplace_addr: address): vector<MarketplaceListing>
```

## 📋 Event Tracking

The system emits comprehensive events for complete transparency:

### TicketMinted Event
```move
struct TicketMinted {
    show_id: u64,
    seat_id: String,
    to: address,
    price: u64,
    timestamp: u64,
}
```

### TicketResold Event
```move
struct TicketResold {
    show_id: u64,
    seat_id: String,
    from: address,
    to: address,
    price: u64,
    royalty_to_creator: u64,
    resale_count: u8,
    timestamp: u64,
}
```

### TicketUsed Event
```move
struct TicketUsed {
    show_id: u64,
    seat_id: String,
    owner: address,
    timestamp: u64,
}
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- Yarn or npm
- Aptos CLI (for contract deployment)

### Installation
```bash
# Install dependencies
yarn install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your configuration

# Start development server
yarn dev
```

### Environment Variables
```env
NEXT_PUBLIC_APTOS_NODE_URL=https://fullnode.testnet.aptoslabs.com/v1
NEXT_PUBLIC_ROYALTIX_MODULE_ADDRESS=0x1  # Your deployed contract address
```

### Contract Deployment
```bash
cd blockchain
aptos init
aptos move compile
aptos move publish
```

## 💡 Usage Examples

### For Creators (Theaters/Event Organizers)
1. Connect wallet to access Creator Dashboard
2. Create shows with custom parameters (price, royalties, resale limits)
3. Monitor real-time sales and resale activity
4. View comprehensive analytics and revenue breakdowns
5. Track individual ticket lifecycles

### For Customers
1. Browse marketplace for primary ticket sales
2. Purchase tickets with automatic NFT minting
3. View tickets in gallery with QR codes for entry
4. List tickets for resale (up to maximum hop limit)
5. Browse and purchase from resale marketplace

### Example Transaction Flow
```
1. Creator creates show → TicketMinted event
2. Customer A buys ticket (50 APT) → TicketMinted event
3. Customer A lists for resale (70 APT) → Listed in marketplace
4. Customer B buys resale → TicketResold event (68.6 APT to A, 1.4 APT royalty to creator)
5. Customer B uses ticket → TicketUsed event
```

## 🎯 Value Propositions

### For Creators
- ✅ **Passive Income**: Earn royalties on every resale
- ✅ **Complete Transparency**: See every transaction
- ✅ **Anti-Scalping**: Limit resales to prevent speculation
- ✅ **Real-time Analytics**: Make data-driven decisions

### For Customers
- ✅ **Authentic Tickets**: Blockchain-verified NFTs
- ✅ **Resale Rights**: Sell unwanted tickets easily
- ✅ **Price Discovery**: Fair market pricing
- ✅ **Fraud Protection**: Impossible to counterfeit

## 🔧 Technical Stack

- **Blockchain**: Aptos (Move language)
- **Frontend**: Next.js 14, TypeScript, Tailwind CSS
- **UI Components**: Radix UI, Lucide Icons
- **Charts**: Recharts
- **Wallet**: Aptos Wallet Adapter
- **State**: React Context API

## 📈 Analytics Features

The Creator Dashboard provides comprehensive analytics:

### KPI Cards
- Total Tickets Sold
- Primary Sales Revenue  
- Resale Royalties Earned
- Total Resales
- Tickets Used
- Utilization Rate

### Charts
- **Line Chart**: Daily sales and revenue trends
- **Bar Chart**: Revenue by show
- **Pie Chart**: Resale activity distribution

### Event Log Table
Complete transaction history with:
- Timestamp
- Event type (Minted/Resold/Used)
- Show and seat information
- Seller/buyer addresses
- Prices and royalties

## 🛡️ Security Features

- **Smart Contract Validation**: All transactions validated on-chain
- **Ownership Verification**: Cryptographic proof of ownership
- **Usage Prevention**: Tickets can only be used once
- **Hop Limits**: Maximum resale count prevents speculation
- **Automatic Royalties**: Creator payments cannot be bypassed

## 🌐 Deployment

The application is ready for deployment on:
- **Vercel** (Frontend)
- **Aptos Testnet/Mainnet** (Smart Contract)

## 📞 Support

For technical support or questions about the implementation, please refer to the inline code documentation or create an issue in the repository.

---

**Built with ❤️ for the future of decentralized entertainment**



