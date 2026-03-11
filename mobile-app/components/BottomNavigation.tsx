import React from 'react';
import { StyleSheet, View, TouchableOpacity, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

type Screen = 'home' | 'reports' | 'schedules' | 'tasks' | 'forms' | 'formFill' | 'profile' | 'clients' | 'clientGoals' | 'notifications';

interface BottomNavigationProps {
  activeScreen: Screen;
  onNavigate: (screen: Screen) => void;
}

export default function BottomNavigation({ activeScreen, onNavigate }: BottomNavigationProps) {
  const navItems = [
    { screen: 'home' as Screen, icon: 'home', activeIcon: 'home', label: 'Home' },
    { screen: 'schedules' as Screen, icon: 'calendar-outline', activeIcon: 'calendar', label: 'Schedule' },
    { screen: 'forms' as Screen, icon: 'document-text-outline', activeIcon: 'document-text', label: 'Forms' },
    { screen: 'reports' as Screen, icon: 'bar-chart-outline', activeIcon: 'bar-chart', label: 'Reports' },
    { screen: 'clients' as Screen, icon: 'people-outline', activeIcon: 'people', label: 'Clients' },
  ];

  return (
    <View style={styles.bottomNav}>
      {navItems.map((item) => {
        const isActive = activeScreen === item.screen;
        return (
          <TouchableOpacity
            key={item.screen}
            style={styles.navItem}
            onPress={() => onNavigate(item.screen)}
          >
            {isActive ? (
              <View style={styles.activeNavIcon}>
                <Ionicons name={item.activeIcon as any} size={24} color="#3b82f6" />
              </View>
            ) : (
              <Ionicons name={item.icon as any} size={24} color="#9ca3af" />
            )}
            <Text style={isActive ? styles.activeNavLabel : styles.inactiveNavLabel}>
              {item.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  bottomNav: {
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
