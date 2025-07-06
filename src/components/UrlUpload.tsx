'use client';

import { useState, type ChangeEvent, type FormEvent } from 'react';
import { 
  DocumentArrowUpIcon, 
  ExclamationTriangleIcon,
  LinkIcon,
  CloudArrowUpIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

interface FileUploadProps {
  readonly onImport: (url: string) => Promise<void>;
  readonly onUpload: (file: File) => Promise<void>;
  readonly isImporting: boolean;
  readonly onCancel: () => void;
}

export default function FileUpload({ onImport, onUpload, isImporting, onCancel }: FileUploadProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState('');
  const [icalUrl, setIcalUrl] = useState('');
  const [activeTab, setActiveTab] = useState<'url' | 'file'>('url');

  const handleFileSelect = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.name.endsWith('.ics') && file.type !== 'text/calendar') {
      setError('Please select a valid .ics file');
      return;
    }

    setSelectedFile(file);
    setError('');
    
    // Automatically upload the file as soon as it's selected
    try {
      await onUpload(file);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload file');
    }
  };

  const handleUrlImport = async (e: FormEvent) => {
    e.preventDefault();
    if (!icalUrl.trim()) {
      setError('Please enter a valid iCal URL');
      return;
    }

    // Validate URL format
    try {
      new URL(icalUrl);
    } catch {
      setError('Please enter a valid URL');
      return;
    }

    try {
      await onImport(icalUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to import calendar');
    }
  };

  const handleExampleUrlClick = (url: string) => {
    setIcalUrl(url);
    setError('');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl mx-auto max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <CloudArrowUpIcon className="h-6 w-6 text-blue-600 mr-2" />
              <h2 className="text-xl font-semibold text-gray-900">
                Import Calendar Data
              </h2>
            </div>
            <button
              onClick={onCancel}
              className="p-2 rounded-full hover:bg-gray-100 transition-all duration-200"
              aria-label="Close"
            >
              <XMarkIcon className="h-5 w-5 text-gray-600" />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex mb-6 bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setActiveTab('url')}
              className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                activeTab === 'url'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              <LinkIcon className="h-4 w-4 inline mr-2" />
              Import from URL
            </button>
            <button
              onClick={() => setActiveTab('file')}
              className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                activeTab === 'file'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              <DocumentArrowUpIcon className="h-4 w-4 inline mr-2" />
              Upload File
            </button>
          </div>

          {/* URL Import Tab */}
          {activeTab === 'url' && (
            <div className="space-y-4">
              {/* Instructions */}
              <div className="bg-blue-50 rounded-lg p-4">
                <h3 className="text-sm font-medium text-blue-900 mb-2">
                  How to get your calendar URL:
                </h3>
                <div className="space-y-3">
                  <div>
                    <h4 className="text-sm font-semibold text-blue-800">Airbnb:</h4>
                    <ol className="text-sm text-blue-700 space-y-1 ml-2">
                      <li>1. Go to your Airbnb hosting dashboard</li>
                      <li>2. Navigate to Calendar → Availability settings</li>
                      <li>3. Find &quot;Export calendar&quot; section</li>
                      <li>4. Copy the iCal URL (ends with .ics)</li>
                    </ol>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-blue-800">Booking.com:</h4>
                    <ol className="text-sm text-blue-700 space-y-1 ml-2">
                      <li>1. Go to your Booking.com partner dashboard</li>
                      <li>2. Navigate to Calendar or Availability</li>
                      <li>3. Look for &quot;Export&quot; or &quot;iCal&quot; option</li>
                      <li>4. Copy the iCal URL</li>
                    </ol>
                  </div>
                </div>
              </div>

              {/* Example URLs */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="text-sm font-medium text-gray-800 mb-2">Example URLs:</h4>
                <div className="space-y-2">
                  <div>
                    <p className="text-xs text-gray-600 mb-1">Airbnb:</p>
                    <button
                      onClick={() => handleExampleUrlClick('https://www.airbnb.com/calendar/ical/123456789.ics?s=12345676789')}
                      className="text-xs text-blue-600 hover:text-blue-800 break-all cursor-pointer hover:underline"
                    >
                      https://www.airbnb.com/calendar/ical/123456789.ics?s=12345676789
                    </button>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 mb-1">Booking.com:</p>
                    <button
                      onClick={() => handleExampleUrlClick('https://ical.booking.com/v1/export?t=1234566-f5b2-457a-872f-12345566')}
                      className="text-xs text-blue-600 hover:text-blue-800 break-all cursor-pointer hover:underline"
                    >
                      https://ical.booking.com/v1/export?t=1234566-f5b2-457a-872f-12345566
                    </button>
                  </div>
                </div>
              </div>

              {/* URL Input Form */}
              <form onSubmit={handleUrlImport} className="space-y-4">
                <div>
                  <label htmlFor="icalUrlInput" className="block text-sm font-medium text-gray-700 mb-2">
                    Calendar URL (iCal)
                  </label>
                  <div className="relative">
                    <input
                      id="icalUrlInput"
                      type="url"
                      value={icalUrl}
                      onChange={(e) => setIcalUrl(e.target.value)}
                      placeholder="https://www.airbnb.com/calendar/ical/..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                      disabled={isImporting}
                    />
                    {isImporting && (
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        <div className="animate-spin rounded-full h-5 w-5 border-2 border-blue-200 border-t-blue-600"></div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={onCancel}
                    disabled={isImporting}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isImporting || !icalUrl.trim()}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                  >
                    {isImporting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Importing...
                      </>
                    ) : (
                      <>
                        <LinkIcon className="h-4 w-4 mr-2" />
                        Import from URL
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* File Upload Tab */}
          {activeTab === 'file' && (
            <div className="space-y-4">
              {/* Instructions */}
              <div className="bg-blue-50 rounded-lg p-4">
                <h3 className="text-sm font-medium text-blue-900 mb-2">
                  How to get your .ics file:
                </h3>
                <div className="space-y-3">
                  <div>
                    <h4 className="text-sm font-semibold text-blue-800">Airbnb:</h4>
                    <ol className="text-sm text-blue-700 space-y-1 ml-2">
                      <li>1. Go to your Airbnb hosting dashboard</li>
                      <li>2. Navigate to Calendar → Availability settings</li>
                      <li>3. Find &quot;Export calendar&quot; section</li>
                      <li>4. Download the .ics file</li>
                    </ol>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-blue-800">Booking.com:</h4>
                    <ol className="text-sm text-blue-700 space-y-1 ml-2">
                      <li>1. Go to your Booking.com partner dashboard</li>
                      <li>2. Navigate to Calendar or Availability</li>
                      <li>3. Look for &quot;Export&quot; or &quot;Download&quot; option</li>
                      <li>4. Download the .ics file</li>
                    </ol>
                  </div>
                </div>
              </div>

              {/* File Upload Area */}
              <div className="space-y-4">
                <div>
                  <label htmlFor="icsFileInput" className="block text-sm font-medium text-gray-700 mb-2">
                    Select Calendar File (.ics)
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    {isImporting ? (
                      <div className="flex flex-col items-center justify-center">
                        <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
                        <div className="text-sm text-gray-600">Uploading your file...</div>
                        {selectedFile && (
                          <div className="mt-2 text-xs text-gray-500">
                            {selectedFile.name}
                          </div>
                        )}
                      </div>
                    ) : (
                      <>
                        <DocumentArrowUpIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <div className="space-y-2">
                          <div className="text-sm text-gray-600">
                            Select your .ics file to upload
                          </div>
                          <label className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 cursor-pointer">
                            <DocumentArrowUpIcon className="h-4 w-4 mr-2" />
                            Choose File
                            <input
                              id="icsFileInput"
                              type="file"
                              accept=".ics,text/calendar"
                              onChange={handleFileSelect}
                              className="hidden"
                              disabled={isImporting}
                            />
                          </label>
                        </div>
                        {selectedFile && (
                          <div className="mt-4 text-sm text-gray-600">
                            Selected: {selectedFile.name}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={onCancel}
                    disabled={isImporting}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mt-4 flex items-center p-3 bg-red-50 border border-red-200 rounded-md">
              <ExclamationTriangleIcon className="h-5 w-5 text-red-500 mr-2 flex-shrink-0" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {/* Info Note */}
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <p className="text-xs text-gray-600">
              <strong>Note:</strong> This will replace all existing bookings with data from your calendar. 
              The calendar will be automatically refreshed to show your current bookings.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
