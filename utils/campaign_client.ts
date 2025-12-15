import {
    Connection,
    PublicKey,
    SystemProgram,
    TransactionInstruction,
    LAMPORTS_PER_SOL,
} from '@solana/web3.js';
import { Program, BN } from '@coral-xyz/anchor';
import { CaptainSol } from './captain_sol';
import { Campaign as OnChainCampaign, CampaignStatus } from './captain_sol_types';
import { uploadJSON, uploadImage, getJSON, getIPFSGatewayURL } from './ipfs_client';
import { Campaign } from './ui_types';

export const CAPTAIN_SOL_PROGRAM_ID = new PublicKey('5xGZmXnD9DcdzHqY5H7UEBrkGC57CLejiVQz6AS7EphZ');
// Use a valid public key for the platform wallet (treasury)
// This should be an address controlled by the platform admin
export const PLATFORM_WALLET = new PublicKey('9Hbby1f64TMhu4E9qPQwiP7gm8PLWqm72pumgo4ENpeH');

export interface QuizQuestion {
    id: string;
    text: string;
    options: string[];
    correctAnswerIndex: number; // 0-based index, internal use only (not for IPFS)
}

export interface QuizData {
    questions: QuizQuestion[];
    correct_answer_hash?: string; // Generated on upload
}

export interface ModuleData {
    id: number;
    title: string;
    description: string;
    content_url: string;
    duration: string;
    quiz?: QuizData;
}

export interface CampaignData {
    title: string;
    description: string;
    banner_image: string; // URL or local URI
    modules: ModuleData[];
}

/**
 * Derive Campaign PDA
 * Seeds: ["campaign", creator, campaignId]
 */
export function getCampaignPDA(
    creator: PublicKey,
    campaignId: BN,
    programId: PublicKey = CAPTAIN_SOL_PROGRAM_ID
): [PublicKey, number] {
    return PublicKey.findProgramAddressSync(
        [
            Buffer.from('campaign'),
            creator.toBuffer(),
            campaignId.toArrayLike(Buffer, 'le', 8),
        ],
        programId
    );
}

/**
 * Derive Module PDA
 * Seeds: ["module", campaign, moduleId]
 */
export function getModulePDA(
    campaignPDA: PublicKey,
    moduleId: number,
    programId: PublicKey = CAPTAIN_SOL_PROGRAM_ID
): [PublicKey, number] {
    return PublicKey.findProgramAddressSync(
        [
            Buffer.from('module'),
            campaignPDA.toBuffer(),
            Buffer.from([moduleId]), // u8
        ],
        programId
    );
}

/**
 * Upload Campaign Metadata to IPFS
 */
export async function uploadCampaignMetadata(
    data: CampaignData
): Promise<string> {
    // 1. Upload Banner Image if it's a local URI
    let bannerImageUrl = data.banner_image;
    if (!data.banner_image.startsWith('http')) {
        const imageCID = await uploadImage(data.banner_image);
        bannerImageUrl = getIPFSGatewayURL(imageCID);
    }

    // 2. Prepare Metadata JSON
    const metadata = {
        title: data.title,
        description: data.description,
        banner_image: bannerImageUrl,
        modules: data.modules.map(m => ({
            id: m.id,
            title: m.title,
            description: m.description,
            content_url: m.content_url,
            duration: m.duration,
            quiz: m.quiz ? {
                questions: m.quiz.questions.map(q => ({
                    id: q.id,
                    text: q.text,
                    options: q.options
                })),
                correct_answer_hash: m.quiz.correct_answer_hash
            } : undefined
        }))
    };

    // 3. Upload Metadata
    const result = await uploadJSON(metadata);
    return result.dataCID;
}

/**
 * Generate a random Campaign ID (u64)
 */
export function generateCampaignId(): BN {
    return new BN(Date.now()); // Simple timestamp based ID for now
}

/**
 * Create Initialize Campaign Instruction
 */
export async function createInitializeCampaignInstruction(
    program: Program<CaptainSol>,
    creator: PublicKey,
    campaignId: BN,
    ipfsHash: string,
    startTime: number,
    endTime: number,
    totalModules: number,
    nftLimit: number,
    platformWallet: PublicKey = PLATFORM_WALLET
): Promise<TransactionInstruction> {
    const [campaignPDA] = getCampaignPDA(creator, campaignId);

    return await program.methods
        .initializeCampaign(
            campaignId,
            ipfsHash,
            new BN(startTime),
            new BN(endTime),
            totalModules,
            nftLimit
        )
        .accounts({
            creator,
            campaign: campaignPDA,
            platformWallet,
            systemProgram: SystemProgram.programId,
        })
        .instruction();
}

/**
 * Create Add Module Instruction
 */
export async function createAddModuleInstruction(
    program: Program<CaptainSol>,
    creator: PublicKey,
    campaignId: BN,
    moduleId: number,
    ipfsHash: string
): Promise<TransactionInstruction> {
    const [campaignPDA] = getCampaignPDA(creator, campaignId);
    const [modulePDA] = getModulePDA(campaignPDA, moduleId);

    return await program.methods
        .addModule(moduleId, ipfsHash)
        .accounts({
            creator,
            campaign: campaignPDA,
            module: modulePDA,
            systemProgram: SystemProgram.programId,
        })
        .instruction();
}

/**
 * Fetch all campaigns and resolve metadata
 */
export async function fetchCampaigns(
    connection: Connection,
    program: Program<CaptainSol>
): Promise<Campaign[]> {
    try {
        const campaigns = await program.account.campaign.all();

        const resolvedCampaigns = await Promise.all(
            campaigns.map(async (camp) => {
                const account = camp.account as unknown as OnChainCampaign;
                let metadata: any = {
                    title: 'Loading...',
                    description: '',
                    banner_image: '',
                    modules: []
                };

                // Fetch metadata from IPFS if hash exists
                if (account.ipfsHash) {
                    try {
                        const fetched = await getJSON(account.ipfsHash);
                        if (fetched) metadata = fetched;
                    } catch (e) {
                        console.error(`Failed to fetch metadata for ${account.ipfsHash}`, e);
                    }
                }

                // Map to UI model
                // Handle Enum status correctly
                const statusObj = account.status as any;
                const statusKey = Object.keys(statusObj || {})[0] || 'active';
                const status = statusKey.charAt(0).toUpperCase() + statusKey.slice(1);

                return {
                    creator: account.creator.toString(),
                    start_time: account.startTime.toNumber() * 1000,
                    end_time: account.endTime.toNumber() * 1000,
                    status: status,
                    ipfs_hash: metadata, // UI expects resolved partial here
                    total_modules: account.totalModules,
                    nft_limit: account.nftLimit,
                    nft_minted_count: account.nftMintedCount,
                    bump: account.bump,
                    publicKey: camp.publicKey.toString()
                };
            })
        );

        return resolvedCampaigns;
    } catch (error) {
        console.error("Error in fetchCampaigns:", error);
        return [];
    }
}
