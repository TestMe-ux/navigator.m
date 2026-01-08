# Navigator Mobile App



Android mobile application for Navigator 2.0, featuring Overview and Demand pages with Header and Navigation Drawer components.

## Features

- **Overview Page**: Dashboard with KPI cards, rate trends, property health score, and market demand widgets
- **Demand Page**: Market demand forecasting with calendar view, summary cards, trends chart, and events/holidays
- **Header Component**: Fixed header with hotel selector, notifications, and user profile
- **Navigation Drawer**: Left-side navigation menu with all main sections and support items

## Setup

### Prerequisites

- Node.js >= 18
- React Native CLI
- Android Studio (for Android development)
- Java Development Kit (JDK)

### Installation

1. Navigate to the Mobile_Version directory:
```bash
cd Mobile_Version
```

2. Install dependencies:
```bash
npm install
```

3. For iOS (if needed):
```bash
cd ios && pod install && cd ..
```

### Running the App

#### Android
```bash
npm run android
```

#### iOS
```bash
npm run ios
```

#### Start Metro Bundler
```bash
npm start
```

## Project Structure

```
Mobile_Version/
├── App.tsx                 # Main app entry point with navigation setup
├── src/
│   ├── components/
│   │   ├── Header.tsx      # Header component with hotel selector
│   │   └── NavigationDrawer.tsx  # Left navigation menu
│   └── pages/
│       ├── OverviewPage.tsx # Overview dashboard page
│       └── DemandPage.tsx  # Demand forecast page
├── package.json
├── tsconfig.json
├── babel.config.js
└── metro.config.js
```

## Components

### Header
- Fixed position at top
- Hotel selector with search
- Notifications badge
- User profile menu
- Gradient brand background matching web app

### Navigation Drawer
- Left-side drawer navigation
- Main navigation items (Overview, Demand, etc.)
- Support section (Reports, Settings, Help)
- Issues badge at bottom
- Active route highlighting

### Overview Page
- KPI cards grid
- Rate trends chart placeholder
- Property health score widget
- Market demand widget

### Demand Page
- Filter bar (WoW, MoM, YoY)
- Demand calendar overview
- Summary cards (Demand Index, ADR, RevPAR, Occupancy)
- Demand trends chart
- Events & Holidays table

## Styling

The app uses React Native StyleSheet with colors matching the web application:
- Brand colors: `#008FFF` (primary blue)
- Background: `#f8fafc` (light gray)
- Cards: `#ffffff` (white)
- Text: `#1e293b` (dark slate)

## Notes

- This is a mobile adaptation of the web application
- Components are independent and don't modify the original application
- API integration points are marked with comments for future implementation
- Mock data is used for demonstration purposes

## Development

To add new pages or components:

1. Create component in `src/components/` or page in `src/pages/`
2. Add route to `App.tsx` navigation stack
3. Add navigation item to `NavigationDrawer.tsx` if needed

## License

Same as parent Navigator 2.0 project.

