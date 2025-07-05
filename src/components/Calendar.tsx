'use client';

import { useState, useEffect } from 'react';
import { CalendarDay, CalendarMonth, Booking } from '@/types/booking';
import { generateCalendarMonth, getMonthName, getWeekdayNames, navigateMonth } from '@/utils/calendar';
import { loadBookingsFromStorage } from '@/utils/storage';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

interface CalendarProps {
  readonly onDateSelect?: (date: Date) => void;
  readonly bookings?: Booking[];
}

export default function Calendar({ onDateSelect, bookings }: CalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [calendarMonth, setCalendarMonth] = useState<CalendarMonth | null>(null);
  const [currentBookings, setCurrentBookings] = useState<Booking[]>([]);
  const [selectedDay, setSelectedDay] = useState<CalendarDay | null>(null);
  const [showBookingDetail, setShowBookingDetail] = useState(false);

  useEffect(() => {
    // Use bookings from props if available, otherwise load from storage
    if (bookings) {
      setCurrentBookings(bookings);
    } else {
      const loadedBookings = loadBookingsFromStorage();
      setCurrentBookings(loadedBookings);
    }
  }, [bookings]);

  useEffect(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const monthData = generateCalendarMonth(year, month, currentBookings);
    setCalendarMonth(monthData);
  }, [currentDate, currentBookings]);

  const getAriaLabel = (day: CalendarDay): string => {
    const dateString = day.date.toDateString();
    if (day.bookings.length === 0) {
      return dateString;
    }
    const bookingText = day.bookings.length === 1 ? 'booking' : 'bookings';
    return `${dateString} - ${day.bookings.length} ${bookingText}`;
  };

  const handlePrevMonth = () => {
    const { year, month } = navigateMonth(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      'prev'
    );
    setCurrentDate(new Date(year, month, 1));
  };

  const handleNextMonth = () => {
    const { year, month } = navigateMonth(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      'next'
    );
    setCurrentDate(new Date(year, month, 1));
  };

  const handleDateClick = (day: CalendarDay) => {
    if (day.bookings.length > 0) {
      setSelectedDay(day);
      setShowBookingDetail(true);
    }
    
    if (onDateSelect) {
      onDateSelect(day.date);
    }
  };

  const closeBookingDetail = () => {
    setShowBookingDetail(false);
    setSelectedDay(null);
  };

  const getDayClassName = (day: CalendarDay): string => {
    const baseClasses = 'aspect-square flex items-center justify-center text-sm font-normal rounded-full transition-all duration-200 cursor-pointer relative overflow-hidden';
    const classes = [baseClasses];

    // Function to check if a booking is blocked (cancelled or blocked guest)
    const isBookingBlocked = (booking: Booking): boolean => {
      const isStatusBlocked = booking.status === 'cancelled';
      const isGuestBlocked = booking.guestName ? (
        booking.guestName.toLowerCase().includes('blocked') ||
        booking.guestName.toLowerCase().includes('maintenance') ||
        booking.guestName.toLowerCase().includes('block')
      ) : false;
      return isStatusBlocked || isGuestBlocked;
    };

    if (!day.isCurrentMonth) {
      classes.push('text-gray-400 hover:bg-gray-50');
    } else if (day.isToday) {
      classes.push('bg-blue-500 text-white hover:bg-blue-600');
    } else if (day.bookings.length > 0) {
      // Check booking statuses
      const hasConfirmedBooking = day.bookings.some(booking => booking.status === 'confirmed');
      const hasBlockedBooking = day.bookings.some(booking => isBookingBlocked(booking));
      
      // If there are both confirmed and blocked bookings, it's mixed
      if (hasConfirmedBooking && hasBlockedBooking) {
        // Mixed status - orange color
        classes.push('bg-orange-500 text-white hover:bg-orange-600');
      } else if (hasConfirmedBooking && !hasBlockedBooking) {
        // All bookings are confirmed - green color
        classes.push('bg-green-500 text-white hover:bg-green-600');
      } else if (hasBlockedBooking && !hasConfirmedBooking) {
        // All bookings are blocked - red color
        classes.push('bg-red-500 text-white hover:bg-red-600');
      } else {
        // Fallback - should not happen, but handle just in case
        classes.push('bg-gray-500 text-white hover:bg-gray-600');
      }
    } else {
      classes.push('text-gray-700 hover:bg-gray-50');
    }

    return classes.join(' ');
  };

  if (!calendarMonth) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-gray-500">Loading calendar...</div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden fade-in">
      {/* Calendar Header */}
      <div className="flex items-center justify-between p-4 sm:p-5 border-b border-gray-200 bg-white">
        <button
          onClick={handlePrevMonth}
          className="p-2 rounded-full hover:bg-gray-100 transition-all duration-200"
          aria-label="Previous month"
        >
          <ChevronLeftIcon className="h-5 w-5 text-gray-600" />
        </button>
        
        <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
          {getMonthName(calendarMonth.month)} {calendarMonth.year}
        </h2>
        
        <button
          onClick={handleNextMonth}
          className="p-2 rounded-full hover:bg-gray-100 transition-all duration-200"
          aria-label="Next month"
        >
          <ChevronRightIcon className="h-5 w-5 text-gray-600" />
        </button>
      </div>

      {/* Weekday Headers */}
      <div className="grid grid-cols-7 border-b border-gray-200 bg-gray-50">
        {getWeekdayNames().map((day) => (
          <div key={day} className="p-2 text-xs font-medium text-gray-600 text-center">
            <span className="hidden sm:inline">{day}</span>
            <span className="sm:hidden">{day.substring(0, 2)}</span>
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1 p-4 bg-white">
        {calendarMonth.days.map((day) => (
          <div key={day.date.toISOString()} className="relative calendar-day">
            <button
              className={getDayClassName(day)}
              onClick={() => handleDateClick(day)}
              aria-label={getAriaLabel(day)}
              type="button"
              title={day.bookings.length > 0 ? `${day.bookings.length} booking(s) - Click for details` : ''}
            >
              <span className="text-sm font-normal">
                {day.date.getDate()}
              </span>
            </button>
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="px-4 py-3 border-t border-gray-200 bg-white">
        <div className="flex flex-wrap justify-center items-center gap-4 text-xs sm:text-sm">
          <div className="flex items-center">
            <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
            <span className="text-gray-700 font-medium">Hari Ini</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
            <span className="text-gray-700 font-medium">Confirmed</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
            <span className="text-gray-700 font-medium">Blocked</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-orange-500 rounded-full mr-2"></div>
            <span className="text-gray-700 font-medium">Mixed</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-gray-200 rounded-full mr-2"></div>
            <span className="text-gray-700 font-medium">Tersedia</span>
          </div>
        </div>
      </div>

      {/* Booking Detail Modal */}
      {showBookingDetail && selectedDay && (
        <BookingDetailModal 
          day={selectedDay} 
          onClose={closeBookingDetail}
        />
      )}
    </div>
  );
}

// Booking Detail Modal Component
interface BookingDetailModalProps {
  readonly day: CalendarDay;
  readonly onClose: () => void;
}

function BookingDetailModal({ day, onClose }: BookingDetailModalProps) {
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('id-ID', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Function to check if a booking is blocked (cancelled or blocked guest)
  const isBookingBlocked = (booking: Booking): boolean => {
    const isStatusBlocked = booking.status === 'cancelled';
    const isGuestBlocked = booking.guestName ? (
      booking.guestName.toLowerCase().includes('blocked') ||
      booking.guestName.toLowerCase().includes('maintenance') ||
      booking.guestName.toLowerCase().includes('block')
    ) : false;
    return isStatusBlocked || isGuestBlocked;
  };

  const getStatusColor = (booking: Booking) => {
    if (booking.status === 'confirmed') {
      return 'text-green-600 bg-green-50';
    } else if (isBookingBlocked(booking)) {
      return 'text-red-600 bg-red-50';
    } else {
      return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusText = (booking: Booking) => {
    if (booking.status === 'confirmed') {
      return 'Confirmed';
    } else if (isBookingBlocked(booking)) {
      return 'Blocked';
    } else {
      return 'Unknown';
    }
  };

  const getPlatformIcon = (platform: string) => {
    return platform === 'airbnb' ? 'A' : 'B';
  };

  const getPlatformColor = (platform: string) => {
    return platform === 'airbnb' 
      ? 'text-rose-600 bg-rose-100' 
      : 'text-blue-600 bg-blue-100';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-4 sm:p-6 w-full max-w-md sm:max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <h3 className="text-lg sm:text-xl font-bold text-gray-900">
            Booking Details
          </h3>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100 transition-all duration-200"
            aria-label="Close"
          >
            <svg className="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Date Info */}
        <div className="mb-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
          <h4 className="text-sm font-semibold text-blue-900 mb-2">Selected Date</h4>
          <p className="text-blue-800">{formatDate(day.date)}</p>
        </div>

        {/* Bookings List */}
        <div className="space-y-4">
          <h4 className="text-sm font-semibold text-gray-900 mb-3">
            Bookings ({day.bookings.length})
          </h4>
          
          {day.bookings.map((booking, index) => (
            <div key={booking.id || index} className="border border-gray-200 rounded-xl p-4 space-y-3">
              {/* Platform and Status */}
              <div className="flex items-center justify-between">
                <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getPlatformColor(booking.platform)}`}>
                  <span className="w-4 h-4 rounded-full bg-current text-white flex items-center justify-center text-xs mr-2">
                    {getPlatformIcon(booking.platform)}
                  </span>
                  {booking.platform === 'airbnb' ? 'Airbnb' : 'Booking.com'}
                </div>
                <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(booking)}`}>
                  {getStatusText(booking)}
                </div>
              </div>

              {/* Booking Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-gray-500 font-medium">Check-in:</span>
                  <p className="text-gray-900">{booking.checkInDate.toLocaleDateString('id-ID')}</p>
                </div>
                <div>
                  <span className="text-gray-500 font-medium">Check-out:</span>
                  <p className="text-gray-900">{booking.checkOutDate.toLocaleDateString('id-ID')}</p>
                </div>
              </div>

              {/* Guest Name */}
              {booking.guestName && (
                <div className="text-sm">
                  <span className="text-gray-500 font-medium">Guest:</span>
                  <p className="text-gray-900">{booking.guestName}</p>
                </div>
              )}

              {/* Property Name */}
              {booking.propertyName && (
                <div className="text-sm">
                  <span className="text-gray-500 font-medium">Property:</span>
                  <p className="text-gray-900">{booking.propertyName}</p>
                </div>
              )}

              {/* Booking ID */}
              {booking.id && (
                <div className="text-sm">
                  <span className="text-gray-500 font-medium">Booking ID:</span>
                  <p className="text-gray-900 font-mono text-xs">{booking.id}</p>
                </div>
              )}

              {/* Duration */}
              <div className="text-sm">
                <span className="text-gray-500 font-medium">Duration:</span>
                <p className="text-gray-900">
                  {Math.ceil((booking.checkOutDate.getTime() - booking.checkInDate.getTime()) / (1000 * 60 * 60 * 24))} night(s)
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Close Button */}
        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-xl hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-all duration-200"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
