import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
}

interface AppHeaderProps {
  user: User;
  onLogout: () => void;
}

export default function AppHeader({ user, onLogout }: AppHeaderProps) {
  return (
    <View style={styles.header}>
      <View style={styles.headerContent}>
        <Text style={styles.headerTitle}>Hello, {user?.firstName}!</Text>
        <Text style={styles.headerRole}>{user?.role.toUpperCase()}</Text>
      </View>
      <TouchableOpacity onPress={onLogout} style={styles.logoutButton}>
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
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
});
