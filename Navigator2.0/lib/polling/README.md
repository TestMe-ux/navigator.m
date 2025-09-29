# Modern React Polling Service

A comprehensive polling service for React/Next.js applications that replaces the Angular `ReportStatusService` with improved architecture, TypeScript support, and modern React patterns.

## Features

- ✅ **TypeScript Support**: Full type safety with comprehensive interfaces
- ✅ **React Hooks**: Easy integration with custom hooks
- ✅ **Context Provider**: Global state management across components
- ✅ **Auto-resume**: Automatically resumes polling on app restart
- ✅ **Error Handling**: Robust error handling with retry logic
- ✅ **Notifications**: Snackbar notifications for status updates
- ✅ **localStorage Integration**: Persistent polling state
- ✅ **Modern Architecture**: Clean separation of concerns

## Architecture

```
lib/polling/
├── types.ts              # TypeScript interfaces and types
├── api-services.ts       # API service functions
├── notification-service.ts # Snackbar notification service
├── snackbar-service.ts # Global snackbar service
├── polling-service.ts    # Core polling service
└── README.md            # This documentation

hooks/
└── use-polling.ts       # React hooks for polling

components/polling/
├── polling-context.tsx   # React context provider
├── polling-status-indicator.tsx # Status display components
└── global-snackbar.tsx   # Global snackbar component
```

## Quick Start

### 1. Setup Provider

Add the `PollingProvider` to your app layout:

```tsx
// app/layout.tsx
import { PollingProvider } from '@/components/polling/polling-context';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <PollingProvider>
          {children}
        </PollingProvider>
      </body>
    </html>
  );
}
```

### 2. Use in Components

#### Using the Context Hook

```tsx
import { usePollingContext } from '@/components/polling/polling-context';

function MyComponent() {
  const { 
    startReportPolling, 
    startTaskPolling, 
    isReportPolling, 
    isTaskPolling 
  } = usePollingContext();

  const handleStartReport = () => {
    startReportPolling({
      reportId: '123',
      startDate: '2024-01-01',
      endDate: '2024-01-02',
      sid: '456',
      userEmail: 'user@example.com'
    });
  };

  return (
    <div>
      <button onClick={handleStartReport} disabled={isReportPolling}>
        {isReportPolling ? 'Polling...' : 'Start Report Polling'}
      </button>
    </div>
  );
}
```

#### Using the Custom Hook

```tsx
import { useReportPolling, useTaskPolling } from '@/hooks/use-polling';

function MyComponent() {
  const { startReportPolling, isReportPolling } = useReportPolling();
  const { startTaskPolling, isTaskPolling } = useTaskPolling();

  // Your component logic...
}
```

### 3. Display Status

```tsx
import { PollingStatusIndicator } from '@/components/polling/polling-status-indicator';

function Header() {
  return (
    <header>
      <PollingStatusIndicator compact={true} />
    </header>
  );
}

function SettingsPage() {
  return (
    <div>
      <PollingStatusIndicator showDetails={true} />
    </div>
  );
}
```

## API Reference

### Types

#### ReportPollingData
```typescript
interface ReportPollingData {
  reportId: string;
  startDate: string;
  endDate: string;
  sid: string;
  userEmail: string;
}
```

#### TaskPollingData
```typescript
interface TaskPollingData {
  taskId: number;
  channel: string;
  los: string;
  guest: string;
  sid: number;
  userId: string;
  checkInStartDate: string;
  checkInEndDate: string;
  month: number;
  year: number;
}
```

#### PollingState
```typescript
interface PollingState {
  isActive: boolean;
  isPaused: boolean;
  retryCount: number;
  lastPollTime: number;
  error?: Error;
}
```

### PollingService Methods

#### startReportPolling(data: ReportPollingData)
Starts polling for report generation status.

#### startTaskPolling(data: TaskPollingData)
Starts polling for task completion status.

#### stopPolling(type: 'report' | 'task')
Stops polling for a specific type.

#### stopAllPolling()
Stops all active polling operations.

#### getPollingState(type: 'report' | 'task')
Returns the current polling state for a specific type.

#### isPolling(type: 'report' | 'task')
Returns whether polling is active for a specific type.

### Context Methods

The `usePollingContext` hook provides:

- `startReportPolling(data)` - Start report polling
- `startTaskPolling(data)` - Start task polling
- `stopPolling(type)` - Stop specific polling
- `stopAllPolling()` - Stop all polling
- `isReportPolling` - Boolean for report polling status
- `isTaskPolling` - Boolean for task polling status
- `isAnyPolling` - Boolean for any polling status
- `reportPollingState` - Current report polling state
- `taskPollingState` - Current task polling state

### Custom Hooks

#### usePolling(options?)
General polling hook with all functionality.

#### useReportPolling(options?)
Specialized hook for report polling only.

#### useTaskPolling(options?)
Specialized hook for task polling only.

## Configuration

### Environment Variables

Make sure your `.env.local` file has the API base URL:

```env
NEXT_PUBLIC_API_BASE_URL=https://your-api-server.com/api
```

### API Endpoints

The service uses existing API methods from `lib/reports.ts`:

- `getAllReports()` - Get all reports (uses `Report/GetReportDates`)
- `getRTRRReportStatus()` - Get task status (uses `RTRR/GetReportStatusOfRTRR`)
- `regenerateRTRR()` - Regenerate task (uses `RTRR/ReGenrateRTRRReport`)

### localStorage Keys

The service uses these localStorage keys:

- `active_report_id_{sid}_{userId}` - Active report ID
- `active_task_id_{sid}_{userId}` - Active task ID
- `Lighting_Refresh_{taskId}` - Lightning refresh data
- `report_data_{reportId}` - Report polling data
- `task_data_{taskId}` - Task polling data

## Migration from Angular

### Original Angular Service
```typescript
// Angular
constructor(private reportStatusService: ReportStatusService) {}

ngOnInit() {
  this.reportStatusService.setReportId('123');
  this.reportStatusService.setTaskId(456);
}
```

### React Equivalent
```typescript
// React
import { usePollingContext } from '@/components/polling/polling-context';

function MyComponent() {
  const { startReportPolling, startTaskPolling } = usePollingContext();

  useEffect(() => {
    startReportPolling({
      reportId: '123',
      startDate: '2024-01-01',
      endDate: '2024-01-02',
      sid: '456',
      userEmail: 'user@example.com'
    });

    startTaskPolling({
      taskId: 456,
      channel: 'Booking.com',
      los: '1',
      guest: '2',
      sid: 456,
      userId: 'user123',
      checkInStartDate: '2024-01-01',
      checkInEndDate: '2024-01-31',
      month: 1,
      year: 2024
    });
  }, []);
}
```

## Best Practices

1. **Use Context for Global State**: Use `usePollingContext` when you need polling state across multiple components.

2. **Use Hooks for Local State**: Use `useReportPolling` or `useTaskPolling` for component-specific polling.

3. **Handle Errors**: Always provide error handling in your components:

```tsx
const { startReportPolling } = useReportPolling({
  onError: (error) => {
    console.error('Polling failed:', error);
    // Handle error appropriately
  }
});
```

4. **Clean Up**: The service automatically cleans up on unmount, but you can manually stop polling if needed.

5. **Monitor Status**: Use the status indicators to show users when operations are in progress.

## Troubleshooting

### Common Issues

1. **API Not Configured**: Make sure `NEXT_PUBLIC_API_BASE_URL` is set in your environment variables.

2. **Polling Not Starting**: Check that all required fields are provided in the polling data.

3. **Notifications Not Showing**: Ensure the `GlobalSnackbar` component is included in your layout.

4. **localStorage Issues**: The service handles SSR gracefully, but make sure localStorage is available on the client.

### Debug Mode

Enable debug logging by setting:

```typescript
// In your component
const { startReportPolling } = useReportPolling({
  onStateChange: (state) => {
    console.log('Polling state changed:', state);
  }
});
```

## Examples

See `components/polling/polling-example.tsx` for a complete example of how to use the polling service in your components.

## Support

For issues or questions, please check the console logs for detailed error information. The service provides comprehensive logging to help debug any issues.
