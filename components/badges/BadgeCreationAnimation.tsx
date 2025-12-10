import React, { useEffect } from 'react';
import { StyleSheet, Dimensions, View } from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withTiming,
    withSequence,
    withDelay,
    runOnJS,
    Easing,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@react-navigation/native';

interface BadgeCreationAnimationProps {
    onComplete: () => void;
    isVisible: boolean;
}

const { width, height } = Dimensions.get('window');

// Starting position: Top Right Corner (padded)
const START_X = width / 2 - 40; // Relative to center
const START_Y = -height / 2 + 80; // Relative to center

export function BadgeCreationAnimation({ onComplete, isVisible }: BadgeCreationAnimationProps) {
    const theme = useTheme();

    // Shared values for animation
    const translateX = useSharedValue(width / 2 - 50); // Start near top right
    const translateY = useSharedValue(-(height / 2) + 100); // Start near top
    const scale = useSharedValue(1);
    const opacity = useSharedValue(0);

    const animatedStyle = useAnimatedStyle(() => {
        return {
            transform: [
                { translateX: translateX.value },
                { translateY: translateY.value },
                { scale: scale.value },
            ],
            opacity: opacity.value,
        };
    });

    useEffect(() => {
        if (isVisible) {
            // Reset values
            translateX.value = width / 2 - 60; // Top Right
            translateY.value = -(height / 2) + 100; // Top
            scale.value = 1.5; // Start Large
            opacity.value = 0;

            // Start Animation Sequence
            opacity.value = withTiming(1, { duration: 300 });

            // Move to center and scale down
            translateX.value = withDelay(
                300,
                withTiming(0, {
                    duration: 1200,
                    easing: Easing.bezier(0.25, 0.1, 0.25, 1),
                })
            );

            translateY.value = withDelay(
                300,
                withTiming(0, {
                    duration: 1200,
                    easing: Easing.bezier(0.25, 0.1, 0.25, 1),
                })
            );

            scale.value = withDelay(
                300,
                withSequence(
                    withTiming(0.5, { duration: 1200 }), // Shrink while moving
                    withTiming(0, { duration: 300 }) // Disappear at end
                )
            );

            // Cleanup after animation
            setTimeout(() => {
                onComplete();
            }, 2000);
        }
    }, [isVisible]);

    if (!isVisible) return null;

    return (
        <View style={styles.container} pointerEvents="none">
            <Animated.View style={[styles.iconContainer, animatedStyle]}>
                <Ionicons name="ribbon" size={120} color={theme.colors.primary} />
            </Animated.View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000,
        backgroundColor: 'rgba(0,0,0,0.3)', // Slight dim for focus
    },
    iconContainer: {
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.30,
        shadowRadius: 4.65,
        elevation: 8,
    }
});
