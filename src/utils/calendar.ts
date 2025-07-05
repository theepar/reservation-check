import { CalendarDay, CalendarMonth, Booking } from '@/types/booking';

export function generateCalendarMonth(year: number, month: number, bookings: Booking[]): CalendarMonth {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startDate = new Date(firstDay);
  const endDate = new Date(lastDay);
  
  // Start from Sunday of the first week
  startDate.setDate(startDate.getDate() - startDate.getDay());
  
  // End on Saturday of the last week
  endDate.setDate(endDate.getDate() + (6 - endDate.getDay()));
  
  const days: CalendarDay[] = [];
  const currentDate = new Date(startDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  while (currentDate <= endDate) {
    const dateBookings = getBookingsForDate(currentDate, bookings);
    
    days.push({
      date: new Date(currentDate),
      isCurrentMonth: currentDate.getMonth() === month,
      isToday: currentDate.getTime() === today.getTime(),
      bookings: dateBookings
    });
    
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return {
    year,
    month,
    days
  };
}

export function getBookingsForDate(date: Date, bookings: Booking[]): Booking[] {
  const targetDate = new Date(date);
  targetDate.setHours(0, 0, 0, 0);
  
  const matchingBookings = bookings.filter(booking => {
    const checkIn = new Date(booking.checkInDate);
    const checkOut = new Date(booking.checkOutDate);
    checkIn.setHours(0, 0, 0, 0);
    checkOut.setHours(0, 0, 0, 0);
    
    // Include both check-in and check-out dates in the booking range
    const isInRange = targetDate >= checkIn && targetDate <= checkOut;
    
    return isInRange;
  });
  
  return matchingBookings;
}

export function getMonthName(month: number): string {
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  return months[month];
}

export function getWeekdayNames(): string[] {
  return ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
}

export function navigateMonth(year: number, month: number, direction: 'prev' | 'next'): { year: number; month: number } {
  if (direction === 'prev') {
    if (month === 0) {
      return { year: year - 1, month: 11 };
    }
    return { year, month: month - 1 };
  }
  
  if (month === 11) {
    return { year: year + 1, month: 0 };
  }
  return { year, month: month + 1 };
}

export function isDateInRange(date: Date, startDate: Date, endDate: Date): boolean {
  const targetDate = new Date(date);
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  targetDate.setHours(0, 0, 0, 0);
  start.setHours(0, 0, 0, 0);
  end.setHours(0, 0, 0, 0);
  
  return targetDate >= start && targetDate <= end;
}

export function formatCalendarDate(date: Date): string {
  return date.toISOString().split('T')[0];
}
