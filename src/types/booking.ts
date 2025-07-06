export interface Booking {
  id: string;
  platform: 'airbnb' | 'booking.com' | 'other';
  propertyName: string;
  guestName?: string; // Make optional as we transition
  guest?: string; // For extracted guest name
  description?: string; // For full description from iCal
  checkInDate: Date;
  checkOutDate: Date;
  status: 'confirmed' | 'pending' | 'cancelled';
  originalStatus?: string; // Original status from iCal SUMMARY field
  createdAt: Date;
  updatedAt: Date;
}

export interface BookingFormData {
  platform: 'airbnb' | 'booking.com';
  propertyName: string;
  guestName: string;
  checkInDate: string;
  checkOutDate: string;
  status: 'confirmed' | 'pending' | 'cancelled';
}

export interface CalendarDay {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  bookings: Booking[];
}

export interface CalendarMonth {
  year: number;
  month: number;
  days: CalendarDay[];
}

export interface BookingValidationError {
  field: string;
  message: string;
}

export interface BookingValidation {
  isValid: boolean;
  errors: BookingValidationError[];
}
