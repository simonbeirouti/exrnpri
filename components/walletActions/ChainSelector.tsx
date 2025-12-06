import React, { useMemo } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { usePrivy } from '@privy-io/expo';
import { Dropdown } from '../ui/Dropdown';
import { useTheme } from '@react-navigation/native';

type ChainType = 'ethereum' | 'solana' | 'bitcoin-segwit' | 'stellar' | 'cosmos' | 'near';

const CHAIN_CONFIG: { type: ChainType; label: string; icon: string }[] = [
    { type: 'ethereum', label: 'EVM', icon: 'logo-electron' },
    { type: 'solana', label: 'Solana', icon: 'sunny' },
    { type: 'bitcoin-segwit', label: 'Bitcoin', icon: 'logo-bitcoin' },
    { type: 'stellar', label: 'Stellar', icon: 'planet' },
    { type: 'cosmos', label: 'Cosmos', icon: 'planet-outline' },
    { type: 'near', label: 'Near', icon: 'infinite' },
];

interface ChainSelectorProps {
    selectedChain: string;
    onSelectChain: (chain: string) => void;
}

export const ChainSelector: React.FC<ChainSelectorProps> = ({
    selectedChain,
    onSelectChain,
}) => {
    const { user } = usePrivy();
    const theme = useTheme();

    const availableChains = useMemo(() => {
        if (!user) return [];
        const wallets = user.linked_accounts.filter((a) => a.type === 'wallet');
        const walletChainTypes = new Set(wallets.map((w) => w.chain_type));

        // Filter config to only include chains user has wallets for
        return CHAIN_CONFIG.filter((c) => walletChainTypes.has(c.type));
    }, [user]);

    const options = useMemo(() =>
        availableChains.map(c => ({ label: c.label, value: c.type })),
        [availableChains]);

    if (availableChains.length === 0) return null;

    return (
        <View style={{ marginBottom: 10, zIndex: 100 }}>
            <Text style={{ color: theme.colors.text, marginBottom: 8, fontWeight: '600' }}>Select Chain</Text>
            <Dropdown
                options={options}
                selectedValue={selectedChain}
                onSelect={onSelectChain}
            />
        </View>
    );
};