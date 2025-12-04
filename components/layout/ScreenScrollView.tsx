import React from 'react';
import { ScrollView, StyleSheet, ScrollViewProps } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useHeaderHeight } from '@react-navigation/elements';

interface ScreenScrollViewProps extends ScrollViewProps {
    children: React.ReactNode;
    useSafeArea?: boolean;
}

export function ScreenScrollView({ children, style, contentContainerStyle, useSafeArea = true, ...props }: ScreenScrollViewProps) {
    const theme = useTheme();
    const headerHeight = useHeaderHeight();

    const Wrapper = useSafeArea ? SafeAreaView : React.Fragment;
    const wrapperProps = useSafeArea ? {
        style: { flex: 1, backgroundColor: theme.colors.background },
        edges: ['bottom', 'left', 'right'] as const
    } : {};

    return (
        // @ts-ignore
        <Wrapper {...wrapperProps}>
            <ScrollView
                style={[styles.container, { backgroundColor: theme.colors.background }, style]}
                contentContainerStyle={[
                    { paddingTop: headerHeight },
                    contentContainerStyle
                ]}
                {...props}
            >
                {children}
            </ScrollView>
        </Wrapper>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
});
