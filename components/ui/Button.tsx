import React from 'react';
import {
    Text,
    TouchableOpacity,
    StyleSheet,
    ActivityIndicator,
    ViewStyle,
    TextStyle,
    TouchableOpacityProps,
} from 'react-native';
import { useTheme } from '@react-navigation/native';
import { Colors, Spacing, BorderRadius } from '../../constants/Colors';

interface ButtonProps extends TouchableOpacityProps {
    title: string;
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive';
    size?: 'sm' | 'md' | 'lg';
    loading?: boolean;
    style?: ViewStyle;
    textStyle?: TextStyle;
}

export const Button: React.FC<ButtonProps> = ({
    title,
    variant = 'primary',
    size = 'md',
    loading = false,
    style,
    textStyle,
    disabled,
    ...props
}) => {
    const theme = useTheme();

    // Get base colors based on theme
    const colors = theme.dark ? Colors.dark : Colors.light;

    const getBackgroundColor = () => {
        if (disabled) return colors.muted;
        switch (variant) {
            case 'primary': return colors.primary;
            case 'secondary': return colors.secondary;
            case 'outline': return 'transparent';
            case 'ghost': return 'transparent';
            case 'destructive': return colors.destructive;
            default: return colors.primary;
        }
    };

    const getTextColor = () => {
        if (disabled) return colors.mutedForeground;
        switch (variant) {
            case 'primary': return colors.primaryForeground;
            case 'secondary': return colors.secondaryForeground;
            case 'outline': return colors.primary;
            case 'ghost': return colors.primary;
            case 'destructive': return colors.destructiveForeground;
            default: return colors.primaryForeground;
        }
    };

    const getBorderColor = () => {
        if (variant === 'outline') return colors.border;
        return 'transparent';
    };

    const getPadding = () => {
        switch (size) {
            case 'sm': return { paddingVertical: Spacing.xs, paddingHorizontal: Spacing.sm };
            case 'md': return { paddingVertical: Spacing.sm + 4, paddingHorizontal: Spacing.md };
            case 'lg': return { paddingVertical: Spacing.md, paddingHorizontal: Spacing.lg };
            default: return { paddingVertical: Spacing.sm + 4, paddingHorizontal: Spacing.md };
        }
    };

    const getFontSize = () => {
        switch (size) {
            case 'sm': return 12;
            case 'md': return 16;
            case 'lg': return 18;
            default: return 16;
        }
    };

    return (
        <TouchableOpacity
            style={[
                styles.container,
                {
                    backgroundColor: getBackgroundColor(),
                    borderColor: getBorderColor(),
                    borderWidth: variant === 'outline' ? 1 : 0,
                    ...getPadding(),
                },
                style,
            ]}
            disabled={disabled || loading}
            activeOpacity={0.8}
            {...props}
        >
            {loading ? (
                <ActivityIndicator size="small" color={getTextColor()} />
            ) : (
                <Text
                    style={[
                        styles.text,
                        { color: getTextColor(), fontSize: getFontSize() },
                        textStyle,
                    ]}
                >
                    {title}
                </Text>
            )}
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        borderRadius: BorderRadius.md,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
    },
    text: {
        fontWeight: '600',
        textAlign: 'center',
    },
});
