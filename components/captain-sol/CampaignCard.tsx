import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Dimensions } from 'react-native';
import { Colors } from '@/constants/Colors';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

import { Campaign } from '@/utils/ui_types';

interface CampaignCardProps {
    campaign: Campaign;
    variant: 'large' | 'small';
    onPress?: () => void;
}

const { width } = Dimensions.get('window');

export const CampaignCard: React.FC<CampaignCardProps> = ({ campaign, variant, onPress }) => {
    const isLarge = variant === 'large';
    const cardWidth = isLarge ? width * 0.8 : width * 0.45;
    const cardHeight = isLarge ? 300 : 200;

    return (
        <TouchableOpacity
            onPress={onPress}
            activeOpacity={0.9}
            style={[styles.container, { width: cardWidth, height: cardHeight }]}
        >
            <Image
                source={{ uri: campaign.ipfs_hash.banner_image }}
                style={styles.image}
                resizeMode="cover"
            />
            <LinearGradient
                colors={['transparent', 'rgba(0,0,0,0.8)']}
                style={styles.gradient}
            >
                <View style={styles.content}>
                    {isLarge && (
                        <View style={styles.badgeContainer}>
                            <Text style={styles.statusBadge}>{campaign.status}</Text>
                        </View>
                    )}
                    <Text style={[styles.title, !isLarge && styles.smallTitle]} numberOfLines={2}>
                        {campaign.ipfs_hash.title}
                    </Text>
                    {isLarge && (
                        <Text style={styles.description} numberOfLines={2}>
                            {campaign.ipfs_hash.description}
                        </Text>
                    )}
                    <View style={styles.footer}>
                        <View style={styles.moduleInfo}>
                            <Ionicons name="layers-outline" size={isLarge ? 16 : 12} color="#fff" />
                            <Text style={styles.moduleText}>{campaign.total_modules} Modules</Text>
                        </View>
                        {!isLarge && (
                            <Text style={styles.statusTextSmall}>{campaign.status}</Text>
                        )}
                    </View>
                </View>
            </LinearGradient>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        borderRadius: 16,
        overflow: 'hidden',
        backgroundColor: '#2A2A2A',
        marginRight: 16,
        marginBottom: 16,
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
    image: {
        width: '100%',
        height: '100%',
        position: 'absolute',
    },
    gradient: {
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        height: '60%', // Cover bottom half mostly
        justifyContent: 'flex-end',
        padding: 16,
    },
    content: {
        justifyContent: 'flex-end',
    },
    badgeContainer: {
        position: 'absolute',
        top: -120, // Move it up so it's not in the gradient text area if possible, or just place it in image overlay
        right: 0,
        backgroundColor: Colors.light.tint, // Use tint color for active
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
    },
    statusBadge: {
        color: '#fff',
        fontSize: 12,
        fontWeight: 'bold',
        textTransform: 'uppercase',
    },
    title: {
        color: '#fff',
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    smallTitle: {
        fontSize: 16,
        marginBottom: 4,
    },
    description: {
        color: '#ccc',
        fontSize: 14,
        marginBottom: 12,
    },
    footer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    moduleInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    moduleText: {
        color: '#ddd',
        fontSize: 12,
    },
    statusTextSmall: {
        color: '#aaa',
        fontSize: 10,
        textTransform: 'uppercase',
    },
});
