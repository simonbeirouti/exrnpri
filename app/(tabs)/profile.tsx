import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@react-navigation/native';
import { PublicKey, Transaction } from '@solana/web3.js';

import { Program, AnchorProvider } from '@coral-xyz/anchor';
import { BadgeGrid } from '@/components/badges/BadgeGrid';
import { SolanaNetworkWarning } from '@/components/badges/SolanaNetworkWarning';
import { BadgeWithMetadata } from '@/utils/badge_types';
import { getConnection, createBurnBadgeInstruction, getOwnedBadgeMints } from '@/utils/badge_client';
import { FontSize, Spacing, Layout } from '@/constants/Colors';
import { useWallet } from '@/context/WalletContext';
import { useBadgeContext } from '@/context/BadgeContext';
import { BadgePlatform } from '@/utils/badge_platform';
import badgePlatformIdl from '@/badge_platform.json';

export default function ProfilePage() {
    const theme = useTheme();
    const { currentWallet, selectedChain } = useWallet();
    const { profileRefreshVersion } = useBadgeContext();
    const solanaWallet = currentWallet;
    const [ownedBadges, setOwnedBadges] = useState<BadgeWithMetadata[]>([]);
    const [loading, setLoading] = useState(false);

    const fetchOwnedBadges = async () => {
        if (selectedChain !== 'solana' || !solanaWallet?.address) return;

        setLoading(true);
        try {
            const connection = getConnection();
            const owner = new PublicKey(solanaWallet.address);

            // 1. Fetch user's token accounts
            const ownedMints = await getOwnedBadgeMints(connection, owner);

            // 2. Fetch all badge accounts from program manually
            const provider = new AnchorProvider(connection, solanaWallet as any, {});
            const program = new Program<BadgePlatform>(badgePlatformIdl as BadgePlatform, provider);

            const accounts = await connection.getProgramAccounts(program.programId);

            // 3. Manually deserialize and filter owned badges
            const ownedBadgesData: BadgeWithMetadata[] = [];
            for (const { account, pubkey } of accounts) {
                try {
                    const decoded = program.coder.accounts.decode('badge', account.data);

                    // Only include if user owns this badge
                    if (ownedMints.has(decoded.mint.toString())) {
                        ownedBadgesData.push({
                            creator: decoded.creator,
                            price: decoded.price,
                            mint: decoded.mint,
                            badgeId: decoded.badgeId,
                            name: decoded.name,
                            description: decoded.description,
                            uri: decoded.uri,
                            bump: decoded.bump,
                            image: decoded.uri,
                            isOwned: true,
                        });
                    }
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

                        // Only include if user owns this badge
                        if (ownedMints.has(mint.toString())) {
                            ownedBadgesData.push({
                                creator,
                                price,
                                mint,
                                badgeId,
                                name: badgeId, // Use badgeId as fallback name
                                description: 'Legacy Badge', // Default description
                                uri,
                                bump,
                                image: uri,
                                isOwned: true,
                            });
                        }
                    } catch (legacyErr) {
                        console.warn(`Failed to decode badge account ${pubkey.toString()} as both new and legacy schema:`, legacyErr);
                    }
                }
            }

            setOwnedBadges(ownedBadgesData);
        } catch (error) {
            console.error('Error fetching owned badges:', error);
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
            setOwnedBadges(current => current.filter(b => b.mint.toString() !== badge.mint.toString()));

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

    return (
        <SafeAreaView style={{ flex: 1 }} edges={['top']}>
            {/* Owned Badges Grid */}
            <View style={styles.badgesSection}>
                <SolanaNetworkWarning>
                    <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
                        My Badges
                    </Text>

                    <BadgeGrid
                        badges={ownedBadges}
                        onRefresh={handleRefresh}
                        refreshing={loading}
                        showOwnedIndicator={true}
                        emptyMessage="You don't own any badges yet. Browse and purchase your first badge!"
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
        padding: Layout.padding,
        borderBottomWidth: 1,
        borderBottomColor: '#00000011',
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
        padding: Layout.padding,
    },
});
