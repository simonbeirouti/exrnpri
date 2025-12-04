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
        alignItems: 'center', // Center the text for action rows usually? Or keep it left aligned?
        // The user said "just text". Usually action rows like "Logout" are centered or left aligned.
        // SettingsRow has left aligned text. I'll stick to left aligned to match, or maybe center if it's a button-like action.
        // Let's look at SettingsRow again. It has `alignItems: 'center'` on container, and `justifyContent: 'center'` on contentContainer.
        // But `contentContainer` in SettingsRow has `flex: 1`.
        // If I want it to look like a row but just text, I should probably keep it left aligned like the others, OR center it if it's a "button".
        // "display the button and instead just text" -> implies it replaces a button.
        // I will default to centered text for "Action" rows as they are often buttons in disguise, but I'll make it configurable if needed.
        // Actually, looking at standard iOS settings, "Log Out" is often a cell with centered red text.
        // I will center it by default.
    },
    title: {
        fontSize: 16,
        fontWeight: '500',
        textAlign: 'center', // Center text
    },
});
