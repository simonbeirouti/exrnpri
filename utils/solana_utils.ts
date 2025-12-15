import { Connection } from '@solana/web3.js';

export const DEVNET_RPC = 'https://api.devnet.solana.com';

/**
 * Get Solana Devnet connection
 */
export function getConnection(): Connection {
    return new Connection(DEVNET_RPC, 'confirmed');
}
