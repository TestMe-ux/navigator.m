# Static Data Loading Implementation

## Overview

Both the Overview and Demand pages now load static data from a centralized data file. This makes it easy to update the data and test the application without needing API endpoints.

## File Structure

```
src/
├── data/
│   └── staticData.ts          # Centralized static data file
├── pages/
│   ├── OverviewPage.tsx       # Updated to use static data
│   └── DemandPage.tsx         # Updated to use static data with filters
```

## Data File: `src/data/staticData.ts`

This file contains:
- **Overview Data**: KPI metrics, health scores, rate trends, market demand
- **Demand Data**: Summary metrics for WoW/MoM/YoY filters, calendar data, trends, events

### Overview Data Structure

```typescript
{
  kpi: [
    { id, title, value, subtitle, icon, color }
  ],
  healthScore: {
    overallScore: number,
    parity: number,
    rate: number,
    demand: number
  },
  rateTrends: { labels, values },
  marketDemand: { current, previous, change }
}
```

### Demand Data Structure

```typescript
{
  wow: { summary: [...] },
  mom: { summary: [...] },
  yoy: { summary: [...] },
  calendar: [{ date, demand, occupancy }],
  trends: { labels, values },
  events: [{ id, name, date, type, impact }]
}
```

## Features Implemented

### Overview Page
✅ KPI Cards with real values:
- Parity Score: 87.5%
- Average Daily Rate: $245.80
- Price Positioning: 2nd

✅ Property Health Score with metrics:
- Overall Score: 82
- Parity: 87.5%
- Rate: 78.2%
- Demand: 80.5%

### Demand Page
✅ Filter-based data loading (WoW/MoM/YoY):
- Each filter shows different summary values
- Data updates when filter changes

✅ Summary Cards with dynamic values:
- Demand Index
- Hotel ADR
- RevPAR
- Occupancy

✅ Events & Holidays List:
- Displays actual events with dates
- Shows impact levels (high/medium/low)
- Different icons for events vs holidays

## Current Static Data Values

### Overview KPIs
- **Parity Score**: 87.5%
- **Average Daily Rate**: $245.80
- **Price Positioning**: 2nd

### Demand Summary (WoW)
- **Demand Index**: 78.5 (+6.2%)
- **Hotel ADR**: $245.80 (+3.5%)
- **RevPAR**: $193.15 (+4.8%)
- **Occupancy**: 78.5% (+2.1%)

### Demand Summary (MoM)
- **Demand Index**: 78.5 (+12.4%)
- **Hotel ADR**: $245.80 (+8.2%)
- **RevPAR**: $193.15 (+10.5%)
- **Occupancy**: 78.5% (+5.3%)

### Demand Summary (YoY)
- **Demand Index**: 78.5 (+15.8%)
- **Hotel ADR**: $245.80 (+12.6%)
- **RevPAR**: $193.15 (+18.2%)
- **Occupancy**: 78.5% (+4.9%)

## How to Update Data

1. Open `src/data/staticData.ts`
2. Modify the values in `overviewData` or `demandData` objects
3. Save the file
4. The app will automatically reflect the changes (if Metro bundler is running with hot reload)

## Example: Updating KPI Values

```typescript
// In staticData.ts
export const overviewData: OverviewData = {
  kpi: [
    {
      id: 'parity-score',
      title: 'Parity Score',
      value: '90.2%',  // Update this value
      subtitle: 'Overall rate parity',
      icon: 'security',
      color: '#008FFF',
    },
    // ... other KPIs
  ],
  // ... rest of data
};
```

## Example: Adding Events

```typescript
// In staticData.ts
events: [
  {
    id: '6',
    name: 'New Event Name',
    date: '2024-02-20',
    type: 'event',
    impact: 'high',
  },
  // ... existing events
],
```

## Next Steps

To integrate with real API:
1. Create API service functions
2. Replace static data imports with API calls
3. Add loading states
4. Add error handling
5. Keep static data as fallback for offline mode

## Testing

The static data is now loaded and displayed on both pages. You can:
- Navigate between Overview and Demand pages
- Switch filters on Demand page (WoW/MoM/YoY)
- See all data values populated
- View events list with proper formatting


