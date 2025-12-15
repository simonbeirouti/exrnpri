import { PublicKey } from '@solana/web3.js';
import { BN } from '@coral-xyz/anchor';

export type CaptainSolProgramId = '13cJ7sYnRSfvynNpYhJhPgSpfeTC7FH4WbF3Mrnt3x3b';

// --- Accounts ---

export interface Campaign {
    creator: PublicKey;
    platformWallet: PublicKey;
    startTime: BN;
    endTime: BN;
    status: CampaignStatus;
    ipfsHash: string;
    totalModules: number; // u8
    nftLimit: number; // u32
    nftMintedCount: number; // u32
    bump: number; // u8
}

export type CampaignStatus =
    | { active: {} }
    | { expired: {} }
    | { closed: {} };

export interface Module {
    moduleId: number; // u8
    ipfsHash: string;
    campaign: PublicKey;
    bump: number; // u8
}

export interface ParticipantProgress {
    participant: PublicKey;
    campaign: PublicKey;
    completedModules: Buffer | Uint8Array; // bytes
    nftMinted: boolean;
    registeredAt: BN; // i64
    bump: number; // u8
}

// --- Events ---

export interface CampaignClosed {
    campaign: PublicKey;
    nftMintedCount: number; // u32
}

export interface CampaignCompleted {
    campaign: PublicKey;
    participant: PublicKey;
    ipfsHash: string;
}

export interface CampaignCreated {
    campaign: PublicKey;
    creator: PublicKey;
    ipfsHash: string;
    startTime: BN; // i64
    endTime: BN; // i64
    totalModules: number; // u8
    nftLimit: number; // u32
}

export interface ModuleAdded {
    campaign: PublicKey;
    module: PublicKey;
    moduleId: number; // u8
    ipfsHash: string;
}

export interface ModuleCompleted {
    campaign: PublicKey;
    participant: PublicKey;
    module: PublicKey;
    moduleId: number; // u8
    completedCount: number; // u8
}

export interface NftMinted {
    campaign: PublicKey;
    participant: PublicKey;
    nftMint: PublicKey;
    timestamp: BN; // i64
}

export interface ParticipantRegistered {
    campaign: PublicKey;
    participant: PublicKey;
    registeredAt: BN; // i64
}

// --- Errors ---

export enum CaptainSolError {
    InvalidTimeRange = 6000,
    CampaignNotActive = 6001,
    UnauthorizedCreator = 6002,
    InvalidPlatformWallet = 6003,
    ModuleAlreadyCompleted = 6004,
    NftLimitReached = 6005,
    NftAlreadyMinted = 6006,
    InsufficientFunds = 6007,
    InvalidIpfsHash = 6008,
    CampaignNotExpired = 6009,
    ParticipantNotRegistered = 6010,
    InvalidModule = 6011,
    IncompleteModules = 6012,
    CampaignExpired = 6013,
}
