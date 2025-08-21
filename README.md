# Royaltix (Aptos Testnet)

## Quick start

1. Install dependencies

```bash
npm install
```

2. Run dev server

```bash
npm run dev
```

3. Configure environment

Create `.env.local` in the project root:

```
NEXT_PUBLIC_APTOS_NODE_URL=https://fullnode.testnet.aptoslabs.com/v1
# After deploying Move module, set your account address below
# e.g., 0xabc... (without quotes)
NEXT_PUBLIC_ROYALTIX_MODULE_ADDRESS=0x
```

4. Wallets
- Supports Petra, Martian, Fewcha on Aptos testnet
- Install any wallet extension and create/import an account
- Get testnet APT from the faucet via the wallet

## On-chain integration
- Marketplace attempts an on-chain mint using `tickets::mint` when `NEXT_PUBLIC_ROYALTIX_MODULE_ADDRESS` is set
- Otherwise, it completes a local purchase for demo purposes
- Tickets page shows a transaction link if available

## Move module (scaffold)
Location: `blockchain/`

- `Move.toml` configured for `royaltix`
- `sources/tickets.move` provides `init`, `mint`, and `get_count`

### Build and publish (using Aptos CLI)

```bash
aptos init # choose testnet and set your profile
cd blockchain
aptos move compile
aptos move publish --named-addresses royaltix=<your_account_address>
```

Copy your published account address into `.env.local` as `NEXT_PUBLIC_ROYALTIX_MODULE_ADDRESS`.

## Notes
- The UI maintains local tickets to keep UX smooth during integration
- Replace placeholder mint flow with your module semantics as needed



