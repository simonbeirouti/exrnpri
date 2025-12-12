import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@react-navigation/native';
import { PublicKey, Transaction } from '@solana/web3.js';

import { Program, AnchorProvider } from '@coral-xyz/anchor';
import { BadgeGrid } from '@/components/badges/BadgeGrid';
import { SolanaNetworkWarning } from '@/components/badges/SolanaNetworkWarning';
import { BadgeWithMetadata } from '@/utils/badge_types';
import { getConnection, createBurnBadgeInstruction, getOwnedBadgeMints, BADGE_PROGRAM_ID } from '@/utils/badge_client';
import { FontSize, Spacing, Layout } from '@/constants/Colors';
import { useWallet } from '@/context/WalletContext';
import { useBadgeContext } from '@/context/BadgeContext';
import { BadgePlatform } from '@/utils/badge_platform';
import badgePlatformIdl from '@/badge_platform.json';
import { Ionicons } from '@expo/vector-icons';

export default function ProfilePage() {
    const theme = useTheme();
    const { currentWallet, selectedChain } = useWallet();
    const { profileRefreshVersion } = useBadgeContext();
    const solanaWallet = currentWallet;
    const [badges, setBadges] = useState<BadgeWithMetadata[]>([]);
    const [loading, setLoading] = useState(false);
    const [filter, setFilter] = useState<'all' | 'live' | 'paused'>('all');

    const fetchOwnedBadges = async () => {
        if (selectedChain !== 'solana') return;

        setLoading(true);
        try {
            const connection = getConnection();
            const provider = new AnchorProvider(connection, solanaWallet as any, {});
            const program = new Program<BadgePlatform>(badgePlatformIdl as BadgePlatform, provider);

            // Fetch all badge accounts from program
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
                        const data = account.data;
                        let offset = 8; // Skip discriminator

                        const creator = new PublicKey(data.slice(offset, offset + 32));
                        offset += 32;

                        const price = data.readBigUInt64LE(offset);
                        offset += 8;

                        const mint = new PublicKey(data.slice(offset, offset + 32));
                        offset += 32;

                        const badgeIdLen = data.readUInt32LE(offset);
                        offset += 4;
                        const badgeId = data.slice(offset, offset + badgeIdLen).toString('utf8');
                        offset += badgeIdLen;

                        const uriLen = data.readUInt32LE(offset);
                        offset += 4;
                        const uri = data.slice(offset, offset + uriLen).toString('utf8');
                        offset += uriLen;

                        const bump = data.readUInt8(offset);

                        console.log(`Legacy Badge ${badgeId}: defaulting isActive to true`);

                        badgesData.push({
                            creator,
                            price,
                            mint,
                            badgeId,
                            name: badgeId, // Use badgeId as fallback name
                            description: 'Legacy Badge', // Default description
                            uri,
                            isActive: true, // Legacy badges default to active
                            bump,
                            image: uri,
                            isOwned: ownedMints.has(mint.toString()),
                        });
                    } catch (legacyErr) {
                        console.warn(`Failed to decode badge account ${pubkey.toString()} as both new and legacy schema:`, legacyErr);
                    }
                }
            }

            console.log(`Total badges loaded: ${badgesData.length}\n`);
            // Show all badges with owned indicators
            setBadges(badgesData);
        } catch (error) {
            console.error('Error fetching badges:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleRefresh = async () => {
        await fetchOwnedBadges();
    };

    const handleBurn = async (badge: BadgeWithMetadata) => {
        if (!solanaWallet?.address) return;

        setLoading(true);
        try {
            const provider = await solanaWallet.getProvider?.();
            if (!provider) throw new Error("Wallet provider not found");

            const connection = getConnection();
            const owner = new PublicKey(solanaWallet.address);

            // Construct instruction
            const program = new Program(badgePlatformIdl as any, new AnchorProvider(connection, solanaWallet as any, {}));

            const instruction = await createBurnBadgeInstruction(
                program,
                owner,
                badge.creator,
                badge.badgeId
            );

            const transaction = new Transaction();
            const { blockhash } = await connection.getLatestBlockhash();
            transaction.recentBlockhash = blockhash;
            transaction.feePayer = owner;
            transaction.add(instruction);

            // Sign and send
            const { signature } = await provider.request({
                method: 'signAndSendTransaction',
                params: {
                    transaction,
                    connection,
                },
            });

            Alert.alert('Success', 'Badge burned successfully!');

            // Optimistically remove badge from UI
            setBadges((current: BadgeWithMetadata[]) => current.filter((b: BadgeWithMetadata) => b.mint.toString() !== badge.mint.toString()));

            await fetchOwnedBadges(); // Refresh list to confirm
        } catch (error) {
            console.error('Error burning badge:', error);
            Alert.alert('Error', 'Failed to burn badge. See console for details.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOwnedBadges();
    }, [solanaWallet?.address, selectedChain, profileRefreshVersion]);

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
            {/* Owned Badges Grid */}
            <View style={styles.badgesSection}>
                <SolanaNetworkWarning>
                    <View style={styles.header}>
                        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
                            My Badges
                        </Text>
                        <TouchableOpacity
                            onPress={cycleFilter}
                            style={styles.filterButton}
                        >
                            <Ionicons name={getFilterIcon()} size={28} color={getFilterColor()} />
                        </TouchableOpacity>
                    </View>

                    <BadgeGrid
                        badges={filteredBadges}
                        onRefresh={handleRefresh}
                        refreshing={loading}
                        showOwnedIndicator={true}
                        emptyMessage="No badges match the current filter."
                        showPrice={false}
                        enableBurn={true}
                        onBurn={handleBurn}
                    />
                </SolanaNetworkWarning>
            </View>
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
    profileInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: Layout.gap,
    },
    avatar: {
        width: 80,
        height: 80,
        borderRadius: 40,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: Layout.padding,
    },
    userInfo: {
        flex: 1,
    },
    userName: {
        fontSize: FontSize.xl,
        fontWeight: '700',
        marginBottom: 4,
    },
    walletContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    walletAddress: {
        fontSize: FontSize.sm,
    },
    statsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginBottom: Layout.gap,
    },
    stat: {
        alignItems: 'center',
    },
    statValue: {
        fontSize: FontSize.xxxl,
        fontWeight: '700',
    },
    statLabel: {
        fontSize: FontSize.sm,
        marginTop: 4,
    },
    badgesSection: {
        flex: 1,
    },
    sectionTitle: {
        fontSize: FontSize.xxl,
        fontWeight: '700',
    },
    filterButton: {
        padding: 4,
    },
});
