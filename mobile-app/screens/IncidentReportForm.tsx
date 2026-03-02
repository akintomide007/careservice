import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, ScrollView } from 'react-native';

interface IncidentReportFormProps {
  activeSession: any;
  onSubmit: (incidentData: any) => Promise<void>;
  onBack: () => void;
}

export default function IncidentReportForm({ activeSession, onSubmit, onBack }: IncidentReportFormProps) {
  const [incidentForm, setIncidentForm] = useState({
    incidentType: 'Behavioral',
    severity: 'medium',
    description: '',
    actionTaken: '',
  });

  const handleSubmit = async () => {
    await onSubmit(incidentForm);
  };

  return (
    <ScrollView style={styles.content}>
      <View style={styles.card}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        
        <Text style={styles.cardTitle}>Incident Report</Text>
        <Text style={styles.cardSubtitle}>
          Client: {activeSession?.client?.firstName} {activeSession?.client?.lastName}
        </Text>
        
        <Text style={styles.label}>Incident Type</Text>
        <View style={styles.pickerContainer}>
          <Text style={styles.pickerText}>{incidentForm.incidentType}</Text>
        </View>
        
        <Text style={styles.label}>Severity Level</Text>
        <View style={styles.severityButtons}>
          {['low', 'medium', 'high', 'critical'].map((sev) => (
            <TouchableOpacity
              key={sev}
              style={[
                styles.severityButton,
                incidentForm.severity === sev && styles.severityButtonActive
              ]}
              onPress={() => setIncidentForm({...incidentForm, severity: sev})}
            >
              <Text style={[
                styles.severityButtonText,
                incidentForm.severity === sev && styles.severityButtonTextActive
              ]}>
                {sev.toUpperCase()}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        
        <Text style={styles.label}>Description</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Describe what happened..."
          value={incidentForm.description}
          onChangeText={(text) => setIncidentForm({...incidentForm, description: text})}
          multiline
          numberOfLines={4}
        />
        
        <Text style={styles.label}>Action Taken</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="What action was taken?"
          value={incidentForm.actionTaken}
          onChangeText={(text) => setIncidentForm({...incidentForm, actionTaken: text})}
          multiline
          numberOfLines={3}
        />
        
        <TouchableOpacity
          style={[styles.button, styles.dangerButton]}
          onPress={handleSubmit}
        >
          <Text style={styles.buttonText}>Submit Incident Report</Text>
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
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
    marginTop: 16,
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
  severityButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  severityButton: {
    flex: 1,
    padding: 12,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  severityButtonActive: {
    backgroundColor: '#dc2626',
    borderColor: '#dc2626',
  },
  severityButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6b7280',
  },
  severityButtonTextActive: {
    color: '#fff',
  },
  button: {
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 16,
  },
  dangerButton: {
    backgroundColor: '#dc2626',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
