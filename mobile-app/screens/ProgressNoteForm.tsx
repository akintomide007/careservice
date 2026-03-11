import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import VoiceToTextInput from '../components/VoiceToTextInput';

interface ProgressNoteFormProps {
  activeSession: any;
  onSubmit: (noteData: any) => Promise<void>;
  onBack: () => void;
}

export default function ProgressNoteForm({ activeSession, onSubmit, onBack }: ProgressNoteFormProps) {
  const [noteForm, setNoteForm] = useState({
    serviceType: 'Community-Based Support',
    reasonForService: '',
    supportsProvided: '',
    progressNotes: '',
  });

  const handleSubmit = async () => {
    await onSubmit(noteForm);
  };

  return (
    <ScrollView style={styles.content}>
      <View style={styles.card}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        
        <Text style={styles.cardTitle}>Progress Note</Text>
        <Text style={styles.cardSubtitle}>
          Client: {activeSession?.client?.firstName} {activeSession?.client?.lastName}
        </Text>
        
        <Text style={styles.label}>Service Type</Text>
        <View style={styles.pickerContainer}>
          <Text style={styles.pickerText}>{noteForm.serviceType}</Text>
        </View>
        
        <View style={styles.labelRow}>
          <Text style={styles.label}>Reason for Service</Text>
          <Ionicons name="mic-outline" size={16} color="#3b82f6" />
        </View>
        <VoiceToTextInput
          value={noteForm.reasonForService}
          onChange={(text) => setNoteForm({...noteForm, reasonForService: text})}
          placeholder="Type or speak why service was provided today..."
          multiline
          numberOfLines={3}
        />
        
        <View style={styles.labelRow}>
          <Text style={styles.label}>Supports Provided</Text>
          <Ionicons name="mic-outline" size={16} color="#3b82f6" />
        </View>
        <VoiceToTextInput
          value={noteForm.supportsProvided}
          onChange={(text) => setNoteForm({...noteForm, supportsProvided: text})}
          placeholder="Type or speak what supports were provided..."
          multiline
          numberOfLines={3}
        />
        
        <View style={styles.labelRow}>
          <Text style={styles.label}>Progress Notes</Text>
          <Ionicons name="mic-outline" size={16} color="#3b82f6" />
        </View>
        <VoiceToTextInput
          value={noteForm.progressNotes}
          onChange={(text) => setNoteForm({...noteForm, progressNotes: text})}
          placeholder="Type or speak to document progress and observations..."
          multiline
          numberOfLines={4}
        />
        
        <TouchableOpacity
          style={[styles.button, styles.primaryButton]}
          onPress={handleSubmit}
        >
          <Text style={styles.buttonText}>Create Progress Note</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    padding: 16,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  backButton: {
    marginBottom: 16,
  },
  backText: {
    color: '#2563eb',
    fontSize: 16,
    fontWeight: '600',
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111',
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 16,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
    marginTop: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    padding: 14,
    borderRadius: 10,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    padding: 14,
    borderRadius: 10,
    backgroundColor: '#f9fafb',
  },
  pickerText: {
    fontSize: 16,
    color: '#111',
  },
  button: {
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 16,
  },
  primaryButton: {
    backgroundColor: '#2563eb',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
