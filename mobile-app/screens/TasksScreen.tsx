import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const API_URL = 'http://localhost:3001';

interface TasksScreenProps {
  token: string;
  onBack: () => void;
}

export default function TasksScreen({ token, onBack }: TasksScreenProps) {
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/api/tasks`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const data = await response.json();
      setTasks(data);
    } catch (error) {
      console.error('Error loading tasks:', error);
      Alert.alert('Error', 'Failed to load tasks');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleTask = async (taskId: string, currentStatus: string) => {
    try {
      const newStatus = currentStatus === 'completed' ? 'pending' : 'completed';
      const response = await fetch(`${API_URL}/api/tasks/${taskId}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        loadTasks();
      } else {
        Alert.alert('Error', 'Failed to update task');
      }
    } catch (error) {
      console.error('Error updating task:', error);
      Alert.alert('Error', 'Failed to update task');
    }
  };

  const pendingTasks = tasks.filter(t => t.status !== 'completed');
  const completedTasks = tasks.filter(t => t.status === 'completed');

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#3b82f6" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.title}>My Tasks</Text>
          <Text style={styles.subtitle}>Track your assigned tasks</Text>
        </View>
      </View>

      <ScrollView style={styles.content}>
        {/* Statistics */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <View style={styles.statIconContainer}>
              <Ionicons name="list-outline" size={28} color="#3b82f6" />
            </View>
            <Text style={styles.statValue}>{pendingTasks.length}</Text>
            <Text style={styles.statLabel}>Pending</Text>
          </View>
          
          <View style={styles.statCard}>
            <View style={styles.statIconContainer}>
              <Ionicons name="checkmark-done-outline" size={28} color="#22c55e" />
            </View>
            <Text style={styles.statValue}>{completedTasks.length}</Text>
            <Text style={styles.statLabel}>Completed</Text>
          </View>
        </View>

        {/* Pending Tasks */}
        <View style={styles.card}>
          <View style={styles.sectionHeader}>
            <Ionicons name="time-outline" size={20} color="#3b82f6" />
            <Text style={styles.cardTitle}>Pending Tasks</Text>
          </View>
          
          {loading ? (
            <Text style={styles.emptyText}>Loading tasks...</Text>
          ) : pendingTasks.length === 0 ? (
            <View style={styles.emptyState}>
              <View style={styles.emptyIconContainer}>
                <Ionicons name="checkmark-circle-outline" size={48} color="#22c55e" />
              </View>
              <Text style={styles.emptyText}>All tasks completed!</Text>
              <Text style={styles.emptySubtext}>Great job!</Text>
            </View>
          ) : (
            pendingTasks.map((task) => (
              <TouchableOpacity
                key={task.id}
                style={styles.taskCard}
                onPress={() => handleToggleTask(task.id, task.status)}
              >
                <View style={styles.checkbox}>
                  <View style={styles.checkboxInner} />
                </View>
                
                <View style={styles.taskInfo}>
                  <Text style={styles.taskTitle}>{task.title}</Text>
                  {task.description && (
                    <Text style={styles.taskDescription}>{task.description}</Text>
                  )}
                  <View style={styles.taskMeta}>
                    {task.priority && (
                      <View style={[
                        styles.priorityBadge,
                        task.priority === 'high' && styles.priorityHigh,
                        task.priority === 'medium' && styles.priorityMedium,
                        task.priority === 'low' && styles.priorityLow,
                      ]}>
                        <Ionicons
                          name={
                            task.priority === 'high' ? 'alert-circle' :
                            task.priority === 'medium' ? 'warning' :
                            'information-circle'
                          }
                          size={12}
                          color={
                            task.priority === 'high' ? '#dc2626' :
                            task.priority === 'medium' ? '#f59e0b' :
                            '#22c55e'
                          }
                        />
                        <Text style={[
                          styles.priorityText,
                          task.priority === 'high' && styles.priorityHighText,
                          task.priority === 'medium' && styles.priorityMediumText,
                          task.priority === 'low' && styles.priorityLowText,
                        ]}>
                          {task.priority.toUpperCase()}
                        </Text>
                      </View>
                    )}
                    {task.dueDate && (
                      <View style={styles.dueDateContainer}>
                        <Ionicons name="calendar-outline" size={12} color="#6b7280" />
                        <Text style={styles.dueDate}>
                          Due: {new Date(task.dueDate).toLocaleDateString()}
                        </Text>
                      </View>
                    )}
                  </View>
                </View>
              </TouchableOpacity>
            ))
          )}
        </View>

        {/* Completed Tasks */}
        {completedTasks.length > 0 && (
          <View style={styles.card}>
            <View style={styles.sectionHeader}>
              <Ionicons name="checkmark-circle-outline" size={20} color="#22c55e" />
              <Text style={styles.cardTitle}>Completed Tasks</Text>
            </View>
            
            {completedTasks.map((task) => (
              <TouchableOpacity
                key={task.id}
                style={[styles.taskCard, styles.taskCardCompleted]}
                onPress={() => handleToggleTask(task.id, task.status)}
              >
                <View style={[styles.checkbox, styles.checkboxChecked]}>
                  <Ionicons name="checkmark" size={16} color="#fff" />
                </View>
                
                <View style={styles.taskInfo}>
                  <Text style={[styles.taskTitle, styles.taskTitleCompleted]}>
                    {task.title}
                  </Text>
                  {task.description && (
                    <Text style={styles.taskDescriptionCompleted}>{task.description}</Text>
                  )}
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
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
  statsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  statIconContainer: {
    marginBottom: 12,
  },
  statValue: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 13,
    color: '#6b7280',
    fontWeight: '500',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111',
  },
  emptyState: {
    padding: 40,
    alignItems: 'center',
  },
  emptyIconContainer: {
    marginBottom: 16,
  },
  emptyText: {
    textAlign: 'center',
    color: '#6b7280',
    fontSize: 15,
    marginBottom: 8,
    fontWeight: '500',
  },
  emptySubtext: {
    textAlign: 'center',
    color: '#9ca3af',
    fontSize: 13,
  },
  taskCard: {
    flexDirection: 'row',
    padding: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    marginBottom: 12,
    backgroundColor: '#f9fafb',
  },
  taskCardCompleted: {
    opacity: 0.7,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#d1d5db',
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  checkboxChecked: {
    backgroundColor: '#22c55e',
    borderColor: '#22c55e',
  },
  taskInfo: {
    flex: 1,
  },
  taskTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111',
    marginBottom: 4,
  },
  taskTitleCompleted: {
    textDecorationLine: 'line-through',
    color: '#6b7280',
  },
  taskDescription: {
    fontSize: 13,
    color: '#6b7280',
    marginBottom: 8,
    lineHeight: 18,
  },
  taskDescriptionCompleted: {
    fontSize: 13,
    color: '#9ca3af',
    marginBottom: 8,
    lineHeight: 18,
  },
  taskMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flexWrap: 'wrap',
  },
  priorityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 4,
  },
  priorityHigh: {
    backgroundColor: '#fee2e2',
  },
  priorityMedium: {
    backgroundColor: '#fef3c7',
  },
  priorityLow: {
    backgroundColor: '#dcfce7',
  },
  priorityText: {
    fontSize: 11,
    fontWeight: '600',
  },
  priorityHighText: {
    color: '#dc2626',
  },
  priorityMediumText: {
    color: '#f59e0b',
  },
  priorityLowText: {
    color: '#22c55e',
  },
  dueDateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  dueDate: {
    fontSize: 12,
    color: '#6b7280',
  },
});
