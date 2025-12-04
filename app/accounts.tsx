import React, { useState } from 'react';
import { StyleSheet, View, Text, Alert, TextInput, TouchableOpacity } from 'react-native';
import { Stack } from 'expo-router';
import { usePrivy, useLinkWithOAuth, useUnlinkOAuth, useLinkEmail, useLinkSMS } from '@privy-io/expo';
import { useLinkWithPasskey } from '@privy-io/expo/passkey';
import { ScreenScrollView } from '@/components/layout/ScreenScrollView';
import { SettingsToggleRow } from '@/components/settings/SettingsToggleRow';
import { SettingsCollapseRow } from '@/components/settings/SettingsCollapseRow';
import { useTheme } from '@react-navigation/native';
import Constants from "expo-constants";

type OAuthProvider = "github" | "google" | "discord" | "apple" | "twitter" | "spotify" | "instagram" | "tiktok" | "linkedin";

const OAUTH_PROVIDERS: { provider: OAuthProvider; label: string; icon: any }[] = [
    { provider: 'google', label: 'Google', icon: 'logo-google' },
    // { provider: 'apple', label: 'Apple', icon: 'logo-apple' },
    { provider: 'github', label: 'GitHub', icon: 'logo-github' },
    // { provider: 'discord', label: 'Discord', icon: 'logo-discord' },
    // { provider: 'twitter', label: 'Twitter', icon: 'logo-twitter' },
    // { provider: 'spotify', label: 'Spotify', icon: 'musical-notes' },
    // { provider: 'instagram', label: 'Instagram', icon: 'logo-instagram' },
    // { provider: 'tiktok', label: 'TikTok', icon: 'videocam' },
    // { provider: 'linkedin', label: 'LinkedIn', icon: 'logo-linkedin' },
];

export default function AccountsScreen() {
    const theme = useTheme();
    const { user } = usePrivy();
    const [expandedEmail, setExpandedEmail] = useState(false);
    const [expandedPhone, setExpandedPhone] = useState(false);

    // Email State
    const [email, setEmail] = useState("");
    const [emailCode, setEmailCode] = useState("");

    // Phone State
    const [phone, setPhone] = useState("");
    const [smsCode, setSmsCode] = useState("");

    const { link } = useLinkWithOAuth({
        onError: (err) => Alert.alert("Error", err.message),
    });

    const { unlinkOAuth } = useUnlinkOAuth({
        onError: (err) => Alert.alert("Error", err.message),
        onSuccess: () => Alert.alert("Success", "Account unlinked successfully"),
    });

    const { sendCode: sendCodeEmail, linkWithCode: linkWithCodeEmail, state: emailState } = useLinkEmail({
        onError: (err) => Alert.alert("Error", err.message),
        onSendCodeSuccess: () => Alert.alert("Code Sent", "Check your email for the verification code."),
        onLinkSuccess: () => {
            Alert.alert("Success", "Email linked successfully");
            setExpandedEmail(false);
            setEmail("");
            setEmailCode("");
        },
    });

    const { sendCode: sendCodeSMS, linkWithCode: linkWithCodeSMS, state: smsState } = useLinkSMS({
        onError: (err) => Alert.alert("Error", err.message),
        onSendCodeSuccess: () => Alert.alert("Code Sent", "Check your phone for the verification code."),
        onLinkSuccess: () => {
            Alert.alert("Success", "Phone linked successfully");
            setExpandedPhone(false);
            setPhone("");
            setSmsCode("");
        },
    });

    const { linkWithPasskey } = useLinkWithPasskey({
        onError: (err) => Alert.alert("Error", err.message),
    });

    const isLinked = (provider: string) => {
        return !!user?.linked_accounts.find(
            (account) => (account as any).type === `${provider}_oauth`
        );
    };

    const handleToggleOAuth = (provider: OAuthProvider, value: boolean) => {
        if (value) {
            link({ provider });
        } else {
            const account = user?.linked_accounts.find(
                (a) => (a as any).type === `${provider}_oauth`
            );
            if (account) {
                Alert.alert(
                    "Unlink Account",
                    `Are you sure you want to unlink your ${provider} account?`,
                    [
                        { text: "Cancel", style: "cancel" },
                        {
                            text: "Unlink",
                            style: "destructive",
                            onPress: () => unlinkOAuth({ provider, subject: (account as any).subject }),
                        },
                    ]
                );
            }
        }
    };

    const linkedEmail = user?.linked_accounts.find((a) => a.type === 'email');
    const linkedPhone = user?.linked_accounts.find((a) => a.type === 'phone');
    const hasPasskey = !!user?.linked_accounts.find((a) => a.type === 'passkey');

    return (
        <ScreenScrollView>
            <Stack.Screen options={{ title: 'Accounts', headerBackTitle: 'Settings', headerTransparent: true }} />
            <View style={styles.content}>
                <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Social Accounts</Text>
                <View style={styles.group}>
                    {OAUTH_PROVIDERS.map((item) => (
                        <SettingsToggleRow
                            key={item.provider}
                            icon={item.icon}
                            title={item.label}
                            subtitle={isLinked(item.provider) ? "Linked" : "Not linked"}
                            value={isLinked(item.provider)}
                            onValueChange={(val) => handleToggleOAuth(item.provider, val)}
                        />
                    ))}
                </View>

                <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Contact Info</Text>
                <View style={styles.group}>
                    <SettingsCollapseRow
                        icon="mail-outline"
                        title="Email"
                        subtitle={linkedEmail ? (linkedEmail as any).address : "Not linked"}
                        expanded={expandedEmail}
                        onToggle={() => setExpandedEmail(!expandedEmail)}
                    >
                        <View style={styles.inputContainer}>
                            {!linkedEmail && (
                                <>
                                    <View style={styles.row}>
                                        <TextInput
                                            style={[styles.input, { color: theme.colors.text, borderColor: theme.colors.border }]}
                                            placeholder="Enter email"
                                            placeholderTextColor={theme.colors.text + '80'}
                                            value={email}
                                            onChangeText={setEmail}
                                            autoCapitalize="none"
                                            keyboardType="email-address"
                                        />
                                        <TouchableOpacity
                                            style={[styles.button, { backgroundColor: theme.colors.primary, opacity: (!email || emailState.status === "sending-code") ? 0.6 : 1 }]}
                                            onPress={() => sendCodeEmail({ email })}
                                            disabled={!email || emailState.status === "sending-code"}
                                        >
                                            <Text style={styles.buttonText}>{emailState.status === "sending-code" ? "Sending..." : "Send"}</Text>
                                        </TouchableOpacity>
                                    </View>

                                    <View style={styles.row}>
                                        <TextInput
                                            style={[styles.input, { color: theme.colors.text, borderColor: theme.colors.border }]}
                                            placeholder="Verification Code"
                                            placeholderTextColor={theme.colors.text + '80'}
                                            value={emailCode}
                                            onChangeText={setEmailCode}
                                            keyboardType="number-pad"
                                        />
                                        <TouchableOpacity
                                            style={[styles.button, { backgroundColor: theme.colors.primary, opacity: (!emailCode || emailState.status === "submitting-code") ? 0.6 : 1 }]}
                                            onPress={() => linkWithCodeEmail({ code: emailCode, email })}
                                            disabled={!emailCode || emailState.status === "submitting-code"}
                                        >
                                            <Text style={styles.buttonText}>{emailState.status === "submitting-code" ? "Verifying..." : "Link"}</Text>
                                        </TouchableOpacity>
                                    </View>
                                </>
                            )}
                            {linkedEmail && (
                                <Text style={{ color: theme.colors.text }}>
                                    Your email is currently linked: {(linkedEmail as any).address}
                                </Text>
                            )}
                        </View>
                    </SettingsCollapseRow>

                    <SettingsCollapseRow
                        icon="call-outline"
                        title="Phone"
                        subtitle={linkedPhone ? (linkedPhone as any).phoneNumber : "Not linked"}
                        expanded={expandedPhone}
                        onToggle={() => setExpandedPhone(!expandedPhone)}
                    >
                        <View style={styles.inputContainer}>
                            {!linkedPhone && (
                                <>
                                    <View style={styles.row}>
                                        <TextInput
                                            style={[styles.input, { color: theme.colors.text, borderColor: theme.colors.border }]}
                                            placeholder="Enter phone number"
                                            placeholderTextColor={theme.colors.text + '80'}
                                            value={phone}
                                            onChangeText={setPhone}
                                            keyboardType="phone-pad"
                                        />
                                        <TouchableOpacity
                                            style={[styles.button, { backgroundColor: theme.colors.primary, opacity: (!phone || smsState.status === "sending-code") ? 0.6 : 1 }]}
                                            onPress={() => sendCodeSMS({ phone })}
                                            disabled={!phone || smsState.status === "sending-code"}
                                        >
                                            <Text style={styles.buttonText}>{smsState.status === "sending-code" ? "Sending..." : "Send"}</Text>
                                        </TouchableOpacity>
                                    </View>

                                    <View style={styles.row}>
                                        <TextInput
                                            style={[styles.input, { color: theme.colors.text, borderColor: theme.colors.border }]}
                                            placeholder="Verification Code"
                                            placeholderTextColor={theme.colors.text + '80'}
                                            value={smsCode}
                                            onChangeText={setSmsCode}
                                            keyboardType="number-pad"
                                        />
                                        <TouchableOpacity
                                            style={[styles.button, { backgroundColor: theme.colors.primary, opacity: (!smsCode || smsState.status === "submitting-code") ? 0.6 : 1 }]}
                                            onPress={() => linkWithCodeSMS({ code: smsCode, phone })}
                                            disabled={!smsCode || smsState.status === "submitting-code"}
                                        >
                                            <Text style={styles.buttonText}>{smsState.status === "submitting-code" ? "Verifying..." : "Link"}</Text>
                                        </TouchableOpacity>
                                    </View>
                                </>
                            )}
                            {linkedPhone && (
                                <Text style={{ color: theme.colors.text }}>
                                    Your phone is currently linked: {(linkedPhone as any).phoneNumber}
                                </Text>
                            )}
                        </View>
                    </SettingsCollapseRow>
                </View>

                <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Security</Text>
                <View style={styles.group}>
                    <SettingsToggleRow
                        icon="key-outline"
                        title="Passkey"
                        subtitle={hasPasskey ? "Linked" : "Not linked"}
                        value={hasPasskey}
                        onValueChange={(val) => {
                            if (val) {
                                linkWithPasskey({
                                    relyingParty: Constants.expoConfig?.extra?.passkeyAssociatedDomain,
                                });
                            }
                            // Passkey unlinking usually not supported directly via toggle in this simple flow or might need specific API
                            // For now, assuming we only support linking via toggle for passkey or it's additive.
                            // If unlinking is needed, we'd need useUnlinkPasskey if available or similar logic.
                            // Based on previous file, only linking was shown.
                        }}
                        disabled={hasPasskey}
                    />
                </View>
            </View>
        </ScreenScrollView>
    );
}

const styles = StyleSheet.create({
    content: {
        padding: 10,
        gap: 10,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    group: {
        borderRadius: 10,
        overflow: 'hidden',
    },
    inputContainer: {
        gap: 10,
    },
    row: {
        flexDirection: 'row',
        gap: 10,
        alignItems: 'center',
    },
    input: {
        flex: 1,
        borderWidth: 1,
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
    },
    button: {
        width: 70,
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
    buttonText: {
        color: 'white',
        fontWeight: '600',
        fontSize: 14,
    },
});
