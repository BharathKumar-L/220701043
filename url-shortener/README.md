# URL Shortener Web App

A modern, feature-rich URL shortening application built with React, Vite, and Material UI.

## Features

### Core Functionality
- **URL Shortening**: Shorten up to 5 URLs concurrently
- **Custom Shortcodes**: Optional custom shortcodes (3-10 alphanumeric characters)
- **Validity Period**: Configurable expiration time (default: 30 minutes)
- **Unique Shortcodes**: Automatic generation ensuring uniqueness
- **Client-side Redirection**: Handles shortened URL redirection

### Analytics & Statistics
- **Click Tracking**: Records timestamp, source, and geographical location
- **Comprehensive Stats**: View all shortened URLs with detailed analytics
- **Search & Filter**: Find URLs by shortcode, original URL, or shortened URL
- **Pagination**: Navigate through large datasets efficiently
- **Status Indicators**: Visual indicators for active/expired URLs

### User Experience
- **Material UI Design**: Modern, responsive interface
- **Real-time Validation**: Client-side form validation
- **Error Handling**: User-friendly error messages
- **Copy to Clipboard**: One-click URL copying
- **Responsive Design**: Works on desktop and mobile devices

### Data Persistence
- **Local Storage**: URLs and analytics persist across browser sessions
- **Logging System**: Comprehensive logging middleware for debugging

## Technical Stack

- **Frontend**: React 19 with Vite
- **UI Framework**: Material UI (MUI)
- **Routing**: React Router DOM
- **State Management**: React Context API
- **Styling**: Material UI with custom theme
- **Logging**: Custom logging middleware

## Installation & Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd url-shortener
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Open in browser**
   Navigate to `http://localhost:3000`

## Usage

### Shortening URLs

1. **Navigate to the home page** (`/`)
2. **Add URLs**: Enter up to 5 URLs to shorten
3. **Configure options** (optional):
   - Set validity period in minutes (default: 30)
   - Provide custom shortcode (3-10 alphanumeric characters)
4. **Submit**: Click "Shorten URLs" to generate shortened links
5. **Copy links**: Use the "Copy Link" button to copy shortened URLs

### Viewing Statistics

1. **Navigate to statistics page** (`/stats`)
2. **View summary**: See total URLs, active URLs, expired URLs, and total clicks
3. **Search**: Use the search bar to find specific URLs
4. **View details**: Click the expand icon to see click analytics
5. **Pagination**: Navigate through large datasets

### URL Redirection

- **Direct access**: Visit `http://localhost:3000/{shortcode}`
- **Automatic tracking**: Clicks are automatically recorded with timestamp, source, and location
- **Error handling**: Expired or invalid URLs show appropriate error messages

## API Integration

The application uses a free IP geolocation service (`ipapi.co`) to determine click locations. This service provides:
- Country information
- City and region data
- Automatic fallback to "Unknown" if service is unavailable

## Logging System

The application uses a custom logging middleware that:
- Logs all user actions and system events
- Stores logs in localStorage for persistence
- Provides different log levels (INFO, WARN, ERROR, DEBUG)
- Includes contextual data with each log entry

## File Structure

```
src/
├── components/
│   ├── UrlShortenerForm.jsx    # Main URL shortening form
│   ├── StatsTable.jsx          # Statistics and analytics table
│   └── RedirectionHandler.jsx  # URL redirection component
├── context/
│   └── UrlContext.jsx          # Global state management
├── pages/
│   ├── ShortenerPage.jsx       # URL shortener page
│   └── StatsPage.jsx           # Statistics page
├── App.jsx                     # Main app component
├── main.jsx                    # Application entry point
└── LoggingMiddleware.js        # Custom logging system
```

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### Key Features Implementation

1. **URL Validation**: Client-side validation using URL constructor
2. **Shortcode Generation**: Random 6-character alphanumeric codes
3. **Uniqueness Check**: Ensures no duplicate shortcodes
4. **Expiration Logic**: Automatic expiration based on validity period
5. **Click Analytics**: Comprehensive tracking with geolocation
6. **Error Handling**: Graceful error handling with user feedback

## Browser Compatibility

- Chrome (recommended)
- Firefox
- Safari
- Edge

## Performance Considerations

- Local storage for data persistence
- Efficient state management with React Context
- Optimized re-renders with proper React patterns
- Minimal external dependencies

## Security Features

- Client-side validation
- XSS protection through React's built-in sanitization
- No sensitive data storage
- Secure URL handling

## Future Enhancements

- User authentication system
- API backend integration
- Advanced analytics dashboard
- URL categories and tags
- Bulk URL import/export
- Custom domain support
