module royaltix::tickets {
    use std::signer;
    use std::string::{Self, String};
    use std::vector;
    use aptos_framework::event;
    use aptos_framework::account;
    use aptos_framework::timestamp;
    use aptos_framework::coin;
    use aptos_framework::aptos_coin::AptosCoin;

    // Events
    #[event]
    struct TicketMinted has drop, store {
        show_id: u64,
        seat_id: String,
        to: address,
        price: u64,
        timestamp: u64,
    }

    #[event]
    struct TicketResold has drop, store {
        show_id: u64,
        seat_id: String,
        from: address,
        to: address,
        price: u64,
        royalty_to_creator: u64,
        resale_count: u8,
        timestamp: u64,
    }

    #[event]
    struct TicketUsed has drop, store {
        show_id: u64,
        seat_id: String,
        owner: address,
        timestamp: u64,
    }

    // Structs
    struct Ticket has key, store, drop, copy {
        id: u64,
        show_id: u64,
        seat_id: String,
        movie: String,
        theater: String,
        showtime: String,
        price: u64,
        resale_count: u8,
        creator: address,
        owner: address,
        is_used: bool,
        created_at: u64,
    }

    struct Show has store, drop, copy {
        id: u64,
        movie: String,
        theater: String,
        showtime: String,
        base_price: u64,
        creator: address,
        total_seats: u64,
        sold_seats: u64,
        royalty_percentage: u8, // e.g., 2 for 2%
        max_resale_hops: u8,    // e.g., 2 for max 2 resales
    }

    struct TicketsStore has key {
        tickets: vector<Ticket>,
        shows: vector<Show>,
        next_ticket_id: u64,
        next_show_id: u64,
    }

    struct MarketplaceListing has store, drop, copy {
        ticket_id: u64,
        seller: address,
        price: u64,
        listed_at: u64,
    }

    struct Marketplace has key {
        listings: vector<MarketplaceListing>,
    }

    // Error codes
    const E_NOT_OWNER: u64 = 1;
    const E_TICKET_NOT_FOUND: u64 = 2;
    const E_TICKET_ALREADY_USED: u64 = 3;
    const E_MAX_RESALES_REACHED: u64 = 4;
    const E_SHOW_NOT_FOUND: u64 = 5;
    const E_INSUFFICIENT_PAYMENT: u64 = 6;
    const E_NOT_AUTHORIZED: u64 = 7;
    const E_LISTING_NOT_FOUND: u64 = 8;

    // Initialize the module
    public entry fun init(account: &signer) {
        let addr = signer::address_of(account);
        if (!exists<TicketsStore>(addr)) {
            move_to(account, TicketsStore { 
                tickets: vector::empty<Ticket>(), 
                shows: vector::empty<Show>(),
                next_ticket_id: 1,
                next_show_id: 1,
            });
        };
        if (!exists<Marketplace>(addr)) {
            move_to(account, Marketplace { 
                listings: vector::empty<MarketplaceListing>(),
            });
        };
    }

    // Create a new show (only creator can do this)
    public entry fun create_show(
        creator: &signer, 
        movie: String, 
        theater: String, 
        showtime: String, 
        base_price: u64,
        total_seats: u64,
        royalty_percentage: u8,
        max_resale_hops: u8
    ) acquires TicketsStore {
        let creator_addr = signer::address_of(creator);
        let store = borrow_global_mut<TicketsStore>(creator_addr);
        
        let show = Show {
            id: store.next_show_id,
            movie,
            theater,
            showtime,
            base_price,
            creator: creator_addr,
            total_seats,
            sold_seats: 0,
            royalty_percentage,
            max_resale_hops,
        };
        
        vector::push_back(&mut store.shows, show);
        store.next_show_id = store.next_show_id + 1;
    }

    // Mint a ticket (primary sale)
    public entry fun mint(
        buyer: &signer, 
        creator_addr: address,
        show_id: u64, 
        seat_id: String
    ) acquires TicketsStore {
        let buyer_addr = signer::address_of(buyer);
        let store = borrow_global_mut<TicketsStore>(creator_addr);
        
        // Find the show
        let show_index = find_show_index(&store.shows, show_id);
        assert!(show_index < vector::length(&store.shows), E_SHOW_NOT_FOUND);
        let show = vector::borrow_mut(&mut store.shows, show_index);
        
        // Check payment and transfer
        let price = show.base_price;
        coin::transfer<AptosCoin>(buyer, creator_addr, price);
        
        // Create ticket
        let ticket = Ticket {
            id: store.next_ticket_id,
            show_id,
            seat_id: seat_id,
            movie: show.movie,
            theater: show.theater,
            showtime: show.showtime,
            price,
            resale_count: 0,
            creator: creator_addr,
            owner: buyer_addr,
            is_used: false,
            created_at: timestamp::now_microseconds(),
        };
        
        vector::push_back(&mut store.tickets, ticket);
        store.next_ticket_id = store.next_ticket_id + 1;
        show.sold_seats = show.sold_seats + 1;
        
        // Emit event
        event::emit(TicketMinted {
            show_id,
            seat_id: seat_id,
            to: buyer_addr,
            price,
            timestamp: timestamp::now_microseconds(),
        });
    }

    // List ticket for resale
    public entry fun list_for_resale(
        seller: &signer,
        marketplace_addr: address,
        ticket_id: u64,
        price: u64
    ) acquires TicketsStore, Marketplace {
        let seller_addr = signer::address_of(seller);
        
        // Verify ticket ownership
        let ticket_index = find_user_ticket_index(seller_addr, marketplace_addr, ticket_id);
        let store = borrow_global<TicketsStore>(marketplace_addr);
        let ticket = vector::borrow(&store.tickets, ticket_index);
        
        assert!(ticket.owner == seller_addr, E_NOT_OWNER);
        assert!(!ticket.is_used, E_TICKET_ALREADY_USED);
        
        // Check if ticket can be resold
        let show_index = find_show_index(&store.shows, ticket.show_id);
        let show = vector::borrow(&store.shows, show_index);
        assert!(ticket.resale_count < show.max_resale_hops, E_MAX_RESALES_REACHED);
        
        // Add to marketplace
        let marketplace = borrow_global_mut<Marketplace>(marketplace_addr);
        let listing = MarketplaceListing {
            ticket_id,
            seller: seller_addr,
            price,
            listed_at: timestamp::now_microseconds(),
        };
        vector::push_back(&mut marketplace.listings, listing);
    }

    // Buy resale ticket
    public entry fun buy_resale_ticket(
        buyer: &signer,
        marketplace_addr: address,
        ticket_id: u64
    ) acquires TicketsStore, Marketplace {
        let buyer_addr = signer::address_of(buyer);
        
        // Find and remove listing
        let marketplace = borrow_global_mut<Marketplace>(marketplace_addr);
        let listing_index = find_listing_index(&marketplace.listings, ticket_id);
        assert!(listing_index < vector::length(&marketplace.listings), E_LISTING_NOT_FOUND);
        let listing = vector::remove(&mut marketplace.listings, listing_index);
        
        // Get ticket and show info
        let store = borrow_global_mut<TicketsStore>(marketplace_addr);
        let ticket_index = find_ticket_index(&store.tickets, ticket_id);
        let ticket = vector::borrow_mut(&mut store.tickets, ticket_index);
        let show_index = find_show_index(&store.shows, ticket.show_id);
        let show = vector::borrow(&store.shows, show_index);
        
        // Calculate royalty
        let sale_price = listing.price;
        let royalty_amount = (sale_price * (show.royalty_percentage as u64)) / 100;
        let seller_amount = sale_price - royalty_amount;
        
        // Transfer payments
        coin::transfer<AptosCoin>(buyer, listing.seller, seller_amount);
        coin::transfer<AptosCoin>(buyer, show.creator, royalty_amount);
        
        // Update ticket ownership
        let old_owner = ticket.owner;
        ticket.owner = buyer_addr;
        ticket.resale_count = ticket.resale_count + 1;
        
        // Emit event
        event::emit(TicketResold {
            show_id: ticket.show_id,
            seat_id: ticket.seat_id,
            from: old_owner,
            to: buyer_addr,
            price: sale_price,
            royalty_to_creator: royalty_amount,
            resale_count: ticket.resale_count,
            timestamp: timestamp::now_microseconds(),
        });
    }

    // Use ticket (called by theater)
    public entry fun use_ticket(
        theater: &signer,
        ticket_owner: address,
        ticket_id: u64
    ) acquires TicketsStore {
        let theater_addr = signer::address_of(theater);
        let store = borrow_global_mut<TicketsStore>(theater_addr);
        
        let ticket_index = find_ticket_index(&store.tickets, ticket_id);
        let ticket = vector::borrow_mut(&mut store.tickets, ticket_index);
        
        assert!(ticket.owner == ticket_owner, E_NOT_OWNER);
        assert!(!ticket.is_used, E_TICKET_ALREADY_USED);
        
        ticket.is_used = true;
        
        // Emit event
        event::emit(TicketUsed {
            show_id: ticket.show_id,
            seat_id: ticket.seat_id,
            owner: ticket_owner,
            timestamp: timestamp::now_microseconds(),
        });
    }

    // View functions
    #[view]
    public fun get_user_tickets(user_addr: address, store_addr: address): vector<Ticket> acquires TicketsStore {
        let store = borrow_global<TicketsStore>(store_addr);
        let user_tickets = vector::empty<Ticket>();
        let i = 0;
        while (i < vector::length(&store.tickets)) {
            let ticket = vector::borrow(&store.tickets, i);
            if (ticket.owner == user_addr && !ticket.is_used) {
                vector::push_back(&mut user_tickets, *ticket);
            };
            i = i + 1;
        };
        user_tickets
    }

    #[view]
    public fun get_shows(store_addr: address): vector<Show> acquires TicketsStore {
        let store = borrow_global<TicketsStore>(store_addr);
        store.shows
    }

    #[view]
    public fun get_marketplace_listings(marketplace_addr: address): vector<MarketplaceListing> acquires Marketplace {
        let marketplace = borrow_global<Marketplace>(marketplace_addr);
        marketplace.listings
    }

    #[view]
    public fun get_ticket_by_id(store_addr: address, ticket_id: u64): Ticket acquires TicketsStore {
        let store = borrow_global<TicketsStore>(store_addr);
        let ticket_index = find_ticket_index(&store.tickets, ticket_id);
        *vector::borrow(&store.tickets, ticket_index)
    }

    #[view]
    public fun get_show_by_id(store_addr: address, show_id: u64): Show acquires TicketsStore {
        let store = borrow_global<TicketsStore>(store_addr);
        let show_index = find_show_index(&store.shows, show_id);
        *vector::borrow(&store.shows, show_index)
    }

    // Helper functions
    fun find_ticket_index(tickets: &vector<Ticket>, ticket_id: u64): u64 {
        let i = 0;
        while (i < vector::length(tickets)) {
            let ticket = vector::borrow(tickets, i);
            if (ticket.id == ticket_id) {
                return i
            };
            i = i + 1;
        };
        abort E_TICKET_NOT_FOUND
    }

    fun find_show_index(shows: &vector<Show>, show_id: u64): u64 {
        let i = 0;
        while (i < vector::length(shows)) {
            let show = vector::borrow(shows, i);
            if (show.id == show_id) {
                return i
            };
            i = i + 1;
        };
        abort E_SHOW_NOT_FOUND
    }

    fun find_user_ticket_index(user_addr: address, store_addr: address, ticket_id: u64): u64 acquires TicketsStore {
        let store = borrow_global<TicketsStore>(store_addr);
        let i = 0;
        while (i < vector::length(&store.tickets)) {
            let ticket = vector::borrow(&store.tickets, i);
            if (ticket.id == ticket_id && ticket.owner == user_addr) {
                return i
            };
            i = i + 1;
        };
        abort E_TICKET_NOT_FOUND
    }

    fun find_listing_index(listings: &vector<MarketplaceListing>, ticket_id: u64): u64 {
        let i = 0;
        while (i < vector::length(listings)) {
            let listing = vector::borrow(listings, i);
            if (listing.ticket_id == ticket_id) {
                return i
            };
            i = i + 1;
        };
        abort E_LISTING_NOT_FOUND
    }
}


