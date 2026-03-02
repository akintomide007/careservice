import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, Alert } from 'react-native';

const API_URL = 'http://localhost:3001';

interface SchedulesScreenProps {
  token: string;
  onBack: () => void;
}

export default function SchedulesScreen({ token, onBack }: SchedulesScreenProps) {
  const [schedules, setSchedules] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSchedules();
  }, []);

  const loadSchedules = async () => {
    try {
      setLoading(true);
      const today = new Date().toISOString().split('T')[0];
      const response = await fetch(`${API_URL}/api/schedules?startDate=${today}&endDate=${today}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const data = await response.json();
      setSchedules(data);
    } catch (error) {
      console.error('Error loading schedules:', error);
      Alert.alert('Error', 'Failed to load schedules');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>My Schedule</Text>
        <Text style={styles.subtitle}>Today's appointments and shifts</Text>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Today's Shifts</Text>
          
          {loading ? (
            <Text style={styles.emptyText}>Loading schedules...</Text>
          ) : schedules.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>📅</Text>
              <Text style={styles.emptyText}>No scheduled shifts for today</Text>
              <Text style={styles.emptySubtext}>Enjoy your day off!</Text>
            </View>
          ) : (
            schedules.map((schedule) => (
              <View key={schedule.id} style={styles.scheduleCard}>
                <View style={styles.timeSection}>
                  <Text style={styles.timeText}>{schedule.startTime}</Text>
                  <Text style={styles.timeDivider}>-</Text>
                  <Text style={styles.timeText}>{schedule.endTime}</Text>
                </View>
                
                <View style={styles.scheduleInfo}>
                  <View style={styles.clientRow}>
                    <View style={styles.clientAvatar}>
                      <Text style={styles.avatarText}>
                        {schedule.client?.firstName?.[0]}{schedule.client?.lastName?.[0]}
                      </Text>
                    </View>
                    <View style={styles.clientDetails}>
                      <Text style={styles.clientName}>
                        {schedule.client?.firstName} {schedule.client?.lastName}
                      </Text>
                      <Text style={styles.serviceType}>
                        {schedule.serviceType || 'General Care'}
                      </Text>
                    </View>
                  </View>
                  
                  {schedule.notes && (
                    <View style={styles.notesSection}>
                      <Text style={styles.notesLabel}>Notes:</Text>
                      <Text style={styles.notesText}>{schedule.notes}</Text>
                    </View>
                  )}
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
    backgroundColor: '#f8f9fa',
  },
  header: {
    padding: 20,
    paddingTop: 50,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  backButton: {
    marginBottom: 16,
  },
  backText: {
    color: '#2563eb',
    fontSize: 16,
    fontWeight: '600',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#111',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#6b7280',
  },
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
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111',
    marginBottom: 16,
  },
  emptyState: {
    padding: 40,
    alignItems: 'center',
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyText: {
    textAlign: 'center',
    color: '#6b7280',
    fontSize: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    textAlign: 'center',
    color: '#9ca3af',
    fontSize: 14,
  },
  scheduleCard: {
    flexDirection: 'row',
    padding: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    marginBottom: 12,
    backgroundColor: '#fafafa',
  },
  timeSection: {
    alignItems: 'center',
    paddingRight: 16,
    borderRightWidth: 2,
    borderRightColor: '#2563eb',
    marginRight: 16,
  },
  timeText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111',
  },
  timeDivider: {
    fontSize: 12,
    color: '#6b7280',
    marginVertical: 4,
  },
  scheduleInfo: {
    flex: 1,
  },
  clientRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  clientAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#2563eb',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  clientDetails: {
    flex: 1,
  },
  clientName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111',
    marginBottom: 2,
  },
  serviceType: {
    fontSize: 13,
    color: '#6b7280',
  },
  notesSection: {
    backgroundColor: '#eff6ff',
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  notesLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1e40af',
    marginBottom: 4,
  },
  notesText: {
    fontSize: 13,
    color: '#1e3a8a',
  },
});
