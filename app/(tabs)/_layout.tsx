import React from 'react';
import { Tabs } from 'expo-router';
import { useTheme } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function TabLayout() {
    const theme = useTheme();

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }} edges={['top']}>
            <Tabs
                screenOptions={{
                    tabBarActiveTintColor: theme.colors.primary,
                    tabBarInactiveTintColor: theme.colors.text,
                    tabBarStyle: {
                        backgroundColor: theme.colors.card,
                        borderTopColor: theme.colors.border,
                    },
                    headerStyle: {
                        backgroundColor: theme.colors.card,
                    },
                    headerTintColor: theme.colors.text,
                }}>
                <Tabs.Screen
                    name="index"
                    options={{
                        headerShown: false,
                        tabBarLabel: "Home",
                        tabBarIcon: ({ color, size }) => <Ionicons name="home" size={size} color={color} />,
                    }}
                />
                <Tabs.Screen
                    name="settings"
                    options={{
                        headerShown: false,
                        tabBarLabel: "Settings",
                        tabBarIcon: ({ color, size }) => <Ionicons name="settings" size={size} color={color} />,
                    }}
                />
            </Tabs>
        </SafeAreaView>
    );
}
