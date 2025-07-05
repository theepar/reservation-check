'use client';

import { useState, useEffect } from 'react';
import { Booking } from '@/types/booking';
import { loadBookingsFromStorage, saveBookingsToStorage } from '@/utils/storage';
import { fetchAirbnbCalendar } from '@/utils/icalParser';
import { sampleBookings } from '@/utils/sampleData';
import Calendar from '@/components/Calendar';
import UrlUpload from '@/components/UrlUpload';
import { CloudArrowDownIcon, TrashIcon } from '@heroicons/react/24/outline';

export default function HomePage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [showAirbnbImport, setShowAirbnbImport] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isImporting, setIsImporting] = useState(false);
  const [lastImportDate, setLastImportDate] = useState<Date | null>(null);

  // Function to check if a booking is blocked
  const isBookingBlocked = (booking: Booking): boolean => {
    // Check if status is cancelled or if guest name contains blocked/maintenance keywords
    const isStatusBlocked = booking.status === 'cancelled';
    const isGuestBlocked = booking.guestName ? (
      booking.guestName.toLowerCase().includes('blocked') ||
      booking.guestName.toLowerCase().includes('maintenance') ||
      booking.guestName.toLowerCase().includes('block')
    ) : false;
    return isStatusBlocked || isGuestBlocked;
  };

  // Load bookings from localStorage on component mount
  useEffect(() => {
    const loadedBookings = loadBookingsFromStorage();
    
    // Check if we have a last import date
    const lastImport = localStorage.getItem('lastAirbnbImport');
    if (lastImport) {
      setLastImportDate(new Date(lastImport));
    }
    
    // If no bookings and no previous import, use sample data
    if (loadedBookings.length === 0 && !lastImport) {
      console.log('📝 No imported data found, loading sample bookings for demo');
      setBookings(sampleBookings);
    } else {
      setBookings(loadedBookings);
    }
    
    setIsLoading(false);
  }, []);

  // Save bookings to localStorage whenever bookings change, but only if not using sample data
  useEffect(() => {
    if (!isLoading) {
      const lastImport = localStorage.getItem('lastAirbnbImport');
      // Only save to storage if we have an import date (real data) or if bookings array is not sample data
      if (lastImport || bookings.length === 0 || bookings[0]?.id !== 'RESV12345') {
        saveBookingsToStorage(bookings);
      }
    }
  }, [bookings, isLoading]);

  const handleImportAirbnb = async (icalUrl: string) => {
    setIsImporting(true);
    try {
      const importedBookings = await fetchAirbnbCalendar(icalUrl);
      console.log('✅ Successfully imported bookings:', importedBookings.map(b => ({
        guestName: b.guestName,
        checkIn: b.checkInDate.toDateString(),
        checkOut: b.checkOutDate.toDateString(),
        platform: b.platform
      })));
      
      // Replace all bookings (including sample data) with imported data
      setBookings(importedBookings);
      
      // Save the import date to mark that we now have real data
      const now = new Date();
      setLastImportDate(now);
      localStorage.setItem('lastAirbnbImport', now.toISOString());
      
      setShowAirbnbImport(false);
      
      // Show success message
      alert(`Successfully imported ${importedBookings.length} bookings from URL! Sample data has been replaced.`);
    } catch (error) {
      console.error('Import failed:', error);
      throw error; // Re-throw to let the import component handle it
    } finally {
      setIsImporting(false);
    }
  };

  const handleUploadFile = async (file: File) => {
    setIsImporting(true);
    try {
      const { parseICalFile } = await import('@/utils/icalParser');
      const importedBookings = await parseICalFile(file);
      console.log('✅ Successfully uploaded bookings:', importedBookings.map(b => ({
        guestName: b.guestName,
        checkIn: b.checkInDate.toDateString(),
        checkOut: b.checkOutDate.toDateString(),
        platform: b.platform
      })));
      
      // Replace all bookings (including sample data) with uploaded data
      setBookings(importedBookings);
      
      // Save the import date to mark that we now have real data
      const now = new Date();
      setLastImportDate(now);
      localStorage.setItem('lastAirbnbImport', now.toISOString());
      
      setShowAirbnbImport(false);
      
      // Show success message
      alert(`Successfully uploaded ${importedBookings.length} bookings from file! Sample data has been replaced.`);
    } catch (error) {
      console.error('Upload failed:', error);
      throw error; // Re-throw to let the import component handle it
    } finally {
      setIsImporting(false);
    }
  };

  const handleResetData = async () => {
    if (confirm('Are you sure you want to reset all booking data? This action cannot be undone.')) {
      // Clear all bookings
      setBookings([]);
      
      // Clear localStorage
      localStorage.removeItem('lastAirbnbImport');
      localStorage.removeItem('bookings');
      
      // Reset last import date
      setLastImportDate(null);
      
      // Show success message
      alert('All booking data has been reset successfully!');
    }
  };

  const handleDateSelect = (date: Date) => {
    console.log('Selected date:', date);
  };

  const handleOpenAirbnbImport = () => {
    setShowAirbnbImport(true);
  };

  const handleCloseAirbnbImport = () => {
    setShowAirbnbImport(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
            <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-blue-400 rounded-full animate-spin mx-auto" style={{ animationDirection: 'reverse', animationDuration: '0.8s' }}></div>
          </div>
          <p className="text-gray-600 font-medium">Loading your bookings...</p>
          <p className="text-sm text-gray-500 mt-2">Please wait while we fetch your calendar data</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 sm:py-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 sm:mb-6">
          <div className="mb-4 sm:mb-0">
            <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">
              Reservation Calendar
            </h1>
            <p className="text-gray-600 mt-1 text-sm">
              Your imported Airbnb or Booking.com reservations
              {lastImportDate && (
                <span className="text-xs text-gray-500 block mt-1">
                  Last updated: {lastImportDate.toLocaleDateString()} at {lastImportDate.toLocaleTimeString()}
                </span>
              )}
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleResetData}
              disabled={isImporting}
              className="flex items-center justify-center px-4 py-3 sm:px-3 sm:py-2 text-sm bg-red-600 text-white rounded-xl hover:bg-red-700 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl min-h-[44px] touch-manipulation"
            >
              <TrashIcon className="h-5 w-5 sm:h-4 sm:w-4 mr-2" />
              <span className="font-medium">Reset Data</span>
            </button>
            <button
              onClick={handleOpenAirbnbImport}
              disabled={isImporting}
              className="flex items-center justify-center px-4 py-3 sm:px-3 sm:py-2 text-sm bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl min-h-[44px] touch-manipulation"
            >
              <CloudArrowDownIcon className="h-5 w-5 sm:h-4 sm:w-4 mr-2" />
              <span className="font-medium">Import Calendar</span>
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4 mb-4 sm:mb-6">
          <div className="bg-white rounded-2xl shadow-lg p-3 sm:p-4 border border-gray-100 hover:shadow-xl transition-shadow duration-200">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-100 to-blue-200 rounded-2xl flex items-center justify-center">
                  <span className="text-blue-600 font-bold text-base sm:text-lg">
                    {bookings.length}
                  </span>
                </div>
              </div>
              <div className="ml-3">
                <p className="text-xs sm:text-sm font-medium text-gray-500">Total Bookings</p>
                <p className="text-lg sm:text-xl font-bold text-gray-900">{bookings.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-3 sm:p-4 border border-gray-100 hover:shadow-xl transition-shadow duration-200">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-green-100 to-green-200 rounded-2xl flex items-center justify-center">
                  <span className="text-green-600 font-bold text-base sm:text-lg">
                    {bookings.filter(b => b.status === 'confirmed').length}
                  </span>
                </div>
              </div>
              <div className="ml-3">
                <p className="text-xs sm:text-sm font-medium text-gray-500">Confirmed</p>
                <p className="text-lg sm:text-xl font-bold text-gray-900">
                  {bookings.filter(b => b.status === 'confirmed').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-3 sm:p-4 border border-gray-100 hover:shadow-xl transition-shadow duration-200">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center">
                  <span className="text-gray-600 font-bold text-base sm:text-lg">
                    {bookings.filter(b => isBookingBlocked(b)).length}
                  </span>
                </div>
              </div>
              <div className="ml-3">
                <p className="text-xs sm:text-sm font-medium text-gray-500">Blocked</p>
                <p className="text-lg sm:text-xl font-bold text-gray-900">
                  {bookings.filter(b => isBookingBlocked(b)).length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-3 sm:p-4 border border-gray-100 hover:shadow-xl transition-shadow duration-200">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-rose-100 to-rose-200 rounded-2xl flex items-center justify-center">
                  <span className="text-rose-600 font-bold text-base sm:text-lg">A</span>
                </div>
              </div>
              <div className="ml-3">
                <p className="text-xs sm:text-sm font-medium text-gray-500">Airbnb</p>
                <p className="text-lg sm:text-xl font-bold text-gray-900">
                  {bookings.filter(b => b.platform === 'airbnb').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-3 sm:p-4 border border-gray-100 hover:shadow-xl transition-shadow duration-200">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-100 to-blue-200 rounded-2xl flex items-center justify-center">
                  <span className="text-blue-600 font-bold text-base sm:text-lg">B</span>
                </div>
              </div>
              <div className="ml-3">
                <p className="text-xs sm:text-sm font-medium text-gray-500">Booking.com</p>
                <p className="text-lg sm:text-xl font-bold text-gray-900">
                  {bookings.filter(b => b.platform === 'booking.com').length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Calendar */}
        <div className="mb-4 sm:mb-6">
          <Calendar
            onDateSelect={handleDateSelect}
            bookings={bookings}
          />
        </div>

        {/* Upload Modal */}
        {showAirbnbImport && (
          <UrlUpload
            onImport={handleImportAirbnb}
            onUpload={handleUploadFile}
            isImporting={isImporting}
            onCancel={handleCloseAirbnbImport}
          />
        )}
      </div>
    </div>
  );
}
