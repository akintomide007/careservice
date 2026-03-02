import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const API_URL = 'http://localhost:3001';

interface FormsListScreenProps {
  token: string;
  onSelectTemplate: (template: any) => void;
  onSelectDraft: (draft: any) => void;
  onBack: () => void;
}

export default function FormsListScreen({ token, onSelectTemplate, onSelectDraft, onBack }: FormsListScreenProps) {
  const [templates, setTemplates] = useState<any[]>([]);
  const [drafts, setDrafts] = useState<any[]>([]);
  const [rejectedForms, setRejectedForms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const headers = { 'Authorization': `Bearer ${token}` };

      const [templatesData, draftsData, rejectedData] = await Promise.all([
        fetch(`${API_URL}/api/form-templates`, { headers }).then(res => res.json()),
        fetch(`${API_URL}/api/form-responses?status=draft`, { headers }).then(res => res.json()),
        fetch(`${API_URL}/api/form-responses?status=rejected`, { headers }).then(res => res.json()),
      ]);

      setTemplates(templatesData);
      setDrafts(draftsData.filter((f: any) => f.status === 'draft'));
      setRejectedForms(rejectedData);
    } catch (error) {
      console.error('Failed to load forms:', error);
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
      onSelectTemplate(fullTemplate);
    } catch (error) {
      Alert.alert('Error', 'Failed to load form template');
    }
  };

  const handleSelectDraft = async (draft: any) => {
    try {
      const [draftData, templateData] = await Promise.all([
        fetch(`${API_URL}/api/form-responses/${draft.id}`, {
          headers: { 'Authorization': `Bearer ${token}` },
        }).then(res => res.json()),
        fetch(`${API_URL}/api/form-templates/${draft.templateId}`, {
          headers: { 'Authorization': `Bearer ${token}` },
        }).then(res => res.json()),
      ]);

      const cleanResponseData = { ...draftData.responseData };
      delete cleanResponseData._approval;

      onSelectDraft({
        draft: { ...draftData, responseData: cleanResponseData },
        template: templateData,
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to load draft form');
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text style={styles.loadingText}>Loading forms...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Integrated Header with Back Button */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#3b82f6" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.title}>Forms</Text>
          <Text style={styles.subtitle}>Select a form to fill out or continue</Text>
        </View>
      </View>

      <ScrollView style={styles.content}>
        {/* Rejected Forms Section */}
        {rejectedForms.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="alert-circle" size={24} color="#dc2626" />
              <Text style={styles.sectionTitle}>Needs Revision</Text>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{rejectedForms.length}</Text>
              </View>
            </View>
            <Text style={styles.sectionSubtitle}>These forms were rejected and need your attention</Text>

            {rejectedForms.map((form) => {
              const approvalData = form.responseData?._approval || {};
              return (
                <TouchableOpacity
                  key={form.id}
                  style={[styles.card, styles.rejectedCard]}
                  onPress={() => handleSelectDraft(form)}
                >
                  <View style={styles.cardHeader}>
                    <View style={styles.rejectedBadge}>
                      <Ionicons name="close-circle" size={14} color="#fff" />
                      <Text style={styles.rejectedBadgeText}>NEEDS REVISION</Text>
                    </View>
                  </View>
                  
                  <Text style={styles.cardTitle}>{form.template?.name || 'Untitled Form'}</Text>
                  
                  {approvalData.comment && (
                    <View style={styles.feedbackBox}>
                      <View style={styles.feedbackHeader}>
                        <Ionicons name="chatbox-ellipses-outline" size={16} color="#991b1b" />
                        <Text style={styles.feedbackLabel}>Manager's Feedback:</Text>
                      </View>
                      <Text style={styles.feedbackText}>{approvalData.comment}</Text>
                    </View>
                  )}
                  
                  <View style={styles.cardFooter}>
                    <View style={styles.dateRow}>
                      <Ionicons name="time-outline" size={14} color="#9ca3af" />
                      <Text style={styles.cardDate}>
                        Updated: {new Date(form.updatedAt || form.createdAt).toLocaleDateString()}
                      </Text>
                    </View>
                  </View>
                  
                  <View style={styles.cardAction}>
                    <Text style={styles.actionText}>Tap to Revise & Resubmit</Text>
                    <Ionicons name="arrow-forward" size={18} color="#3b82f6" />
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        {/* Draft Forms Section */}
        {drafts.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="document-text-outline" size={24} color="#f59e0b" />
              <Text style={styles.sectionTitle}>My Drafts</Text>
              <View style={[styles.badge, styles.draftBadge]}>
                <Text style={styles.badgeText}>{drafts.length}</Text>
              </View>
            </View>
            <Text style={styles.sectionSubtitle}>Continue working on your saved forms</Text>

            {drafts.map((draft) => (
              <TouchableOpacity
                key={draft.id}
                style={[styles.card, styles.draftCard]}
                onPress={() => handleSelectDraft(draft)}
              >
                <View style={styles.cardHeader}>
                  <View style={styles.draftBadgeSmall}>
                    <Ionicons name="create-outline" size={14} color="#fff" />
                    <Text style={styles.draftBadgeText}>DRAFT</Text>
                  </View>
                </View>
                
                <Text style={styles.cardTitle}>{draft.template?.name || 'Untitled Form'}</Text>
                
                {draft.template?.description && (
                  <Text style={styles.cardDescription}>{draft.template.description}</Text>
                )}
                
                <View style={styles.cardFooter}>
                  <View style={styles.dateRow}>
                    <Ionicons name="time-outline" size={14} color="#9ca3af" />
                    <Text style={styles.cardDate}>
                      Last updated: {new Date(draft.updatedAt || draft.createdAt).toLocaleDateString()}
                    </Text>
                  </View>
                </View>
                
                <View style={styles.cardAction}>
                  <Text style={styles.actionText}>Continue Editing</Text>
                  <Ionicons name="arrow-forward" size={18} color="#3b82f6" />
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Available Templates Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="document-outline" size={24} color="#3b82f6" />
            <Text style={styles.sectionTitle}>Available Forms</Text>
          </View>
          <Text style={styles.sectionSubtitle}>Select a form template to begin</Text>

          {templates.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="folder-open-outline" size={64} color="#d1d5db" />
              <Text style={styles.emptyText}>No forms available</Text>
            </View>
          ) : (
            templates.map((template) => (
              <TouchableOpacity
                key={template.id}
                style={styles.card}
                onPress={() => handleSelectTemplate(template)}
              >
                <View style={styles.cardHeader}>
                  <Ionicons name="document" size={20} color="#3b82f6" />
                </View>
                
                <Text style={styles.cardTitle}>{template.name}</Text>
                
                {template.description && (
                  <Text style={styles.cardDescription}>{template.description}</Text>
                )}
                
                <View style={styles.cardMeta}>
                  <View style={styles.metaItem}>
                    <Ionicons name="pricetag-outline" size={14} color="#6b7280" />
                    <Text style={styles.metaText}>{template.formType?.replace('_', ' ')}</Text>
                  </View>
                  {template.serviceType && (
                    <View style={styles.serviceTypeBadge}>
                      <Ionicons name="medical-outline" size={12} color="#1e40af" />
                      <Text style={styles.serviceTypeText}>{template.serviceType}</Text>
                    </View>
                  )}
                </View>
                
                <View style={styles.cardAction}>
                  <Text style={styles.actionText}>Fill Out Form</Text>
                  <Ionicons name="arrow-forward" size={18} color="#3b82f6" />
                </View>
              </TouchableOpacity>
            ))
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f4ff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f4ff',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6b7280',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: 'transparent',
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    marginRight: 12,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  headerContent: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111',
  },
  subtitle: {
    fontSize: 13,
    color: '#6b7280',
    marginTop: 2,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111',
    flex: 1,
  },
  sectionSubtitle: {
    fontSize: 13,
    color: '#6b7280',
    marginBottom: 16,
    marginLeft: 32,
  },
  badge: {
    backgroundColor: '#dc2626',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  draftBadge: {
    backgroundColor: '#f59e0b',
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  rejectedCard: {
    borderWidth: 2,
    borderColor: '#fca5a5',
  },
  draftCard: {
    borderWidth: 2,
    borderColor: '#fcd34d',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  rejectedBadge: {
    backgroundColor: '#dc2626',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  rejectedBadgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
  },
  draftBadgeSmall: {
    backgroundColor: '#f59e0b',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  draftBadgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#111',
    marginBottom: 8,
  },
  cardDescription: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 12,
    lineHeight: 20,
  },
  feedbackBox: {
    backgroundColor: '#fee2e2',
    borderLeftWidth: 4,
    borderLeftColor: '#dc2626',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  feedbackHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  feedbackLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#991b1b',
  },
  feedbackText: {
    fontSize: 13,
    color: '#7f1d1d',
    lineHeight: 18,
  },
  cardFooter: {
    marginBottom: 12,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  cardDate: {
    fontSize: 12,
    color: '#9ca3af',
  },
  cardMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    flexWrap: 'wrap',
    gap: 8,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 12,
    color: '#6b7280',
    textTransform: 'capitalize',
    fontWeight: '600',
  },
  serviceTypeBadge: {
    backgroundColor: '#dbeafe',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  serviceTypeText: {
    fontSize: 11,
    color: '#1e40af',
    fontWeight: '600',
  },
  cardAction: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f4ff',
  },
  actionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#3b82f6',
  },
  emptyState: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 40,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  emptyText: {
    fontSize: 16,
    color: '#6b7280',
    marginTop: 16,
  },
});
