import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Stack } from 'expo-router';
import Wallets from '@/components/userManagement/Wallets';
import { ScreenScrollView } from '@/components/ScreenScrollView';

export default function WalletsScreen() {
    return (
        <ScreenScrollView>
            <Stack.Screen options={{ title: 'Wallets', headerBackTitle: 'Settings', headerTransparent: true }} />
            <View style={styles.content}>
                <Wallets />
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
