export interface Booking {
  id: string;
  platform: 'airbnb' | 'booking.com';
  propertyName: string;
  guestName: string;
  checkInDate: Date;
  checkOutDate: Date;
  totalPrice: number;
  currency: string;
  status: 'confirmed' | 'pending' | 'cancelled';
  createdAt: Date;
  updatedAt: Date;
}

export interface BookingFormData {
  platform: 'airbnb' | 'booking.com';
  propertyName: string;
  guestName: string;
  checkInDate: string;
  checkOutDate: string;
  totalPrice: number;
  currency: string;
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
