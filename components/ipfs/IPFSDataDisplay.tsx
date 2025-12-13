import React from 'react';
import {
    View,
    Text,
    Image,
    StyleSheet,
    TouchableOpacity,
    Alert,
    Linking,
} from 'react-native';
import { useTheme } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { getIPFSGatewayURL, getIPFSDataURL } from '@/utils/ipfs_client';
import { FontSize, Spacing, Layout, BorderRadius } from '@/constants/Colors';

interface IPFSDataDisplayProps {
    dataCID: string;
    imageCID: string;
    imageURL: string;
    name?: string;
    description?: string;
}

export function IPFSDataDisplay({
    dataCID,
    imageCID,
    imageURL,
    name,
    description,
}: IPFSDataDisplayProps) {
    const theme = useTheme();

    const copyToClipboard = async (text: string, label: string) => {
        await Clipboard.setStringAsync(text);
        Alert.alert('Copied!', `${label} copied to clipboard`);
    };

    const openIPFSLink = async (cid: string, type: 'data' | 'image') => {
        // Use the appropriate URL based on the type
        const url = type === 'data' ? getIPFSDataURL(cid) : getIPFSGatewayURL(cid);
        const canOpen = await Linking.canOpenURL(url);

        if (canOpen) {
            await Linking.openURL(url);
        } else {
            Alert.alert('Error', `Cannot open ${type} URL: ${url}`);
        }
    };

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.card }]}>
            {/* Success Header */}
            <View style={styles.header}>
                <Ionicons name="checkmark-circle" size={32} color="#34C759" />
                <Text style={[styles.title, { color: theme.colors.text }]}>
                    Successfully Uploaded to IPFS
                </Text>
            </View>

            {/* Server URL Display */}
            <View style={styles.serverInfo}>
                <Ionicons name="server-outline" size={16} color={theme.colors.text} />
                <Text style={[styles.serverText, { color: theme.colors.text }]}>
                    Server: {process.env.EXPO_PUBLIC_IPFS_SERVER_URL || 'http://localhost:3001'}
                </Text>
            </View>

            {/* Image Display */}
            {imageCID && (
                <View style={styles.imageContainer}>
                    <Image
                        source={{ uri: getIPFSGatewayURL(imageCID) }}
                        style={styles.image}
                        resizeMode="cover"
                    />
                </View>
            )}

            {/* Data Display */}
            {name && (
                <View style={styles.dataRow}>
                    <Text style={[styles.dataLabel, { color: theme.colors.text }]}>Name:</Text>
                    <Text style={[styles.dataValue, { color: theme.colors.text }]}>{name}</Text>
                </View>
            )}

            {description && (
                <View style={styles.dataRow}>
                    <Text style={[styles.dataLabel, { color: theme.colors.text }]}>Description:</Text>
                    <Text style={[styles.dataValue, { color: theme.colors.text }]}>{description}</Text>
                </View>
            )}

            {/* CID Display */}
            <View style={styles.cidContainer}>
                <Text style={[styles.cidLabel, { color: theme.colors.text }]}>Data CID:</Text>
                <TouchableOpacity
                    style={[styles.cidRow, { backgroundColor: theme.colors.background }]}
                    onPress={() => copyToClipboard(dataCID, 'Data CID')}
                >
                    <Text
                        style={[styles.cidText, { color: theme.colors.primary }]}
                        numberOfLines={1}
                        ellipsizeMode="middle"
                    >
                        {dataCID}
                    </Text>
                    <Ionicons name="copy-outline" size={20} color={theme.colors.primary} />
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.viewButton, { backgroundColor: theme.colors.primary }]}
                    onPress={() => openIPFSLink(dataCID, 'data')}
                >
                    <Ionicons name="open-outline" size={18} color="#FFFFFF" />
                    <Text style={styles.viewButtonText}>View on IPFS</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.cidContainer}>
                <Text style={[styles.cidLabel, { color: theme.colors.text }]}>Image CID:</Text>
                <TouchableOpacity
                    style={[styles.cidRow, { backgroundColor: theme.colors.background }]}
                    onPress={() => copyToClipboard(imageCID, 'Image CID')}
                >
                    <Text
                        style={[styles.cidText, { color: theme.colors.primary }]}
                        numberOfLines={1}
                        ellipsizeMode="middle"
                    >
                        {imageCID}
                    </Text>
                    <Ionicons name="copy-outline" size={20} color={theme.colors.primary} />
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.viewButton, { backgroundColor: theme.colors.primary }]}
                    onPress={() => openIPFSLink(imageCID, 'image')}
                >
                    <Ionicons name="open-outline" size={18} color="#FFFFFF" />
                    <Text style={styles.viewButtonText}>View on IPFS</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: Spacing.lg,
        borderRadius: BorderRadius.lg,
        gap: Spacing.md,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.md,
        marginBottom: Spacing.sm,
    },
    title: {
        fontSize: FontSize.lg,
        fontWeight: '700',
        flex: 1,
    },
    serverInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.xs,
        marginBottom: Spacing.md,
    },
    serverText: {
        fontSize: FontSize.xs,
        opacity: 0.6,
        fontFamily: 'monospace',
    },
    imageContainer: {
        borderRadius: BorderRadius.md,
        overflow: 'hidden',
        height: 200,
        marginBottom: Spacing.sm,
    },
    image: {
        width: '100%',
        height: '100%',
    },
    dataRow: {
        gap: Spacing.xs,
    },
    dataLabel: {
        fontSize: FontSize.sm,
        fontWeight: '600',
        opacity: 0.7,
    },
    dataValue: {
        fontSize: FontSize.md,
        fontWeight: '500',
    },
    cidContainer: {
        gap: Spacing.xs,
    },
    cidLabel: {
        fontSize: FontSize.sm,
        fontWeight: '600',
        opacity: 0.7,
    },
    cidRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.sm,
        padding: Spacing.md,
        borderRadius: BorderRadius.md,
    },
    cidText: {
        flex: 1,
        fontSize: FontSize.sm,
        fontFamily: 'monospace',
    },
    infoBox: {
        flexDirection: 'row',
        gap: Spacing.sm,
        padding: Spacing.md,
        borderRadius: BorderRadius.md,
        marginTop: Spacing.sm,
    },
    infoText: {
        flex: 1,
        fontSize: FontSize.sm,
        lineHeight: 20,
    },
    viewButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: Spacing.xs,
        padding: Spacing.md,
        borderRadius: BorderRadius.md,
    },
    viewButtonText: {
        color: '#FFFFFF',
        fontSize: FontSize.md,
        fontWeight: '600',
    },
});
