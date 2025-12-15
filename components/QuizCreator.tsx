import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { QuizQuestion } from '@/utils/campaign_client';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface QuizCreatorProps {
    visible: boolean;
    onClose: () => void;
    onSave: (questions: QuizQuestion[]) => void;
    initialQuestions?: QuizQuestion[];
}

export default function QuizCreator({ visible, onClose, onSave, initialQuestions = [] }: QuizCreatorProps) {
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? 'light'];
    const insets = useSafeAreaInsets();

    const [questions, setQuestions] = useState<QuizQuestion[]>(initialQuestions);

    // Question Form State
    const [showForm, setShowForm] = useState(false);
    const [questionText, setQuestionText] = useState('');
    const [options, setOptions] = useState<string[]>(['', '']);
    const [correctIndex, setCorrectIndex] = useState(0);

    const addOption = () => {
        setOptions([...options, '']);
    };

    const updateOption = (text: string, index: number) => {
        const newOptions = [...options];
        newOptions[index] = text;
        setOptions(newOptions);
    };

    const removeOption = (index: number) => {
        if (options.length <= 2) {
            Alert.alert('Error', 'A question must have at least 2 options.');
            return;
        }
        const newOptions = options.filter((_, i) => i !== index);
        setOptions(newOptions);
        if (correctIndex >= index && correctIndex > 0) {
            setCorrectIndex(correctIndex - 1);
        }
    };

    const saveQuestion = () => {
        if (!questionText.trim()) {
            Alert.alert('Error', 'Question text is required');
            return;
        }
        if (options.some(opt => !opt.trim())) {
            Alert.alert('Error', 'All options must be filled');
            return;
        }

        const newQuestion: QuizQuestion = {
            id: `q${questions.length + 1}`,
            text: questionText,
            options: options,
            correctAnswerIndex: correctIndex
        };

        setQuestions([...questions, newQuestion]);
        resetForm();
    };

    const removeQuestion = (index: number) => {
        setQuestions(questions.filter((_, i) => i !== index));
    };

    const resetForm = () => {
        setQuestionText('');
        setOptions(['', '']);
        setCorrectIndex(0);
        setShowForm(false);
    };

    const handleSaveQuiz = () => {
        onSave(questions);
    };

    return (
        <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
            <View style={[styles.container, { backgroundColor: theme.background, paddingTop: insets.top }]}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={onClose}>
                        <Text style={{ color: theme.primary, fontSize: 16 }}>Cancel</Text>
                    </TouchableOpacity>
                    <Text style={[styles.title, { color: theme.text }]}>Manage Quiz</Text>
                    <TouchableOpacity onPress={handleSaveQuiz}>
                        <Text style={{ color: theme.primary, fontSize: 16, fontWeight: '600' }}>Done</Text>
                    </TouchableOpacity>
                </View>

                <ScrollView contentContainerStyle={styles.content}>
                    {/* Questions List */}
                    {questions.length === 0 && !showForm && (
                        <View style={styles.emptyState}>
                            <Ionicons name="documents-outline" size={48} color={theme.icon} />
                            <Text style={{ color: theme.icon, marginTop: 8 }}>No questions added yet.</Text>
                        </View>
                    )}

                    {questions.map((q, idx) => (
                        <View key={idx} style={[styles.questionCard, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
                            <View style={{ flex: 1 }}>
                                <Text style={{ color: theme.text, fontWeight: '600', fontSize: 16 }}>Q{idx + 1}: {q.text}</Text>
                                <View style={{ marginTop: 4 }}>
                                    {q.options.map((opt, i) => (
                                        <Text key={i} style={{ color: i === q.correctAnswerIndex ? theme.primary : theme.icon, fontSize: 14 }}>
                                            • {opt} {i === q.correctAnswerIndex && '(Correct)'}
                                        </Text>
                                    ))}
                                </View>
                            </View>
                            <TouchableOpacity onPress={() => removeQuestion(idx)} style={{ padding: 8 }}>
                                <Ionicons name="trash-outline" size={20} color="red" />
                            </TouchableOpacity>
                        </View>
                    ))}

                    {/* Add Question Button or Form */}
                    {!showForm ? (
                        <TouchableOpacity
                            style={[styles.addButton, { borderColor: theme.primary }]}
                            onPress={() => setShowForm(true)}
                        >
                            <Ionicons name="add" size={20} color={theme.primary} />
                            <Text style={{ color: theme.primary, fontWeight: '600', marginLeft: 4 }}>Add Question</Text>
                        </TouchableOpacity>
                    ) : (
                        <View style={[styles.formCard, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
                            <Text style={[styles.sectionTitle, { color: theme.text }]}>New Question</Text>

                            <Text style={[styles.label, { color: theme.text }]}>Question Text</Text>
                            <TextInput
                                style={[styles.input, { color: theme.text, borderColor: theme.border }]}
                                placeholder="E.g., What is the capital of France?"
                                placeholderTextColor={theme.icon}
                                value={questionText}
                                onChangeText={setQuestionText}
                            />

                            <Text style={[styles.label, { color: theme.text, marginTop: 12 }]}>Options</Text>
                            {options.map((opt, idx) => (
                                <View key={idx} style={styles.optionRow}>
                                    <TouchableOpacity
                                        onPress={() => setCorrectIndex(idx)}
                                        style={{ marginRight: 8 }}
                                    >
                                        <Ionicons
                                            name={correctIndex === idx ? "radio-button-on" : "radio-button-off"}
                                            size={24}
                                            color={correctIndex === idx ? theme.primary : theme.icon}
                                        />
                                    </TouchableOpacity>
                                    <TextInput
                                        style={[styles.input, { flex: 1, marginBottom: 0, color: theme.text, borderColor: theme.border }]}
                                        placeholder={`Option ${idx + 1}`}
                                        placeholderTextColor={theme.icon}
                                        value={opt}
                                        onChangeText={(text) => updateOption(text, idx)}
                                    />
                                    {options.length > 2 && (
                                        <TouchableOpacity onPress={() => removeOption(idx)} style={{ marginLeft: 8 }}>
                                            <Ionicons name="close-circle-outline" size={24} color="red" />
                                        </TouchableOpacity>
                                    )}
                                </View>
                            ))}

                            <TouchableOpacity onPress={addOption} style={{ alignSelf: 'flex-start', marginVertical: 8 }}>
                                <Text style={{ color: theme.primary }}>+ Add Option</Text>
                            </TouchableOpacity>

                            <View style={styles.formActions}>
                                <TouchableOpacity onPress={resetForm} style={{ marginRight: 16 }}>
                                    <Text style={{ color: theme.icon }}>Cancel</Text>
                                </TouchableOpacity>
                                <TouchableOpacity onPress={saveQuestion} style={[styles.saveButton, { backgroundColor: theme.primary }]}>
                                    <Text style={{ color: '#fff', fontWeight: 'bold' }}>Save Question</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    )}
                </ScrollView>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingBottom: 16,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: '#ccc',
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    content: {
        padding: 20,
        paddingBottom: 40,
    },
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        padding: 40,
    },
    questionCard: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
        marginBottom: 12,
    },
    addButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        borderWidth: 1,
        borderStyle: 'dashed',
        borderRadius: 12,
        marginTop: 8,
    },
    formCard: {
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
        marginTop: 8,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '700',
        marginBottom: 12,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 8,
    },
    input: {
        height: 44,
        borderWidth: 1,
        borderRadius: 8,
        paddingHorizontal: 12,
        fontSize: 16,
        marginBottom: 0,
    },
    optionRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    formActions: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        alignItems: 'center',
        marginTop: 16,
    },
    saveButton: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 8,
    },
});
