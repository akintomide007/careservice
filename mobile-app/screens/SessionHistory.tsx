import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView } from 'react-native';

interface SessionHistoryProps {
  sessionHistory: any[];
  onBack: () => void;
}

export default function SessionHistory({ sessionHistory, onBack }: SessionHistoryProps) {
  return (
    <ScrollView style={styles.content}>
      <View style={styles.card}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        
        <Text style={styles.cardTitle}>Session History</Text>
        <Text style={styles.cardSubtitle}>Your past service sessions</Text>
        
        {sessionHistory.length === 0 ? (
          <Text style={styles.emptyText}>No session history available</Text>
        ) : (
          sessionHistory.map((session) => (
            <View key={session.id} style={styles.historyCard}>
              <View style={styles.historyHeader}>
                <Text style={styles.historyClient}>
                  {session.client?.firstName} {session.client?.lastName}
                </Text>
                <Text style={styles.historyHours}>{session.totalHours || '0'} hrs</Text>
              </View>
              <Text style={styles.historyDetail}>
                {new Date(session.clockInTime).toLocaleDateString()} • {session.serviceType}
              </Text>
              <Text style={[styles.historyStatus, 
                session.status === 'completed' && styles.statusCompleted]}>
                {session.status}
              </Text>
            </View>
          ))
        )}
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
  emptyText: {
    textAlign: 'center',
    color: '#9ca3af',
    padding: 32,
    fontSize: 15,
  },
  historyCard: {
    padding: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    marginBottom: 12,
    backgroundColor: '#fafafa',
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  historyClient: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111',
  },
  historyHours: {
    fontSize: 14,
    fontWeight: '700',
    color: '#2563eb',
  },
  historyDetail: {
    fontSize: 13,
    color: '#6b7280',
    marginBottom: 8,
  },
  historyStatus: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6b7280',
    textTransform: 'uppercase',
  },
  statusCompleted: {
    color: '#16a34a',
  },
});
