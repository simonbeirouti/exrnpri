import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@react-navigation/native';
import { Program, AnchorProvider, Wallet } from '@coral-xyz/anchor';
import { PublicKey, Transaction } from '@solana/web3.js';
import { BadgeGrid } from '@/components/badges/BadgeGrid';
import { SolanaNetworkWarning } from '@/components/badges/SolanaNetworkWarning';
import { CreateBadgeForm } from '@/components/badges/CreateBadgeForm';
import { Ionicons } from '@expo/vector-icons';
import { BadgeWithMetadata } from '@/utils/badge_types';
import {
    getConnection,
    createMintBadgeInstruction,
    getBadgePDA,
    getMintPDA,
    getOwnedBadgeMints,
    BADGE_PROGRAM_ID,
} from '@/utils/badge_client';
import { BadgePlatform } from '@/utils/badge_platform';
import badgePlatformIdl from '@/badge_platform.json';
import { FontSize, Spacing, Layout } from '@/constants/Colors';
import { useWallet } from '@/context/WalletContext';

export default function BadgesPage() {
    const theme = useTheme();
    const { currentWallet, selectedChain } = useWallet();
    const solanaWallet = currentWallet; // Alias for compatibility with existing code
    const [badges, setBadges] = useState<BadgeWithMetadata[]>([]);
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);

    const fetchBadges = async () => {
        if (selectedChain !== 'solana') return;
        try {
            const connection = getConnection();
            const wallet = solanaWallet as unknown as Wallet;
            const provider = new AnchorProvider(connection, wallet, {});
            const program = new Program<BadgePlatform>(
                badgePlatformIdl as BadgePlatform,
                provider
            );

            // Fetch all badge accounts
            const badgeAccounts = await program.account.badge.all();

            // Fetch owned mints if connected
            let ownedMints = new Set<string>();
            if (solanaWallet?.address) {
                ownedMints = await getOwnedBadgeMints(
                    connection,
                    new PublicKey(solanaWallet.address)
                );
            }

            const badgesData: BadgeWithMetadata[] = badgeAccounts.map((account) => ({
                creator: account.account.creator,
                price: account.account.price,
                mint: account.account.mint,
                badgeId: account.account.badgeId,
                uri: account.account.uri,
                bump: account.account.bump,
                // TODO: Fetch metadata from URI
                name: account.account.badgeId, // Placeholder
                description: 'Badge description', // Placeholder
                isOwned: ownedMints.has(account.account.mint.toString()),
            }))
                .filter(badge => !badge.isOwned);

            setBadges(badgesData);
        } catch (error) {
            console.error('Error fetching badges:', error);
            Alert.alert('Error', 'Failed to load badges');
        }
    };

    const handleRefresh = async () => {
        setRefreshing(true);
        await fetchBadges();
        setRefreshing(false);
    };

    const handlePurchase = async (badge: BadgeWithMetadata) => {
        if (selectedChain !== 'solana' || !solanaWallet?.address) {
            Alert.alert('Error', 'Please connect your Solana wallet');
            return;
        }

        Alert.alert(
            'Purchase Badge',
            `Purchase "${badge.name}" for ${(Number(badge.price) / 1e9).toFixed(2)} SOL ? `,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Purchase',
                    onPress: async () => {
                        setLoading(true);
                        try {
                            if (!solanaWallet?.getProvider) {
                                Alert.alert('Error', 'Wallet provider not available');
                                return;
                            }

                            const provider = await solanaWallet.getProvider();
                            if (!provider) {
                                Alert.alert('Error', 'Failed to get wallet provider');
                                return;
                            }

                            const connection = getConnection();
                            const payer = new PublicKey(solanaWallet.address);

                            // Build transaction
                            const [badgePDA] = getBadgePDA(badge.creator, badge.badgeId);
                            const [mintPDA] = getMintPDA(badgePDA);

                            const program = new Program(
                                badgePlatformIdl as any,
                                new AnchorProvider(connection, solanaWallet as any, {})
                            );

                            const instruction = await createMintBadgeInstruction(
                                program,
                                payer,
                                badge.creator,
                                badge.badgeId
                            );

                            const transaction = new Transaction().add(instruction);
                            const { blockhash } = await connection.getLatestBlockhash();
                            transaction.recentBlockhash = blockhash;
                            transaction.feePayer = payer;

                            // Sign and send with Privy provider
                            const { signature } = await provider.request({
                                method: 'signAndSendTransaction',
                                params: {
                                    transaction,
                                    connection,
                                },
                            });

                            Alert.alert(
                                'Success!',
                                `Badge purchased successfully!\n\nSignature: ${signature.slice(0, 8)}...`
                            );

                            // Refresh badges
                            await fetchBadges();
                        } catch (error) {
                            console.error('Error purchasing badge:', error);
                            Alert.alert('Error', `Failed to purchase badge: ${error instanceof Error ? error.message : 'Unknown error'}`);
                        } finally {
                            setLoading(false);
                        }
                    },
                },
            ]
        );
    };

    useEffect(() => {
        fetchBadges();
    }, [selectedChain]);

    return (
        <SafeAreaView style={{ flex: 1 }} edges={['top']}>
            <SolanaNetworkWarning>
                <View style={styles.header}>
                    <Text style={[styles.title, { color: theme.colors.text }]}>
                        Browse Badges
                    </Text>
                    <TouchableOpacity
                        onPress={() => setIsCreateModalVisible(true)}
                        style={styles.createButton}
                    >
                        <Ionicons name="add-circle" size={32} color={theme.colors.primary} />
                    </TouchableOpacity>
                </View>

                <BadgeGrid
                    badges={badges}
                    onBadgePress={handlePurchase}
                    onRefresh={handleRefresh}
                    refreshing={refreshing}
                    showPurchaseButton={true}
                    emptyMessage="No badges available yet. Create the first one!"
                />

                <CreateBadgeForm
                    visible={isCreateModalVisible}
                    onClose={() => setIsCreateModalVisible(false)}
                    onSuccess={() => {
                        setIsCreateModalVisible(false);
                        handleRefresh();
                    }}
                />


            </SolanaNetworkWarning>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: Layout.padding,
    },
    title: {
        fontSize: FontSize.xxl,
        fontWeight: '700',
    },
    refreshButton: {
        padding: Layout.padding,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: Layout.gap,
        fontSize: FontSize.md,
    },
    createButton: {
        padding: 4,
    },
});
