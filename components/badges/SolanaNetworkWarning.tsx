import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { useWallet } from '@/context/WalletContext';
import { Button } from '@/components/ui/Button';
import { Colors, Layout, FontSize, Spacing } from '@/constants/Colors';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface SolanaNetworkWarningProps {
    children?: React.ReactNode;
}

export function SolanaNetworkWarning({ children }: SolanaNetworkWarningProps) {
    const theme = useTheme();
    const { selectedChain, setSelectedChain } = useWallet();

    const isSolana = selectedChain === 'solana';

    if (isSolana) {
        return <>{children}</>;
    }

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <View style={[styles.content, { backgroundColor: theme.colors.card }]}>
                <MaterialCommunityIcons
                    name="alert-circle-outline"
                    size={48}
                    color={theme.colors.text}
                    style={{ marginBottom: Layout.gap }}
                />

                <Text style={[styles.title, { color: theme.colors.text }]}>
                    Solana Network Required
                </Text>

                <Text style={[styles.description, { color: theme.colors.text + '99' }]}>
                    This feature is only available on the Solana network. Please switch your active network to continue.
                </Text>

                <Button
                    title="Switch to Solana"
                    onPress={() => setSelectedChain('solana')}
                    variant="primary"
                    size="lg"
                    style={styles.button}
                />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: Layout.padding,
    },
    content: {
        width: '100%',
        maxWidth: 400,
        padding: Layout.gap * 1.5,
        borderRadius: Layout.borderRadius,
        alignItems: 'center',
        // Add subtle shadow
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    title: {
        fontSize: FontSize.xl,
        fontWeight: '700',
        textAlign: 'center',
        marginBottom: Spacing.sm,
    },
    description: {
        fontSize: FontSize.md,
        textAlign: 'center',
        marginBottom: Layout.gap * 1.5, // 30px
        lineHeight: 24,
    },
    button: {
        width: '100%',
        maxWidth: 250,
    },
});
