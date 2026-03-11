import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const API_URL = 'http://localhost:3001';

interface ClientProfileScreenProps {
  token: string;
  clientId: string;
  onBack: () => void;
}

interface Client {
  id: string;
  firstName: string;
  lastName: string;
  dddId: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  phone?: string;
  email?: string;
  dateOfBirth?: string;
  guardianName?: string;
  guardianPhone?: string;
  guardianEmail?: string;
  guardianRelationship?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  medicalInfo?: string;
  allergies?: string;
  medications?: string;
  behavioralNotes?: string;
  preferences?: string;
  communicationPreferences?: string;
}

export default function ClientProfileScreen({ token, clientId, onBack }: ClientProfileScreenProps) {
  const [client, setClient] = useState<Client | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadClientProfile();
  }, [clientId]);

  const loadClientProfile = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/api/clients/${clientId}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const data = await response.json();
      setClient(data);
    } catch (error) {
      console.error('Error loading client profile:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#3b82f6" />
          </TouchableOpacity>
          <Text style={styles.title}>Client Profile</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3b82f6" />
          <Text style={styles.loadingText}>Loading profile...</Text>
        </View>
      </View>
    );
  }

  if (!client) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#3b82f6" />
          </TouchableOpacity>
          <Text style={styles.title}>Client Profile</Text>
        </View>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={64} color="#ef4444" />
          <Text style={styles.errorText}>Unable to load client profile</Text>
        </View>
      </View>
    );
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Not provided';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#3b82f6" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.title}>Client Profile</Text>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {client.firstName[0]}{client.lastName[0]}
            </Text>
          </View>
          <Text style={styles.clientName}>
            {client.firstName} {client.lastName}
          </Text>
          <Text style={styles.clientId}>ID: {client.dddId}</Text>
        </View>

        {/* Basic Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            <Ionicons name="person-outline" size={16} color="#3b82f6" /> BASIC INFORMATION
          </Text>
          <View style={styles.card}>
            <InfoRow icon="calendar-outline" label="Date of Birth" value={formatDate(client.dateOfBirth)} />
            <InfoRow icon="call-outline" label="Phone" value={client.phone || 'Not provided'} />
            <InfoRow icon="mail-outline" label="Email" value={client.email || 'Not provided'} />
            <InfoRow 
              icon="location-outline" 
              label="Address" 
              value={client.address ? `${client.address}${client.city ? `, ${client.city}` : ''}${client.state ? `, ${client.state}` : ''}${client.zipCode ? ` ${client.zipCode}` : ''}` : 'Not provided'} 
            />
          </View>
        </View>

        {/* Guardian Information */}
        {(client.guardianName || client.guardianPhone) && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              <Ionicons name="people-outline" size={16} color="#10b981" /> GUARDIAN INFORMATION
            </Text>
            <View style={styles.card}>
              <InfoRow icon="person-outline" label="Guardian Name" value={client.guardianName || 'Not provided'} />
              <InfoRow icon="heart-outline" label="Relationship" value={client.guardianRelationship || 'Not provided'} />
              <InfoRow icon="call-outline" label="Phone" value={client.guardianPhone || 'Not provided'} />
              <InfoRow icon="mail-outline" label="Email" value={client.guardianEmail || 'Not provided'} />
            </View>
          </View>
        )}

        {/* Emergency Contact */}
        {(client.emergencyContactName || client.emergencyContactPhone) && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              <Ionicons name="alert-circle-outline" size={16} color="#ef4444" /> EMERGENCY CONTACT
            </Text>
            <View style={styles.card}>
              <InfoRow icon="person-outline" label="Name" value={client.emergencyContactName || 'Not provided'} />
              <InfoRow icon="call-outline" label="Phone" value={client.emergencyContactPhone || 'Not provided'} />
            </View>
          </View>
        )}

        {/* Medical Information */}
        {(client.medicalInfo || client.allergies || client.medications) && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              <Ionicons name="medical-outline" size={16} color="#f59e0b" /> MEDICAL INFORMATION
            </Text>
            <View style={styles.card}>
              {client.medicalInfo && (
                <InfoBlock icon="clipboard-outline" label="Medical Info" value={client.medicalInfo} />
              )}
              {client.allergies && (
                <InfoBlock icon="warning-outline" label="Allergies" value={client.allergies} />
              )}
              {client.medications && (
                <InfoBlock icon="medkit-outline" label="Medications" value={client.medications} />
              )}
            </View>
          </View>
        )}

        {/* Behavioral & Preferences */}
        {(client.behavioralNotes || client.preferences || client.communicationPreferences) && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              <Ionicons name="happy-outline" size={16} color="#8b5cf6" /> BEHAVIORAL & PREFERENCES
            </Text>
            <View style={styles.card}>
              {client.behavioralNotes && (
                <InfoBlock icon="chatbox-ellipses-outline" label="Behavioral Notes" value={client.behavioralNotes} />
              )}
              {client.preferences && (
                <InfoBlock icon="star-outline" label="Preferences" value={client.preferences} />
              )}
              {client.communicationPreferences && (
                <InfoBlock icon="chatbubble-outline" label="Communication Preferences" value={client.communicationPreferences} />
              )}
            </View>
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

function InfoRow({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <View style={styles.infoRow}>
      <View style={styles.infoLabel}>
        <Ionicons name={icon as any} size={16} color="#6b7280" style={styles.infoIcon} />
        <Text style={styles.labelText}>{label}</Text>
      </View>
      <Text style={styles.valueText}>{value}</Text>
    </View>
  );
}

function InfoBlock({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <View style={styles.infoBlock}>
      <View style={styles.infoLabel}>
        <Ionicons name={icon as any} size={16} color="#6b7280" style={styles.infoIcon} />
        <Text style={styles.labelText}>{label}</Text>
      </View>
      <Text style={styles.blockValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f4ff',
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
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
    color: '#6b7280',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
    paddingHorizontal: 40,
  },
  errorText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    textAlign: 'center',
  },
  profileHeader: {
    alignItems: 'center',
    paddingVertical: 24,
    marginBottom: 24,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#3b82f6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  avatarText: {
    fontSize: 36,
    fontWeight: '700',
    color: '#fff',
  },
  clientName: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111',
    marginBottom: 4,
  },
  clientId: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '600',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#6b7280',
    letterSpacing: 1,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  infoRow: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  infoLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  infoIcon: {
    marginRight: 8,
  },
  labelText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6b7280',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  valueText: {
    fontSize: 15,
    color: '#111',
    fontWeight: '500',
    paddingLeft: 24,
  },
  infoBlock: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  blockValue: {
    fontSize: 15,
    color: '#374151',
    lineHeight: 22,
    paddingLeft: 24,
  },
});
