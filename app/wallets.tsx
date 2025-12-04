import React from 'react';
import {
    useEmbeddedEthereumWallet,
    useEmbeddedSolanaWallet,
    usePrivy,
} from "@privy-io/expo";
import { useCreateWallet } from "@privy-io/expo/extended-chains";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { useTheme } from "@react-navigation/native";
import { SettingsCollapseRow } from "@/components/settings/SettingsCollapseRow";
import { Stack } from 'expo-router';
import { ScreenScrollView } from '@/components/layout/ScreenScrollView';

export default function WalletsScreen() {
    const theme = useTheme();
    const [error, setError] = useState<string | null>(null);
    const { user } = usePrivy();
    const { create: createEthereumWallet } = useEmbeddedEthereumWallet();
    const { create: createSolanaWallet } = useEmbeddedSolanaWallet();
    const { createWallet } = useCreateWallet();
    const wallets = user?.linked_accounts.filter(
        (account) => account.type === "wallet",
    );

    const [expandedChains, setExpandedChains] = useState<Record<string, boolean>>({});

    type ExtendedChainType =
        | "bitcoin-segwit"
        | "stellar"
        | "cosmos"
        | "near"
    // | "sui"
    // | "tron"
    // | "ton"
    // | "spark";
    type chainTypes = "ethereum" | "solana" | ExtendedChainType;

    const ALL_CHAIN_TYPES: { type: chainTypes; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
        { type: "ethereum", label: "Ethereum", icon: "logo-electron" }, // Using electron as placeholder for ETH
        { type: "solana", label: "Solana", icon: "sunny" }, // Using sunny for Solana
        { type: "bitcoin-segwit", label: "Bitcoin", icon: "logo-bitcoin" },
        { type: "stellar", label: "Stellar", icon: "planet" },
        { type: "cosmos", label: "Cosmos", icon: "planet-outline" },
        { type: "near", label: "Near", icon: "infinite" },
    ];

    const toggleChain = (chainType: string) => {
        setExpandedChains((prev) => ({
            ...prev,
            [chainType]: !prev[chainType],
        }));
    };

    const createWallets = (chainType: chainTypes) => {
        switch (chainType) {
            case "ethereum":
                return createEthereumWallet({ createAdditional: true });
            case "solana":
                return createSolanaWallet?.({
                    createAdditional: true,
                    recoveryMethod: "privy",
                });

            default:
                return createWallet({
                    chainType: chainType as ExtendedChainType,
                }).catch((err: any) => {
                    console.log(err);
                    setError(err?.message ? String(err.message) : String(err));
                });
        }
    };

    return (
        <ScreenScrollView>
            <Stack.Screen options={{ title: 'Wallets', headerBackTitle: 'Settings', headerTransparent: true }} />
            <View style={styles.content}>
                <View style={styles.container}>
                    {ALL_CHAIN_TYPES.map((chain) => {
                        const chainWallets = wallets?.filter((w) => w.chain_type === chain.type) || [];
                        const isExpanded = !!expandedChains[chain.type];

                        return (
                            <SettingsCollapseRow
                                key={chain.type}
                                icon={chain.icon}
                                title={chain.label}
                                subtitle={chainWallets.length > 0 ? `${chainWallets.length} wallet${chainWallets.length > 1 ? 's' : ''}` : "No wallets"}
                                expanded={isExpanded}
                                onToggle={() => toggleChain(chain.type)}
                            >
                                <View style={styles.expandedContent}>
                                    {chainWallets.length > 0 ? (
                                        chainWallets.map((wallet, index) => (
                                            <View key={`${chain.type}-wallet-${index}`}>
                                                <Text style={[styles.walletAddress, { color: theme.colors.text }]}>
                                                    {wallet.address}
                                                </Text>
                                            </View>
                                        ))
                                    ) : (
                                        <Text style={[styles.noWalletsText, { color: theme.colors.text }]}>
                                            No wallets created yet.
                                        </Text>
                                    )}

                                    <TouchableOpacity
                                        style={[styles.createButton, { backgroundColor: theme.colors.primary }]}
                                        onPress={() => createWallets(chain.type)}
                                    >
                                        <Text style={styles.createButtonText}>Create Wallet</Text>
                                    </TouchableOpacity>
                                </View>
                            </SettingsCollapseRow>
                        );
                    })}
                    {error && <Text style={{ color: "red", padding: 10 }}>{error}</Text>}
                </View>
            </View>
        </ScreenScrollView>
    );
}

const styles = StyleSheet.create({
    content: {
        padding: 10,
        gap: 10,
    },
    container: {
        borderRadius: 10,
        overflow: 'hidden',
    },
    expandedContent: {
        gap: 15,
    },
    walletAddress: {
        fontSize: 12,
        fontFamily: 'monospace',
    },
    noWalletsText: {
        opacity: 0.6,
        fontStyle: 'italic',
    },
    createButton: {
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
    },
    createButtonText: {
        color: 'white',
        fontWeight: '600',
        fontSize: 14,
    },
});
