import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  ScrollView, 
  TouchableOpacity, 
  Alert 
} from 'react-native';
import DynamicForm from '../components/DynamicForm';

const API_URL = 'http://localhost:3008';

interface FormsScreenProps {
  token: string;
  onBack: () => void;
  activeSession: any;
}

export default function FormsScreen({ token, onBack, activeSession }: FormsScreenProps) {
  const [templates, setTemplates] = useState<any[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      const response = await fetch(`${API_URL}/api/form-templates`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const data = await response.json();
      setTemplates(data);
    } catch (error) {
      Alert.alert('Error', 'Failed to load forms');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectTemplate = async (template: any) => {
    try {
      const response = await fetch(`${API_URL}/api/form-templates/${template.id}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const fullTemplate = await response.json();
      setSelectedTemplate(fullTemplate);
    } catch (error) {
      Alert.alert('Error', 'Failed to load form details');
    }
  };

  const handleSaveForm = async (formData: any, status: 'draft' | 'submitted') => {
    try {
      const response = await fetch(`${API_URL}/api/form-responses`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          templateId: selectedTemplate.id,
          responseData: formData,
          status,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save form');
      }

      Alert.alert(
        'Success',
        status === 'draft' ? 'Form saved as draft!' : 'Form submitted successfully!'
      );
      setSelectedTemplate(null);
      
      if (status === 'submitted') {
        onBack();
      }
    } catch (error) {
      throw new Error('Failed to save form');
    }
  };

  if (selectedTemplate) {
    return (
      <DynamicForm
        template={selectedTemplate}
        onSave={handleSaveForm}
        onCancel={() => setSelectedTemplate(null)}
      />
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Text style={styles.backText}> Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Available Forms</Text>
      </View>

      <ScrollView style={styles.content}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.emptyText}>Loading forms...</Text>
          </View>
        ) : templates.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No forms available</Text>
          </View>
        ) : (
          templates.map((template) => (
            <TouchableOpacity
              key={template.id}
              style={styles.formCard}
              onPress={() => handleSelectTemplate(template)}
            >
              <View style={styles.formHeader}>
                <Text style={styles.formTitle}>{template.name}</Text>
                {template.formType && (
                  <Text style={styles.formType}>
                    {template.formType.replace('_', ' ').toUpperCase()}
                  </Text>
                )}
              </View>
              {template.description && (
                <Text style={styles.formDescription}>{template.description}</Text>
              )}
              {template.serviceType && (
                <Text style={styles.serviceType}>{template.serviceType}</Text>
              )}
              <View style={styles.formFooter}>
                <Text style={styles.fillOutButton}>Fill Out </Text>
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    backgroundColor: '#fff',
    padding: 20,
    paddingTop: 50,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  backButton: {
    marginBottom: 12,
  },
  backText: {
    color: '#2563eb',
    fontSize: 16,
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    color: '#9ca3af',
    fontSize: 15,
  },
  formCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  formHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  formTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111',
    flex: 1,
    marginRight: 8,
  },
  formType: {
    fontSize: 10,
    fontWeight: '600',
    color: '#6b7280',
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  formDescription: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 8,
  },
  serviceType: {
    fontSize: 12,
    color: '#2563eb',
    marginBottom: 12,
  },
  formFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  fillOutButton: {
    color: '#2563eb',
    fontSize: 14,
    fontWeight: '600',
  },
});
