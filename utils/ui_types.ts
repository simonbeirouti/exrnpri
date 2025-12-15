export interface Module {
    id: number;
    title: string;
    description: string;
    content_url: string;
    duration: string;
}

export interface IPFSHash {
    title: string;
    description: string;
    banner_image: string;
    modules: Module[];
}

export interface Campaign {
    creator: string;
    start_time: number;
    end_time: number;
    status: string;
    ipfs_hash: IPFSHash;
    total_modules: number;
    nft_limit: number;
    nft_minted_count: number;
    bump: number;
    publicKey: string;
}
