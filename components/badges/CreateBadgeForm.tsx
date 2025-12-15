import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    StyleSheet,
    TouchableOpacity,
    Alert,
    ActivityIndicator,
    Modal,
    Platform,
    KeyboardAvoidingView,
    ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@react-navigation/native';
import { usePrivy } from '@privy-io/expo';
import { Program, AnchorProvider, Wallet } from '@coral-xyz/anchor';
import { Transaction, PublicKey } from '@solana/web3.js';
import { CreateBadgeFormData } from '@/utils/badge_types';
import {
    createInitializeBadgeInstruction,
    createMintBadgeInstruction,
    getOwnedBadgeMints,
    getBadgePDA,
    getMintPDA,
    solToLamports,
    BADGE_PROGRAM_ID,
} from '@/utils/badge_client';
import { getConnection } from '@/utils/solana_utils';
import { BadgePlatform } from '@/utils/badge_platform';
import { Colors, Spacing, BorderRadius, FontSize, Layout } from '@/constants/Colors';
import badgePlatformIdl from '@/badge_platform.json';
import { useWallet } from '@/context/WalletContext';
import { Button } from '../ui/Button';

interface CreateBadgeFormProps {
    visible: boolean;
    onClose: () => void;
    onSuccess?: () => void;
}

export function CreateBadgeForm({ visible, onClose, onSuccess }: CreateBadgeFormProps) {
    const theme = useTheme();
    const { user } = usePrivy();
    const { currentWallet } = useWallet();
    const solanaWallet = currentWallet;

    const [formData, setFormData] = useState<CreateBadgeFormData>({
        badgeId: '',
        name: '',
        description: '',
        uri: '',
        price: '',
    });
    const [loading, setLoading] = useState(false);

    // Generate random badge ID on open
    React.useEffect(() => {
        if (visible) {
            const randomId = 'arm' + Math.random().toString(36).substring(2, 8); // arm + 6 random chars
            setFormData(prev => ({ ...prev, badgeId: randomId }));
        }
    }, [visible]);

    const updateField = (field: keyof CreateBadgeFormData, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const validateForm = (): boolean => {
        if (!formData.badgeId.trim()) {
            Alert.alert('Error', 'Badge ID is required');
            return false;
        }
        if (!formData.name.trim()) {
            Alert.alert('Error', 'Badge name is required');
            return false;
        }
        if (!formData.uri.trim()) {
            Alert.alert('Error', 'Badge URI is required');
            return false;
        }
        if (!formData.price || isNaN(parseFloat(formData.price)) || parseFloat(formData.price) <= 0) {
            Alert.alert('Error', 'Please enter a valid price');
            return false;
        }
        return true;
    };

    const handleCreate = async () => {
        if (!validateForm()) return;
        if (!solanaWallet?.address) {
            Alert.alert('Error', 'Please connect your Solana wallet');
            return;
        }

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

            // Build metadata URI (simple JSON for now)
            const metadata = {
                name: formData.name,
                description: formData.description,
                image: formData.uri, // For now, use URI as image
            };
            const metadataUri = formData.uri; // In production, upload to Arweave

            // Create instruction
            const creator = new PublicKey(solanaWallet.address);

            // Build transaction manually without Anchor Program wrapper
            const [badgePDA] = getBadgePDA(creator, formData.badgeId);
            const [mintPDA] = getMintPDA(badgePDA);

            const transaction = new Transaction();
            const { blockhash } = await connection.getLatestBlockhash();
            transaction.recentBlockhash = blockhash;
            transaction.feePayer = creator;

            // Add initialize badge instruction


            // Create instruction data manually (this is a simplified version)
            // In production, you'd use the full Anchor instruction builder
            const instruction = await createInitializeBadgeInstruction(
                new Program(badgePlatformIdl as any, new AnchorProvider(connection, solanaWallet as any, {})),
                creator,
                formData.badgeId,
                formData.name,
                formData.description,
                metadataUri,
                parseFloat(formData.price)
            );

            transaction.add(instruction);

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
                `Badge "${formData.name}" created successfully!\n\nSignature: ${signature.slice(0, 8)}...`,
                [
                    {
                        text: 'OK',
                        onPress: () => {
                            // Reset form
                            setFormData({
                                badgeId: '',
                                name: '',
                                description: '',
                                uri: '',
                                price: '',
                            });
                            onSuccess?.();
                        },
                    },
                ]
            );
        } catch (error) {
            console.error('Error creating badge:', error);
            Alert.alert('Error', `Failed to create badge: ${error instanceof Error ? error.message : 'Unknown error'}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <React.Fragment>
            <Modal
                visible={visible}
                transparent
                animationType="slide"
                onRequestClose={onClose}
            >
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    style={styles.modalOverlay}
                >
                    <View style={[styles.modalContent, { backgroundColor: theme.colors.card }]}>
                        <View style={styles.header}>
                            <Text style={[styles.title, { color: theme.colors.text }]}>Create New Badge</Text>
                            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                                <Ionicons name="close" size={24} color={theme.colors.text} />
                            </TouchableOpacity>
                        </View>

                        <ScrollView contentContainerStyle={styles.formContent}>
                            {/* Name and Price Row */}
                            <View style={styles.row}>
                                {/* Name (75%) */}
                                <View style={[styles.fieldContainer, { flex: 3, marginRight: Layout.gap }]}>
                                    <Text style={[styles.label, { color: theme.colors.text }]}>Badge Name *</Text>
                                    <TextInput
                                        style={[
                                            styles.input,
                                            {
                                                backgroundColor: theme.colors.background,
                                                color: theme.colors.text,
                                                borderColor: theme.colors.border,
                                            }
                                        ]}
                                        placeholder="Name"
                                        placeholderTextColor={theme.colors.text + '66'}
                                        value={formData.name}
                                        onChangeText={(value) => updateField('name', value)}
                                        editable={!loading}
                                    />
                                </View>

                                {/* Price (25%) */}
                                <View style={[styles.fieldContainer, { flex: 1 }]}>
                                    <Text style={[styles.label, { color: theme.colors.text }]}>Price *</Text>
                                    <TextInput
                                        style={[
                                            styles.input,
                                            {
                                                backgroundColor: theme.colors.background,
                                                color: theme.colors.text,
                                                borderColor: theme.colors.border,
                                            }
                                        ]}
                                        placeholder="SOL"
                                        placeholderTextColor={theme.colors.text + '66'}
                                        value={formData.price}
                                        onChangeText={(value) => updateField('price', value)}
                                        keyboardType="decimal-pad"
                                        editable={!loading}
                                    />
                                </View>
                            </View>

                            {/* URI */}
                            <View style={styles.fieldContainer}>
                                <Text style={[styles.label, { color: theme.colors.text }]}>Image URI *</Text>
                                <TextInput
                                    style={[
                                        styles.input,
                                        {
                                            backgroundColor: theme.colors.background,
                                            color: theme.colors.text,
                                            borderColor: theme.colors.border,
                                        }
                                    ]}
                                    placeholder="https://arweave.net/..."
                                    placeholderTextColor={theme.colors.text + '66'}
                                    value={formData.uri}
                                    onChangeText={(value) => updateField('uri', value)}
                                    autoCapitalize="none"
                                    editable={!loading}
                                />
                            </View>

                            {/* Description */}
                            <View style={styles.fieldContainer}>
                                <Text style={[styles.label, { color: theme.colors.text }]}>Description</Text>
                                <TextInput
                                    style={[
                                        styles.input,
                                        styles.textArea,
                                        {
                                            backgroundColor: theme.colors.background,
                                            color: theme.colors.text,
                                            borderColor: theme.colors.border,
                                        }
                                    ]}
                                    placeholder="Describe your badge..."
                                    placeholderTextColor={theme.colors.text + '66'}
                                    value={formData.description}
                                    onChangeText={(value) => updateField('description', value)}
                                    multiline
                                    numberOfLines={3}
                                    editable={!loading}
                                />
                            </View>

                            {/* Create Button */}
                            <View style={styles.buttonContainer}>
                                <Button
                                    title={loading ? 'Creating...' : `${formData.name || 'Name'} @ ${formData.price || 'Price'}`}
                                    onPress={handleCreate}
                                    loading={loading}
                                    variant="primary"
                                    size="lg"
                                    style={{ width: '100%' }}
                                />
                            </View>
                        </ScrollView>
                    </View>
                </KeyboardAvoidingView>
            </Modal>
        </React.Fragment>
    );
}

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        padding: Layout.padding,
    },
    modalContent: {
        borderRadius: Layout.borderRadius,
        padding: Layout.padding,
        maxHeight: '90%',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: Layout.padding,
    },
    closeButton: {
        padding: 4,
    },
    formContent: {
        gap: Layout.gap,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'flex-start',
    },
    title: {
        fontSize: FontSize.xl,
        fontWeight: '700',
    },
    fieldContainer: {
        // Removed marginBottom for tighter spacing
    },
    label: {
        fontSize: FontSize.md,
        fontWeight: '600',
        marginBottom: 4, // Keep tight label-input spacing
    },
    input: {
        borderWidth: 1,
        borderRadius: Layout.borderRadius,
        padding: Layout.padding,
        fontSize: FontSize.md,
    },
    textArea: {
        minHeight: 80,
        textAlignVertical: 'top',
    },
    hint: {
        fontSize: FontSize.sm,
        marginTop: 4,
    },
    buttonContainer: {
        alignItems: 'center',
    },
});
