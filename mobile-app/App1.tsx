import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, ScrollView, Alert, RefreshControl, ActivityIndicator } from 'react-native';

const API_URL = 'http://localhost:3001';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
}

type Screen = 'dashboard' | 'schedules' | 'tasks' | 'forms' | 'clients';

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  
  const [email, setEmail] = useState('dsp@careservice.com');
  const [password, setPassword] = useState('dsp123');
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  
  const [activeSession, setActiveSession] = useState<any>(null);
  const [clients, setClients] = useState<any[]>([]);
  const [sessionHistory, setSessionHistory] = useState<any[]>([]);

  // Progress Note Form State
  const [noteForm, setNoteForm] = useState({
    serviceType: 'Community-Based Support',
    reasonForService: '',
    supportsProvided: '',
    promptLevel: [] as string[],
    engagement: '',
    mood: '',
    progressNotes: '',
  });

  // Incident Form State
  const [incidentForm, setIncidentForm] = useState({
    incidentType: 'Behavioral',
    severity: 'medium',
    description: '',
    actionTaken: '',
  });

  // Picker modals
  const [showServiceTypePicker, setShowServiceTypePicker] = useState(false);
  const [showIncidentTypePicker, setShowIncidentTypePicker] = useState(false);
  const [showReasonPicker, setShowReasonPicker] = useState(false);
  const [showSupportsPicker, setShowSupportsPicker] = useState(false);
  const [showEngagementPicker, setShowEngagementPicker] = useState(false);
  const [showMoodPicker, setShowMoodPicker] = useState(false);
  const [showActionPicker, setShowActionPicker] = useState(false);

  const serviceTypes = [
    'Community-Based Support',
    'Individual Support - Daily Living',
    'Respite',
    'Behavioral Support',
    'Career Planning / Vocational'
  ];

  const reasonOptions = [
    'ISP goal support',
    'Community participation',
    'Social skills development',
    'Daily living skills',
    'Behavioral support',
    'Recreation/leisure'
  ];

  const supportsOptions = [
    'Verbal prompting',
    'Visual cues/aids',
    'Modeling behavior',
    'Gestural prompts',
    'Physical guidance',
    'Task analysis/breakdown',
    'Positive reinforcement',
    'Environmental modification'
  ];

  const engagementOptions = [
    'Fully engaged, cooperative',
    'Mostly engaged, some redirection needed',
    'Partially engaged',
    'Minimal engagement',
    'Required significant support'
  ];

  const moodOptions = [
    'Happy, positive',
    'Calm, neutral',
    'Anxious',
    'Frustrated',
    'Agitated',
    'Withdrawn'
  ];

  const incidentTypes = [
    'Behavioral',
    'Medical',
    'Safety',
    'Medication Error',
    'Fall/Injury',
    'Property Damage',
    'Other'
  ];

  const actionOptions = [
    'Redirected to appropriate behavior',
    'Provided calming strategies',
    'Contacted supervisor',
    'Called emergency services',
    'Documented and monitored',
    'Modified environment',
    'Administered first aid',
    'Notified family/guardian'
  ];

  const togglePromptLevel = (level: string) => {
    setNoteForm(prev => ({
      ...prev,
      promptLevel: prev.promptLevel.includes(level)
        ? prev.promptLevel.filter(l => l !== level)
        : [...prev.promptLevel, level]
    }));
  };

  const login = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setToken(data.token);
        setUser(data.user);
        setIsLoggedIn(true);
        loadClients(data.token);
        checkActiveSession(data.token);
        loadHistory(data.token);
      } else {
        Alert.alert('Login Failed', data.error || 'Invalid credentials');
      }
    } catch (error) {
      Alert.alert('Error', 'Could not connect to server');
    } finally {
      setLoading(false);
    }
  };

  const loadClients = async (authToken: string) => {
    try {
      const response = await fetch(`${API_URL}/api/clients`, {
        headers: { 'Authorization': `Bearer ${authToken}` },
      });
      const data = await response.json();
      setClients(data);
    } catch (error) {
      console.error('Failed to load clients');
    }
  };

  const checkActiveSession = async (authToken: string) => {
    try {
      const response = await fetch(`${API_URL}/api/sessions/active`, {
        headers: { 'Authorization': `Bearer ${authToken}` },
      });
      const data = await response.json();
      if (data.length > 0) {
        setActiveSession(data[0]);
      }
    } catch (error) {
      console.error('Failed to check active session');
    }
  };

  const loadHistory = async (authToken: string) => {
    try {
      const response = await fetch(`${API_URL}/api/sessions/history`, {
        headers: { 'Authorization': `Bearer ${authToken}` },
      });
      const data = await response.json();
      setSessionHistory(data);
    } catch (error) {
      console.error('Failed to load history');
    }
  };

  const clockIn = async (clientId: string) => {
    try {
      const response = await fetch(`${API_URL}/api/sessions/clock-in`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          clientId,
          serviceType: 'community_based_support',
          latitude: 40.7128,
          longitude: -74.0060,
          locationName: 'Community Center',
        }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setActiveSession(data);
        Alert.alert('Success', 'Clocked in successfully!');
      } else {
        Alert.alert('Error', data.error);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to clock in');
    }
  };

  const clockOut = async () => {
    if (!activeSession) return;
    
    try {
      const response = await fetch(`${API_URL}/api/sessions/clock-out`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId: activeSession.id,
          latitude: 40.7128,
          longitude: -74.0060,
        }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        Alert.alert('Success', `Clocked out! Total hours: ${data.totalHours}`);
        setActiveSession(null);
        loadHistory(token!);
      } else {
        Alert.alert('Error', data.error);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to clock out');
    }
  };

  const createProgressNote = async () => {
    if (!activeSession) {
      Alert.alert('Error', 'No active session');
      return;
    }

    try {
      const today = new Date().toISOString().split('T')[0];
      const now = new Date().toTimeString().split(' ')[0].substring(0, 5);

      const response = await fetch(`${API_URL}/api/progress-notes`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId: activeSession.id,
          clientId: activeSession.clientId,
          serviceType: noteForm.serviceType,
          serviceDate: today,
          startTime: now,
          endTime: now,
          reasonForService: noteForm.reasonForService,
          supportsProvided: noteForm.supportsProvided,
          progressNotes: noteForm.progressNotes,
        }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        Alert.alert('Success', 'Progress note created!');
        setCurrentScreen('home');
        setNoteForm({
          serviceType: 'Community-Based Support',
          reasonForService: '',
          supportsProvided: '',
          promptLevel: [],
          engagement: '',
          mood: '',
          progressNotes: '',
        });
      } else {
        Alert.alert('Error', data.error);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to create progress note');
    }
  };

  const createIncident = async () => {
    if (!activeSession) {
      Alert.alert('Error', 'No active session');
      return;
    }

    try {
      const today = new Date().toISOString().split('T')[0];
      const now = new Date().toTimeString().split(' ')[0].substring(0, 5);

      const response = await fetch(`${API_URL}/api/incidents`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          clientId: activeSession.clientId,
          incidentDate: today,
          incidentTime: now,
          incidentType: incidentForm.incidentType,
          severity: incidentForm.severity,
          employeeStatement: incidentForm.description,
          actionTaken: incidentForm.actionTaken,
          latitude: 40.7128,
          longitude: -74.0060,
        }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        Alert.alert('Success', 'Incident report created!');
        setCurrentScreen('home');
        setIncidentForm({
          incidentType: 'behavioral',
          severity: 'medium',
          description: '',
          actionTaken: '',
        });
      } else {
        Alert.alert('Error', data.error);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to create incident report');
    }
  };

  const logout = () => {
    setIsLoggedIn(false);
    setUser(null);
    setToken(null);
    setActiveSession(null);
    setClients([]);
    setCurrentScreen('home');
  };

  if (!isLoggedIn) {
    return (
      <View style={styles.container}>
        <View style={styles.loginContainer}>
          <View style={styles.logoContainer}>
            <View style={styles.logo}>
              <Text style={styles.logoText}>CP</Text>
            </View>
            <Text style={styles.title}>Care Provider</Text>
            <Text style={styles.subtitle}>Direct Support Professional</Text>
          </View>
          
          <View style={styles.form}>
            <Text style={styles.label}>Email Address</Text>
            <TextInput
              style={styles.input}
              placeholder="email@example.com"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
            />
            
            <Text style={styles.label}>Password</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
            
            <TouchableOpacity
              style={[styles.button, styles.primaryButton, loading && styles.disabledButton]}
              onPress={login}
              disabled={loading}
            >
              <Text style={styles.buttonText}>
                {loading ? 'Signing In...' : 'Sign In'}
              </Text>
            </TouchableOpacity>
            
            <Text style={styles.hint}>Test Account: dsp@careservice.com / dsp123</Text>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Hello, {user?.firstName}!</Text>
          <Text style={styles.headerRole}>{user?.role.toUpperCase()}</Text>
        </View>
        <TouchableOpacity onPress={logout} style={styles.logoutButton}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      {currentScreen === 'home' && (
        <ScrollView style={styles.content}>
          {activeSession ? (
            <View style={[styles.card, styles.activeCard]}>
              <View style={styles.statusBadge}>
                <Text style={styles.statusText}> ACTIVE SESSION</Text>
              </View>
              <Text style={styles.clientNameLarge}>
                {activeSession.client?.firstName} {activeSession.client?.lastName}
              </Text>
              <View style={styles.sessionDetails}>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Service Type:</Text>
                  <Text style={styles.detailValue}>{activeSession.serviceType}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Started:</Text>
                  <Text style={styles.detailValue}>
                    {new Date(activeSession.clockInTime).toLocaleTimeString()}
                  </Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Location:</Text>
                  <Text style={styles.detailValue}>Community Center</Text>
                </View>
              </View>
              
              <TouchableOpacity
                style={[styles.button, styles.dangerButton]}
                onPress={clockOut}
              >
                <Text style={styles.buttonText}>Clock Out</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Select Client</Text>
              <Text style={styles.cardSubtitle}>Choose a client to begin service</Text>
              
              {clients.length === 0 ? (
                <Text style={styles.emptyText}>No clients available</Text>
              ) : (
                clients.map((client) => (
                  <TouchableOpacity
                    key={client.id}
                    style={styles.clientCard}
                    onPress={() => clockIn(client.id)}
                  >
                    <View style={styles.clientInfo}>
                      <Text style={styles.clientName}>
                        {client.firstName} {client.lastName}
                      </Text>
                      <Text style={styles.clientId}>ID: {client.dddId}</Text>
                    </View>
                    <Text style={styles.arrow}></Text>
                  </TouchableOpacity>
                ))
              )}
            </View>
          )}

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Quick Actions</Text>
            
            <TouchableOpacity
              style={[styles.actionButton, !activeSession && styles.disabledButton]}
              disabled={!activeSession}
              onPress={() => setCurrentScreen('progressNote')}
            >
              <Text style={styles.actionIcon}></Text>
              <View style={styles.actionContent}>
                <Text style={[styles.actionButtonText, !activeSession && styles.disabledText]}>
                  Create Progress Note
                </Text>
                <Text style={styles.actionDescription}>Document service provided</Text>
              </View>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.actionButton, !activeSession && styles.disabledButton]}
              disabled={!activeSession}
              onPress={() => setCurrentScreen('incident')}
            >
              <Text style={styles.actionIcon}></Text>
              <View style={styles.actionContent}>
                <Text style={[styles.actionButtonText, !activeSession && styles.disabledText]}>
                  Report Incident
                </Text>
                <Text style={styles.actionDescription}>Document any incidents</Text>
              </View>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => setCurrentScreen('history')}
            >
              <Text style={styles.actionIcon}></Text>
              <View style={styles.actionContent}>
                <Text style={styles.actionButtonText}>View History</Text>
                <Text style={styles.actionDescription}>Past service sessions</Text>
              </View>
            </TouchableOpacity>
          </View>
        </ScrollView>
      )}

      {currentScreen === 'progressNote' && (
        <ScrollView style={styles.content}>
          <View style={styles.card}>
            <TouchableOpacity onPress={() => setCurrentScreen('home')} style={styles.backButton}>
              <Text style={styles.backText}> Back</Text>
            </TouchableOpacity>
            
            <Text style={styles.cardTitle}>Progress Note</Text>
            <Text style={styles.cardSubtitle}>
              Client: {activeSession?.client?.firstName} {activeSession?.client?.lastName}
            </Text>
            
            <Text style={styles.label}>Service Type</Text>
            <View style={styles.pickerContainer}>
              <Text style={styles.pickerText}>{noteForm.serviceType}</Text>
            </View>
            
            <Text style={styles.label}>Reason for Service</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Why was service provided today?"
              value={noteForm.reasonForService}
              onChangeText={(text) => setNoteForm({...noteForm, reasonForService: text})}
              multiline
              numberOfLines={3}
            />
            
            <Text style={styles.label}>Supports Provided</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="What supports were provided?"
              value={noteForm.supportsProvided}
              onChangeText={(text) => setNoteForm({...noteForm, supportsProvided: text})}
              multiline
              numberOfLines={3}
            />
            
            <Text style={styles.label}>Progress Notes</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Document progress and observations..."
              value={noteForm.progressNotes}
              onChangeText={(text) => setNoteForm({...noteForm, progressNotes: text})}
              multiline
              numberOfLines={4}
            />
            
            <TouchableOpacity
              style={[styles.button, styles.primaryButton]}
              onPress={createProgressNote}
            >
              <Text style={styles.buttonText}>Create Progress Note</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      )}

      {currentScreen === 'incident' && (
        <ScrollView style={styles.content}>
          <View style={styles.card}>
            <TouchableOpacity onPress={() => setCurrentScreen('home')} style={styles.backButton}>
              <Text style={styles.backText}> Back</Text>
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
              onPress={createIncident}
            >
              <Text style={styles.buttonText}>Submit Incident Report</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      )}

      {currentScreen === 'history' && (
        <ScrollView style={styles.content}>
          <View style={styles.card}>
            <TouchableOpacity onPress={() => setCurrentScreen('home')} style={styles.backButton}>
              <Text style={styles.backText}> Back</Text>
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
                    {new Date(session.clockInTime).toLocaleDateString()}  {session.serviceType}
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
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  loginContainer: {
    flex: 1,
    padding: 24,
    backgroundColor: '#fff',
    justifyContent: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 48,
  },
  logo: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#2563eb',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  logoText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#111',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  form: {
    width: '100%',
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
  button: {
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 16,
  },
  primaryButton: {
    backgroundColor: '#2563eb',
  },
  dangerButton: {
    backgroundColor: '#dc2626',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  hint: {
    textAlign: 'center',
    marginTop: 24,
    color: '#9ca3af',
    fontSize: 13,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    paddingTop: 50,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#111',
  },
  headerRole: {
    fontSize: 12,
    color: '#2563eb',
    fontWeight: '600',
    marginTop: 4,
  },
  logoutButton: {
    padding: 8,
    paddingHorizontal: 16,
    backgroundColor: '#fee2e2',
    borderRadius: 8,
  },
  logoutText: {
    color: '#dc2626',
    fontWeight: '600',
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
  activeCard: {
    borderWidth: 2,
    borderColor: '#22c55e',
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#dcfce7',
    borderRadius: 20,
    marginBottom: 16,
  },
  statusText: {
    color: '#16a34a',
    fontSize: 12,
    fontWeight: '700',
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
  clientNameLarge: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111',
    marginBottom: 16,
  },
  sessionDetails: {
    marginBottom: 20,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 14,
    color: '#6b7280',
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111',
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
  arrow: {
    fontSize: 20,
    color: '#2563eb',
  },
  emptyText: {
    textAlign: 'center',
    color: '#9ca3af',
    padding: 32,
    fontSize: 15,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    marginBottom: 12,
    backgroundColor: '#fafafa',
  },
  actionIcon: {
    fontSize: 28,
    marginRight: 16,
  },
  actionContent: {
    flex: 1,
  },
  actionButtonText: {
    color: '#111',
    fontSize: 16,
    fontWeight: '600',
  },
  actionDescription: {
    color: '#6b7280',
    fontSize: 13,
    marginTop: 2,
  },
  disabledButton: {
    opacity: 0.4,
  },
  disabledText: {
    color: '#9ca3af',
  },
  backButton: {
    marginBottom: 16,
  },
  backText: {
    color: '#2563eb',
    fontSize: 16,
    fontWeight: '600',
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
