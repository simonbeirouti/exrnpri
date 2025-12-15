import React from 'react';
import { ScrollView, StyleSheet, ScrollViewProps } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useHeaderHeight } from '@react-navigation/elements';

interface ScreenScrollViewProps extends ScrollViewProps {
    children: React.ReactNode;
    useSafeArea?: boolean;
    scrollEnabled?: boolean;
    backgroundColor?: string;
}

export function ScreenScrollView({ children, style, contentContainerStyle, useSafeArea = true, scrollEnabled = true, backgroundColor, ...props }: ScreenScrollViewProps) {
    const theme = useTheme();
    const headerHeight = useHeaderHeight();

    const bgColor = backgroundColor || theme.colors.background;

    const Wrapper = useSafeArea ? SafeAreaView : React.Fragment;
    const wrapperProps = useSafeArea ? {
        style: { flex: 1, backgroundColor: bgColor },
        edges: ['top', 'bottom', 'left', 'right'] as const
    } : {};

    return (
        // @ts-ignore
        <Wrapper {...wrapperProps}>
            <ScrollView
                style={[styles.container, { backgroundColor: bgColor }, style]}
                contentContainerStyle={[
                    { paddingTop: headerHeight },
                    contentContainerStyle
                ]}
                scrollEnabled={scrollEnabled}
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
