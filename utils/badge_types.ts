import { PublicKey } from '@solana/web3.js';

/**
 * Badge account data structure from the Solana program
 */
export interface BadgeMetadata {
    creator: PublicKey;
    price: bigint;
    mint: PublicKey;
    badgeId: string;
    name: string;
    description: string;
    uri: string;
    isActive: boolean;
    bump: number;
}

/**
 * Badge with additional UI metadata
 */
export interface BadgeWithMetadata extends BadgeMetadata {
    // Parsed metadata from URI (future enhancement)
    image?: string;
    // UI state
    isOwned?: boolean;
}

/**
 * Form data for creating a new badge
 */
export interface CreateBadgeFormData {
    badgeId: string;
    name: string;
    description: string;
    uri: string;
    price: string; // In SOL (will be converted to lamports)
}

/**
 * Purchase badge form data
 */
export interface PurchaseBadgeData {
    badgeId: string;
    creator: PublicKey;
    price: bigint;
}
