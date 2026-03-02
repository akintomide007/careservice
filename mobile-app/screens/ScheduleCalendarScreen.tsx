import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, Alert, TextInput, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const API_URL = 'http://localhost:3001';

interface ScheduleCalendarScreenProps {
  token: string;
  onBack: () => void;
}

interface ScheduleEvent {
  id: string;
  title: string;
  startTime: string;
  endTime: string;
  date: string;
  client?: {
    id: string;
    firstName: string;
    lastName: string;
    address?: string;
  };
  serviceType?: string;
  location?: string;
  notes?: string;
}

export default function ScheduleCalendarScreen({ token, onBack }: ScheduleCalendarScreenProps) {
  const [schedules, setSchedules] = useState<ScheduleEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [clients, setClients] = useState<any[]>([]);

  const [requestForm, setRequestForm] = useState({
    clientId: '',
    appointmentType: 'home_visit',
    preferredDate: '',
    preferredTime: '',
    duration: '60',
    reason: '',
    notes: ''
  });

  useEffect(() => {
    loadSchedules();
    loadClients();
  }, [selectedDate]);

  const loadSchedules = async () => {
    try {
      setLoading(true);
      const startDate = new Date(selectedDate);
      startDate.setDate(1);
      const endDate = new Date(selectedDate);
      endDate.setMonth(endDate.getMonth() + 1);
      endDate.setDate(0);

      const response = await fetch(
        `${API_URL}/api/schedules/my-schedules?startDate=${startDate.toISOString().split('T')[0]}&endDate=${endDate.toISOString().split('T')[0]}`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      const data = await response.json();
      setSchedules(data);
    } catch (error) {
      console.error('Error loading schedules:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadClients = async () => {
    try {
      const response = await fetch(`${API_URL}/api/clients`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const data = await response.json();
      setClients(data);
    } catch (error) {
      console.error('Error loading clients:', error);
    }
  };

  const handleRequestAppointment = async () => {
    if (!requestForm.clientId || !requestForm.preferredDate || !requestForm.preferredTime || !requestForm.reason) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    try {
      const preferredDateTime = `${requestForm.preferredDate}T${requestForm.preferredTime}`;
      
      await fetch(`${API_URL}/api/appointment-requests`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          clientId: requestForm.clientId,
          appointmentType: requestForm.appointmentType,
          urgency: 'routine',
          reason: requestForm.reason,
          notes: requestForm.notes,
          preferredDates: [preferredDateTime],
          estimatedDuration: parseInt(requestForm.duration),
        }),
      });

      setShowRequestModal(false);
      setRequestForm({
        clientId: '',
        appointmentType: 'home_visit',
        preferredDate: '',
        preferredTime: '',
        duration: '60',
        reason: '',
        notes: ''
      });
      Alert.alert('Success', 'Appointment request submitted successfully!');
      loadSchedules();
    } catch (error) {
      Alert.alert('Error', 'Failed to submit appointment request');
    }
  };

  const getDaysInMonth = () => {
    const year = selectedDate.getFullYear();
    const month = selectedDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }
    return days;
  };

  const getSchedulesForDate = (day: number) => {
    if (!day) return [];
    const dateStr = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), day)
      .toISOString().split('T')[0];
    return schedules.filter(s => s.date?.startsWith(dateStr) || s.startTime?.startsWith(dateStr));
  };

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'];

  const changeMonth = (delta: number) => {
    const newDate = new Date(selectedDate);
    newDate.setMonth(newDate.getMonth() + delta);
    setSelectedDate(newDate);
  };

  const upcomingSchedules = schedules
    .filter(s => new Date(s.date || s.startTime) >= new Date())
    .sort((a, b) => new Date(a.date || a.startTime).getTime() - new Date(b.date || b.startTime).getTime())
    .slice(0, 5);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#3b82f6" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.title}>My Schedule</Text>
          <Text style={styles.subtitle}>View appointments and request new ones</Text>
        </View>
        <TouchableOpacity
          style={styles.requestButton}
          onPress={() => setShowRequestModal(true)}
        >
          <Ionicons name="add" size={20} color="#fff" />
          <Text style={styles.requestButtonText}>Request</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {/* Calendar */}
        <View style={styles.calendarCard}>
          {/* Calendar Header */}
          <View style={styles.calendarHeader}>
            <TouchableOpacity onPress={() => changeMonth(-1)} style={styles.monthButton}>
              <Ionicons name="chevron-back" size={24} color="#3b82f6" />
            </TouchableOpacity>
            <Text style={styles.monthTitle}>
              {monthNames[selectedDate.getMonth()]} {selectedDate.getFullYear()}
            </Text>
            <TouchableOpacity onPress={() => changeMonth(1)} style={styles.monthButton}>
              <Ionicons name="chevron-forward" size={24} color="#3b82f6" />
            </TouchableOpacity>
          </View>

          {/* Days of Week */}
          <View style={styles.daysOfWeek}>
            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => (
              <Text key={index} style={styles.dayOfWeekText}>{day}</Text>
            ))}
          </View>

          {/* Calendar Grid */}
          <View style={styles.calendarGrid}>
            {getDaysInMonth().map((day, index) => {
              const daySchedules = day ? getSchedulesForDate(day) : [];
              const isToday = day === new Date().getDate() &&
                selectedDate.getMonth() === new Date().getMonth() &&
                selectedDate.getFullYear() === new Date().getFullYear();

              return (
                <View
                  key={index}
                  style={[
                    styles.calendarDay,
                    !day && styles.emptyDay,
                    isToday && styles.todayDay
                  ]}
                >
                  {day && (
                    <>
                      <Text style={[styles.dayNumber, isToday && styles.todayNumber]}>
                        {day}
                      </Text>
                      {daySchedules.map((schedule, idx) => (
                        <View key={idx} style={styles.scheduleChip}>
                          <Text style={styles.scheduleChipText} numberOfLines={1}>
                            {schedule.startTime?.split('T')[1]?.substring(0, 5) || 'TBD'}
                          </Text>
                        </View>
                      ))}
                    </>
                  )}
                </View>
              );
            })}
          </View>
        </View>

        {/* Upcoming Appointments */}
        <View style={styles.upcomingCard}>
          <View style={styles.sectionHeader}>
            <Ionicons name="calendar" size={24} color="#3b82f6" />
            <Text style={styles.upcomingTitle}>Upcoming Appointments</Text>
          </View>
          {loading ? (
            <View style={styles.centerContent}>
              <Text style={styles.loadingText}>Loading...</Text>
            </View>
          ) : upcomingSchedules.length === 0 ? (
            <View style={styles.centerContent}>
              <Ionicons name="calendar-outline" size={48} color="#d1d5db" style={styles.emptyIcon} />
              <Text style={styles.emptyText}>No upcoming appointments</Text>
              <Text style={styles.emptySubtext}>Your schedule is clear</Text>
            </View>
          ) : (
            upcomingSchedules.map((schedule) => (
              <View key={schedule.id} style={styles.appointmentCard}>
                <View style={styles.appointmentInfo}>
                  <Text style={styles.appointmentTitle}>{schedule.title}</Text>
                  {schedule.client && (
                    <View style={styles.infoRow}>
                      <Ionicons name="person-outline" size={14} color="#6b7280" />
                      <Text style={styles.infoText} numberOfLines={1}>
                        {schedule.client.firstName} {schedule.client.lastName}
                      </Text>
                    </View>
                  )}
                  {schedule.location && (
                    <View style={styles.infoRow}>
                      <Ionicons name="location-outline" size={14} color="#6b7280" />
                      <Text style={styles.infoText} numberOfLines={1}>{schedule.location}</Text>
                    </View>
                  )}
                </View>
                <View style={styles.appointmentTime}>
                  <Text style={styles.appointmentDate}>
                    {new Date(schedule.date || schedule.startTime).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </Text>
                  <View style={styles.timeRow}>
                    <Ionicons name="time-outline" size={14} color="#6b7280" />
                    <Text style={styles.appointmentTimeText} numberOfLines={1}>
                      {new Date(schedule.startTime).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}
                    </Text>
                  </View>
                </View>
              </View>
            ))
          )}
        </View>
      </ScrollView>

      {/* Request Appointment Modal */}
      <Modal visible={showRequestModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <ScrollView>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Request Appointment</Text>
                <TouchableOpacity onPress={() => setShowRequestModal(false)}>
                  <Ionicons name="close" size={28} color="#6b7280" />
                </TouchableOpacity>
              </View>

              <Text style={styles.label}>Client *</Text>
              <View style={styles.pickerContainer}>
                <TextInput
                  style={styles.input}
                  placeholder="Select a client..."
                  editable={false}
                />
              </View>

              <Text style={styles.label}>Appointment Type *</Text>
              <View style={styles.pickerContainer}>
                <TextInput
                  style={styles.input}
                  value={requestForm.appointmentType.replace('_', ' ')}
                  editable={false}
                />
              </View>

              <Text style={styles.label}>Preferred Date *</Text>
              <TextInput
                style={styles.input}
                value={requestForm.preferredDate}
                onChangeText={(text) => setRequestForm({ ...requestForm, preferredDate: text })}
                placeholder="YYYY-MM-DD"
              />

              <Text style={styles.label}>Preferred Time *</Text>
              <TextInput
                style={styles.input}
                value={requestForm.preferredTime}
                onChangeText={(text) => setRequestForm({ ...requestForm, preferredTime: text })}
                placeholder="HH:MM"
              />

              <Text style={styles.label}>Reason for Appointment *</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={requestForm.reason}
                onChangeText={(text) => setRequestForm({ ...requestForm, reason: text })}
                placeholder="Explain the purpose..."
                multiline
                numberOfLines={3}
              />

              <View style={styles.infoBox}>
                <Ionicons name="information-circle-outline" size={20} color="#3b82f6" style={styles.infoIcon} />
                <Text style={styles.infoBoxText}>
                  Your appointment request will be sent to your manager for approval.
                </Text>
              </View>

              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => setShowRequestModal(false)}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.submitButton}
                  onPress={handleRequestAppointment}
                >
                  <Text style={styles.submitButtonText}>Submit Request</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
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
  requestButton: {
    backgroundColor: '#3b82f6',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    gap: 6,
  },
  requestButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  calendarCard: {
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
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  monthButton: {
    padding: 8,
  },
  monthTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111',
  },
  daysOfWeek: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  dayOfWeekText: {
    flex: 1,
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '600',
    color: '#6b7280',
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  calendarDay: {
    width: '14.28%',
    minHeight: 60,
    padding: 4,
    borderWidth: 0.5,
    borderColor: '#e5e7eb',
  },
  emptyDay: {
    backgroundColor: '#f9fafb',
  },
  todayDay: {
    backgroundColor: '#dbeafe',
  },
  dayNumber: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 2,
  },
  todayNumber: {
    color: '#3b82f6',
  },
  scheduleChip: {
    backgroundColor: '#3b82f6',
    borderRadius: 4,
    padding: 2,
    marginTop: 2,
  },
  scheduleChipText: {
    fontSize: 9,
    color: '#fff',
    fontWeight: '600',
  },
  upcomingCard: {
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
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 10,
  },
  upcomingTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111',
  },
  centerContent: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  loadingText: {
    textAlign: 'center',
    color: '#6b7280',
    fontSize: 15,
  },
  emptyIcon: {
    marginBottom: 12,
  },
  emptyText: {
    textAlign: 'center',
    color: '#374151',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  emptySubtext: {
    textAlign: 'center',
    color: '#9ca3af',
    fontSize: 14,
  },
  appointmentCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#f0f4ff',
  },
  appointmentInfo: {
    flex: 1,
  },
  appointmentTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111',
    marginBottom: 6,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  infoText: {
    fontSize: 13,
    color: '#6b7280',
  },
  appointmentTime: {
    alignItems: 'flex-end',
  },
  appointmentDate: {
    fontSize: 13,
    fontWeight: '600',
    color: '#111',
    marginBottom: 4,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  appointmentTimeText: {
    fontSize: 12,
    color: '#6b7280',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 6,
    marginTop: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    padding: 12,
    borderRadius: 8,
    fontSize: 15,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#eff6ff',
    borderWidth: 1,
    borderColor: '#bfdbfe',
    borderRadius: 12,
    padding: 12,
    marginTop: 16,
    gap: 8,
  },
  infoIcon: {
    marginTop: 1,
  },
  infoBoxText: {
    flex: 1,
    fontSize: 13,
    color: '#1e40af',
    lineHeight: 18,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    marginTop: 20,
  },
  cancelButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 12,
  },
  cancelButtonText: {
    color: '#374151',
    fontWeight: '600',
  },
  submitButton: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
  },
  submitButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
});
