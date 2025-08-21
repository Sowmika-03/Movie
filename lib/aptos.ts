import { AptosClient } from 'aptos'

export const APTOS_NODE_URL = process.env.NEXT_PUBLIC_APTOS_NODE_URL || 'https://fullnode.testnet.aptoslabs.com/v1'

export const aptos = new AptosClient(APTOS_NODE_URL)

export async function getLedgerInfo() {
  return aptos.getLedgerInfo()
}


