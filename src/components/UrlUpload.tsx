'use client';

import { useState, useEffect } from 'react';
import { validateICalUrl } from '@/utils/icalParser';
import { CloudArrowDownIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';

interface UrlUploadProps {
  readonly onImport: (icalUrl: string) => Promise<void>;
  readonly onUpload: (file: File) => Promise<void>;
  readonly isImporting: boolean;
  readonly onCancel: () => void;
}

export default function UrlUpload({ onImport, onUpload, isImporting, onCancel }: UrlUploadProps) {
  const [icalUrl, setICalUrl] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [importMethod, setImportMethod] = useState<'url' | 'file'>('url');
  const [error, setError] = useState('');

  // Reset form when component mounts or import method changes
  useEffect(() => {
    setError('');
    setICalUrl('');
    setSelectedFile(null);
  }, [importMethod]);

  // Reset form when import method changes
  const handleMethodChange = (method: 'url' | 'file') => {
    setImportMethod(method);
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      setSelectedFile(null);
      return;
    }

    // Validate file type
    if (!file.name.toLowerCase().endsWith('.ics') && file.type !== 'text/calendar') {
      setError('Please select a valid .ics calendar file');
      setSelectedFile(null);
      return;
    }

    setSelectedFile(file);
    setError('');
  };

  const handleUrlImport = async (): Promise<void> => {
    if (!icalUrl.trim()) {
      setError('Please enter your calendar URL');
      return;
    }

    if (!validateICalUrl(icalUrl)) {
      setError('Please enter a valid Airbnb or Booking.com calendar URL');
      return;
    }

    try {
      await onImport(icalUrl);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to import calendar data';
      if (errorMessage.includes('CORS') || errorMessage.includes('security restrictions')) {
        setError('Unable to fetch calendar directly due to browser security. Please try: 1) Download the .ics file from your platform, 2) Switch to "File Upload" tab, 3) Upload the downloaded file.');
      } else if (errorMessage.includes('HTTP error') || errorMessage.includes('fetch')) {
        setError('Failed to access the calendar URL. Please check: 1) URL is correct and accessible, 2) Try downloading the .ics file manually and uploading it instead.');
      } else {
        setError(errorMessage);
      }
    }
  };

  const handleFileUpload = async (): Promise<void> => {
    if (!selectedFile) {
      setError('Please select a file to upload');
      return;
    }

    try {
      await onUpload(selectedFile);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload file');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (importMethod === 'url') {
      await handleUrlImport();
    } else {
      await handleFileUpload();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-4 sm:p-6 w-full max-w-md sm:max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center mb-4 sm:mb-6">
          <CloudArrowDownIcon className="h-6 w-6 text-blue-600 mr-2" />
          <h2 className="text-lg sm:text-xl font-bold text-gray-900">
            Import Calendar
          </h2>
        </div>

        <div className="mb-4 sm:mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
          <h3 className="text-sm font-semibold text-blue-900 mb-3">Choose import method:</h3>
          
          {/* Method Tabs */}
          <div className="flex space-x-2 mb-4">
            <button
              type="button"
              onClick={() => handleMethodChange('url')}
              className={`flex-1 px-3 py-3 sm:px-3 sm:py-2 text-sm font-medium rounded-xl transition-all duration-200 min-h-[44px] sm:min-h-0 touch-manipulation ${
                importMethod === 'url'
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'bg-white text-blue-600 border border-blue-200 hover:bg-blue-50'
              }`}
            >
              URL Import
            </button>
            <button
              type="button"
              onClick={() => handleMethodChange('file')}
              className={`flex-1 px-3 py-3 sm:px-3 sm:py-2 text-sm font-medium rounded-xl transition-all duration-200 min-h-[44px] sm:min-h-0 touch-manipulation ${
                importMethod === 'file'
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'bg-white text-blue-600 border border-blue-200 hover:bg-blue-50'
              }`}
            >
              File Upload
            </button>
          </div>

          {importMethod === 'url' ? (
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-semibold text-blue-800 mb-2">Airbnb:</h4>
                <ol className="text-xs sm:text-sm text-blue-700 space-y-1 ml-2">
                  <li>1. Go to your Airbnb hosting dashboard</li>
                  <li>2. Navigate to Calendar → Availability settings</li>
                  <li>3. Find &quot;Export calendar&quot; section</li>
                  <li>4. Copy the calendar link</li>
                </ol>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-blue-800 mb-2">Booking.com:</h4>
                <ol className="text-xs sm:text-sm text-blue-700 space-y-1 ml-2">
                  <li>1. Go to your Booking.com partner dashboard</li>
                  <li>2. Navigate to Calendar or Availability</li>
                  <li>3. Look for &quot;Export&quot; or &quot;iCal&quot; option</li>
                  <li>4. Copy the calendar URL</li>
                </ol>
              </div>
            </div>
          ) : (
            <div>
              <h4 className="text-sm font-semibold text-blue-800 mb-2">Upload .ics file:</h4>
              <ol className="text-xs sm:text-sm text-blue-700 space-y-1 ml-2">
                <li>1. Download your calendar file (.ics) from Airbnb or Booking.com</li>
                <li>2. Select the file using the file input below</li>
                <li>3. Click upload to import your bookings</li>
              </ol>
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {importMethod === 'url' ? (
            <div>
              <label htmlFor="icalUrl" className="block text-sm font-medium text-gray-700 mb-2">
                Calendar URL (Airbnb or Booking.com)
              </label>
              <input
                type="url"
                id="icalUrl"
                value={icalUrl}
                onChange={(e) => setICalUrl(e.target.value)}
                placeholder="https://www.airbnb.com/calendar/ical/... or Booking.com URL"
                className="w-full px-3 py-2 border text-gray-700 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm transition-all duration-200"
                disabled={isImporting}
              />
            </div>
          ) : (
            <div>
              <label htmlFor="icsFile" className="block text-sm font-medium text-gray-700 mb-2">
                Select Calendar File (.ics)
              </label>
              <input
                type="file"
                id="icsFile"
                key={`file-input-${importMethod}`}
                accept=".ics,text/calendar"
                onChange={handleFileSelect}
                disabled={isImporting}
                className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 transition-all duration-200"
              />
              {selectedFile && (
                <p className="mt-2 text-sm text-gray-600">
                  Selected: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)
                </p>
              )}
            </div>
          )}

          {error && (
            <div className="flex items-center p-3 bg-red-50 border border-red-200 rounded-xl">
              <ExclamationTriangleIcon className="h-5 w-5 text-red-500 mr-2 flex-shrink-0" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <div className="flex flex-col sm:flex-row sm:justify-end space-y-3 sm:space-y-0 sm:space-x-3 pt-4">
            <button
              type="button"
              onClick={onCancel}
              disabled={isImporting}
              className="px-4 py-3 sm:px-4 sm:py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-xl hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 min-h-[44px] touch-manipulation"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isImporting}
              className="px-4 py-3 sm:px-4 sm:py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-xl hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-all duration-200 shadow-lg hover:shadow-xl min-h-[44px] touch-manipulation"
            >
              {isImporting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  {importMethod === 'url' ? 'Importing...' : 'Uploading...'}
                </>
              ) : (
                <>
                  <CloudArrowDownIcon className="h-4 w-4 mr-2" />
                  {importMethod === 'url' ? 'Import Calendar' : 'Upload File'}
                </>
              )}
            </button>
          </div>
        </form>

        <div className="mt-4 sm:mt-6 p-4 bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl border border-gray-200">
          <p className="text-xs sm:text-sm text-gray-600">
            <strong>Note:</strong> This will replace all existing bookings with data from your calendar. 
            The calendar will be automatically refreshed to show your current bookings.
          </p>
        </div>
      </div>
    </div>
  );
}
