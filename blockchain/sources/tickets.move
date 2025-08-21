module royaltix::tickets {
    use std::signer;
    use std::string;
    use std::vector;

    struct Ticket has key, store, drop, copy {
        id: u64,
        movie: string::String,
        theater: string::String,
        showtime: string::String,
        price: u64,
        resale_count: u8,
    }

    struct TicketsStore has key {
        tickets: vector<Ticket>,
        next_id: u64,
    }

    public entry fun init(account: &signer) {
        move_to(account, TicketsStore { tickets: vector::empty<Ticket>(), next_id: 0 })
    }

    public entry fun mint(account: &signer, movie: string::String, theater: string::String, showtime: string::String, price: u64) {
        let store = borrow_global_mut<TicketsStore>(signer::address_of(account));
        let id = store.next_id;
        store.next_id = id + 1;
        let t = Ticket { id, movie, theater, showtime, price, resale_count: 0 };
        vector::push_back<Ticket>(&mut store.tickets, t);
    }

    public fun get_count(addr: address): u64 acquires TicketsStore {
        let store = borrow_global<TicketsStore>(addr);
        vector::length<Ticket>(&store.tickets) as u64
    }
}


