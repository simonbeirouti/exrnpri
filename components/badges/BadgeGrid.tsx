import React from 'react';
import { View, FlatList, StyleSheet, RefreshControl, Text } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { BadgeCard } from './BadgeCard';
import { BadgeWithMetadata } from '@/utils/badge_types';
import { Spacing, FontSize } from '@/constants/Colors';

interface BadgeGridProps {
    badges: BadgeWithMetadata[];
    onBadgePress?: (badge: BadgeWithMetadata) => void;
    onRefresh?: () => void;
    refreshing?: boolean;
    showPurchaseButton?: boolean;
    showOwnedIndicator?: boolean;
    emptyMessage?: string;
    showPrice?: boolean;
    enableBurn?: boolean;
    onBurn?: (badge: BadgeWithMetadata) => void;
}

export function BadgeGrid({
    badges,
    onBadgePress,
    onRefresh,
    refreshing = false,
    showPurchaseButton = false,
    showOwnedIndicator = false,
    emptyMessage = 'No badges found',
    showPrice,
    enableBurn = false,
    onBurn
}: BadgeGridProps) {
    const theme = useTheme();

    const renderBadge = ({ item }: { item: BadgeWithMetadata }) => (
        <View style={styles.gridItem}>
            <BadgeCard
                badge={item}
                onPress={() => onBadgePress?.(item)}
                showPurchaseButton={showPurchaseButton}
                showOwnedIndicator={showOwnedIndicator}
                showPrice={showPrice}
                enableBurn={enableBurn}
                onBurn={onBurn}
            />
        </View>
    );

    const renderEmpty = () => (
        <View style={styles.emptyContainer}>
            <Text style={[styles.emptyText, { color: theme.colors.text + '99' }]}>
                {emptyMessage}
            </Text>
        </View>
    );

    return (
        <FlatList
            data={badges}
            renderItem={renderBadge}
            keyExtractor={(item) => `${item.creator.toString()}-${item.badgeId}`}
            numColumns={2}
            columnWrapperStyle={styles.row}
            contentContainerStyle={styles.container}
            ListEmptyComponent={renderEmpty}
            refreshControl={
                onRefresh ? (
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        tintColor={theme.colors.primary}
                    />
                ) : undefined
            }
        />
    );
}

const styles = StyleSheet.create({
    container: {
        padding: Spacing.md,
    },
    row: {
        justifyContent: 'space-between',
    },
    gridItem: {
        width: '48%',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: Spacing.xxl,
    },
    emptyText: {
        fontSize: FontSize.md,
        textAlign: 'center',
    },
});
