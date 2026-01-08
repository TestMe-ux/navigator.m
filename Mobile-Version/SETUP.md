# Mobile App Setup Guide

## Quick Start

This is an Android mobile application created as an independent mobile version of the Navigator 2.0 web application. It includes:

- **Overview Page**: Dashboard with KPI cards and widgets
- **Demand Page**: Market demand forecasting with calendar and charts
- **Header Component**: Fixed header with hotel selector and notifications
- **Navigation Drawer**: Left-side menu with all navigation items

## Installation Steps

### 1. Prerequisites

Ensure you have the following installed:
- Node.js (>= 18)
- React Native CLI: `npm install -g react-native-cli`
- Android Studio (for Android development)
- JDK 11 or higher

### 2. Install Dependencies

```bash
cd Mobile_Version
npm install
```

### 3. Android Setup

1. Open Android Studio
2. Install Android SDK (API level 33 or higher)
3. Set up Android emulator or connect a physical device
4. Enable USB debugging on physical device

### 4. Run the App

```bash
# Start Metro bundler
npm start

# In a new terminal, run Android
npm run android
```

## Project Structure

```
Mobile_Version/
├── App.tsx                      # Main app with navigation
├── index.js                     # Entry point
├── package.json                 # Dependencies
├── src/
│   ├── components/
│   │   ├── Header.tsx           # Header component
│   │   └── NavigationDrawer.tsx # Left menu drawer
│   └── pages/
│       ├── OverviewPage.tsx     # Overview dashboard
│       └── DemandPage.tsx       # Demand forecast page
└── README.md                    # Full documentation
```

## Key Features

### Header Component
- Fixed at top (z-index: 100)
- Gradient brand background (#008FFF)
- Hotel selector with search
- Notifications badge
- User profile menu

### Navigation Drawer
- Left-side drawer navigation
- All main navigation items
- Support section
- Issues badge at bottom
- Active route highlighting

### Overview Page
- KPI cards (Parity Score, Average Daily Rate, Price Positioning)
- Rate trends chart placeholder
- Property health score widget
- Market demand widget

### Demand Page
- Filter bar (WoW, MoM, YoY)
- Demand calendar overview
- Summary cards (4 metrics)
- Demand trends chart
- Events & Holidays section

## Integration Notes

### API Integration
The app currently uses mock data. To integrate with the actual API:

1. Copy API client files from `Navigator2.0/lib/` to `Mobile_Version/src/lib/`
2. Update API calls in:
   - `OverviewPage.tsx` - Replace mock KPI data
   - `DemandPage.tsx` - Replace mock demand data
3. Install axios if not already included: `npm install axios`

### Storage
For persistent storage (hotel selection, user preferences):
- Use `@react-native-async-storage/async-storage`
- Install: `npm install @react-native-async-storage/async-storage`
- Replace localStorage calls with AsyncStorage

### Navigation
The app uses React Navigation. To add more pages:

1. Create page component in `src/pages/`
2. Add route to `App.tsx` Stack.Navigator
3. Add navigation item to `NavigationDrawer.tsx`

## Styling

The app uses React Native StyleSheet with colors matching the web app:
- Primary: `#008FFF`
- Background: `#f8fafc`
- Cards: `#ffffff`
- Text: `#1e293b`, `#64748b`

## Troubleshooting

### Metro bundler issues
```bash
npm start -- --reset-cache
```

### Android build issues
```bash
cd android
./gradlew clean
cd ..
npm run android
```

### Dependencies issues
```bash
rm -rf node_modules
npm install
```

## Next Steps

1. Integrate with actual API endpoints
2. Add AsyncStorage for data persistence
3. Implement chart libraries (e.g., react-native-chart-kit)
4. Add error handling and loading states
5. Implement authentication flow
6. Add push notifications

## Notes

- This is an independent mobile app - it does not modify the original web application
- All components are adapted for React Native
- The app structure follows React Native best practices
- Components are self-contained and reusable

