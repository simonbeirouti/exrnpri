import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Animated, Pressable, Modal } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { BadgeWithMetadata } from '@/utils/badge_types';
import { lamportsToSol } from '@/utils/badge_client';
import { Colors, Spacing, BorderRadius, FontSize } from '@/constants/Colors';
import { Button } from '../ui/Button';

interface BadgeCardProps {
    badge: BadgeWithMetadata;
    onPress?: () => void;
    showPurchaseButton?: boolean;
    showOwnedIndicator?: boolean;
    showPrice?: boolean;
    enableBurn?: boolean;
    onBurn?: (badge: BadgeWithMetadata) => void;
}

export function BadgeCard({
    badge,
    onPress,
    showPurchaseButton = false,
    showOwnedIndicator = false,
    showPrice = true,
    enableBurn = false,
    onBurn
}: BadgeCardProps) {
    const theme = useTheme();
    const priceInSol = lamportsToSol(badge.price);

    // Modal state
    const [modalVisible, setModalVisible] = useState(false);
    // Animation for opening the modal (Scale/Fade effect, simpler than 3D flip to avoid artifacts)
    const openAnim = useRef(new Animated.Value(0)).current;

    // Burn interaction state
    const [burnStep, setBurnStep] = useState<'idle' | 'confirm' | 'burning'>('idle');

    // Trigger open animation when modal becomes visible
    React.useEffect(() => {
        if (modalVisible) {
            openAnim.setValue(0);
            Animated.spring(openAnim, {
                toValue: 1,
                friction: 8,
                useNativeDriver: true,
            }).start();
        }
    }, [modalVisible]);

    const openModal = () => {
        setModalVisible(true);
    };

    const closeModal = () => {
        Animated.timing(openAnim, {
            toValue: 0,
            duration: 200,
            useNativeDriver: true,
        }).start(() => {
            setModalVisible(false);
            setBurnStep('idle'); // Reset burn state
        });
    };

    const handlePress = () => {
        openModal();
    };

    const handleBurnPress = () => {
        if (burnStep === 'idle') {
            setBurnStep('confirm');
        } else if (burnStep === 'confirm') {
            setBurnStep('burning');
            setTimeout(() => {
                onBurn?.(badge);
                // Optionally close modal after burn
                closeModal();
            }, 500);
        }
    };

    return (
        <>
            {/* Thumbnail View (Grid Item) */}
            <Pressable onPress={handlePress} style={styles.thumbnailContainer}>
                <View style={[styles.thumbnail, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
                    {badge.image ? (
                        <Image
                            source={{ uri: badge.image }}
                            style={styles.image}
                            resizeMode="cover"
                        />
                    ) : (
                        <View style={[styles.imagePlaceholder, { backgroundColor: theme.colors.primary }]}>
                            <Ionicons name="ribbon" size={32} color="#fff" />
                        </View>
                    )}
                </View>
            </Pressable>

            {/* Expanded Detail View */}
            <Modal
                animationType="none"
                transparent={true}
                visible={modalVisible}
                onRequestClose={closeModal}
            >
                <View style={styles.modalOverlay}>
                    <Pressable style={styles.modalBackdrop} onPress={closeModal} />

                    <Animated.View style={[
                        styles.modalContent,
                        {
                            opacity: openAnim,
                            transform: [
                                {
                                    scale: openAnim.interpolate({
                                        inputRange: [0, 1],
                                        outputRange: [0.9, 1]
                                    })
                                }
                            ]
                        }
                    ]}>

                        <View style={[
                            styles.card,
                            {
                                backgroundColor: theme.colors.card,
                                borderColor: theme.colors.border,
                            },
                        ]}>
                            <View style={styles.imageContainer}>
                                {badge.image ? (
                                    <Image
                                        source={{ uri: badge.image }}
                                        style={styles.image}
                                        resizeMode="cover"
                                    />
                                ) : (
                                    <View style={[styles.imagePlaceholder, { backgroundColor: theme.colors.primary }]}>
                                        <Ionicons name="ribbon" size={60} color="#fff" />
                                    </View>
                                )}

                                {/* Price or Owned Overlay (Bottom Left) */}
                                {showOwnedIndicator && badge.isOwned ? (
                                    <View style={[styles.priceOverlay, { backgroundColor: theme.colors.primary }]}>
                                        <Ionicons name="checkmark-circle" size={12} color="#fff" />
                                        <Text style={styles.priceText}>Owned</Text>
                                    </View>
                                ) : showPrice && (
                                    <View style={styles.priceOverlay}>
                                        <Ionicons name="cash" size={12} color="#fff" />
                                        <Text style={styles.priceText}>
                                            {priceInSol} SOL
                                        </Text>
                                    </View>
                                )}

                                <TouchableOpacity
                                    style={styles.closeButton}
                                    onPress={closeModal}
                                >
                                    <Ionicons name="close-circle" size={28} color="rgba(0,0,0,0.5)" />
                                </TouchableOpacity>
                            </View>

                            <View style={styles.info}>
                                <Text
                                    style={[styles.name, { color: theme.colors.text }]}
                                    numberOfLines={1}
                                >
                                    {badge.name || badge.badgeId}
                                </Text>

                                {badge.description && (
                                    <Text
                                        style={[styles.description, { color: theme.colors.text + '99' }]}
                                        numberOfLines={3}
                                    >
                                        {badge.description}
                                    </Text>
                                )}

                                {showPurchaseButton && !badge.isOwned && (
                                    <Button
                                        title={`Buy for ${priceInSol} SOL`}
                                        onPress={() => {
                                            onPress?.();
                                            // Optionally close modal or wait for generic refresh
                                        }}
                                        variant="primary"
                                        size="lg"
                                        style={{ marginTop: Spacing.sm, width: '100%' }}
                                    />
                                )}

                                {enableBurn && (
                                    <View style={{ marginTop: Spacing.md }}>
                                        {burnStep === 'idle' ? (
                                            <Button
                                                title="Burn Badge"
                                                variant="outline"
                                                size="md"
                                                onPress={handleBurnPress}
                                                style={{ borderColor: '#FF3B30', borderWidth: 1 }}
                                                textStyle={{ color: '#FF3B30' }}
                                            />
                                        ) : (
                                            <View style={styles.burnActionRow}>
                                                <Button
                                                    title="Cancel"
                                                    variant="outline"
                                                    size="md"
                                                    onPress={() => setBurnStep('idle')}
                                                    style={{ flex: 1, borderColor: theme.colors.border }}
                                                />
                                                <Button
                                                    title="Confirm"
                                                    variant="primary"
                                                    size="md"
                                                    onPress={handleBurnPress}
                                                    style={{ backgroundColor: '#FF3B30', flex: 1 }}
                                                />
                                            </View>
                                        )}
                                    </View>
                                )}
                            </View>
                        </View>
                    </Animated.View>
                </View>
            </Modal>
        </>
    );
}

const styles = StyleSheet.create({
    thumbnailContainer: {
        marginBottom: Spacing.sm,
        width: '100%',
        aspectRatio: 1,
    },
    thumbnail: {
        width: '100%',
        height: '100%',
        borderRadius: BorderRadius.lg,
        overflow: 'hidden',
        borderWidth: 1,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: Spacing.xl,
    },
    modalBackdrop: {
        ...StyleSheet.absoluteFillObject,
    },
    modalContent: {
        width: '100%',
        maxWidth: 320,
        backgroundColor: 'transparent',
    },
    card: {
        width: '100%',
        // Height auto to fit content
        borderRadius: BorderRadius.xl,
        borderWidth: 1,
        overflow: 'hidden',
        backgroundColor: '#fff',
    },
    burnActionRow: {
        flexDirection: 'row',
        gap: Spacing.sm,
        width: '100%',
    },
    imageContainer: {
        width: '100%',
        aspectRatio: 1,
        position: 'relative',
    },
    image: {
        width: '100%',
        height: '100%',
    },
    imagePlaceholder: {
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
    },
    priceOverlay: {
        position: 'absolute',
        bottom: Spacing.sm,
        left: Spacing.sm,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        paddingHorizontal: Spacing.sm,
        paddingVertical: 4,
        borderRadius: BorderRadius.md,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    priceText: {
        color: '#fff',
        fontSize: FontSize.xs,
        fontWeight: '600',
    },
    info: {
        padding: Spacing.sm,
    },
    name: {
        fontSize: FontSize.md,
        fontWeight: '600',
        marginBottom: 4,
    },
    description: {
        fontSize: FontSize.sm,
        marginBottom: Spacing.sm,
        lineHeight: 18,
    },
    closeButton: {
        position: 'absolute',
        top: Spacing.sm,
        right: Spacing.sm,
        zIndex: 10,
    },
});
