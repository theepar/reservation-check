import { Booking } from '@/types/booking';

// Parse iCal date format (YYYYMMDD or YYYYMMDDTHHMMSS)
function parseICalDate(dateString: string): Date {
  // Remove timezone info if present and clean the date string
  let cleanDate = dateString.replace(/[TZ]/g, '');
  
  // Handle different date formats
  if (cleanDate.length >= 8) {
    cleanDate = cleanDate.substring(0, 8);
  } else {
    throw new Error(`Invalid date format: ${dateString}`);
  }
  
  const year = parseInt(cleanDate.substring(0, 4));
  const month = parseInt(cleanDate.substring(4, 6)) - 1; // Month is 0-based
  const day = parseInt(cleanDate.substring(6, 8));
  
  // Validate parsed values
  if (isNaN(year) || isNaN(month) || isNaN(day)) {
    throw new Error(`Invalid date components: ${dateString}`);
  }
  
  return new Date(year, month, day);
}

// Parse iCal content and extract booking events
function parseICalContent(icalContent: string, sourceUrl?: string): Booking[] {
  const bookings: Booking[] = [];
  
  // Determine platform from URL, filename, or content
  let platform: 'airbnb' | 'booking.com' | 'unknown' = 'unknown';
  
  if (sourceUrl) {
    if (sourceUrl.includes('airbnb')) {
      platform = 'airbnb';
    } else if (sourceUrl.includes('booking.com')) {
      platform = 'booking.com';
    }
  }
  
  // Check content for platform indicators
  if (icalContent.includes('booking.com') || icalContent.includes('Booking.com')) {
    platform = 'booking.com';
  } else if (icalContent.includes('airbnb.com') || icalContent.includes('Airbnb')) {
    platform = 'airbnb';
  }
  
  // If still unknown, try to detect from the content patterns
  if (platform === 'unknown') {
    // Look for typical Airbnb patterns
    if (icalContent.includes('SUMMARY:Booked') || icalContent.includes('SUMMARY:Blocked')) {
      platform = 'airbnb';
    }
    // Look for typical Booking.com patterns
    else if (icalContent.includes('SUMMARY:Reserved') || icalContent.includes('SUMMARY:Confirmed')) {
      platform = 'booking.com';
    }
  }
  
  console.log('🔍 Detected platform:', platform);
  
  // Split by lines and process events
  const lines = icalContent.split(/\r\n|\n|\r/);
  let currentEvent: {
    start?: string;
    end?: string;
    summary?: string;
    uid?: string;
    description?: string;
  } | null = null;
  
  for (const line of lines) {
    if (line.startsWith('BEGIN:VEVENT')) {
      currentEvent = {};
    } else if (line.startsWith('END:VEVENT') && currentEvent) {
      if (currentEvent.start && currentEvent.end && currentEvent.summary) {
        try {
          const startDate = parseICalDate(currentEvent.start);
          const endDate = parseICalDate(currentEvent.end);
          
          // Skip if this looks like a blocked date rather than a real booking
          const summary = currentEvent.summary.toLowerCase();
          
          // Check if this is a confirmed booking (Reserved, Booked, etc.)
          const isConfirmed = summary.includes('reserved') ||
                             summary.includes('booked') ||
                             summary.includes('confirmed') ||
                             summary === 'reserved' ||
                             summary === 'booked';
          
          // Check if this is blocked/cancelled
          const isBlocked = !isConfirmed && (
                           summary.includes('blocked') || 
                           summary.includes('not available') || 
                           summary.includes('unavailable') ||
                           summary.includes('cancelled') ||
                           summary === 'busy' ||
                           summary === 'blocked' ||
                           summary === 'cancelled'
                           );
          
          console.log('Parsing event:', {
            summary: currentEvent.summary,
            isBlocked,
            isConfirmed,
            startRaw: currentEvent.start,
            endRaw: currentEvent.end,
            startParsed: startDate.toDateString(),
            endParsed: endDate.toDateString(),
            platform
          });
          
          // For all-day events, DTEND is exclusive (the day after the last day), 
          // so we need to subtract 1 day for the actual end date
          const actualEndDate = new Date(endDate);
          actualEndDate.setDate(actualEndDate.getDate() - 1);
          
          // Skip if start date is after end date
          if (startDate > actualEndDate) {
            console.warn('Invalid date range, skipping event:', {
              startDate: startDate.toDateString(),
              endDate: actualEndDate.toDateString()
            });
            continue;
          }
          
          // Determine guest name based on platform and content
          let guestName = 'Unknown';
          
          // Try to extract guest name from description first
          if (currentEvent.description) {
            const guestMatch = /Guest:\s*(.+)/i.exec(currentEvent.description);
            if (guestMatch) {
              guestName = guestMatch[1].trim();
            }
          }
          
          // If no guest name found in description, use summary-based logic
          if (guestName === 'Unknown') {
            const summary = currentEvent.summary.toLowerCase();
            
            // For Airbnb, blocked dates usually have generic names
            if (platform === 'airbnb') {
              if (isBlocked) {
                guestName = 'Blocked';
              } else if (summary.includes('reserved')) {
                guestName = 'Reserved Guest';
              } else if (summary === 'booked') {
                guestName = 'Airbnb Guest';
              } else {
                // Real Airbnb bookings usually have guest names or reservation codes
                guestName = currentEvent.summary;
              }
            } else if (platform === 'booking.com') {
              if (isBlocked) {
                guestName = 'Blocked';
              } else if (summary.includes('reserved')) {
                guestName = 'Reserved Guest';
              } else if (summary === 'booked') {
                guestName = 'Booking.com Guest';
              } else {
                // Booking.com bookings might have guest names
                guestName = currentEvent.summary;
              }
            } else if (isBlocked) {
              guestName = 'Blocked';
            } else if (summary.includes('reserved')) {
              guestName = 'Reserved Guest';
            } else {
              guestName = currentEvent.summary;
            }
          }
          
          // Determine property name from platform
          let propertyName = 'Unknown Property';
          if (platform === 'airbnb') {
            propertyName = 'Airbnb Property';
          } else if (platform === 'booking.com') {
            propertyName = 'Booking.com Property';
          }
          
          // Create booking object
          const booking: Booking = {
            id: currentEvent.uid ?? `${platform}-${Date.now()}-${Math.random()}`,
            platform: platform as 'airbnb' | 'booking.com',
            propertyName,
            guestName,
            checkInDate: startDate,
            checkOutDate: actualEndDate,
            totalPrice: 0,
            currency: 'USD',
            status: isBlocked ? 'cancelled' : 'confirmed',
            createdAt: new Date(),
            updatedAt: new Date()
          };
          
          console.log('✅ Successfully parsed booking:', {
            guestName: booking.guestName,
            checkInDate: booking.checkInDate.toDateString(),
            checkOutDate: booking.checkOutDate.toDateString(),
            platform: booking.platform,
            status: booking.status,
            isBlocked,
            isConfirmed
          });
          
          bookings.push(booking);
        } catch (error) {
          console.error('Error parsing event:', error, currentEvent);
        }
      }
      currentEvent = null;
    } else if (currentEvent) {
      if (line.startsWith('DTSTART')) {
        // Handle both DTSTART:20250710 and DTSTART;VALUE=DATE:20250710 formats
        const colonIndex = line.indexOf(':');
        if (colonIndex > -1) {
          const value = line.substring(colonIndex + 1).trim();
          if (value) {
            currentEvent.start = value;
          }
        }
      } else if (line.startsWith('DTEND')) {
        // Handle both DTEND:20250710 and DTEND;VALUE=DATE:20250710 formats
        const colonIndex = line.indexOf(':');
        if (colonIndex > -1) {
          const value = line.substring(colonIndex + 1).trim();
          if (value) {
            currentEvent.end = value;
          }
        }
      } else if (line.startsWith('SUMMARY')) {
        const colonIndex = line.indexOf(':');
        if (colonIndex > -1) {
          const value = line.substring(colonIndex + 1).trim();
          if (value) {
            currentEvent.summary = value;
          }
        }
      } else if (line.startsWith('UID')) {
        const colonIndex = line.indexOf(':');
        if (colonIndex > -1) {
          const value = line.substring(colonIndex + 1).trim();
          if (value) {
            currentEvent.uid = value;
          }
        }
      } else if (line.startsWith('DESCRIPTION')) {
        const colonIndex = line.indexOf(':');
        if (colonIndex > -1) {
          const value = line.substring(colonIndex + 1).trim();
          if (value) {
            currentEvent.description = value;
          }
        }
      }
    }
  }
  
  console.log(`📅 Parsed ${bookings.length} bookings from iCal`);
  return bookings;
}

// Fetch iCal from URL and parse it
export async function fetchAirbnbCalendar(url: string): Promise<Booking[]> {
  if (!url) {
    throw new Error('URL is required');
  }
  
  try {
    console.log('🔍 Fetching iCal from URL:', url);
    
    // Try direct fetch first
    let response;
    let icalContent = '';
    
    try {
      response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'text/calendar, text/plain, */*',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        },
        mode: 'cors'
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status} - ${response.statusText}`);
      }
      
      icalContent = await response.text();
      console.log('📥 Received iCal content directly, length:', icalContent.length);
      console.log('📄 First 200 chars:', icalContent.substring(0, 200));
      
    } catch (corsError) {
      console.warn('Direct fetch failed, trying proxy method...', corsError);
      
      // Try multiple proxy methods for better compatibility
      const proxyUrls = [
        `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`,
        `https://corsproxy.io/?${encodeURIComponent(url)}`,
        `https://cors-anywhere.herokuapp.com/${url}`
      ];
      
      for (const proxyUrl of proxyUrls) {
        try {
          console.log('🔄 Trying proxy:', proxyUrl);
          response = await fetch(proxyUrl);
          
          if (!response.ok) {
            console.warn(`Proxy failed with status: ${response.status}`);
            continue;
          }
          
          // Handle different proxy response formats
          const contentType = response.headers.get('content-type');
          if (contentType?.includes('application/json')) {
            const proxyData = await response.json();
            icalContent = proxyData.contents ?? proxyData.data ?? proxyData;
          } else {
            icalContent = await response.text();
          }
          
          if (icalContent && typeof icalContent === 'string') {
            console.log('📥 Received iCal content via proxy, length:', icalContent.length);
            console.log('📄 First 200 chars:', icalContent.substring(0, 200));
            break;
          }
        } catch (proxyError) {
          console.warn(`Proxy ${proxyUrl} failed:`, proxyError);
          continue;
        }
      }
      
      if (!icalContent) {
        throw new Error('All proxy methods failed. Please try downloading the .ics file and uploading it instead.');
      }
    }
    
    // Clean the content and add better validation
    let cleanContent = icalContent.replace(/^\uFEFF/, '').trim();
    
    // Log the content for debugging
    console.log('🔍 Content analysis:');
    console.log('  - Length:', cleanContent.length);
    console.log('  - Starts with:', cleanContent.substring(0, 50));
    console.log('  - Contains VCALENDAR:', cleanContent.includes('BEGIN:VCALENDAR'));
    
    // Try to find and extract the calendar content if it's embedded
    if (!cleanContent.includes('BEGIN:VCALENDAR')) {
      // Sometimes the content might be HTML with embedded iCal
      const icalRegex = /BEGIN:VCALENDAR[\s\S]*?END:VCALENDAR/;
      const icalMatch = icalRegex.exec(cleanContent);
      if (icalMatch) {
        cleanContent = icalMatch[0];
        console.log('📦 Extracted embedded iCal content, length:', cleanContent.length);
      } else {
        console.error('❌ Missing VCALENDAR, content preview:', cleanContent.substring(0, 500));
        throw new Error('Invalid iCal format: missing VCALENDAR. The URL might not be returning iCal data or might be blocked by CORS.');
      }
    }
    
    const bookings = parseICalContent(cleanContent, url);
    console.log('✅ Successfully parsed calendar:', bookings.length, 'bookings');
    
    return bookings;
  } catch (error) {
    console.error('❌ Error fetching calendar:', error);
    if (error instanceof Error) {
      if (error.message.includes('CORS')) {
        throw new Error('Unable to fetch calendar due to browser security restrictions. Please try downloading the .ics file and uploading it instead.');
      }
      throw error;
    }
    throw new Error('Failed to fetch calendar data');
  }
}

// Parse iCal file content
export async function parseICalFile(file: File): Promise<Booking[]> {
  if (!file) {
    throw new Error('File is required');
  }
  
  try {
    console.log('📁 Parsing iCal file:', file.name, 'Size:', file.size, 'bytes');
    
    const icalContent = await file.text();
    console.log('📥 Read file content, length:', icalContent.length);
    console.log('📄 First 200 chars:', icalContent.substring(0, 200));
    
    // Check for BOM and remove it
    const cleanContent = icalContent.replace(/^\uFEFF/, '');
    
    if (!cleanContent.includes('BEGIN:VCALENDAR')) {
      console.error('❌ Missing VCALENDAR, content preview:', cleanContent.substring(0, 500));
      throw new Error('Invalid iCal format: missing VCALENDAR');
    }
    
    const bookings = parseICalContent(cleanContent);
    console.log('✅ Successfully parsed file:', bookings.length, 'bookings');
    
    return bookings;
  } catch (error) {
    console.error('❌ Error parsing file:', error);
    throw error;
  }
}

// Validate iCal URL format
export function validateICalUrl(url: string): boolean {
  try {
    const urlObj = new URL(url);
    
    // Check if protocol is valid
    if (urlObj.protocol !== 'https:' && urlObj.protocol !== 'http:') {
      return false;
    }
    
    // Check for known iCal patterns
    const validPatterns = [
      // Airbnb patterns - exact format: https://www.airbnb.com/calendar/ical/[ID].ics?s=[token]
      /^https:\/\/www\.airbnb\.com\/calendar\/ical\/\d+\.ics\?s=[a-f0-9]+$/i,
      /^https:\/\/www\.airbnb\.[a-z]+\/calendar\/ical\/\d+\.ics\?s=[a-f0-9]+$/i,
      
      // Booking.com patterns - exact format: https://ical.booking.com/v1/export?t=[uuid]
      /^https:\/\/ical\.booking\.com\/v1\/export\?t=[a-f0-9-]+$/i,
      
      // Generic .ics file pattern for other services
      /\.ics(\?.*)?$/i,
      
      // Fallback patterns for other calendar services
      /calendar.*ical/i,
      /ical.*calendar/i
    ];
    
    return validPatterns.some(pattern => pattern.test(url));
  } catch {
    return false;
  }
}
