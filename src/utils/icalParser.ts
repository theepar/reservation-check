import { Booking } from '@/types/booking';

// A type for the raw key-value pairs parsed from a VEVENT
interface VEvent {
  [key: string]: string;
}

/**
 * Processes a single line from iCal data and adds it to the current event
 */
function processEventLine(
    line: string, 
    currentEvent: VEvent, 
    lastKey: string
): { updatedEvent: VEvent; newLastKey: string } {
    let newLastKey = lastKey;

    if (line.startsWith(' ')) {
        // This is a folded line (a continuation of the previous line)
        if (lastKey && currentEvent[lastKey]) {
            currentEvent[lastKey] += line.substring(1);
        }
    } else {
        // This is a new property
        const regexResult = /^([^;:]+)(?:;[^:]+)?:(.*)$/.exec(line);
        if (regexResult) {
            const key = regexResult[1];
            const value = regexResult[2];
            currentEvent[key] = value;
            newLastKey = key;
        }
    }

    return { updatedEvent: currentEvent, newLastKey };
}

/**
 * Parses iCal data into an array of VEvent objects
 */
function parseICalData(data: string): VEvent[] {
    // Normalize line endings to LF and then split
    const lines = data.replace(/\r\n/g, '\n').split('\n');

    const events: VEvent[] = [];
    let currentEvent: VEvent | null = null;
    let lastKey = '';

    for (const line of lines) {
        if (line.startsWith('BEGIN:VEVENT')) {
            currentEvent = {};
        } else if (line.startsWith('END:VEVENT')) {
            if (currentEvent) {
                events.push(currentEvent);
                currentEvent = null;
            }
        } else if (currentEvent) {
            const result = processEventLine(line, currentEvent, lastKey);
            currentEvent = result.updatedEvent;
            lastKey = result.newLastKey;
        }
    }

    return events;
}

/**
 * Parses an iCal date string into a JavaScript Date object
 */
function parseDate(dateStr: string): Date {
    const year = parseInt(dateStr.substring(0, 4), 10);
    const month = parseInt(dateStr.substring(4, 6), 10) - 1; // Month is 0-indexed
    const day = parseInt(dateStr.substring(6, 8), 10);

    if (dateStr.length > 8) {
        const hour = parseInt(dateStr.substring(9, 11), 10);
        const minute = parseInt(dateStr.substring(11, 13), 10);
        const second = parseInt(dateStr.substring(13, 15), 10);
        return new Date(Date.UTC(year, month, day, hour, minute, second));
    }

    return new Date(Date.UTC(year, month, day));
}

/**
 * Determines the booking status based on the event summary
 */
function determineBookingStatus(event: VEvent, platform: 'airbnb' | 'booking.com'): 'confirmed' | 'cancelled' {
    const summary = event.SUMMARY ?? '';
    const description = event.DESCRIPTION ?? '';
    const lowerSummary = summary.toLowerCase();

    if (lowerSummary === 'blocked' || lowerSummary === 'cancelled') {
        return 'cancelled';
    }

    if (platform === 'airbnb') {
        const statusMatch = /Status:\s*(.*?)(?:\r?\n|$)/i.exec(description);
        if (statusMatch?.[1] && statusMatch[1].toLowerCase() === 'confirmed') {
            return 'confirmed';
        }
    }

    if (lowerSummary === 'booked' || lowerSummary === 'reserved') {
        return 'confirmed';
    }

    return 'confirmed';
}

/**
 * Extracts guest name from event data based on platform
 */
function extractGuestName(event: VEvent, platform: 'airbnb' | 'booking.com'): string {
    const summary = event.SUMMARY ?? '';
    const description = event.DESCRIPTION ?? '';

    if (platform === 'airbnb') {
        const guestMatch = /Guest:\s*(.*?)(?:\r?\n|$)/i.exec(description);
        if (guestMatch?.[1]) {
            return guestMatch[1].trim();
        }
        if (summary.toLowerCase() === 'blocked' || summary.toLowerCase() === 'cancelled') {
            return 'Blocked';
        }
        return summary.trim();
    } else if (platform === 'booking.com') {
        if (summary.toLowerCase().includes('blocked') || summary.toLowerCase().includes('cancelled')) {
            return 'Blocked';
        }
        if (description) {
            return description.split(/\r?\n/)[0].trim();
        }
        return summary.replace(' - Closed', '').trim();
    }
    
    return summary.trim() || 'Unknown Guest';
}

/**
 * Parses iCal format data into Booking objects
 * @param data - The iCal data string
 * @param platform - The booking platform (airbnb or booking.com)
 * @returns Array of Booking objects
 */
export const parseICal = (data: string, platform: 'airbnb' | 'booking.com' = 'airbnb'): Booking[] => {
    if (!data.includes('BEGIN:VCALENDAR')) {
        throw new Error('Invalid iCal data: Missing BEGIN:VCALENDAR');
    }

    const events = parseICalData(data);
    
    return events.map((event, index) => {
        if (!event.DTSTART || !event.DTEND || !event.UID) {
            console.warn(`Skipping invalid event at index ${index} due to missing DTSTART, DTEND, or UID:`, event);
            return null;
        }

        const startDate = parseDate(event.DTSTART);
        const endDate = parseDate(event.DTEND);

        // For all-day events, the end date from iCal is exclusive (the morning of the next day).
        // We adjust it to be inclusive (the end of the last day of the booking).
        if (event.DTSTART.length === 8) { // It's a date (YYYYMMDD), not a datetime
            endDate.setUTCDate(endDate.getUTCDate() - 1);
        }
        
        const propertyName = event.LOCATION ?? 'Unknown Property';
        const guestName = extractGuestName(event, platform);
        const status = determineBookingStatus(event, platform);
        const originalStatus = event.SUMMARY ?? '';

        const newBooking: Booking = {
            id: event.UID,
            platform,
            propertyName,
            guestName,
            checkInDate: startDate,
            checkOutDate: endDate,
            status, // Using our determined status
            originalStatus, // Store the original SUMMARY from iCal
            description: event.DESCRIPTION, // Ensure description is passed
            createdAt: event.CREATED ? parseDate(event.CREATED) : new Date(),
            updatedAt: event['LAST-MODIFIED'] ? parseDate(event['LAST-MODIFIED']) : new Date(),
        };

        return newBooking;
    }).filter((booking): booking is Booking => booking !== null);
};



// Fetch iCal from URL and parse it
export async function fetchAirbnbCalendar(url: string): Promise<Booking[]> {
  if (!url) {
    throw new Error('URL is required');
  }
  try {
    console.log('🔍 Fetching iCal from URL:', url);
    let icalContent = '';
    // Try different strategies in order
    icalContent = await tryDirectFetch(url) ?? 
                  await tryProxyServices(url) ?? 
                  await tryServerProxy() ?? 
                  '';
    if (!icalContent) {
      throw new Error(`Unable to fetch calendar data from the provided URL. This may be due to:\n1. CORS restrictions from the calendar provider\n2. Network connectivity issues\n3. Invalid or expired calendar URL\n4. Server-side restrictions\n\nPlease verify that:\n- The URL is correct and accessible\n- The calendar is set to public/shareable\n- Your internet connection is stable\n\nIf the problem persists, you may need to download the .ics file manually and upload it using the file upload option.`);
    }
    // Clean the content and add better validation
    let cleanContent = icalContent.replace(/^\uFEFF/, '').trim();
    if (!cleanContent.includes('BEGIN:VCALENDAR')) {
      // Sometimes the content might be HTML with embedded iCal
      const icalRegex = /BEGIN:VCALENDAR[\s\S]*?END:VCALENDAR/;
      const icalMatch = icalRegex.exec(cleanContent);
      if (icalMatch) {
        cleanContent = icalMatch[0];
      } else {
        throw new Error('Invalid iCal format: missing VCALENDAR. The URL might not be returning iCal data or might be blocked by CORS.');
      }
    }
    const bookings = parseICalContent(cleanContent, url);
    return bookings;
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes('CORS')) {
        throw new Error('Unable to fetch calendar due to browser security restrictions. Please try downloading the .ics file and uploading it instead.');
      }
      throw error;
    }
    throw new Error('Failed to fetch calendar data');
  }
}

/**
 * Tries to fetch iCal data directly from the URL
 * @param url - The URL to fetch from
 * @returns The iCal data string or null if failed
 */
async function tryDirectFetch(url: string): Promise<string | null> {
    try {
        const response = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            },
        });
        if (response.ok) {
            const text = await response.text();
            if (text.includes('BEGIN:VCALENDAR')) {
                return text;
            }
        }
    } catch {
        // ignore, will try proxy next
    }
    return null;
}

/**
 * Tries to fetch iCal data using various proxy services
 * @param url - The URL to fetch from
 * @returns The iCal data string or null if failed
 */
async function tryProxyServices(url: string): Promise<string | null> {
    try {
        const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`;
        const response = await fetch(proxyUrl);
        if (response.ok) {
            const text = await response.text();
            if (text.includes('BEGIN:VCALENDAR')) {
                return text;
            }
        }
    } catch {
        // ignore, will try next
    }
    return null;
}

/**
 * Tries to fetch iCal data using a server-side proxy (if available)
 * @returns The iCal data string or null if failed
 */
async function tryServerProxy(): Promise<string | null> {
    // Server-side proxy not implemented yet
    return null;
}

/**
 * Parses and returns Booking objects from iCal content
 * @param content - The iCal content string
 * @param sourceUrl - The original URL (for error reporting)
 * @returns Array of Booking objects
 */
function parseICalContent(content: string, sourceUrl: string): Booking[] {
    const platform = sourceUrl.includes('airbnb') ? 'airbnb' : 'booking.com';
    return parseICal(content, platform);
}
