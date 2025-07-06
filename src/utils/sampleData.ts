// Sample booking data for testing the calendar functionality
import { Booking } from '@/types/booking';

export const sampleBookings: Booking[] = [
  {
    id: 'RESV12345',
    platform: 'airbnb',
    propertyName: 'ReservCheck Demo Property',
    guestName: 'John Doe',
    guest: 'John Doe',
    description: 'Reservation for John Doe',
    checkInDate: new Date('2025-07-10'),
    checkOutDate: new Date('2025-07-13'),
    status: 'confirmed',
    createdAt: new Date('2025-07-01'),
    updatedAt: new Date('2025-07-01')
  },
  {
    id: 'RESV12346',
    platform: 'airbnb',
    propertyName: 'ReservCheck Demo Property',
    guestName: 'Jane Smith',
    guest: 'Jane Smith',
    description: 'Reservation for Jane Smith',
    checkInDate: new Date('2025-07-15'),
    checkOutDate: new Date('2025-07-18'),
    status: 'confirmed',
    createdAt: new Date('2025-07-01'),
    updatedAt: new Date('2025-07-01')
  },
  {
    id: 'BLOCK001',
    platform: 'airbnb',
    propertyName: 'ReservCheck Demo Property',
    guestName: 'Maintenance Block',
    guest: 'Maintenance',
    description: 'Blocked for maintenance',
    checkInDate: new Date('2025-07-20'),
    checkOutDate: new Date('2025-07-22'),
    status: 'cancelled',
    createdAt: new Date('2025-07-01'),
    updatedAt: new Date('2025-07-01')
  },
  {
    id: 'BDC789456',
    platform: 'booking.com',
    propertyName: 'ReservCheck Demo Property',
    guestName: 'Maria Garcia',
    guest: '',
    description: 'Guest: Maria Garcia',
    checkInDate: new Date('2025-07-25'),
    checkOutDate: new Date('2025-07-28'),
    status: 'confirmed',
    createdAt: new Date('2025-07-01'),
    updatedAt: new Date('2025-07-01')
  },
  {
    id: 'RESV54321',
    platform: 'airbnb',
    propertyName: 'ReservCheck Demo Property',
    guestName: 'David Brown',
    guest: 'David Brown',
    description: 'Reservation for David Brown',
    checkInDate: new Date('2025-08-01'),
    checkOutDate: new Date('2025-08-05'),
    status: 'confirmed',
    createdAt: new Date('2025-07-01'),
    updatedAt: new Date('2025-07-01')
  },
  {
    id: 'BDC654321',
    platform: 'booking.com',
    propertyName: 'ReservCheck Demo Property',
    guestName: 'Lisa Anderson',
    guest: '',
    description: 'Guest: Lisa Anderson',
    checkInDate: new Date('2025-08-08'),
    checkOutDate: new Date('2025-08-10'),
    status: 'cancelled',
    createdAt: new Date('2025-07-01'),
    updatedAt: new Date('2025-07-01')
  },
  // Mixed status bookings for testing (same dates with different statuses)
  {
    id: 'MIXED001',
    platform: 'airbnb',
    propertyName: 'ReservCheck Demo Property',
    guestName: 'Tom Wilson',
    guest: 'Tom Wilson',
    description: 'Cancelled reservation for Tom Wilson',
    checkInDate: new Date('2025-07-25'),
    checkOutDate: new Date('2025-07-25'),
    status: 'cancelled',
    createdAt: new Date('2025-07-01'),
    updatedAt: new Date('2025-07-01')
  },
  {
    id: 'MIXED002',
    platform: 'booking.com',
    propertyName: 'ReservCheck Demo Property',
    guestName: 'Sarah Johnson',
    guest: '',
    description: 'Guest: Sarah Johnson',
    checkInDate: new Date('2025-07-30'),
    checkOutDate: new Date('2025-07-30'),
    status: 'confirmed',
    createdAt: new Date('2025-07-01'),
    updatedAt: new Date('2025-07-01')
  },
  {
    id: 'MIXED003',
    platform: 'airbnb',
    propertyName: 'ReservCheck Demo Property',
    guestName: 'Mike Davis',
    guest: 'Mike Davis',
    description: 'Cancelled reservation for Mike Davis',
    checkInDate: new Date('2025-07-30'),
    checkOutDate: new Date('2025-07-30'),
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
