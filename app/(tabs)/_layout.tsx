import { Tabs } from 'expo-router';
import { View } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { BadgeProvider } from '@/context/BadgeContext';
// import { FloatingWalletButton } from '@/components/wallet/FloatingWalletButton';

export default function TabLayout() {
    const theme = useTheme();

    return (
        <BadgeProvider>
            <View style={{ flex: 1 }}>
                {/* <FloatingWalletButton /> */}
                <Tabs
                    screenOptions={{
                        tabBarActiveTintColor: theme.colors.primary,
                        tabBarInactiveTintColor: theme.colors.text,
                        tabBarStyle: {
                            backgroundColor: theme.colors.card,
                            borderTopColor: theme.colors.border,
                        },
                    }}>

                    <Tabs.Screen
                        name="index"
                        options={{
                            tabBarLabel: "Home",
                            headerShown: false,
                            tabBarIcon: ({ color, size }) => <Ionicons name="home" size={size} color={color} />,
                        }}
                    />
                    <Tabs.Screen
                        name="badges"
                        options={{
                            tabBarLabel: "Badges",
                            headerShown: false,
                            tabBarIcon: ({ color, size }) => <Ionicons name="shield" size={size} color={color} />,
                        }}
                    />
                    <Tabs.Screen
                        name="profile"
                        options={{
                            tabBarLabel: "Profile",
                            headerShown: false,
                            tabBarIcon: ({ color, size }) => <Ionicons name="person" size={size} color={color} />,
                        }}
                    />
                    <Tabs.Screen
                        name="ipfs"
                        options={{
                            tabBarLabel: "IPFS",
                            headerShown: false,
                            tabBarIcon: ({ color, size }) => <Ionicons name="cloud-upload" size={size} color={color} />,
                        }}
                    />
                    <Tabs.Screen
                        name="settings"
                        options={{
                            tabBarLabel: "Settings",
                            headerShown: true,
                            title: "Settings",
                            headerTransparent: true,
                            headerShadowVisible: false,
                            tabBarIcon: ({ color, size }) => <Ionicons name="settings" size={size} color={color} />,
                        }}
                    />
                </Tabs>
            </View>
        </BadgeProvider>
    );
}
