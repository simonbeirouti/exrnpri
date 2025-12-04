import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@react-navigation/native';

interface SettingsRowProps {
    icon: keyof typeof Ionicons.glyphMap;
    title: string;
    subtitle?: string;
    onPress?: () => void;
}

export const SettingsRow: React.FC<SettingsRowProps> = ({ icon, title, subtitle, onPress }) => {
    const theme = useTheme();

    return (
        <TouchableOpacity
            style={[styles.container, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}
            onPress={onPress}
            activeOpacity={0.7}
        >
            <View style={styles.iconContainer}>
                <Ionicons name={icon} size={24} color={theme.colors.primary} />
            </View>
            <View style={styles.contentContainer}>
                <Text style={[styles.title, { color: theme.colors.text }]}>{title}</Text>
                {subtitle && (
                    <Text style={[styles.subtitle, { color: theme.colors.text, opacity: 0.6 }]}>{subtitle}</Text>
                )}
            </View>
            <Ionicons name="chevron-forward" size={20} color={theme.colors.text} style={{ opacity: 0.5 }} />
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: StyleSheet.hairlineWidth,
    },
    iconContainer: {
        marginRight: 16,
        width: 32,
        alignItems: 'center',
    },
    contentContainer: {
        flex: 1,
        justifyContent: 'center',
    },
    title: {
        fontSize: 16,
        fontWeight: '500',
    },
    subtitle: {
        fontSize: 12,
        marginTop: 2,
    },
});
