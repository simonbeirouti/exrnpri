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
    createMintBadgeInstruction,
    createDeactivateBadgeInstruction,
    createReactivateBadgeInstruction,
    getBadgePDA,
    getMintPDA,
    getOwnedBadgeMints,
    BADGE_PROGRAM_ID,
} from '@/utils/badge_client';
import { getConnection } from '@/utils/solana_utils';
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
    const [filter, setFilter] = useState<'all' | 'live' | 'paused'>('all');

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

            // Fetch all badge accounts manually to handle deserialization errors
            const accounts = await connection.getProgramAccounts(BADGE_PROGRAM_ID);
            console.log(`\nFetched ${accounts.length} badge accounts from blockchain`);

            // Fetch owned mints if connected
            let ownedMints = new Set<string>();
            if (solanaWallet?.address) {
                ownedMints = await getOwnedBadgeMints(
                    connection,
                    new PublicKey(solanaWallet.address)
                );
            }

            // Manually deserialize each account, using fallback for old badges
            const badgesData: BadgeWithMetadata[] = [];
            for (const { account, pubkey } of accounts) {
                try {
                    // Try to decode with new schema (includes name and description)
                    const decoded = program.coder.accounts.decode('badge', account.data);

                    console.log(`Badge ${decoded.badgeId}: isActive = ${decoded.isActive}`);

                    badgesData.push({
                        creator: decoded.creator,
                        price: decoded.price,
                        mint: decoded.mint,
                        badgeId: decoded.badgeId,
                        name: decoded.name,
                        description: decoded.description,
                        uri: decoded.uri,
                        isActive: decoded.isActive ?? true,
                        bump: decoded.bump,
                        image: decoded.uri,
                        isOwned: ownedMints.has(decoded.mint.toString()),
                    });
                } catch (err) {
                    // Try to decode as old schema (without name and description)
                    try {
                        // Manual decoding for old badge schema
                        // Old schema: creator (32), price (8), mint (32), badgeId (4+len), uri (4+len), bump (1)
                        const data = account.data;
                        let offset = 8; // Skip discriminator

                        // Read creator (32 bytes)
                        const creator = new PublicKey(data.slice(offset, offset + 32));
                        offset += 32;

                        // Read price (8 bytes, little-endian u64)
                        const price = data.readBigUInt64LE(offset);
                        offset += 8;

                        // Read mint (32 bytes)
                        const mint = new PublicKey(data.slice(offset, offset + 32));
                        offset += 32;

                        // Read badgeId (string with 4-byte length prefix)
                        const badgeIdLen = data.readUInt32LE(offset);
                        offset += 4;
                        const badgeId = data.slice(offset, offset + badgeIdLen).toString('utf8');
                        offset += badgeIdLen;

                        // Read uri (string with 4-byte length prefix)
                        const uriLen = data.readUInt32LE(offset);
                        offset += 4;
                        const uri = data.slice(offset, offset + uriLen).toString('utf8');
                        offset += uriLen;

                        // Read bump (1 byte)
                        const bump = data.readUInt8(offset);

                        console.log(`Legacy Badge ${badgeId}: defaulting isActive to true`);

                        badgesData.push({
                            creator,
                            price,
                            mint,
                            badgeId,
                            name: badgeId, // Use badgeId as fallback name
                            description: 'Legacy Badge', // Default description for old badges
                            uri,
                            isActive: true, // Legacy badges default to active
                            bump,
                            image: uri,
                            isOwned: ownedMints.has(mint.toString()),
                        });
                    } catch (legacyErr) {
                        // If even legacy decoding fails, skip this account
                        console.warn(`Failed to decode badge account ${pubkey.toString()} as both new and legacy schema:`, legacyErr);
                    }
                }
            }

            console.log(`Total badges loaded: ${badgesData.length}\n`);
            // Show all badges (users always see NFTs)
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

    const handleTogglePause = async (badge: BadgeWithMetadata) => {
        console.log('\n=== TOGGLE PAUSE DEBUG ===');
        console.log('Badge Data:', JSON.stringify({
            name: badge.name,
            badgeId: badge.badgeId,
            creator: badge.creator.toString(),
            isActive: badge.isActive,
            description: badge.description,
        }, null, 2));

        if (selectedChain !== 'solana' || !solanaWallet?.address) {
            Alert.alert('Error', 'Please connect your Solana wallet');
            return;
        }

        // Check if user is the creator
        if (badge.creator.toString() !== solanaWallet.address) {
            Alert.alert('Error', 'Only the badge creator can pause/unpause badges');
            return;
        }

        // Check if this is a legacy badge (created before isActive field was added)
        // Legacy badges will have description === 'Legacy Badge'
        if (badge.description === 'Legacy Badge') {
            Alert.alert(
                'Legacy Badge',
                'This badge was created before the pause feature was added and cannot be paused. Only newly created badges support pause/unpause functionality.',
                [{ text: 'OK' }]
            );
            return;
        }

        const action = badge.isActive ? 'pause' : 'unpause';
        console.log('Action to perform:', action);

        Alert.alert(
            `${action.charAt(0).toUpperCase() + action.slice(1)} Badge`,
            `Are you sure you want to ${action} "${badge.name}"?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: action.charAt(0).toUpperCase() + action.slice(1),
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
                            const creator = new PublicKey(solanaWallet.address);

                            const program = new Program(
                                badgePlatformIdl as any,
                                new AnchorProvider(connection, solanaWallet as any, {})
                            );

                            console.log('Creating instruction for badgeId:', badge.badgeId);
                            // Use the appropriate instruction based on current state
                            const instruction = badge.isActive
                                ? await createDeactivateBadgeInstruction(program, creator, badge.badgeId)
                                : await createReactivateBadgeInstruction(program, creator, badge.badgeId);

                            const transaction = new Transaction().add(instruction);
                            const { blockhash } = await connection.getLatestBlockhash();
                            transaction.recentBlockhash = blockhash;
                            transaction.feePayer = creator;

                            console.log('Sending transaction...');
                            // Sign and send with Privy provider
                            const { signature } = await provider.request({
                                method: 'signAndSendTransaction',
                                params: {
                                    transaction,
                                    connection,
                                },
                            });

                            console.log('Transaction signature:', signature);

                            Alert.alert(
                                'Success!',
                                `Badge ${action}d successfully!\n\nSignature: ${signature.slice(0, 8)}...`
                            );

                            console.log('Refreshing badges...');
                            // Refresh badges
                            await fetchBadges();
                            console.log('Badges refreshed');
                        } catch (error) {
                            console.error(`Error ${action}ing badge:`, error);
                            Alert.alert('Error', `Failed to ${action} badge: ${error instanceof Error ? error.message : 'Unknown error'}`);
                        } finally {
                            setLoading(false);
                            console.log('=== END TOGGLE PAUSE DEBUG ===\n');
                        }
                    },
                },
            ]
        );
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

    // Filter badges based on selected filter
    const filteredBadges = badges.filter(badge => {
        if (filter === 'live') return badge.isActive;
        if (filter === 'paused') return !badge.isActive;
        return true; // 'all'
    });

    const cycleFilter = () => {
        setFilter(current => {
            if (current === 'all') return 'live';
            if (current === 'live') return 'paused';
            return 'all';
        });
    };

    const getFilterIcon = () => {
        if (filter === 'all') return 'apps';
        if (filter === 'live') return 'play-circle';
        return 'pause-circle';
    };

    const getFilterColor = () => {
        if (filter === 'all') return theme.colors.text;
        if (filter === 'live') return '#34C759';
        return '#FF9500';
    };

    return (
        <SafeAreaView style={{ flex: 1 }} edges={['top']}>
            <SolanaNetworkWarning>
                <View style={styles.header}>
                    <Text style={[styles.title, { color: theme.colors.text }]}>
                        Browse Badges
                    </Text>
                    <View style={styles.headerButtons}>
                        <TouchableOpacity
                            onPress={cycleFilter}
                            style={styles.filterButton}
                        >
                            <Ionicons name={getFilterIcon()} size={28} color={getFilterColor()} />
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={() => setIsCreateModalVisible(true)}
                            style={styles.createButton}
                        >
                            <Ionicons name="add-circle" size={32} color={theme.colors.primary} />
                        </TouchableOpacity>
                    </View>
                </View>

                <BadgeGrid
                    badges={filteredBadges}
                    onBadgePress={handlePurchase}
                    onTogglePause={handleTogglePause}
                    onRefresh={handleRefresh}
                    refreshing={refreshing}
                    showPurchaseButton={true}
                    creatorWallet={solanaWallet?.address}
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
    headerButtons: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    filterButton: {
        padding: 4,
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
