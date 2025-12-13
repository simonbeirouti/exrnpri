import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@react-navigation/native';
import { IPFSUploadForm } from '@/components/ipfs/IPFSUploadForm';
import { IPFSDataDisplay } from '@/components/ipfs/IPFSDataDisplay';
import { FontSize, Spacing, Layout } from '@/constants/Colors';

interface UploadedData {
    dataCID: string;
    imageCID: string;
    imageURL: string;
    name: string;
    description: string;
}

export default function IPFSPage() {
    const theme = useTheme();
    const [uploadedData, setUploadedData] = useState<UploadedData | null>(null);

    const handleUploadSuccess = (
        dataCID: string,
        imageCID: string,
        imageURL: string,
        name: string,
        description: string
    ) => {
        setUploadedData({
            dataCID,
            imageCID,
            imageURL,
            name,
            description,
        });
    };

    return (
        <SafeAreaView style={{ flex: 1 }} edges={['top']}>
            <ScrollView
                style={{ flex: 1 }}
                contentContainerStyle={styles.scrollContent}
            >
                <View style={styles.header}>
                    <Text style={[styles.title, { color: theme.colors.text }]}>
                        IPFS Upload
                    </Text>
                    <Text style={[styles.subtitle, { color: theme.colors.text }]}>
                        Upload data to the InterPlanetary File System
                    </Text>
                </View>

                {/* Upload Form */}
                <IPFSUploadForm onUploadSuccess={handleUploadSuccess} />

                {/* Display uploaded data if available */}
                {uploadedData && (
                    <View style={styles.displayContainer}>
                        <IPFSDataDisplay
                            dataCID={uploadedData.dataCID}
                            imageCID={uploadedData.imageCID}
                            imageURL={uploadedData.imageURL}
                            name={uploadedData.name}
                            description={uploadedData.description}
                        />
                    </View>
                )}
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    scrollContent: {
        padding: Layout.padding,
        gap: Spacing.lg,
    },
    header: {
        gap: Spacing.xs,
    },
    title: {
        fontSize: FontSize.xxl,
        fontWeight: '700',
    },
    subtitle: {
        fontSize: FontSize.md,
        opacity: 0.7,
    },
    displayContainer: {
        marginTop: Spacing.md,
    },
});
