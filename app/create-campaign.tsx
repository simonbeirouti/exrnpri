import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, Image, Modal, ScrollView, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { ScreenScrollView } from '@/components/layout/ScreenScrollView';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useWallet } from '@/context/WalletContext';
import { getConnection } from '@/utils/solana_utils';
import { PublicKey, Transaction } from '@solana/web3.js';
import { Program, AnchorProvider, BN } from '@coral-xyz/anchor';
import IDL from '@/captain_sol.json';
import {
    CAPTAIN_SOL_PROGRAM_ID,
    uploadCampaignMetadata,
    createInitializeCampaignInstruction,
    createAddModuleInstruction,
    generateCampaignId,
    ModuleData
} from '@/utils/campaign_client';
import { QuizVerifier } from '@/utils/QuizVerifier';
import QuizCreator from '@/components/QuizCreator';

export default function CreateCampaignScreen() {
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? 'light'];
    const router = useRouter();
    const { currentWallet } = useWallet();
    const connection = getConnection();

    const [loading, setLoading] = useState(false);

    // Campaign State
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [bannerImage, setBannerImage] = useState<string | null>(null);
    const [nftLimit, setNftLimit] = useState('100');

    // Duration State
    const [durationValue, setDurationValue] = useState('7');
    const [durationUnit, setDurationUnit] = useState<'minutes' | 'hours' | 'days'>('days');

    // Modules State
    const [modules, setModules] = useState<ModuleData[]>([]);

    // Module Modal State
    const [showModuleModal, setShowModuleModal] = useState(false);
    const [currentModuleId, setCurrentModuleId] = useState<number>(0);
    const [modTitle, setModTitle] = useState('');
    const [modDesc, setModDesc] = useState('');
    const [modContent, setModContent] = useState('');
    const [modDuration, setModDuration] = useState('5 min');
    const [modQuizQuestions, setModQuizQuestions] = useState<any[]>([]);
    const [showQuizCreator, setShowQuizCreator] = useState(false);

    const pickImage = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [16, 9],
            quality: 0.8,
        });

        if (!result.canceled) {
            setBannerImage(result.assets[0].uri);
        }
    };

    const handleAddModule = () => {
        if (!modTitle || !modDesc || !modContent) {
            Alert.alert('Error', 'Please fill in required module fields');
            return;
        }

        const newModule: ModuleData = {
            id: currentModuleId,
            title: modTitle,
            description: modDesc,
            content_url: 'bafkreidnchqryvj6i32fkowoofbtuau2dwscffmls',
            duration: modDuration,
            quiz: modQuizQuestions.length > 0 ? {
                questions: modQuizQuestions,
                correct_answer_hash: QuizVerifier.generateHash(
                    modQuizQuestions.map(q => q.correctAnswerIndex)
                )
            } : undefined
        };

        setModules([...modules, { ...newModule, id: modules.length }]);
        resetModuleForm();
    };

    const resetModuleForm = () => {
        setModTitle('');
        setModDesc('');
        setModContent('');
        setModDuration('5 min');
        setModQuizQuestions([]);
        setShowModuleModal(false);
    };

    const removeModule = (index: number) => {
        const newModules = modules.filter((_, i) => i !== index);
        setModules(newModules.map((m, i) => ({ ...m, id: i })));
    };

    const calculateTimes = () => {
        const now = Date.now();
        const value = parseInt(durationValue) || 0;
        let multiplier = 1000 * 60; // minutes
        if (durationUnit === 'hours') multiplier *= 60;
        if (durationUnit === 'days') multiplier *= 60 * 24;

        const end = now + (value * multiplier);
        return { start: now, end };
    };

    const handleCreateCampaign = async () => {
        if (!currentWallet) {
            Alert.alert('Error', 'Please connect your wallet first');
            return;
        }
        if (!title || !description || !bannerImage) {
            Alert.alert('Error', 'Please fill in all campaign details');
            return;
        }
        if (modules.length === 0) {
            Alert.alert('Error', 'Please add at least one module');
            return;
        }
        if (!nftLimit || parseInt(nftLimit) <= 0) {
            Alert.alert('Error', 'Please enter a valid NFT Limit');
            return;
        }

        setLoading(true);
        try {
            // 1. Upload Metadata
            const ipfsHash = await uploadCampaignMetadata({
                title,
                description,
                banner_image: bannerImage,
                modules
            });

            console.log("Uploaded Metadata IPFS Hash:", ipfsHash);
            console.log("IPFS Hash Length:", ipfsHash.length);

            // 2. Setup Provider/Program
            const walletInterface = {
                publicKey: new PublicKey(currentWallet.address),
                signTransaction: async (tx: Transaction) => tx,
                signAllTransactions: async (txs: Transaction[]) => txs,
            };

            const provider = new AnchorProvider(connection, walletInterface as any, {
                preflightCommitment: 'confirmed'
            });
            const program = new Program(IDL as any, provider);

            const campaignId = generateCampaignId();
            const creatorKey = new PublicKey(currentWallet.address);

            // 3. Calculate Times
            const { start, end } = calculateTimes();

            // 4. Create Instructions
            const initIx = await createInitializeCampaignInstruction(
                program,
                creatorKey,
                campaignId,
                ipfsHash,
                Math.floor(start / 1000),
                Math.floor(end / 1000),
                modules.length,
                parseInt(nftLimit)
            );

            const moduleIxs = await Promise.all(
                modules.map(m => createAddModuleInstruction(
                    program,
                    creatorKey,
                    campaignId,
                    m.id,
                    ipfsHash
                ))
            );

            // 5. Build Transaction
            const transaction = new Transaction();
            transaction.add(initIx);
            moduleIxs.forEach(ix => transaction.add(ix));

            const { blockhash } = await connection.getLatestBlockhash();
            transaction.recentBlockhash = blockhash;
            transaction.feePayer = creatorKey;

            if (currentWallet) {
                // Get the standard EIP-1193 provider
                const walletProvider = await (currentWallet as any).getProvider();

                if (!walletProvider) {
                    throw new Error("Wallet provider not found");
                }

                const { signature } = await walletProvider.request({
                    method: 'signAndSendTransaction',
                    params: {
                        transaction,
                        connection,
                    },
                });

                console.log("Transaction signature:", signature);
                await connection.confirmTransaction(signature);

                Alert.alert("Success", "Campaign Created!");
                router.back();
            } else {
                console.log("Transaction:", transaction);
                throw new Error("Wallet not connected");
            }

        } catch (e: any) {
            console.error(e);
            Alert.alert("Error", e.message || "Failed to create campaign");
        } finally {
            setLoading(false);
        }
    };

    return (
        <ScreenScrollView backgroundColor={theme.background}>

            <View style={styles.container}>
                <Text style={[styles.title, { color: theme.text }]}>New Voyage</Text>

                {/* Banner Image */}
                <TouchableOpacity onPress={pickImage} style={[styles.imagePicker, { borderColor: theme.border, backgroundColor: theme.cardBackground }]}>
                    {bannerImage ? (
                        <Image source={{ uri: bannerImage }} style={styles.bannerImage} />
                    ) : (
                        <View style={styles.imagePlaceholder}>
                            <Ionicons name="image-outline" size={48} color={theme.icon} />
                            <Text style={{ color: theme.icon, marginTop: 12, fontSize: 16 }}>Tap to add cover image</Text>
                        </View>
                    )}
                </TouchableOpacity>

                {/* Details Form */}
                <View style={styles.formGroup}>
                    <Text style={[styles.label, { color: theme.text }]}>Title</Text>
                    <TextInput
                        style={[styles.input, { color: theme.text, borderColor: theme.border, backgroundColor: theme.cardBackground }]}
                        placeholder="Campaign Title"
                        placeholderTextColor={theme.icon}
                        value={title}
                        onChangeText={setTitle}
                    />
                </View>

                <View style={styles.formGroup}>
                    <Text style={[styles.label, { color: theme.text }]}>Description</Text>
                    <TextInput
                        style={[styles.input, { color: theme.text, borderColor: theme.border, backgroundColor: theme.cardBackground, height: 120, paddingTop: 12 }]}
                        placeholder="Describe your campaign..."
                        placeholderTextColor={theme.icon}
                        multiline
                        textAlignVertical="top"
                        value={description}
                        onChangeText={setDescription}
                    />
                </View>

                {/* Duration Picker */}
                <View style={styles.formGroup}>
                    <Text style={[styles.label, { color: theme.text }]}>Duration</Text>
                    <View style={styles.durationRow}>
                        <TextInput
                            style={[styles.input, styles.durationInput, { color: theme.text, borderColor: theme.border, backgroundColor: theme.cardBackground }]}
                            keyboardType="numeric"
                            value={durationValue}
                            onChangeText={setDurationValue}
                        />
                        <View style={styles.unitSelector}>
                            {(['minutes', 'hours', 'days'] as const).map((unit) => (
                                <TouchableOpacity
                                    key={unit}
                                    style={[
                                        styles.unitButton,
                                        {
                                            backgroundColor: durationUnit === unit ? theme.primary : theme.cardBackground,
                                            borderColor: theme.border
                                        }
                                    ]}
                                    onPress={() => setDurationUnit(unit)}
                                >
                                    <Text style={{
                                        color: durationUnit === unit ? '#fff' : theme.text,
                                        fontWeight: durationUnit === unit ? 'bold' : 'normal'
                                    }}>
                                        {unit.charAt(0).toUpperCase() + unit.slice(1)}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                </View>

                <View style={styles.formGroup}>
                    <Text style={[styles.label, { color: theme.text }]}>NFT Limit</Text>
                    <TextInput
                        style={[styles.input, { color: theme.text, borderColor: theme.border, backgroundColor: theme.cardBackground }]}
                        keyboardType="numeric"
                        placeholder="e.g. 100"
                        placeholderTextColor={theme.icon}
                        value={nftLimit}
                        onChangeText={setNftLimit}
                    />
                </View>

                {/* Modules Section */}
                <View style={styles.sectionHeader}>
                    <Text style={[styles.sectionTitle, { color: theme.text }]}>Modules ({modules.length})</Text>
                    <TouchableOpacity onPress={() => setShowModuleModal(true)} style={styles.addModuleBtn}>
                        <Ionicons name="add-circle" size={20} color={theme.primary} />
                        <Text style={{ color: theme.primary, fontWeight: '600', marginLeft: 4 }}>Add Module</Text>
                    </TouchableOpacity>
                </View>

                {modules.map((m, index) => (
                    <View key={index} style={[styles.moduleCard, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
                        <View style={{ flex: 1 }}>
                            <Text style={{ color: theme.text, fontWeight: 'bold', fontSize: 16 }}>{index + 1}. {m.title}</Text>
                            <Text style={{ color: theme.icon, fontSize: 14, marginTop: 4 }}>{m.duration} • {m.quiz ? `${m.quiz.questions.length} Questions` : 'No Quiz'}</Text>
                        </View>
                        <TouchableOpacity onPress={() => removeModule(index)} style={{ padding: 8 }}>
                            <Ionicons name="trash-outline" size={22} color="red" />
                        </TouchableOpacity>
                    </View>
                ))}

                <TouchableOpacity
                    style={[styles.submitButton, { backgroundColor: theme.primary, opacity: loading ? 0.7 : 1 }]}
                    onPress={handleCreateCampaign}
                    disabled={loading}
                >
                    {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitText}>Create Campaign</Text>}
                </TouchableOpacity>

                {/* Module Modal */}
                <Modal visible={showModuleModal} animationType="slide" presentationStyle="pageSheet">
                    <View style={[styles.modalContainer, { backgroundColor: theme.background }]}>
                        <View style={styles.modalHeader}>
                            <TouchableOpacity onPress={resetModuleForm}>
                                <Text style={{ color: theme.primary, fontSize: 16 }}>Cancel</Text>
                            </TouchableOpacity>
                            <Text style={[styles.modalTitle, { color: theme.text }]}>Add Module</Text>
                            <TouchableOpacity onPress={handleAddModule}>
                                <Text style={{ color: theme.primary, fontWeight: 'bold', fontSize: 16 }}>Add</Text>
                            </TouchableOpacity>
                        </View>
                        <ScrollView contentContainerStyle={{ padding: 20 }}>
                            <View style={styles.formGroup}>
                                <Text style={[styles.label, { color: theme.text }]}>Module Title</Text>
                                <TextInput
                                    style={[styles.input, { color: theme.text, borderColor: theme.border, backgroundColor: theme.cardBackground }]}
                                    placeholder="e.g. Intro to Solana"
                                    placeholderTextColor={theme.icon}
                                    value={modTitle}
                                    onChangeText={setModTitle}
                                />
                            </View>

                            <View style={styles.formGroup}>
                                <Text style={[styles.label, { color: theme.text }]}>Description</Text>
                                <TextInput
                                    style={[styles.input, { color: theme.text, borderColor: theme.border, backgroundColor: theme.cardBackground, height: 100, paddingTop: 12 }]}
                                    placeholder="What will users learn?"
                                    placeholderTextColor={theme.icon}
                                    multiline
                                    textAlignVertical="top"
                                    value={modDesc}
                                    onChangeText={setModDesc}
                                />
                            </View>

                            <View style={styles.formGroup}>
                                <Text style={[styles.label, { color: theme.text }]}>Content URL</Text>
                                <TextInput
                                    style={[styles.input, { color: theme.text, borderColor: theme.border, backgroundColor: theme.cardBackground }]}
                                    placeholder="Link to video or article"
                                    placeholderTextColor={theme.icon}
                                    value={modContent}
                                    onChangeText={setModContent}
                                />
                            </View>

                            <View style={styles.formGroup}>
                                <Text style={[styles.label, { color: theme.text }]}>Duration</Text>
                                <TextInput
                                    style={[styles.input, { color: theme.text, borderColor: theme.border, backgroundColor: theme.cardBackground }]}
                                    placeholder="e.g. 5 min"
                                    placeholderTextColor={theme.icon}
                                    value={modDuration}
                                    onChangeText={setModDuration}
                                />
                            </View>

                            <TouchableOpacity
                                style={[styles.quizButton, { borderColor: theme.primary, backgroundColor: theme.cardBackground }]}
                                onPress={() => setShowQuizCreator(true)}
                            >
                                <Ionicons name="school-outline" size={24} color={theme.primary} />
                                <Text style={{ color: theme.primary, marginLeft: 12, fontSize: 16, fontWeight: '600' }}>
                                    {modQuizQuestions.length > 0 ? `Edit Quiz (${modQuizQuestions.length} Qs)` : 'Add Quiz'}
                                </Text>
                            </TouchableOpacity>
                        </ScrollView>
                    </View>
                </Modal>

                <QuizCreator
                    visible={showQuizCreator}
                    onClose={() => setShowQuizCreator(false)}
                    initialQuestions={modQuizQuestions}
                    onSave={(questions) => {
                        setModQuizQuestions(questions);
                        setShowQuizCreator(false);
                    }}
                />

            </View>
        </ScreenScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 24,
        // paddingBottom: 120,
    },
    title: {
        fontSize: 32,
        fontWeight: '800',
        marginBottom: 24,
    },
    imagePicker: {
        height: 200,
        borderRadius: 16,
        borderWidth: 1,
        borderStyle: 'dashed',
        overflow: 'hidden',
        marginBottom: 24,
        justifyContent: 'center',
        alignItems: 'center',
    },
    bannerImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    imagePlaceholder: {
        alignItems: 'center',
    },
    formGroup: {
        marginBottom: 20,
    },
    label: {
        fontSize: 15,
        fontWeight: '600',
        marginBottom: 8,
        marginLeft: 4,
    },
    input: {
        borderWidth: 1,
        borderRadius: 12,
        padding: 16,
        fontSize: 16,
    },
    durationRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    durationInput: {
        flex: 1,
        textAlign: 'center',
    },
    unitSelector: {
        flexDirection: 'row',
        gap: 8,
    },
    unitButton: {
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 12,
        borderWidth: 1,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 12,
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: '700',
    },
    addModuleBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 8,
    },
    moduleCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderWidth: 1,
        borderRadius: 14,
        marginBottom: 12,
    },
    submitButton: {
        marginTop: 40,
        borderRadius: 16,
        padding: 18,
        alignItems: 'center',
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.15,
        shadowRadius: 10,
        elevation: 5,
    },
    submitText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    modalContainer: {
        flex: 1,
        paddingTop: 20,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: '#ccc',
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: '700',
    },
    quizButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 18,
        borderWidth: 1,
        borderStyle: 'dashed',
        borderRadius: 12,
        marginTop: 12,
    },
});
