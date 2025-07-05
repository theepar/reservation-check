# 📅 Reservation Calendar

A professional, minimalist calendar application for managing Airbnb and Booking.com reservations. Built with Next.js, TypeScript, and Tailwind CSS.

![Next.js](https://img.shields.io/badge/Next.js-15.3.5-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.0-38B2AC?logo=tailwind-css)
![License](https://img.shields.io/badge/License-MIT-green)

## ✨ Features

- **🔄 Multi-Platform Import**: Support for both Airbnb and Booking.com calendars
- **📂 Flexible Import Options**: Import via URL or file upload (.ics files)
- **🎨 Status-Based Visual Indicators**: 
  - 🟢 Green for confirmed bookings
  - 🔴 Red for cancelled bookings  
  - 🟠 Orange for mixed status days
  - 🔵 Blue for current day
- **📊 Real-time Statistics**: Track total bookings, confirmed reservations, and platform distribution
- **💾 Smart Data Management**: Local storage with sample data for demo purposes
- **📱 Fully Responsive**: Optimized for desktop, tablet, and mobile devices
- **♿ Accessibility First**: WCAG compliant with proper ARIA labels and keyboard navigation
- **🚀 Performance Optimized**: Built with Next.js 14 App Router for optimal performance

## 🚀 Quick Start

### Prerequisites

- Node.js 18.0 or higher
- npm or yarn package manager

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd calender

# Install dependencies
npm install

# Run development server
npm run dev

# Open http://localhost:3000 in your browser
```

### Production Build

```bash
# Build for production
npm run build

# Start production server
npm start
```

## 📖 How to Use

### 🏠 Airbnb Calendar Import

1. **Get your calendar URL**:
   - Go to your Airbnb hosting dashboard
   - Navigate to **Calendar** → **Availability settings**
   - Find **"Export calendar"** section
   - Copy the calendar link (`.ics` URL)

2. **Import to the app**:
   - Click **"Import Calendar"** button
   - Select **"URL Import"** tab
   - Paste your Airbnb calendar URL
   - Click **"Import Calendar"**

### 🏨 Booking.com Calendar Import

1. **Get your calendar URL**:
   - Go to your Booking.com partner dashboard
   - Navigate to **Calendar** or **Availability**
   - Look for **"Export"** or **"iCal"** option
   - Copy the calendar URL

2. **Import to the app**:
   - Click **"Import Calendar"** button
   - Select **"URL Import"** tab
   - Paste your Booking.com calendar URL
   - Click **"Import Calendar"**

### 📁 File Upload Method

1. Download your calendar file (`.ics`) from Airbnb or Booking.com
2. Click **"Import Calendar"** button
3. Select **"File Upload"** tab
4. Choose your `.ics` file
5. Click **"Upload File"**

### 🗑️ Data Management

- **Reset Data**: Click the red **"Reset Data"** button to clear all bookings
- **Automatic Backup**: Your data is automatically saved to local storage
- **Sample Data**: Demo data is shown when no real bookings are imported

### 📋 Viewing Booking Details

1. **Click on any booked date** (colored dates in the calendar)
2. **Detailed Modal** will show:
   - Check-in and check-out dates
   - Booking status (Confirmed/Cancelled)
   - Guest name
   - Property name
   - Reservation/Booking ID
   - Duration in nights
   - Platform (Airbnb/Booking.com)

### 🎨 Visual Indicators

- **🟢 Green**: Confirmed bookings
- **🔴 Red**: Cancelled bookings  
- **🟠 Orange**: Mixed status (both confirmed and cancelled on same date)
- **🔵 Blue**: Current day
- **⚪ Gray**: Available dates

## 🛠️ Tech Stack

### Core Technologies
- **Framework**: Next.js 15.3.5 with App Router
- **Language**: TypeScript 5.0
- **Styling**: Tailwind CSS 3.0
- **Icons**: Heroicons v2

### Key Features
- **iCal Parser**: Custom parser supporting multiple platforms
- **Local Storage**: Client-side data persistence
- **Responsive Design**: Mobile-first approach
- **Type Safety**: Full TypeScript coverage
- **Component Architecture**: Modular, reusable components

## 📁 Project Structure

```
src/
├── app/                 # Next.js App Router pages
│   ├── globals.css     # Global styles
│   ├── layout.tsx      # Root layout
│   └── page.tsx        # Home page
├── components/         # React components
│   ├── AirbnbImport.tsx   # Import modal
│   └── Calendar.tsx       # Calendar component
├── types/             # TypeScript type definitions
│   └── booking.ts     # Booking-related types
└── utils/             # Utility functions
    ├── calendar.ts    # Calendar generation
    ├── icalParser.ts  # iCal parsing
    ├── sampleData.ts  # Demo data
    └── storage.ts     # Local storage management
```

## 🎨 Visual Design

### Color System
- **Confirmed Bookings**: Green (`bg-green-500`)
- **Cancelled Bookings**: Red (`bg-red-500`)
- **Mixed Status**: Orange (`bg-orange-500`)
- **Current Day**: Blue (`bg-blue-500`)
- **Available Days**: Light gray (`bg-gray-200`)

### Platform Indicators
- **Airbnb**: Letter "A" in rose background
- **Booking.com**: Letter "B" in blue background

### Mobile Optimization
- Minimum touch target size: 44px
- Touch-friendly interactions with `touch-manipulation`
- Responsive grid layouts
- Optimized font sizes and spacing

## 🔧 Configuration

### Environment Variables

Create a `.env.local` file for any environment-specific configurations:

```env
# Add any environment variables here
NEXT_PUBLIC_APP_NAME="Reservation Calendar"
```

### Customization

#### Modify Sample Data
Edit `src/utils/sampleData.ts` to customize demo bookings.

#### Styling
All styles use Tailwind CSS. Modify `src/app/globals.css` for global overrides.

#### iCal Parser
Extend `src/utils/icalParser.ts` to support additional platforms.

## 📱 Mobile Features

- **Large Touch Targets**: All buttons are minimum 44px height on mobile
- **Responsive Navigation**: Stacked layout on small screens
- **Optimized Forms**: Mobile-friendly input fields
- **Gesture Support**: Touch-optimized interactions
- **Performance**: Optimized bundle size for mobile networks

## 🚀 Deployment

### Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

### Other Platforms

The app can be deployed to any platform supporting Next.js:
- Netlify
- Railway
- Digital Ocean
- AWS Amplify

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Heroicons** for beautiful icons
- **Tailwind CSS** for utility-first styling
- **Next.js** team for the amazing framework
- **Vercel** for seamless deployment platform

## 📞 Support

For support, questions, or feature requests:
- Create an issue on GitHub
- Contact the development team

---

**Made with ❤️ for vacation rental hosts**

### Calendar Parsing

The app automatically parses your Airbnb iCal data and extracts:
- Guest names from booking summaries
- Check-in and check-out dates
- Booking status (confirmed/pending/cancelled)
- Property information

### CORS Handling

Since browsers block direct requests to external domains, the app uses a CORS proxy (`api.allorigins.win`) to fetch your calendar data safely.

## Project Structure

```
src/
├── app/
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx              # Main calendar page
├── components/
│   ├── AirbnbImport.tsx      # Import modal component
│   └── Calendar.tsx          # Calendar display component
├── types/
│   └── booking.ts            # TypeScript interfaces
└── utils/
    ├── booking.ts            # Booking utility functions
    ├── calendar.ts           # Calendar generation utilities
    ├── icalParser.ts         # iCal parsing functions
    ├── sampleData.ts         # Sample data for testing
    └── storage.ts            # Local storage utilities
```

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

### Tech Stack

- **Next.js 14**: React framework with App Router
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first styling
- **Heroicons**: Beautiful SVG icons

## Features in Detail

### Calendar View
- Monthly navigation with arrow buttons
- Color-coded booking indicators
- Hover tooltips showing booking details
- Responsive grid layout

### Import System
- URL validation for Airbnb calendar links
- Error handling for failed imports
- Progress indicators during import
- Success/failure notifications

### Data Management
- Automatic local storage backup
- Import timestamp tracking
- Calendar refresh functionality
- Error recovery

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Security & Privacy

- All data is stored locally in your browser
- No server-side data storage
- Calendar URLs are processed client-side only
- Uses secure CORS proxy for external requests

## Troubleshooting

### Common Issues

1. **"Invalid iCal content"** - Ensure your URL is correct and ends with `.ics`
2. **CORS errors** - The app uses a proxy service; check your internet connection
3. **No bookings showing** - Verify your calendar URL contains actual booking data
4. **Import fails** - Try refreshing the page and importing again

### Getting Help

If you encounter issues:
1. Check the browser console for error messages
2. Verify your Airbnb calendar URL is accessible
3. Try refreshing the page and importing again

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Built with Next.js and TypeScript
- Icons by Heroicons
- CORS proxy by allorigins.win
- Styling with Tailwind CSS
