import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import { usePrivy } from '@privy-io/expo';
import { SettingsRow } from '@/components/settings/SettingsRow';
import { SettingsActionRow } from '@/components/settings/SettingsActionRow';
import { ScreenScrollView } from '@/components/layout/ScreenScrollView';
import { Layout } from '@/constants/Colors';

export default function SettingsScreen() {
    const theme = useTheme();
    const router = useRouter();
    const { user, logout } = usePrivy();

    return (
        <ScreenScrollView>
            <View style={styles.content}>
                <View style={styles.userView}>
                    <Text style={[styles.userId, { color: theme.colors.text }]}>User ID</Text>
                    <Text style={{ color: theme.colors.text }}>{user?.id}</Text>
                </View>

                <View style={styles.group}>
                    <SettingsRow
                        icon="wallet-outline"
                        title="Wallets"
                        subtitle="Manage your wallets"
                        onPress={() => router.push('/wallets')}
                    />
                    <SettingsRow
                        icon="person-outline"
                        title="Accounts"
                        subtitle="Manage your linked accounts"
                        onPress={() => router.push('/accounts')}
                    />
                </View>

                <View style={styles.group}>
                    <SettingsActionRow
                        title="Log Out"
                        onPress={logout}
                        titleStyle={{ color: '#FF3B30' }}
                    />
                </View>
            </View>
        </ScreenScrollView>
    );
}

const styles = StyleSheet.create({
    content: {
        padding: Layout.padding,
        gap: Layout.gap,
    },
    group: {
        borderRadius: Layout.borderRadius,
        overflow: 'hidden',
    },
    userView: {
        alignItems: "center",
        paddingVertical: 20,
    },
    userId: {
        textAlign: "center",
        fontWeight: "bold",
    }
});
