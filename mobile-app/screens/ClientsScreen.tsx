import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const API_URL = 'http://localhost:3001';

interface ClientsScreenProps {
  token: string;
  onBack: () => void;
  onSelectClient: (clientId: string) => void;
}

interface Client {
  id: string;
  firstName: string;
  lastName: string;
  dddId: string;
  address?: string;
  phone?: string;
  email?: string;
  dateOfBirth?: string;
  guardianName?: string;
  guardianPhone?: string;
}

export default function ClientsScreen({ token, onBack, onSelectClient }: ClientsScreenProps) {
  const [clients, setClients] = useState<Client[]>([]);
  const [filteredClients, setFilteredClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadClients();
  }, []);

  useEffect(() => {
    if (searchQuery) {
      const filtered = clients.filter(client =>
        `${client.firstName} ${client.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
        client.dddId?.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredClients(filtered);
    } else {
      setFilteredClients(clients);
    }
  }, [searchQuery, clients]);

  const loadClients = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/api/clients`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const data = await response.json();
      setClients(data);
      setFilteredClients(data);
    } catch (error) {
      console.error('Error loading clients:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#3b82f6" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.title}>Clients</Text>
          <Text style={styles.subtitle}>View and manage your clients</Text>
        </View>
      </View>

      <View style={styles.content}>
        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Ionicons name="search-outline" size={20} color="#6b7280" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by name or ID..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#9ca3af"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color="#6b7280" />
            </TouchableOpacity>
          )}
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Stats */}
          <View style={styles.statsCard}>
            <View style={styles.statItem}>
              <Ionicons name="people" size={24} color="#3b82f6" />
              <Text style={styles.statValue}>{clients.length}</Text>
              <Text style={styles.statLabel}>Total Clients</Text>
            </View>
          </View>

          {/* Clients List */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>ALL CLIENTS</Text>
            {loading ? (
              <View style={styles.centerContent}>
                <Text style={styles.loadingText}>Loading clients...</Text>
              </View>
            ) : filteredClients.length === 0 ? (
              <View style={styles.emptyState}>
                <Ionicons name="people-outline" size={48} color="#d1d5db" style={styles.emptyIcon} />
                <Text style={styles.emptyText}>No clients found</Text>
                <Text style={styles.emptySubtext}>
                  {searchQuery ? 'Try a different search term' : 'No clients assigned to you yet'}
                </Text>
              </View>
            ) : (
              filteredClients.map((client) => (
                <TouchableOpacity
                  key={client.id}
                  style={styles.clientCard}
                  onPress={() => onSelectClient(client.id)}
                >
                  <View style={styles.clientAvatar}>
                    <Ionicons name="person" size={24} color="#3b82f6" />
                  </View>
                  <View style={styles.clientInfo}>
                    <Text style={styles.clientName}>
                      {client.firstName} {client.lastName}
                    </Text>
                    <View style={styles.clientDetails}>
                      <View style={styles.detailRow}>
                        <Ionicons name="card-outline" size={14} color="#6b7280" />
                        <Text style={styles.detailText}>ID: {client.dddId}</Text>
                      </View>
                      {client.phone && (
                        <View style={styles.detailRow}>
                          <Ionicons name="call-outline" size={14} color="#6b7280" />
                          <Text style={styles.detailText}>{client.phone}</Text>
                        </View>
                      )}
                      {client.address && (
                        <View style={styles.detailRow}>
                          <Ionicons name="location-outline" size={14} color="#6b7280" />
                          <Text style={styles.detailText} numberOfLines={1}>
                            {client.address}
                          </Text>
                        </View>
                      )}
                    </View>
                  </View>
                  <Ionicons name="chevron-forward" size={24} color="#9ca3af" />
                </TouchableOpacity>
              ))
            )}
          </View>
        </ScrollView>
      </View>
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#111',
  },
  statsCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 32,
    fontWeight: '700',
    color: '#111',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 13,
    color: '#6b7280',
    marginTop: 4,
  },
  section: {
    marginBottom: 100,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#6b7280',
    letterSpacing: 1,
    marginBottom: 12,
  },
  centerContent: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  loadingText: {
    color: '#6b7280',
    fontSize: 15,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 48,
    backgroundColor: '#fff',
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  emptyIcon: {
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 4,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#9ca3af',
    textAlign: 'center',
  },
  clientCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  clientAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#dbeafe',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  clientInfo: {
    flex: 1,
  },
  clientName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111',
    marginBottom: 6,
  },
  clientDetails: {
    gap: 4,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  detailText: {
    fontSize: 13,
    color: '#6b7280',
  },
});
