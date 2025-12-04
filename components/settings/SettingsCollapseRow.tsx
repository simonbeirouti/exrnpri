import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, LayoutAnimation, Platform, UIManager } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@react-navigation/native';

if (Platform.OS === 'android') {
    if (UIManager.setLayoutAnimationEnabledExperimental) {
        UIManager.setLayoutAnimationEnabledExperimental(true);
    }
}

interface SettingsCollapseRowProps {
    icon: keyof typeof Ionicons.glyphMap;
    title: string;
    subtitle?: string;
    expanded: boolean;
    onToggle: () => void;
    children: React.ReactNode;
}

export const SettingsCollapseRow: React.FC<SettingsCollapseRowProps> = ({
    icon,
    title,
    subtitle,
    expanded,
    onToggle,
    children
}) => {
    const theme = useTheme();
    const rotateAnim = useRef(new Animated.Value(expanded ? 1 : 0)).current;

    useEffect(() => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        Animated.timing(rotateAnim, {
            toValue: expanded ? 1 : 0,
            duration: 200,
            useNativeDriver: true,
        }).start();
    }, [expanded]);

    const rotate = rotateAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '90deg'],
    });

    return (
        <View style={[styles.wrapper, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
            <TouchableOpacity
                style={styles.container}
                onPress={onToggle}
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
                <Animated.View style={{ transform: [{ rotate }] }}>
                    <Ionicons name="chevron-forward" size={20} color={theme.colors.text} style={{ opacity: 0.5 }} />
                </Animated.View>
            </TouchableOpacity>
            {expanded && (
                <View style={[styles.childrenContainer, { borderTopColor: theme.colors.border }]}>
                    {children}
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    wrapper: {
        borderBottomWidth: StyleSheet.hairlineWidth,
        overflow: 'hidden',
    },
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
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
    childrenContainer: {
        padding: 16,
        borderTopWidth: StyleSheet.hairlineWidth,
    },
});
