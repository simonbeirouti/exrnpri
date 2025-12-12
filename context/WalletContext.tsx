import React, { createContext, useContext, useState, useMemo, useEffect } from "react";
import { usePrivy, useEmbeddedEthereumWallet, useEmbeddedSolanaWallet } from "@privy-io/expo";

interface WalletContextType {
    selectedChain: string;
    setSelectedChain: (chain: string) => void;
    selectedWalletIndex: number;
    setSelectedWalletIndex: (index: number) => void;
    activeWallets: any[];
    currentWallet: any | null;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export function WalletProvider({ children }: { children: React.ReactNode }) {
    const { user } = usePrivy();
    const { wallets: evmWallets } = useEmbeddedEthereumWallet();
    const { wallets: solanaWallets } = useEmbeddedSolanaWallet();

    const [selectedChain, setSelectedChain] = useState<string>("solana");
    const [selectedWalletIndex, setSelectedWalletIndex] = useState(0);

    const activeWallets = useMemo(() => {
        if (selectedChain === "ethereum") return evmWallets || [];
        if (selectedChain === "solana") return solanaWallets || [];

        // For other chains, fallback to linked_accounts filter
        return user?.linked_accounts.filter(
            (a) => a.type === "wallet" && a.chain_type === selectedChain
        ) || [];
    }, [selectedChain, evmWallets, solanaWallets, user]);

    // Reset selection when switching chains
    useEffect(() => {
        setSelectedWalletIndex(0);
    }, [selectedChain]);

    const currentWallet = activeWallets?.[selectedWalletIndex] || null;

    return (
        <WalletContext.Provider
            value={{
                selectedChain,
                setSelectedChain,
                selectedWalletIndex,
                setSelectedWalletIndex,
                activeWallets,
                currentWallet,
            }}
        >
            {children}
        </WalletContext.Provider>
    );
}

export function useWallet() {
    const context = useContext(WalletContext);
    if (context === undefined) {
        throw new Error("useWallet must be used within a WalletProvider");
    }
    return context;
}
