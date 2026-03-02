'use client';

import { useState, useCallback, useMemo } from 'react';
import { Calendar, dateFnsLocalizer, View } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay, addMonths, startOfMonth, endOfMonth } from 'date-fns';
import 'react-big-calendar/lib/css/react-big-calendar.css';

const locales = {
  'en-US': require('date-fns/locale/en-US'),
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  resource: {
    appointmentId: string;
    clientId: string;
    clientName: string;
    dspId: string | null;
    dspName: string;
    type: string;
    urgency: string;
    location?: string;
    duration: number;
    status: string;
  };
}

interface AppointmentCalendarProps {
  token: string;
  onEventSelect: (event: CalendarEvent) => void;
  onSlotSelect: (slotInfo: { start: Date; end: Date }) => void;
  filters?: {
    dspId?: string;
    clientId?: string;
    appointmentType?: string;
  };
}

export default function AppointmentCalendar({
  token,
  onEventSelect,
  onSlotSelect,
  filters,
}: AppointmentCalendarProps) {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [view, setView] = useState<View>('month');
  const [date, setDate] = useState(new Date());
  const [loading, setLoading] = useState(false);

  // Fetch appointments for calendar
  const fetchAppointments = useCallback(async (start: Date, end: Date) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        start: start.toISOString(),
        end: end.toISOString(),
        ...(filters?.dspId && { dspId: filters.dspId }),
        ...(filters?.clientId && { clientId: filters.clientId }),
        ...(filters?.appointmentType && { appointmentType: filters.appointmentType }),
      });

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3008'}/api/appointment-requests/calendar?${params}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.ok) {
        const data = await response.json();
        const formattedEvents = data.map((event: any) => ({
          ...event,
          start: new Date(event.start),
          end: new Date(event.end),
        }));
        setEvents(formattedEvents);
      }
    } catch (error) {
      console.error('Error fetching calendar appointments:', error);
    } finally {
      setLoading(false);
    }
  }, [token, filters]);

  // Fetch on mount and when date/view changes
  useMemo(() => {
    let start: Date, end: Date;

    if (view === 'month') {
      start = startOfMonth(date);
      end = endOfMonth(addMonths(date, 1));
    } else if (view === 'week') {
      start = startOfWeek(date);
      end = new Date(start);
      end.setDate(end.getDate() + 7);
    } else {
      start = new Date(date);
      start.setHours(0, 0, 0, 0);
      end = new Date(date);
      end.setHours(23, 59, 59, 999);
    }

    fetchAppointments(start, end);
  }, [date, view, filters, fetchAppointments]);

  // Custom event styling based on appointment type
  const eventStyleGetter = (event: CalendarEvent) => {
    const colors: Record<string, string> = {
      medical: '#3B82F6', // Blue
      therapy: '#10B981', // Green
      dental: '#8B5CF6',  // Purple
      social: '#F59E0B',  // Orange
      other: '#6B7280',   // Gray
    };

    const urgencyBorder: Record<string, string> = {
      emergency: '3px solid #EF4444',
      urgent: '2px solid #F59E0B',
      routine: 'none',
    };

    return {
      style: {
        backgroundColor: colors[event.resource.type] || colors.other,
        borderRadius: '5px',
        opacity: 0.9,
        color: 'white',
        border: urgencyBorder[event.resource.urgency] || 'none',
        display: 'block',
        padding: '2px 5px',
      },
    };
  };

  // Custom event component to show more details
  const EventComponent = ({ event }: { event: CalendarEvent }) => (
    <div className="text-xs">
      <div className="font-semibold truncate">{event.resource.clientName}</div>
      <div className="truncate">{event.resource.type}</div>
      {event.resource.dspName && event.resource.dspName !== 'Unassigned' && (
        <div className="text-[10px] opacity-90 truncate">👤 {event.resource.dspName}</div>
      )}
      {event.resource.urgency === 'emergency' && (
        <span className="text-[10px]">🚨</span>
      )}
    </div>
  );

  return (
    <div className="h-[600px] bg-white p-4 rounded-lg shadow">
      {loading && (
        <div className="absolute top-4 right-4 z-10">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
        </div>
      )}

      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-bold">Appointment Calendar</h2>
          <div className="flex gap-2 text-xs">
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded" style={{ backgroundColor: '#3B82F6' }}></span>
              Medical
            </span>
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded" style={{ backgroundColor: '#10B981' }}></span>
              Therapy
            </span>
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded" style={{ backgroundColor: '#8B5CF6' }}></span>
              Dental
            </span>
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded" style={{ backgroundColor: '#F59E0B' }}></span>
              Social
            </span>
          </div>
        </div>
      </div>

      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        style={{ height: 'calc(100% - 60px)' }}
        view={view}
        onView={setView}
        date={date}
        onNavigate={setDate}
        onSelectEvent={(event) => onEventSelect(event as CalendarEvent)}
        onSelectSlot={(slotInfo) => onSlotSelect(slotInfo)}
        selectable
        eventPropGetter={eventStyleGetter}
        components={{
          event: EventComponent,
        }}
        views={['month', 'week', 'day', 'agenda']}
        popup
        showMultiDayTimes
      />
    </div>
  );
}
