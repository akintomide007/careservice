import React, { useState } from 'react';
import { StyleSheet, View, Alert } from 'react-native';
import LoginScreen from './screens/LoginScreen';
import DashboardHome from './screens/DashboardHome';
import ReportsScreen from './screens/ReportsScreen';
import ScheduleCalendarScreen from './screens/ScheduleCalendarScreen';
import TasksScreen from './screens/TasksScreen';
import FormsListScreen from './screens/FormsListScreen';
import ClientsScreen from './screens/ClientsScreen';
import ClientProfileScreen from './screens/ClientProfileScreen';
import NotificationsScreen from './screens/NotificationsScreen';
import DynamicForm from './components/DynamicForm';
import BottomNavigation from './components/BottomNavigation';

const API_URL = 'http://localhost:3001';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
}

type Screen = 'home' | 'reports' | 'schedules' | 'tasks' | 'forms' | 'formFill' | 'profile' | 'clients' | 'clientProfile' | 'notifications';

export default function App() {
  // Authentication state
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);

  // Navigation state
  const [currentScreen, setCurrentScreen] = useState<Screen>('home');

  // Data state
  const [activeSession, setActiveSession] = useState<any>(null);
  const [clients, setClients] = useState<any[]>([]);
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);
  const [selectedDraft, setSelectedDraft] = useState<any>(null);
  const [draftFormsCount, setDraftFormsCount] = useState(0);
  const [submittedFormsCount, setSubmittedFormsCount] = useState(0);
  const [rejectedFormsCount, setRejectedFormsCount] = useState(0);
  const [todaySchedule, setTodaySchedule] = useState<any[]>([]);
  const [pendingTasks, setPendingTasks] = useState<any[]>([]);

  // Login handler
  const handleLogin = async (email: string, password: string) => {
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
        await loadDashboardData(data.token);
      } else {
        Alert.alert('Login Failed', data.error || 'Invalid credentials');
      }
    } catch (error) {
      Alert.alert('Error', 'Could not connect to server');
    }
  };

  // Logout handler
  const handleLogout = () => {
    setIsLoggedIn(false);
    setUser(null);
    setToken(null);
    setActiveSession(null);
    setClients([]);
    setCurrentScreen('home');
  };

  // Load dashboard data
  const loadDashboardData = async (authToken: string) => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const [clientsData, sessionData, draftsData, submittedData, rejectedData, schedulesData, tasksData] = await Promise.all([
        fetch(`${API_URL}/api/clients`, {
          headers: { 'Authorization': `Bearer ${authToken}` },
        }).then(res => res.json()),
        fetch(`${API_URL}/api/sessions/active`, {
          headers: { 'Authorization': `Bearer ${authToken}` },
        }).then(res => res.json()),
        fetch(`${API_URL}/api/form-responses?status=draft`, {
          headers: { 'Authorization': `Bearer ${authToken}` },
        }).then(res => res.json()).catch(() => []),
        fetch(`${API_URL}/api/form-responses?status=submitted`, {
          headers: { 'Authorization': `Bearer ${authToken}` },
        }).then(res => res.json()).catch(() => []),
        fetch(`${API_URL}/api/form-responses?status=rejected`, {
          headers: { 'Authorization': `Bearer ${authToken}` },
        }).then(res => res.json()).catch(() => []),
        fetch(`${API_URL}/api/schedules/my-schedules?startDate=${today}&endDate=${today}`, {
          headers: { 'Authorization': `Bearer ${authToken}` },
        }).then(res => res.json()).catch(() => []),
        fetch(`${API_URL}/api/tasks/my-tasks?status=pending`, {
          headers: { 'Authorization': `Bearer ${authToken}` },
        }).then(res => res.json()).catch(() => []),
      ]);

      setClients(clientsData);
      // Load active session if one exists
      if (Array.isArray(sessionData) && sessionData.length > 0) {
        setActiveSession(sessionData[0]);
      } else if (sessionData && !Array.isArray(sessionData)) {
        setActiveSession(sessionData);
      }
      setDraftFormsCount(draftsData.filter((f: any) => f.status === 'draft').length);
      setSubmittedFormsCount(submittedData.filter((f: any) => f.status === 'submitted').length);
      setRejectedFormsCount(rejectedData.filter((f: any) => f.status === 'rejected').length);
      setTodaySchedule(schedulesData);
      setPendingTasks(tasksData);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    }
  };

  // Clock in handler
  const handleClockIn = async (clientId: string) => {
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

  // Clock out handler
  const handleClockOut = async () => {
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
        Alert.alert('Success', `Clocked out successfully! Total hours: ${data.totalHours}`);
        // Clear the session and return to Select Client
        setActiveSession(null);
      } else {
        Alert.alert('Error', data.error);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to clock out');
    }
  };

  // Form handlers
  const handleSelectTemplate = (template: any) => {
    setSelectedTemplate(template);
    setSelectedDraft(null);
    setCurrentScreen('formFill');
  };

  const handleSelectDraft = (data: any) => {
    setSelectedTemplate(data.template);
    setSelectedDraft(data.draft);
    setCurrentScreen('formFill');
  };

  const handleFormSave = async (formData: any, status: 'draft' | 'submitted') => {
    try {
      if (selectedDraft) {
        // Update existing draft/rejected form
        await fetch(`${API_URL}/api/form-responses/${selectedDraft.id}`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            responseData: formData,
            status,
          }),
        });
      } else {
        // Create new form response
        await fetch(`${API_URL}/api/form-responses`, {
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
      }

      Alert.alert('Success', status === 'draft' ? 'Form saved as draft!' : 'Form submitted successfully!');
      setSelectedTemplate(null);
      setSelectedDraft(null);
      setCurrentScreen('forms');
      
      if (token) await loadDashboardData(token);
    } catch (error) {
      throw new Error('Failed to save form');
    }
  };

  const handleFormCancel = () => {
    setSelectedTemplate(null);
    setSelectedDraft(null);
    setCurrentScreen('forms');
  };

  // Render login screen if not logged in
  if (!isLoggedIn) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  // Render main app
  return (
    <View style={styles.container}>
      <View style={styles.contentContainer}>
        {currentScreen === 'home' && (
          <DashboardHome
            activeSession={activeSession}
            clients={clients}
            draftFormsCount={draftFormsCount}
            submittedFormsCount={submittedFormsCount}
            rejectedFormsCount={rejectedFormsCount}
            todaySchedule={todaySchedule}
            pendingTasks={pendingTasks}
            onClockIn={handleClockIn}
            onClockOut={handleClockOut}
            onNavigate={(screen) => {
              setCurrentScreen(screen);
              // Refresh data when navigating away from home
              if (token) {
                loadDashboardData(token);
              }
            }}
            onRefresh={async () => {
              // Manual refresh of dashboard data
              if (token) {
                await loadDashboardData(token);
              }
            }}
            userInitial={user?.firstName?.[0] || 'U'}
          />
        )}

        {currentScreen === 'reports' && token && (
          <ReportsScreen
            token={token}
            onBack={() => setCurrentScreen('home')}
          />
        )}

        {currentScreen === 'schedules' && token && (
          <ScheduleCalendarScreen
            token={token}
            onBack={() => setCurrentScreen('home')}
          />
        )}

        {currentScreen === 'tasks' && token && (
          <TasksScreen
            token={token}
            onBack={() => setCurrentScreen('home')}
          />
        )}

        {currentScreen === 'forms' && token && (
          <FormsListScreen
            token={token}
            onSelectTemplate={handleSelectTemplate}
            onSelectDraft={handleSelectDraft}
            onBack={() => setCurrentScreen('home')}
          />
        )}

        {currentScreen === 'clients' && token && (
          <ClientsScreen
            token={token}
            onBack={() => setCurrentScreen('home')}
            onSelectClient={(clientId) => {
              setSelectedClientId(clientId);
              setCurrentScreen('clientProfile');
            }}
          />
        )}

        {currentScreen === 'clientProfile' && token && selectedClientId && (
          <ClientProfileScreen
            token={token}
            clientId={selectedClientId}
            onBack={() => {
              setSelectedClientId(null);
              setCurrentScreen('clients');
            }}
          />
        )}

        {currentScreen === 'notifications' && token && (
          <NotificationsScreen
            token={token}
            onBack={() => setCurrentScreen('home')}
          />
        )}

        {currentScreen === 'formFill' && selectedTemplate && (
          <DynamicForm
            template={selectedTemplate}
            initialData={selectedDraft?.responseData}
            onSave={handleFormSave}
            onCancel={handleFormCancel}
            clients={clients}
            activeClient={activeSession?.client}
          />
        )}
      </View>

      {/* Bottom Navigation - show on all screens except form fill and client profile */}
      {currentScreen !== 'formFill' && currentScreen !== 'clientProfile' && (
        <BottomNavigation
          activeScreen={currentScreen as any}
          onNavigate={(screen) => setCurrentScreen(screen as Screen)}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  contentContainer: {
    flex: 1,
  },
});
