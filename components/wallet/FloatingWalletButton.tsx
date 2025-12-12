import React, { useState, useMemo } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    Modal,
    StyleSheet,
    Pressable,
} from 'react-native';
import { useTheme } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useWallet } from '@/context/WalletContext';
import { ChainSelector } from '@/components/walletActions/ChainSelector';
import { Dropdown } from '@/components/ui/Dropdown';
import { Layout, FontSize, BorderRadius, Spacing } from '@/constants/Colors';

const CHAIN_ICONS: Record<string, string> = {
    ethereum: 'logo-electron',
    solana: 'sunny',
    'bitcoin-segwit': 'logo-bitcoin',
    stellar: 'planet',
    cosmos: 'planet-outline',
    near: 'infinite',
};

export const FloatingWalletButton: React.FC = () => {
    const [modalVisible, setModalVisible] = useState(false);
    const theme = useTheme();
    const insets = useSafeAreaInsets();
    const {
        selectedChain,
        setSelectedChain,
        selectedWalletIndex,
        setSelectedWalletIndex,
        activeWallets,
        currentWallet,
    } = useWallet();

    // Helper to format address
    const formatAddress = (address: string) => {
        if (!address) return '';
        return `${address.slice(0, 6)}...${address.slice(-4)}`;
    };

    const walletOptions = useMemo(() => {
        return activeWallets?.map((w, index) => {
            const address = (w as any).address || (w as any).publicKey;
            return {
                label: `Wallet ${index + 1} (${formatAddress(address)})`,
                value: index,
            };
        }) || [];
    }, [activeWallets]);

    const chainIcon = CHAIN_ICONS[selectedChain] || 'wallet';

    return (
        <>
            {/* Floating Button */}
            <TouchableOpacity
                style={[
                    styles.floatingButton,
                    {
                        top: insets.top + 16,
                        left: insets.left + 16,
                        backgroundColor: theme.colors.primary,
                        shadowColor: theme.colors.primary,
                    },
                ]}
                onPress={() => setModalVisible(true)}
                activeOpacity={0.8}
            >
                <Ionicons name={chainIcon as any} size={24} color="#fff" />
            </TouchableOpacity>

            {/* Modal */}
            <Modal
                visible={modalVisible}
                transparent
                animationType="fade"
                onRequestClose={() => setModalVisible(false)}
            >
                <Pressable
                    style={styles.modalOverlay}
                    onPress={() => setModalVisible(false)}
                >
                    <Pressable
                        style={[
                            styles.modalContent,
                            { backgroundColor: theme.colors.card },
                        ]}
                        onPress={(e) => e.stopPropagation()}
                    >
                        {/* Header */}
                        <View style={styles.modalHeader}>
                            <Text style={[styles.modalTitle, { color: theme.colors.text }]}>
                                Wallet Settings
                            </Text>
                            <TouchableOpacity
                                onPress={() => setModalVisible(false)}
                                style={styles.closeButton}
                            >
                                <Ionicons name="close" size={24} color={theme.colors.text} />
                            </TouchableOpacity>
                        </View>

                        {/* Content */}
                        <View style={styles.modalBody}>
                            <ChainSelector
                                selectedChain={selectedChain}
                                onSelectChain={setSelectedChain}
                            />

                            {activeWallets && activeWallets.length > 0 ? (
                                <View>
                                    <Text
                                        style={{
                                            color: theme.colors.text,
                                            marginBottom: 8,
                                            fontWeight: '600',
                                        }}
                                    >
                                        Select Wallet
                                    </Text>
                                    <Dropdown
                                        options={walletOptions}
                                        selectedValue={selectedWalletIndex}
                                        onSelect={setSelectedWalletIndex}
                                        disabled={activeWallets.length <= 1}
                                    />
                                </View>
                            ) : (
                                <Text
                                    style={{
                                        color: theme.colors.text,
                                        fontStyle: 'italic',
                                        opacity: 0.7,
                                    }}
                                >
                                    No active wallets for {selectedChain}
                                </Text>
                            )}
                        </View>
                    </Pressable>
                </Pressable>
            </Modal>
        </>
    );
};

const styles = StyleSheet.create({
    floatingButton: {
        position: 'absolute',
        width: 56,
        height: 56,
        borderRadius: 28,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        width: '85%',
        maxWidth: 400,
        borderRadius: BorderRadius.lg,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.2,
        shadowRadius: 16,
        elevation: 10,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: Layout.padding,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(128, 128, 128, 0.2)',
    },
    modalTitle: {
        fontSize: FontSize.xl,
        fontWeight: '700',
    },
    closeButton: {
        padding: 4,
    },
    modalBody: {
        padding: Layout.padding,
    },
});
