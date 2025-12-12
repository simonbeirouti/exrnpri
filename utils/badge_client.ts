import {
    Connection,
    PublicKey,
    SystemProgram,
    TransactionInstruction,
    LAMPORTS_PER_SOL,
} from '@solana/web3.js';
import {
    TOKEN_2022_PROGRAM_ID,
    ASSOCIATED_TOKEN_PROGRAM_ID,
    getAssociatedTokenAddressSync,
} from '@solana/spl-token';
import { Program, AnchorProvider, BN } from '@coral-xyz/anchor';
import { BadgePlatform } from './badge_platform';

// Program constants from deployment
export const BADGE_PROGRAM_ID = new PublicKey('4VsU6pPcYaJp9uBx83AjULcKShKchujxLPGAMapnf5jw');
export const PLATFORM_WALLET = new PublicKey('2p8QvK4XLymfAFrdPxJChT5E44bKxHpsguL4K2rjJ1ZU');
export const DEVNET_RPC = 'https://api.devnet.solana.com';

/**
 * Get users owned badge mints
 */
export async function getOwnedBadgeMints(
    connection: Connection,
    owner: PublicKey
): Promise<Set<string>> {
    // Fetch user's token accounts
    const tokenAccounts = await connection.getParsedTokenAccountsByOwner(
        owner,
        { programId: TOKEN_2022_PROGRAM_ID }
    );

    // Create a set of mints owned by user
    const ownedMints = new Set<string>();
    tokenAccounts.value.forEach((account) => {
        const parsed = account.account.data.parsed.info;
        if (parsed.tokenAmount.decimals === 0 && parsed.tokenAmount.uiAmount >= 1) {
            ownedMints.add(parsed.mint);
        }
    });

    return ownedMints;
}

/**
 * Get Solana Devnet connection
 */
export function getConnection(): Connection {
    return new Connection(DEVNET_RPC, 'confirmed');
}

/**
 * Derive Badge PDA
 * Seeds: ["badge", creator, badge_id]
 */
export function getBadgePDA(
    creator: PublicKey,
    badgeId: string,
    programId: PublicKey = BADGE_PROGRAM_ID
): [PublicKey, number] {
    return PublicKey.findProgramAddressSync(
        [
            Buffer.from('badge'),
            creator.toBuffer(),
            Buffer.from(badgeId),
        ],
        programId
    );
}

/**
 * Derive Mint PDA
 * Seeds: ["mint", badge_pda]
 */
export function getMintPDA(
    badgePDA: PublicKey,
    programId: PublicKey = BADGE_PROGRAM_ID
): [PublicKey, number] {
    return PublicKey.findProgramAddressSync(
        [
            Buffer.from('mint'),
            badgePDA.toBuffer(),
        ],
        programId
    );
}

/**
 * Create initialize badge instruction
 */
export async function createInitializeBadgeInstruction(
    program: Program<BadgePlatform>,
    creator: PublicKey,
    badgeId: string,
    name: string,
    description: string,
    uri: string,
    priceInSol: number
): Promise<TransactionInstruction> {
    const [badgePDA] = getBadgePDA(creator, badgeId);
    const [mintPDA] = getMintPDA(badgePDA);

    const priceInLamports = solToLamports(priceInSol);

    return await program.methods
        .initializeBadge(badgeId, name, description, uri, priceInLamports)
        .accounts({
            creator,
            tokenProgram: TOKEN_2022_PROGRAM_ID,
        })
        .instruction();
}

/**
 * Create mint badge instruction
 */
export async function createMintBadgeInstruction(
    program: Program<BadgePlatform>,
    payer: PublicKey,
    creator: PublicKey,
    badgeId: string
): Promise<TransactionInstruction> {
    const [badgePDA] = getBadgePDA(creator, badgeId);
    const [mintPDA] = getMintPDA(badgePDA);

    const recipientTokenAccount = getAssociatedTokenAddressSync(
        mintPDA,
        payer,
        false,
        TOKEN_2022_PROGRAM_ID
    );

    return await program.methods
        .mintBadge()
        .accountsPartial({
            payer,
            creator,
            badge: badgePDA,
            tokenProgram: TOKEN_2022_PROGRAM_ID,
        })
        .instruction();
}

/**
 * Create burn badge instruction
 */
export async function createBurnBadgeInstruction(
    program: Program<BadgePlatform>,
    owner: PublicKey,
    creator: PublicKey,
    badgeId: string
): Promise<TransactionInstruction> {
    const [badgePDA] = getBadgePDA(creator, badgeId);
    const [mintPDA] = getMintPDA(badgePDA);

    const ownerTokenAccount = getAssociatedTokenAddressSync(
        mintPDA,
        owner,
        false,
        TOKEN_2022_PROGRAM_ID
    );

    return await program.methods
        .burnBadge()
        .accountsPartial({
            owner,
            badge: badgePDA,
            tokenProgram: TOKEN_2022_PROGRAM_ID,
        })
        .instruction();
}

/**
 * Convert lamports to SOL for display
 */
export function lamportsToSol(lamports: bigint | BN): number {
    const lamportsNum = typeof lamports === 'bigint'
        ? Number(lamports)
        : lamports.toNumber();
    return lamportsNum / LAMPORTS_PER_SOL;
}

/**
 * Create deactivate badge instruction (sets isActive to false)
 */
export async function createDeactivateBadgeInstruction(
    program: Program<BadgePlatform>,
    creator: PublicKey,
    badgeId: string
): Promise<TransactionInstruction> {
    const [badgePDA] = getBadgePDA(creator, badgeId);

    return await program.methods
        .deactivateBadge()
        .accountsPartial({
            creator,
            badge: badgePDA,
        })
        .instruction();
}

/**
 * Create reactivate badge instruction (sets isActive to true)
 */
export async function createReactivateBadgeInstruction(
    program: Program<BadgePlatform>,
    creator: PublicKey,
    badgeId: string
): Promise<TransactionInstruction> {
    const [badgePDA] = getBadgePDA(creator, badgeId);

    return await program.methods
        .reactivateBadge()
        .accountsPartial({
            creator,
            badge: badgePDA,
        })
        .instruction();
}

/**
 * Convert SOL to lamports
 */
export function solToLamports(sol: number): BN {
    return new BN(Math.round(sol * LAMPORTS_PER_SOL));
}
