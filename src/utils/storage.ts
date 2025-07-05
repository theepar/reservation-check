import { Booking } from '@/types/booking';

const STORAGE_KEY = 'booking-calendar-data';

export function saveBookingsToStorage(bookings: Booking[]): void {
  try {
    const bookingsData = bookings.map(booking => ({
      ...booking,
      checkInDate: booking.checkInDate.toISOString(),
      checkOutDate: booking.checkOutDate.toISOString(),
      createdAt: booking.createdAt.toISOString(),
      updatedAt: booking.updatedAt.toISOString()
    }));
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(bookingsData));
  } catch (error) {
    console.error('Failed to save bookings to localStorage:', error);
  }
}

interface SerializedBooking {
  id: string;
  platform: 'airbnb' | 'booking.com';
  propertyName: string;
  guestName: string;
  checkInDate: string;
  checkOutDate: string;
  totalPrice: number;
  currency: string;
  status: 'confirmed' | 'pending' | 'cancelled';
  createdAt: string;
  updatedAt: string;
}

export function loadBookingsFromStorage(): Booking[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      return [];
    }
    
    const bookingsData: SerializedBooking[] = JSON.parse(stored);
    const bookings = bookingsData.map((booking) => ({
      ...booking,
      checkInDate: new Date(booking.checkInDate),
      checkOutDate: new Date(booking.checkOutDate),
      createdAt: new Date(booking.createdAt),
      updatedAt: new Date(booking.updatedAt)
    }));
    
    return bookings;
  } catch (error) {
    console.error('Failed to load bookings from localStorage:', error);
    return [];
  }
}

export function clearBookingsFromStorage(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Failed to clear bookings from localStorage:', error);
  }
}

export function addBookingToStorage(booking: Booking): void {
  const bookings = loadBookingsFromStorage();
  bookings.push(booking);
  saveBookingsToStorage(bookings);
}

export function updateBookingInStorage(updatedBooking: Booking): void {
  const bookings = loadBookingsFromStorage();
  const index = bookings.findIndex(booking => booking.id === updatedBooking.id);
  
  if (index !== -1) {
    bookings[index] = updatedBooking;
    saveBookingsToStorage(bookings);
  }
}

export function deleteBookingFromStorage(bookingId: string): void {
  const bookings = loadBookingsFromStorage();
  const filteredBookings = bookings.filter(booking => booking.id !== bookingId);
  saveBookingsToStorage(filteredBookings);
}

export function getBookingFromStorage(bookingId: string): Booking | null {
  const bookings = loadBookingsFromStorage();
  return bookings.find(booking => booking.id === bookingId) || null;
}
