import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json();
    
    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }
    
    // Validate URL format
    let urlObj: URL;
    try {
      urlObj = new URL(url);
    } catch {
      return NextResponse.json({ error: 'Invalid URL format' }, { status: 400 });
    }
    
    // Only allow specific domains for security
    const allowedDomains = [
      'ical.booking.com',
      'www.airbnb.com',
      'airbnb.com',
      'calendar.google.com',
      'outlook.office365.com',
      'outlook.live.com'
    ];
    
    if (!allowedDomains.includes(urlObj.hostname)) {
      return NextResponse.json({ 
        error: 'Domain not allowed. Only Airbnb, Booking.com, and major calendar services are supported.' 
      }, { status: 403 });
    }
    
    console.log('🔍 Server-side fetching from:', url);
    
    // Fetch the calendar data
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'text/calendar, text/plain, */*',
        'User-Agent': 'Mozilla/5.0 (compatible; ReservCheck-Bot/1.0; +https://reservcheck.com/bot)',
        'Cache-Control': 'no-cache'
      },
      // Server-side fetch doesn't have CORS restrictions
    });
    
    if (!response.ok) {
      console.error('❌ Server fetch failed:', response.status, response.statusText);
      return NextResponse.json({ 
        error: `Failed to fetch calendar: ${response.status} ${response.statusText}` 
      }, { status: response.status });
    }
    
    const content = await response.text();
    console.log('✅ Server fetch successful, content length:', content.length);
    
    // Basic validation
    if (!content.includes('BEGIN:VCALENDAR')) {
      console.error('❌ Invalid calendar content received');
      return NextResponse.json({ 
        error: 'Invalid calendar format: missing VCALENDAR' 
      }, { status: 400 });
    }
    
    return NextResponse.json({ 
      content,
      success: true,
      length: content.length 
    });
    
  } catch (error) {
    console.error('❌ Server proxy error:', error);
    return NextResponse.json({ 
      error: 'Internal server error while fetching calendar' 
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ 
    message: 'Calendar proxy API - Use POST method with URL in body' 
  });
}
