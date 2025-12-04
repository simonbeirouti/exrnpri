import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextStyle } from 'react-native';
import { useTheme } from '@react-navigation/native';

interface SettingsActionRowProps {
    title: string;
    onPress?: () => void;
    titleStyle?: TextStyle;
}

export const SettingsActionRow: React.FC<SettingsActionRowProps> = ({ title, onPress, titleStyle }) => {
    const theme = useTheme();

    return (
        <TouchableOpacity
            style={[styles.container, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}
            onPress={onPress}
            activeOpacity={0.7}
        >
            <View style={styles.contentContainer}>
                <Text style={[styles.title, { color: theme.colors.text }, titleStyle]}>{title}</Text>
            </View>
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
    contentContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    title: {
        fontSize: 16,
        fontWeight: '500',
        textAlign: 'center',
    },
});
