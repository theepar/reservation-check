// Sample booking data for testing the calendar functionality
import { Booking } from '@/types/booking';

export const sampleBookings: Booking[] = [
  {
    id: 'RESV12345',
    platform: 'airbnb',
    propertyName: 'Joglo Breeze Villa',
    guestName: 'John Doe',
    checkInDate: new Date('2025-07-10'),
    checkOutDate: new Date('2025-07-13'),
    totalPrice: 750,
    currency: 'USD',
    status: 'confirmed',
    createdAt: new Date('2025-07-01'),
    updatedAt: new Date('2025-07-01')
  },
  {
    id: 'RESV12346',
    platform: 'airbnb',
    propertyName: 'Joglo Breeze Villa',
    guestName: 'Jane Smith',
    checkInDate: new Date('2025-07-15'),
    checkOutDate: new Date('2025-07-18'),
    totalPrice: 850,
    currency: 'USD',
    status: 'confirmed',
    createdAt: new Date('2025-07-01'),
    updatedAt: new Date('2025-07-01')
  },
  {
    id: 'BLOCK001',
    platform: 'airbnb',
    propertyName: 'Joglo Breeze Villa',
    guestName: 'Maintenance Block',
    checkInDate: new Date('2025-07-20'),
    checkOutDate: new Date('2025-07-22'),
    totalPrice: 0,
    currency: 'USD',
    status: 'cancelled',
    createdAt: new Date('2025-07-01'),
    updatedAt: new Date('2025-07-01')
  },
  {
    id: 'BDC789456',
    platform: 'booking.com',
    propertyName: 'Joglo Breeze Villa',
    guestName: 'Maria Garcia',
    checkInDate: new Date('2025-07-25'),
    checkOutDate: new Date('2025-07-28'),
    totalPrice: 680,
    currency: 'USD',
    status: 'confirmed',
    createdAt: new Date('2025-07-01'),
    updatedAt: new Date('2025-07-01')
  },
  {
    id: 'RESV54321',
    platform: 'airbnb',
    propertyName: 'Joglo Breeze Villa',
    guestName: 'David Brown',
    checkInDate: new Date('2025-08-01'),
    checkOutDate: new Date('2025-08-05'),
    totalPrice: 900,
    currency: 'USD',
    status: 'confirmed',
    createdAt: new Date('2025-07-01'),
    updatedAt: new Date('2025-07-01')
  },
  {
    id: 'BDC654321',
    platform: 'booking.com',
    propertyName: 'Joglo Breeze Villa',
    guestName: 'Lisa Anderson',
    checkInDate: new Date('2025-08-08'),
    checkOutDate: new Date('2025-08-10'),
    totalPrice: 440,
    currency: 'USD',
    status: 'cancelled',
    createdAt: new Date('2025-07-01'),
    updatedAt: new Date('2025-07-01')
  },
  // Mixed status bookings for testing (same dates with different statuses)
  {
    id: 'MIXED001',
    platform: 'airbnb',
    propertyName: 'Joglo Breeze Villa',
    guestName: 'Tom Wilson',
    checkInDate: new Date('2025-07-25'),
    checkOutDate: new Date('2025-07-25'),
    totalPrice: 200,
    currency: 'USD',
    status: 'cancelled',
    createdAt: new Date('2025-07-01'),
    updatedAt: new Date('2025-07-01')
  },
  {
    id: 'MIXED002',
    platform: 'booking.com',
    propertyName: 'Joglo Breeze Villa',
    guestName: 'Sarah Johnson',
    checkInDate: new Date('2025-07-30'),
    checkOutDate: new Date('2025-07-30'),
    totalPrice: 150,
    currency: 'USD',
    status: 'confirmed',
    createdAt: new Date('2025-07-01'),
    updatedAt: new Date('2025-07-01')
  },
  {
    id: 'MIXED003',
    platform: 'airbnb',
    propertyName: 'Joglo Breeze Villa',
    guestName: 'Mike Davis',
    checkInDate: new Date('2025-07-30'),
    checkOutDate: new Date('2025-07-30'),
    totalPrice: 180,
    currency: 'USD',
    status: 'cancelled',
    createdAt: new Date('2025-07-01'),
    updatedAt: new Date('2025-07-01')
  }
];

// Function to load sample data (for development/testing)
export function loadSampleData(): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('booking-calendar-data', JSON.stringify(sampleBookings.map(booking => ({
      ...booking,
      checkInDate: booking.checkInDate.toISOString(),
      checkOutDate: booking.checkOutDate.toISOString(),
      createdAt: booking.createdAt.toISOString(),
      updatedAt: booking.updatedAt.toISOString()
    }))));
  }
}
