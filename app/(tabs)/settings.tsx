import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { usePrivy } from '@privy-io/expo';
import { SettingsRow } from '@/components/SettingsRow';
import { SettingsActionRow } from '@/components/SettingsActionRow';
import { ScreenScrollView } from '@/components/ScreenScrollView';

export default function SettingsScreen() {
    const router = useRouter();
    const { logout } = usePrivy();

    return (
        <ScreenScrollView>
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
                    titleStyle={{ color: '#FF3B30' }} // Standard iOS destructive red
                />
            </View>
        </ScreenScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    section: {
        marginTop: 20,
    },
});
