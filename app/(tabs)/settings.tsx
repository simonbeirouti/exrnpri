import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import { usePrivy } from '@privy-io/expo';
import { SettingsRow } from '@/components/SettingsRow';
import { SettingsActionRow } from '@/components/SettingsActionRow';
import { ScreenScrollView } from '@/components/ScreenScrollView';

export default function SettingsScreen() {
    const theme = useTheme();
    const router = useRouter();
    const { user, logout } = usePrivy();

    return (
        <ScreenScrollView>
            <View style={styles.userView}>
                <Text style={[styles.userId, { color: theme.colors.text }]}>User ID</Text>
                <Text style={{ color: theme.colors.text }}>{user?.id}</Text>
            </View>

            <View style={styles.section}>
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

            <View style={styles.section}>
                <SettingsActionRow
                    title="Log Out"
                    onPress={logout}
                    titleStyle={{ color: '#FF3B30' }}
                />
            </View>
        </ScreenScrollView>
    );
}

const styles = StyleSheet.create({
    section: {
        marginTop: 20,
    },
    userView: {
        alignItems: "center",
    },
    userId: {
        paddingTop: 20,
        textAlign: "center",
        fontWeight: "bold",
    }
});
