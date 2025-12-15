import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, useColorScheme, Dimensions, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { Colors } from '@/constants/Colors';
import { CampaignCard } from '@/components/captain-sol/CampaignCard';
import { Campaign } from '@/utils/ui_types';
import { ScreenScrollView } from '@/components/layout/ScreenScrollView';
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { fetchCampaigns, CAPTAIN_SOL_PROGRAM_ID } from '@/utils/campaign_client';
import { Program, AnchorProvider } from '@coral-xyz/anchor';
import { useWallet } from '@/context/WalletContext';
import { getConnection } from '@/utils/solana_utils';
import { PublicKey, Transaction } from '@solana/web3.js';
import IDL from '@/captain_sol.json';

export default function HomeScreen() {
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? 'light'];
    const router = useRouter();

    // Use custom wallet context
    const { currentWallet } = useWallet();
    const connection = useMemo(() => getConnection(), []);

    const [campaigns, setCampaigns] = useState<Campaign[]>([]);
    const [loading, setLoading] = useState(true);

    const [refreshing, setRefreshing] = useState(false);

    const loadCampaigns = useCallback(async () => {
        try {
            // Create a provider (Read-only if wallet not connected, or just wrapping the address if connected)
            // For fetching data, we don't strictly need a signer, but Anchor Program expects a provider.

            const walletInterface = currentWallet
                ? {
                    publicKey: new PublicKey(currentWallet.address),
                    signTransaction: async <T extends Transaction | { version: number }>(tx: T) => tx,
                    signAllTransactions: async <T extends Transaction | { version: number }>(txs: T[]) => txs,
                }
                : {
                    publicKey: new PublicKey('11111111111111111111111111111111'), // Read-only view
                    signTransaction: async <T extends Transaction | { version: number }>(tx: T) => tx,
                    signAllTransactions: async <T extends Transaction | { version: number }>(txs: T[]) => txs,
                };

            const provider = new AnchorProvider(connection, walletInterface as any, {
                preflightCommitment: 'confirmed'
            });

            // Construct program
            const program = new Program(IDL as any, provider);

            const data = await fetchCampaigns(connection, program);
            setCampaigns(data);
        } catch (error) {
            console.error("Failed to fetch campaigns:", error);
            setCampaigns([]);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [currentWallet, connection]);

    useFocusEffect(
        useCallback(() => {
            loadCampaigns();
        }, [loadCampaigns])
    );

    const onRefresh = () => {
        setRefreshing(true);
        loadCampaigns();
    };

    // Filter active campaigns
    // Note: Verify 'status' field structure from IDL. IDL keeps keys lowerCamelCase often, 
    // but the Campaign type might have 'active' or { active: {} }.
    // Looking at IDL: "variants": [{"name": "active"}, ...]
    // Anchor usually decodes enums as { active: {} } or similar.
    // The previous code checked `c.status === 'Active'`.
    // I should check how `fetchCampaigns` returns data.
    // For now keeping loose check.

    const featuredCampaigns = campaigns.filter(c => {
        const s = c.status as any;
        return s === 'Active' || s === 'active' || !!s?.active;
    });
    const allCampaigns = campaigns;

    return (
        <ScreenScrollView
            backgroundColor={theme.background}
            refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.primary} />
            }
        >

            {/* Header */}
            <View style={styles.header}>
                <View>
                    <Text style={[styles.headerTitle, { color: theme.text }]}>Captain Sol</Text>
                    <Text style={[styles.headerSubtitle, { color: theme.icon }]}>Master the seas of Solana</Text>
                </View>
                <TouchableOpacity
                    style={[styles.createButton, { backgroundColor: theme.primary }]}
                    onPress={() => router.push('/create-campaign')}
                >
                    <Ionicons name="add" size={24} color="#fff" />
                </TouchableOpacity>
            </View>

            {
                loading ? (
                    <View style={{ padding: 20 }} >
                        <ActivityIndicator size="large" color={theme.primary} />
                        <Text style={{ textAlign: 'center', marginTop: 10, color: theme.text }}>Loading Campaigns...</Text>
                    </View >
                ) : (
                    <>
                        {/* Featured Section (Large Squares) */}
                        <View style={styles.section}>
                            <Text style={[styles.sectionTitle, { color: theme.text }]}>Featured Voyages</Text>
                            <ScrollView
                                horizontal
                                showsHorizontalScrollIndicator={false}
                                contentContainerStyle={styles.featuredContainer}
                                decelerationRate="fast"
                                snapToInterval={Dimensions.get('window').width * 0.8 + 16} // card width + margin
                                snapToAlignment="start"
                            >
                                {featuredCampaigns.map((campaign, index) => (
                                    <CampaignCard
                                        key={index}
                                        campaign={campaign}
                                        variant="large"
                                        onPress={() => console.log('Campaign pressed:', campaign.ipfs_hash.title)}
                                    />
                                ))}
                                {featuredCampaigns.length === 0 && (
                                    <View style={{ padding: 20 }}>
                                        <Text style={{ color: theme.icon }}>No active campaigns found.</Text>
                                    </View>
                                )}
                            </ScrollView>
                        </View>
                    </>
                )
            }

        </ScreenScrollView >
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        paddingHorizontal: 20,
        paddingTop: 10,
        paddingBottom: 10,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center', // Align title and button
    },
    headerTitle: {
        fontSize: 34,
        fontWeight: '800',
        letterSpacing: -1,
    },
    headerSubtitle: {
        fontSize: 16,
        marginTop: 4,
    },
    section: {
        marginTop: 24,
    },
    sectionTitle: {
        fontSize: 22,
        fontWeight: '700',
        paddingHorizontal: 20,
        marginBottom: 16,
    },
    featuredContainer: {
        paddingHorizontal: 20,
        paddingBottom: 10, // Add some padding for shadow
    },
    gridContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        paddingHorizontal: 20,
        justifyContent: 'space-between', // Using space-between to push items to edges
    },
    createButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
});
