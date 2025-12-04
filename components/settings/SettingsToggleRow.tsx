import React from 'react';
import { View, Text, StyleSheet, Switch } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@react-navigation/native';

interface SettingsToggleRowProps {
    icon: keyof typeof Ionicons.glyphMap;
    title: string;
    subtitle?: string;
    value: boolean;
    onValueChange: (value: boolean) => void;
    disabled?: boolean;
}

export const SettingsToggleRow: React.FC<SettingsToggleRowProps> = ({
    icon,
    title,
    subtitle,
    value,
    onValueChange,
    disabled
}) => {
    const theme = useTheme();

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
            <View style={styles.iconContainer}>
                <Ionicons name={icon} size={24} color={theme.colors.primary} />
            </View>
            <View style={styles.contentContainer}>
                <Text style={[styles.title, { color: theme.colors.text }]}>{title}</Text>
                {subtitle && (
                    <Text style={[styles.subtitle, { color: theme.colors.text, opacity: 0.6 }]}>{subtitle}</Text>
                )}
            </View>
            <Switch
                value={value}
                onValueChange={onValueChange}
                disabled={disabled}
                trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
            />
        </View>
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
        paddingRight: 10,
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
