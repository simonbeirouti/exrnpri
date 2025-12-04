import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { usePrivy, PrivyUser } from '@privy-io/expo';
import LinkAccounts from '@/components/userManagement/LinkAccounts';
import UnlinkAccounts from '@/components/userManagement/UnlinkAccounts';
import { ScreenScrollView } from '@/components/ScreenScrollView';

const toMainIdentifier = (x: PrivyUser["linked_accounts"][number]) => {
    if (x.type === "phone") {
        return x.phoneNumber;
    }
    if (x.type === "email" || x.type === "wallet") {
        return x.address;
    }
    if (x.type === "twitter_oauth" || x.type === "tiktok_oauth") {
        return x.username;
    }
    if (x.type === "custom_auth") {
        return x.custom_user_id;
    }
    return x.type;
};

export default function AccountsScreen() {
    const theme = useTheme();
    const { user } = usePrivy();

    if (!user) return null;

    return (
        <ScreenScrollView>
            <Stack.Screen options={{ title: 'Accounts', headerBackTitle: 'Settings', headerTransparent: true }} />
            <View style={styles.content}>
                <View>
                    <Text style={{ fontWeight: "bold", color: theme.colors.text }}>User ID</Text>
                    <Text style={{ color: theme.colors.text }}>{user.id}</Text>
                </View>

                <View>
                    <Text style={{ fontWeight: "bold", color: theme.colors.text }}>Linked accounts</Text>
                    {user?.linked_accounts.length ? (
                        <View style={{ display: "flex", flexDirection: "column" }}>
                            {user?.linked_accounts?.map((m, index) => (
                                <Text
                                    key={`linked-account-${m.type}-${m.verified_at}-${index}`}
                                    style={{
                                        color: theme.dark ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.5)",
                                        fontSize: 12,
                                        fontStyle: "italic",
                                    }}
                                >
                                    {m.type}: {toMainIdentifier(m)}
                                </Text>
                            ))}
                        </View>
                    ) : null}
                </View>

                <LinkAccounts />
                <UnlinkAccounts />
            </View>
        </ScreenScrollView>
    );
}

const styles = StyleSheet.create({
    content: {
        padding: 20,
        gap: 20,
    },
});
