// src/add
import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

type Screen = 'home' | 'reports' | 'schedules' | 'tasks' | 'forms' | 'profile' | 'clients' | 'notifications';

interface DashboardHomeProps {
  activeSession: any;
  clients: any[];
  draftFormsCount?: number;
  todaySchedule?: any[];
  pendingTasks?: any[];
  onClockIn: (clientId: string) => void;
  onClockOut: () => void;
  onNavigate: (screen: Screen) => void;
  userInitial?: string;
}

export default function DashboardHome({
  activeSession,
  clients,
  draftFormsCount = 0,
  todaySchedule = [],
  pendingTasks = [],
  onClockIn,
  onClockOut,
  onNavigate,
  userInitial = 'L',
}: DashboardHomeProps) {
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  const getCurrentTime = () => {
    return new Date().toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };

  return (
    <View style={styles.container}>
      {/* Background Gradient Blobs */}
      <View style={styles.backgroundBlobs}>
        <View style={[styles.blob, styles.blobTopRight]} />
        <View style={[styles.blob, styles.blobBottomLeft]} />
      </View>

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Ionicons name="sunny-outline" size={20} color="#9ca3af" style={styles.sunIcon} />
          <Text style={styles.greeting}>
            {getGreeting()}, <Text style={styles.userName}>Lex!</Text>
          </Text>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity 
            style={styles.notificationButton}
            onPress={() => onNavigate('notifications')}
          >
            <Ionicons name="notifications-outline" size={24} color="#111" />
            <View style={styles.notificationBadge} />
          </TouchableOpacity>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{userInitial}</Text>
          </View>
        </View>
      </View>

      <ScrollView 
        style={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContentContainer}
      >
        {/* Active Session Card */}
        {activeSession ? (
          <LinearGradient
            colors={['#1e40af', '#3b82f6', '#06b6d4']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.sessionCard}
          >
            <View style={styles.sessionCardHeader}>
              <View style={styles.liveSessionBadge}>
                <View style={styles.pulseDot} />
                <Text style={styles.liveSessionText}>LIVE SESSION</Text>
              </View>
              <View style={styles.timeBadge}>
                <Ionicons name="time-outline" size={14} color="#fff" />
                <Text style={styles.timeText}>{getCurrentTime()}</Text>
              </View>
            </View>

            <View style={styles.clientSection}>
              <View style={styles.clientAvatarContainer}>
                <Ionicons name="person" size={14} color="rgba(255,255,255,0.9)" />
              </View>
              <View style={styles.clientInfoSection}>
                <Text style={styles.currentClientLabel}>Current Client</Text>
                <Text style={styles.clientNameLarge}>
                  {activeSession.client?.firstName} {activeSession.client?.lastName}
                </Text>
              </View>
            </View>

            <View style={styles.detailsGrid}>
              <View style={styles.detailChip}>
                <Ionicons name="briefcase-outline" size={10} color="rgba(255,255,255,0.9)" />
                <Text style={styles.chipLabel}>SERVICE</Text>
                <Text style={styles.chipValue}>{activeSession.serviceType}</Text>
              </View>
              <View style={styles.detailChip}>
                <Ionicons name="location-outline" size={10} color="rgba(255,255,255,0.9)" />
                <Text style={styles.chipLabel}>LOCATION</Text>
                <Text style={styles.chipValue}>Community Center</Text>
              </View>
              <View style={styles.detailChip}>
                <Ionicons name="time-outline" size={10} color="rgba(255,255,255,0.9)" />
                <Text style={styles.chipLabel}>DURATION</Text>
                <Text style={styles.chipValue}>1h 42m</Text>
              </View>
              <View style={styles.detailChip}>
                <Ionicons name="calendar-outline" size={10} color="rgba(255,255,255,0.9)" />
                <Text style={styles.chipLabel}>DATE</Text>
                <Text style={styles.chipValue}>Mar 1, 2026</Text>
              </View>
            </View>

            <TouchableOpacity style={styles.clockOutButton} onPress={onClockOut}>
              <Ionicons name="log-out-outline" size={14} color="#1e40af" style={styles.clockOutIcon} />
              <Text style={styles.clockOutText}>Clock Out</Text>
            </TouchableOpacity>
          </LinearGradient>
        ) : (
          <View style={styles.selectClientCard}>
            <Text style={styles.selectClientTitle}>Select Client</Text>
            <Text style={styles.selectClientSubtitle}>Choose a client to begin service</Text>
            
            {clients.length === 0 ? (
              <Text style={styles.emptyText}>No clients available</Text>
            ) : (
              clients.map((client) => (
                <TouchableOpacity  //work
                  key={client.id}
                  style={styles.clientCard}
                  onPress={() => onClockIn(client.id)}
                >
                  <View style={styles.clientInfo}>
                    <Text style={styles.clientName}>
                      {client.firstName} {client.lastName}
                    </Text>
                    <Text style={styles.clientId}>ID: {client.dddId}</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={24} color="#3b82f6" />
                </TouchableOpacity>
              ))
            )}
          </View>
        )}

        {/* Overview Section */}
        <View style={styles.overviewSection}>
          <Text style={styles.sectionTitle}>OVERVIEW</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Ionicons name="calendar" size={16} color="#3b82f6" style={styles.statIcon} />
              <Text style={styles.statValue}>{todaySchedule.length}</Text>
              <Text style={styles.statLabel}>SCHEDULED</Text>
            </View>
            <View style={styles.statCard}>
              <Ionicons name="checkmark-circle" size={16} color="#10b981" style={styles.statIcon} />
              <Text style={styles.statValue}>{pendingTasks.length}</Text>
              <Text style={styles.statLabel}>TASKS</Text>
            </View>
            <View style={styles.statCard}>
              <Ionicons name="document-text" size={16} color="#f59e0b" style={styles.statIcon} />
              <Text style={styles.statValue}>{draftFormsCount}</Text>
              <Text style={styles.statLabel}>DRAFTS</Text>
            </View>
          </View>
        </View>

        {/* Quick Actions Section */}
        <View style={styles.quickActionsSection}>
          <Text style={styles.sectionTitle}>QUICK ACTIONS</Text>
          <View style={styles.actionsGrid}>
            <TouchableOpacity 
              style={styles.actionCard}
              onPress={() => onNavigate('reports')}
            >
              <View style={styles.actionCardHeader}>
                <View style={[styles.actionIconContainer, { backgroundColor: '#dbeafe' }]}>
                  <Ionicons name="bar-chart" size={24} color="#3b82f6" />
                </View>
                <Ionicons name="arrow-forward" size={18} color="#9ca3af" />
              </View>
              <Text style={styles.actionTitle}>Reports</Text>
              <Text style={styles.actionSubtitle}>Progress & history</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.actionCard}
              onPress={() => onNavigate('schedules')}
            >
              <View style={styles.actionCardHeader}>
                <View style={[styles.actionIconContainer, { backgroundColor: '#d1fae5' }]}>
                  <Ionicons name="calendar" size={24} color="#10b981" />
                </View>
                <Ionicons name="arrow-forward" size={18} color="#9ca3af" />
              </View>
              <Text style={styles.actionTitle}>Schedule</Text>
              <Text style={styles.actionSubtitle}>Shifts & appts</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.actionCard}
              onPress={() => onNavigate('tasks')}
            >
              <View style={styles.actionCardHeader}>
                <View style={[styles.actionIconContainer, { backgroundColor: '#fef3c7' }]}>
                  <Ionicons name="checkmark-circle" size={24} color="#f59e0b" />
                </View>
                <Ionicons name="arrow-forward" size={18} color="#9ca3af" />
              </View>
              <Text style={styles.actionTitle}>My Tasks</Text>
              <Text style={styles.actionSubtitle}>Track assignments</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.actionCard}
              onPress={() => onNavigate('forms')}
            >
              <View style={styles.actionCardHeader}>
                <View style={[styles.actionIconContainer, { backgroundColor: '#ede9fe' }]}>
                  <Ionicons name="document-text" size={24} color="#8b5cf6" />
                </View>
                <Ionicons name="arrow-forward" size={18} color="#9ca3af" />
              </View>
              <View style={styles.actionTitleRow}>
                <Text style={styles.actionTitle}>Forms</Text>
                {draftFormsCount > 0 && (
                  <View style={styles.actionBadge}>
                    <Text style={styles.actionBadgeText}>{draftFormsCount}</Text>
                  </View>
                )}
              </View>
              <Text style={styles.actionSubtitle}>Submit & fill</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <TouchableOpacity 
          style={styles.navItem}
          onPress={() => onNavigate('home')}
        >
          <View style={styles.activeNavIcon}>
            <Ionicons name="home" size={24} color="#3b82f6" />
          </View>
          <Text style={styles.activeNavLabel}>Home</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.navItem}
          onPress={() => onNavigate('schedules')}
        >
          <Ionicons name="calendar-outline" size={24} color="#9ca3af" />
          <Text style={styles.inactiveNavLabel}>Schedule</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.navItem}
          onPress={() => onNavigate('forms')}
        >
          <Ionicons name="document-text-outline" size={24} color="#9ca3af" />
          <Text style={styles.inactiveNavLabel}>Forms</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.navItem}
          onPress={() => onNavigate('reports')}
        >
          <Ionicons name="bar-chart-outline" size={24} color="#9ca3af" />
          <Text style={styles.inactiveNavLabel}>Reports</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.navItem}
          onPress={() => onNavigate('clients')}
        >
          <Ionicons name="people-outline" size={24} color="#9ca3af" />
          <Text style={styles.inactiveNavLabel}>Clients</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f4ff',
  },
  backgroundBlobs: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    overflow: 'hidden',
  },
  blob: {
    position: 'absolute',
    width: 300,
    height: 300,
    borderRadius: 150,
    opacity: 0.15,
  },
  blobTopRight: {
    top: -100,
    right: -100,
    backgroundColor: '#3b82f6',
  },
  blobBottomLeft: {
    bottom: 100,
    left: -100,
    backgroundColor: '#10b981',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 25,
    paddingBottom: 6,
    backgroundColor: 'transparent',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sunIcon: {
    marginRight: 8,
  },
  greeting: {
    fontSize: 18,
    color: '#6b7280',
    fontWeight: '400',
  },
  userName: {
    fontWeight: '700',
    color: '#3b82f6',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  notificationButton: {
    width: 44,
    height: 44,
    backgroundColor: '#fff',
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  notificationBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ef4444',
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#8b5cf6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  scrollContent: {
    flex: 1,
  },
  scrollContentContainer: {
    paddingHorizontal: 20,
  },
  sessionCard: {
    borderRadius: 14,
    padding: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  sessionCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  liveSessionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  pulseDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10b981',
    marginRight: 6,
  },
  liveSessionText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  timeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 16,
    gap: 4,
  },
  timeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  clientSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  clientAvatarContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 7,
  },
  clientInfoSection: {
    flex: 1,
  },
  currentClientLabel: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 10,
    fontWeight: '500',
    marginBottom: 2,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  clientNameLarge: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
  detailsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 5,
    marginBottom: 10,
  },
  detailChip: {
    width: '48%',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 8,
    padding: 6,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  chipLabel: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 8,
    fontWeight: '600',
    marginTop: 3,
    marginBottom: 1,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  chipValue: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
  },
  clockOutButton: {
    backgroundColor: '#fff',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 8,
    borderRadius: 8,
    gap: 4,
  },
  clockOutIcon: {
    marginRight: 4,
  },
  clockOutText: {
    color: '#1e40af',
    fontSize: 16,
    fontWeight: '700',
  },
  selectClientCard: {
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
  selectClientTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111',
    marginBottom: 4,
  },
  selectClientSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 16,
  },
  clientCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    marginBottom: 10,
    backgroundColor: '#fafafa',
  },
  clientInfo: {
    flex: 1,
  },
  clientName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111',
  },
  clientId: {
    fontSize: 13,
    color: '#6b7280',
    marginTop: 2,
  },
  emptyText: {
    textAlign: 'center',
    color: '#9ca3af',
    padding: 32,
    fontSize: 15,
  },
  overviewSection: {
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#6b7280',
    letterSpacing: 1,
    marginBottom: 8,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 6,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  statIcon: {
    marginBottom: 6,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 9,
    fontWeight: '600',
    color: '#6b7280',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  quickActionsSection: {
    marginBottom: 24,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  actionCard: {
    width: '48%',
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  actionCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  actionIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111',
    marginBottom: 4,
  },
  actionSubtitle: {
    fontSize: 13,
    color: '#6b7280',
  },
  actionBadge: {
    backgroundColor: '#f59e0b',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  actionBadgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
  },
  bottomNav: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.88)',
    paddingTop: 4,
    paddingBottom: 10,
    paddingHorizontal: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.05)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 1,
  },
  activeNavIcon: {
    backgroundColor: '#dbeafe',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 2,
    marginBottom: 1,
  },
  activeNavLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#3b82f6',
    marginTop: 2,
  },
  inactiveNavLabel: {
    fontSize: 11,
    fontWeight: '500',
    color: '#9ca3af',
    marginTop: 2,
  },
});
