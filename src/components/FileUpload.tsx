'use client';

import { useState } from 'react';
import { DocumentArrowUpIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';

interface FileUploadProps {
  readonly onUpload: (file: File) => Promise<void>;
  readonly isUploading: boolean;
  readonly onCancel: () => void;
}

export default function FileUpload({ onUpload, isUploading, onCancel }: FileUploadProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState('');

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.name.endsWith('.ics') && file.type !== 'text/calendar') {
      setError('Please select a valid .ics file');
      return;
    }

    setSelectedFile(file);
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      setError('Please select a file first');
      return;
    }

    try {
      await onUpload(selectedFile);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload file');
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const files = Array.from(e.dataTransfer.files);
    const file = files[0];
    
    if (file && (file.name.endsWith('.ics') || file.type === 'text/calendar')) {
      setSelectedFile(file);
      setError('');
    } else {
      setError('Please drop a valid .ics file');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md mx-4">
        <div className="flex items-center mb-6">
          <DocumentArrowUpIcon className="h-6 w-6 text-blue-600 mr-2" />
          <h2 className="text-xl font-semibold text-gray-900">
            Upload Calendar File
          </h2>
        </div>

        <div className="mb-4 p-4 bg-blue-50 rounded-lg">
          <h3 className="text-sm font-medium text-blue-900 mb-2">How to get your .ics file:</h3>
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

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Calendar File (.ics)
            </label>
            <div
              className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors"
              onDragOver={handleDragOver}
              onDrop={handleDrop}
            >
              <DocumentArrowUpIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <div className="space-y-2">
                <div className="text-sm text-gray-600">
                  Drag and drop your .ics file here, or
                </div>
                <label className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 cursor-pointer">
                  <span>Choose File</span>
                  <input
                    type="file"
                    accept=".ics,text/calendar"
                    onChange={handleFileSelect}
                    className="hidden"
                    disabled={isUploading}
                  />
                </label>
              </div>
              {selectedFile && (
                <div className="mt-4 text-sm text-gray-600">
                  Selected: {selectedFile.name}
                </div>
              )}
            </div>
          </div>

          {error && (
            <div className="flex items-center p-3 bg-red-50 border border-red-200 rounded-md">
              <ExclamationTriangleIcon className="h-5 w-5 text-red-500 mr-2 flex-shrink-0" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onCancel}
              disabled={isUploading}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isUploading || !selectedFile}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              {isUploading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Uploading...
                </>
              ) : (
                <>
                  <DocumentArrowUpIcon className="h-4 w-4 mr-2" />
                  Upload File
                </>
              )}
            </button>
          </div>
        </form>

        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <p className="text-xs text-gray-600">
            <strong>Note:</strong> This will replace all existing bookings with data from your uploaded file. 
            The calendar will be automatically refreshed to show your current bookings.
          </p>
        </div>
      </div>
    </div>
  );
}
