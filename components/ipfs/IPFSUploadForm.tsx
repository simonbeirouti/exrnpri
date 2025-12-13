import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    Image,
    StyleSheet,
    Alert,
    ActivityIndicator,
} from 'react-native';
import { useTheme } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { uploadData } from '@/utils/ipfs_client';
import { FontSize, Spacing, Layout, BorderRadius } from '@/constants/Colors';

interface IPFSUploadFormProps {
    onUploadSuccess: (
        dataCID: string,
        imageCID: string,
        imageURL: string,
        name: string,
        description: string
    ) => void;
}

export function IPFSUploadForm({ onUploadSuccess }: IPFSUploadFormProps) {
    const theme = useTheme();
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [imageUri, setImageUri] = useState<string | null>(null);
    const [uploading, setUploading] = useState(false);

    const pickImage = async () => {
        try {
            // Request permissions
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Permission Required', 'Please grant camera roll permissions to select an image.');
                return;
            }

            // Launch image picker
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.8,
            });

            if (!result.canceled && result.assets[0]) {
                setImageUri(result.assets[0].uri);
            }
        } catch (error) {
            console.error('Error picking image:', error);
            Alert.alert('Error', 'Failed to pick image');
        }
    };

    const handleSubmit = async () => {
        // Validation
        if (!name.trim()) {
            Alert.alert('Validation Error', 'Please enter a name');
            return;
        }
        if (!description.trim()) {
            Alert.alert('Validation Error', 'Please enter a description');
            return;
        }
        if (!imageUri) {
            Alert.alert('Validation Error', 'Please select an image');
            return;
        }

        setUploading(true);
        try {
            const { dataCID, imageCID, imageURL } = await uploadData(name, description, imageUri);

            Alert.alert('Success!', `Data uploaded to IPFS!\n\nCID: ${dataCID.slice(0, 12)}...`);

            // Notify parent with all data
            onUploadSuccess(dataCID, imageCID, imageURL, name, description);

            // Reset form
            setName('');
            setDescription('');
            setImageUri(null);
        } catch (error) {
            console.error('Upload error:', error);
            Alert.alert('Upload Failed', error instanceof Error ? error.message : 'Unknown error');
        } finally {
            setUploading(false);
        }
    };

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.card }]}>
            <Text style={[styles.title, { color: theme.colors.text }]}>Upload to IPFS</Text>

            {/* Name Input */}
            <View style={styles.inputContainer}>
                <Text style={[styles.label, { color: theme.colors.text }]}>Name</Text>
                <TextInput
                    style={[
                        styles.input,
                        {
                            backgroundColor: theme.colors.background,
                            color: theme.colors.text,
                            borderColor: theme.colors.border,
                        },
                    ]}
                    placeholder="Enter name..."
                    placeholderTextColor={theme.dark ? '#888' : '#999'}
                    value={name}
                    onChangeText={setName}
                    editable={!uploading}
                />
            </View>

            {/* Description Input */}
            <View style={styles.inputContainer}>
                <Text style={[styles.label, { color: theme.colors.text }]}>Description</Text>
                <TextInput
                    style={[
                        styles.input,
                        styles.textArea,
                        {
                            backgroundColor: theme.colors.background,
                            color: theme.colors.text,
                            borderColor: theme.colors.border,
                        },
                    ]}
                    placeholder="Enter description..."
                    placeholderTextColor={theme.dark ? '#888' : '#999'}
                    value={description}
                    onChangeText={setDescription}
                    multiline
                    numberOfLines={4}
                    textAlignVertical="top"
                    editable={!uploading}
                />
            </View>

            {/* Image Picker */}
            <View style={styles.inputContainer}>
                <Text style={[styles.label, { color: theme.colors.text }]}>Image</Text>
                <TouchableOpacity
                    style={[
                        styles.imagePicker,
                        { borderColor: theme.colors.border },
                    ]}
                    onPress={pickImage}
                    disabled={uploading}
                >
                    {imageUri ? (
                        <Image source={{ uri: imageUri }} style={styles.imagePreview} />
                    ) : (
                        <View style={styles.imagePickerContent}>
                            <Ionicons name="image-outline" size={48} color={theme.colors.text} />
                            <Text style={[styles.imagePickerText, { color: theme.colors.text }]}>
                                Tap to select image
                            </Text>
                        </View>
                    )}
                </TouchableOpacity>
            </View>

            {/* Submit Button */}
            <TouchableOpacity
                style={[
                    styles.submitButton,
                    { backgroundColor: theme.colors.primary },
                    uploading && styles.submitButtonDisabled,
                ]}
                onPress={handleSubmit}
                disabled={uploading}
            >
                {uploading ? (
                    <View style={styles.uploadingContainer}>
                        <ActivityIndicator color="#fff" />
                        <Text style={styles.submitButtonText}>Uploading to IPFS...</Text>
                    </View>
                ) : (
                    <Text style={styles.submitButtonText}>Upload to IPFS</Text>
                )}
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: Spacing.lg,
        borderRadius: BorderRadius.lg,
        gap: Spacing.lg,
    },
    title: {
        fontSize: FontSize.xl,
        fontWeight: '700',
        marginBottom: Spacing.sm,
    },
    inputContainer: {
        gap: Spacing.sm,
    },
    label: {
        fontSize: FontSize.md,
        fontWeight: '600',
    },
    input: {
        borderWidth: 1,
        borderRadius: BorderRadius.md,
        padding: Spacing.md,
        fontSize: FontSize.md,
    },
    textArea: {
        minHeight: 100,
    },
    imagePicker: {
        borderWidth: 2,
        borderStyle: 'dashed',
        borderRadius: BorderRadius.md,
        height: 200,
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
    },
    imagePickerContent: {
        alignItems: 'center',
        gap: Spacing.sm,
    },
    imagePickerText: {
        fontSize: FontSize.md,
    },
    imagePreview: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    submitButton: {
        padding: Spacing.md,
        borderRadius: BorderRadius.md,
        alignItems: 'center',
        marginTop: Spacing.sm,
    },
    submitButtonDisabled: {
        opacity: 0.6,
    },
    submitButtonText: {
        color: '#fff',
        fontSize: FontSize.md,
        fontWeight: '700',
    },
    uploadingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.md,
    },
});
