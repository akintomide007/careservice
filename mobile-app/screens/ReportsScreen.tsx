import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, TextInput, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const API_URL = 'http://localhost:3001';

interface ReportsScreenProps {
  token: string;
  onBack: () => void;
}

export default function ReportsScreen({ token, onBack }: ReportsScreenProps) {
  const [progressNotes, setProgressNotes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    loadProgressNotes();
  }, [filterStatus]);

  const loadProgressNotes = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/api/progress-notes`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const notes = await response.json();
      setProgressNotes(notes);
    } catch (error) {
      console.error('Error loading progress notes:', error);
      Alert.alert('Error', 'Failed to load reports');
    } finally {
      setLoading(false);
    }
  };

  const filteredNotes = progressNotes.filter(note => {
    const matchesSearch = searchTerm === '' || 
      note.client?.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      note.client?.lastName?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || note.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: progressNotes.length,
    drafts: progressNotes.filter(n => n.status === 'draft').length,
    approved: progressNotes.filter(n => n.status === 'approved').length,
    thisMonth: progressNotes.filter(n => {
      const noteDate = new Date(n.serviceDate);
      const now = new Date();
      return noteDate.getMonth() === now.getMonth() && 
             noteDate.getFullYear() === now.getFullYear();
    }).length,
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#3b82f6" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.title}>Progress Reports</Text>
          <Text style={styles.subtitle}>View and manage all service documentation</Text>
        </View>
      </View>

      <ScrollView style={styles.content}>
        {/* Search and Filters */}
        <View style={styles.filtersCard}>
          <View style={styles.searchContainer}>
            <Ionicons name="search-outline" size={20} color="#6b7280" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search by client name..."
              value={searchTerm}
              onChangeText={setSearchTerm}
            />
          </View>
          
          <View style={styles.filterButtons}>
            {['all', 'draft', 'submitted', 'approved'].map((status) => (
              <TouchableOpacity
                key={status}
                style={[
                  styles.filterButton,
                  filterStatus === status && styles.filterButtonActive
                ]}
                onPress={() => setFilterStatus(status)}
              >
                <Text style={[
                  styles.filterButtonText,
                  filterStatus === status && styles.filterButtonTextActive
                ]}>
                  {status.toUpperCase()}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Statistics */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Ionicons name="bar-chart" size={24} color="#3b82f6" />
            <Text style={styles.statLabel}>Total</Text>
            <Text style={styles.statValue}>{stats.total}</Text>
          </View>
          
          <View style={styles.statCard}>
            <Ionicons name="document-text-outline" size={24} color="#3b82f6" />
            <Text style={styles.statLabel}>Drafts</Text>
            <Text style={styles.statValue}>{stats.drafts}</Text>
          </View>
          
          <View style={styles.statCard}>
            <Ionicons name="checkmark-circle" size={24} color="#3b82f6" />
            <Text style={styles.statLabel}>Approved</Text>
            <Text style={styles.statValue}>{stats.approved}</Text>
          </View>
          
          <View style={styles.statCard}>
            <Ionicons name="calendar-outline" size={24} color="#3b82f6" />
            <Text style={styles.statLabel}>This Month</Text>
            <Text style={styles.statValue}>{stats.thisMonth}</Text>
          </View>
        </View>

        {/* Reports List */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="documents" size={22} color="#3b82f6" />
            <Text style={styles.cardTitle}>All Reports</Text>
          </View>
          
          {loading ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="hourglass-outline" size={32} color="#9ca3af" />
              <Text style={styles.emptyText}>Loading reports...</Text>
            </View>
          ) : filteredNotes.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="document-outline" size={32} color="#9ca3af" />
              <Text style={styles.emptyText}>No reports found</Text>
            </View>
          ) : (
            filteredNotes.map((note) => (
              <View key={note.id} style={styles.reportCard}>
                <View style={styles.reportHeader}>
                  <View style={styles.clientAvatar}>
                    <Text style={styles.avatarText}>
                      {note.client?.firstName?.[0]}{note.client?.lastName?.[0]}
                    </Text>
                  </View>
                  <View style={styles.reportInfo}>
                    <Text style={styles.clientName}>
                      {note.client?.firstName} {note.client?.lastName}
                    </Text>
                    <View style={styles.infoRow}>
                      <Ionicons name="briefcase-outline" size={14} color="#6b7280" />
                      <Text style={styles.reportDetail}>{note.serviceType}</Text>
                    </View>
                    <View style={styles.infoRow}>
                      <Ionicons name="time-outline" size={14} color="#6b7280" />
                      <Text style={styles.reportDate}>
                        {new Date(note.serviceDate).toLocaleDateString()} • {note.startTime}-{note.endTime}
                      </Text>
                    </View>
                  </View>
                  <View style={[
                    styles.statusBadge,
                    note.status === 'approved' && styles.statusApproved,
                    note.status === 'submitted' && styles.statusSubmitted,
                    note.status === 'draft' && styles.statusDraft,
                  ]}>
                    {note.status === 'approved' && <Ionicons name="checkmark-circle" size={12} color="#059669" />}
                    {note.status === 'submitted' && <Ionicons name="paper-plane" size={12} color="#2563eb" />}
                    {note.status === 'draft' && <Ionicons name="create-outline" size={12} color="#d97706" />}
                    <Text style={[
                      styles.statusText,
                      note.status === 'approved' && styles.statusTextApproved,
                      note.status === 'submitted' && styles.statusTextSubmitted,
                      note.status === 'draft' && styles.statusTextDraft,
                    ]}>
                      {note.status}
                    </Text>
                  </View>
                </View>
              </View>
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
  filtersCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 12,
    paddingHorizontal: 12,
    marginBottom: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    padding: 12,
    fontSize: 15,
  },
  filterButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  filterButton: {
    flex: 1,
    padding: 10,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 10,
    alignItems: 'center',
  },
  filterButtonActive: {
    backgroundColor: '#3b82f6',
    borderColor: '#3b82f6',
  },
  filterButtonText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#6b7280',
  },
  filterButtonTextActive: {
    color: '#fff',
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  statLabel: {
    fontSize: 11,
    color: '#6b7280',
    marginTop: 6,
    marginBottom: 2,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    marginBottom: 100,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    textAlign: 'center',
    color: '#9ca3af',
    marginTop: 12,
    fontSize: 15,
  },
  reportCard: {
    padding: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    marginBottom: 12,
    backgroundColor: '#f9fafb',
  },
  reportHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  clientAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#3b82f6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  reportInfo: {
    flex: 1,
  },
  clientName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111',
    marginBottom: 4,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 2,
  },
  reportDetail: {
    fontSize: 13,
    color: '#6b7280',
  },
  reportDate: {
    fontSize: 12,
    color: '#9ca3af',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 4,
  },
  statusApproved: {
    backgroundColor: '#dcfce7',
  },
  statusSubmitted: {
    backgroundColor: '#dbeafe',
  },
  statusDraft: {
    backgroundColor: '#fef3c7',
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  statusTextApproved: {
    color: '#059669',
  },
  statusTextSubmitted: {
    color: '#2563eb',
  },
  statusTextDraft: {
    color: '#d97706',
  },
});
