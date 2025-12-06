import React, { useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    ViewStyle,
} from 'react-native';
import { useTheme } from '@react-navigation/native';
import { Colors, BorderRadius, Spacing, Shadows } from '../../constants/Colors';
import { Ionicons } from '@expo/vector-icons';

export interface DropdownOption {
    label: string;
    value: any;
}

interface DropdownProps {
    options: DropdownOption[];
    selectedValue: any;
    onSelect: (value: any) => void;
    placeholder?: string;
    style?: ViewStyle;
}

export const Dropdown: React.FC<DropdownProps & { disabled?: boolean }> = ({
    options,
    selectedValue,
    onSelect,
    placeholder = 'Select option',
    style,
    disabled = false,
}) => {
    const [visible, setVisible] = useState(false);
    const theme = useTheme();
    const colors = theme.dark ? Colors.dark : Colors.light;

    const selectedOption = options.find((opt) => opt.value === selectedValue);

    const handleSelect = (value: any) => {
        onSelect(value);
        setVisible(false);
    };

    const toggle = () => {
        if (!disabled) {
            setVisible(!visible);
        }
    };

    return (
        <View style={[styles.wrapper, style]}>
            <TouchableOpacity
                style={[
                    styles.trigger,
                    {
                        backgroundColor: colors.cardBackground,
                        borderColor: colors.border,
                        opacity: disabled ? 0.7 : 1,
                    },
                ]}
                onPress={toggle}
                activeOpacity={disabled ? 1 : 0.7}
            >
                <Text
                    style={[
                        styles.triggerText,
                        { color: selectedOption ? colors.text : colors.mutedForeground },
                    ]}
                    numberOfLines={1}
                    ellipsizeMode="middle"
                >
                    {selectedOption ? selectedOption.label : placeholder}
                </Text>
                {!disabled && <Ionicons name={visible ? "chevron-up" : "chevron-down"} size={20} color={colors.icon} />}
            </TouchableOpacity>

            {visible && !disabled && (
                <View
                    style={[
                        styles.dropdown,
                        {
                            backgroundColor: colors.cardBackground,
                            borderColor: colors.border,
                            borderWidth: 1,
                            borderTopWidth: 0,
                        },
                    ]}
                >
                    {options.map((item, index) => (
                        <TouchableOpacity
                            key={index}
                            style={[
                                styles.item,
                                {
                                    borderTopColor: colors.border,
                                    borderTopWidth: index === 0 ? 0 : StyleSheet.hairlineWidth,
                                    backgroundColor: item.value === selectedValue ? (theme.dark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)') : 'transparent'
                                }
                            ]}
                            onPress={() => handleSelect(item.value)}
                        >
                            <Text
                                style={[
                                    styles.itemText,
                                    {
                                        color: item.value === selectedValue ? colors.primary : colors.text,
                                        fontWeight: item.value === selectedValue ? '600' : '400',
                                    },
                                ]}
                                numberOfLines={1}
                                ellipsizeMode="middle"
                            >
                                {item.label}
                            </Text>
                            {item.value === selectedValue && (
                                <Ionicons name="checkmark" size={18} color={colors.primary} />
                            )}
                        </TouchableOpacity>
                    ))}
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    wrapper: {
        width: '100%',
        zIndex: 10,
    },
    trigger: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: Spacing.md,
        borderRadius: BorderRadius.md,
        borderWidth: 1,
    },
    triggerText: {
        fontSize: 16,
        flex: 1,
        marginRight: Spacing.sm,
    },
    dropdown: {
        position: 'absolute',
        top: '100%',
        left: 0,
        right: 0,
        marginTop: 4,
        borderRadius: BorderRadius.md,
        overflow: 'hidden',
        zIndex: 1000,
        // Shadow for elevation
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 5,
    },
    item: {
        padding: Spacing.md,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    itemText: {
        fontSize: 16,
        flex: 1,
    },
});
