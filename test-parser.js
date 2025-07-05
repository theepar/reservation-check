// Test script to debug iCal parsing
const fs = require('fs');
const path = require('path');

// Read the example file
const exampleFile = path.join(__dirname, 'example-airbnb.ics');
const content = fs.readFileSync(exampleFile, 'utf8');

console.log('File content length:', content.length);
console.log('First 300 chars:');
console.log(content.substring(0, 300));
console.log('\n---\n');

// Check for VCALENDAR
console.log('Contains BEGIN:VCALENDAR?', content.includes('BEGIN:VCALENDAR'));
console.log('Contains END:VCALENDAR?', content.includes('END:VCALENDAR'));

// Check events
const events = content.match(/BEGIN:VEVENT[\s\S]*?END:VEVENT/g);
console.log('Number of events found:', events ? events.length : 0);

if (events) {
    events.forEach((event, index) => {
        console.log(`\nEvent ${index + 1}:`);
        const summary = event.match(/SUMMARY:(.+)/);
        const dtstart = event.match(/DTSTART[^:]*:(.+)/);
        const dtend = event.match(/DTEND[^:]*:(.+)/);

        console.log('  Summary:', summary ? summary[1] : 'Not found');
        console.log('  Start:', dtstart ? dtstart[1] : 'Not found');
        console.log('  End:', dtend ? dtend[1] : 'Not found');
    });
}
