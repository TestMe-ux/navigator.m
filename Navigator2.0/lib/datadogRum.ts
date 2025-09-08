"use client"
import { datadogRum } from '@datadog/browser-rum'
import { useEffect } from 'react'
import { reactPlugin } from '@datadog/browser-rum-react';
/**
 * Datadog RUM Configuration and Initialization
 * 
 * This module provides comprehensive Real User Monitoring (RUM) setup for Navigator 2.0
 * including performance tracking, error monitoring, and user session analytics.
 * 
 * @version 2.0.0
 * @author Navigator Team
 */

// Environment configuration
const isDevelopment = process.env.NODE_ENV === 'development'
const isProduction = process.env.NODE_ENV === 'production'

/**
 * Check if RUM is available and initialized
 */
function isRumAvailable(): boolean {
  return typeof window !== 'undefined' && datadogRum && typeof datadogRum.addAction === 'function'
}

// Datadog RUM Configuration
export const datadogConfig = {
  applicationId: process.env.NEXT_PUBLIC_DATADOG_APPLICATION_ID || '',
  clientToken: process.env.NEXT_PUBLIC_DATADOG_CLIENT_TOKEN || '',
  site: (process.env.NEXT_PUBLIC_DATADOG_SITE || 'us5.datadoghq.com') as any,
  service: process.env.DD_SERVICE || 'navigator-ui',
  env: process.env.NODE_ENV || 'development',
  version: process.env.NEXT_PUBLIC_APP_VERSION || '2.0.0',
  sessionSampleRate: isProduction ? 100 : 100, // 100% sampling in production, 100% in dev for testing
  sessionReplaySampleRate: isProduction ? 20 : 100, // 20% session replay in production, 100% in dev
  trackUserInteractions: true,
  trackResources: true,
  trackLongTasks: true,
  defaultPrivacyLevel: 'mask-user-input' as const,
  // plugins: [reactPlugin({ router: true })],
}

/**
 * Initialize Datadog RUM
 * Should be called once during application startup
 */
export function initializeDatadogRum() {
  // Check if we're in a browser environment
  if (typeof window === 'undefined') {
    console.warn('Datadog RUM: Cannot initialize on server side')
    return false
  }

  // Only initialize if we have the required configuration
  if (!datadogConfig.applicationId || !datadogConfig.clientToken) {
    console.warn('Datadog RUM: Missing required configuration. Please set NEXT_PUBLIC_DATADOG_APPLICATION_ID and NEXT_PUBLIC_DATADOG_CLIENT_TOKEN')
    return false
  }
  if ((window as any).DD_RUM_INITIALIZED) {
    return true
  }
  // Check if already initialized
  // try {
  //   datadogRum.getInternalContext()
  //   console.log('Datadog RUM: Already initialized')
  //   return true
  // } catch {
  //   // Not initialized yet, continue with initialization
  // }

  try {
    console.log('Initializing Datadog RUM with config:', datadogConfig)
    datadogRum.init(datadogConfig)

    // Set global context
    datadogRum.setGlobalContextProperty('application', 'navigator-ui')
    datadogRum.setGlobalContextProperty('version', datadogConfig.version)
    datadogRum.setGlobalContextProperty('environment', datadogConfig.env)

    console.log('Datadog RUM initialized successfully')
      ; (window as any).DD_RUM_INITIALIZED = true
    return true
  } catch (error) {
    console.error('Failed to initialize Datadog RUM:', error)
    return false
  }
}

/**
 * Set user context for RUM tracking
 * @param user - User information object
 */
export function setUserContext(user: {
  id?: string
  name?: string
  email?: string
  role?: string
  organization?: string
  [key: string]: any
}) {
  if (typeof window === 'undefined') return

  try {
    datadogRum.setUser(user)
    console.log('Datadog RUM: User context set', { id: user.id, name: user.name })
  } catch (error) {
    console.error('Failed to set user context:', error)
  }
}

/**
 * Clear user context (for logout)
 */
export function clearUserContext() {
  if (typeof window === 'undefined') return

  try {
    datadogRum.clearUser()
    console.log('Datadog RUM: User context cleared')
  } catch (error) {
    console.error('Failed to clear user context:', error)
  }
}

/**
 * Track custom events
 * @param eventName - Name of the event
 * @param context - Additional context data
 */
export function trackEvent(eventName: string, context?: Record<string, any>) {
  if (!isRumAvailable()) return

  try {
    datadogRum.addAction(eventName, {
      ...context,
      timestamp: Date.now(),
      feature: getCurrentFeature(),
    })
    console.log('Datadog RUM: Event tracked', eventName, context)
  } catch (error) {
    console.error('Failed to track event:', error)
  }
}

/**
 * Track page views
 * @param pageName - Name of the page
 * @param context - Additional context data
 */
export function trackPageView(pageName: string, context?: Record<string, any>) {
  try {
    datadogRum.addAction('page_view', {
      page: pageName,
      ...context,
      timestamp: Date.now(),
      feature: getCurrentFeature(),
    })
    console.log('Datadog RUM: Page view tracked', pageName, context)
  } catch (error) {
    console.error('Failed to track page view:', error)
  }
}

/**
 * Track performance metrics
 * @param metricName - Name of the metric
 * @param value - Metric value
 * @param unit - Unit of measurement
 */
export function trackPerformance(metricName: string, value: number, unit: string = 'ms') {
  try {
    datadogRum.addAction('performance_metric', {
      metric: metricName,
      value,
      unit,
      timestamp: Date.now(),
      feature: getCurrentFeature(),
    })
    console.log('Datadog RUM: Performance metric tracked', metricName, value, unit)
  } catch (error) {
    console.error('Failed to track performance metric:', error)
  }
}

/**
 * Track business metrics
 * @param metricName - Name of the business metric
 * @param value - Metric value
 * @param context - Additional context
 */
export function trackBusinessMetric(metricName: string, value: number, context?: Record<string, any>) {
  try {
    datadogRum.addAction('business_metric', {
      metric: metricName,
      value,
      ...context,
      timestamp: Date.now(),
      feature: getCurrentFeature(),
    })
    console.log('Datadog RUM: Business metric tracked', metricName, value, context)
  } catch (error) {
    console.error('Failed to track business metric:', error)
  }
}

/**
 * Track errors with custom context
 * @param error - Error object or message
 * @param context - Additional context data
 */
export function trackError(error: Error | string, context?: Record<string, any>) {
  if (!isRumAvailable()) return

  try {
    const errorMessage = error instanceof Error ? error.message : error
    const errorStack = error instanceof Error ? error.stack : undefined

    datadogRum.addError(error, {
      ...context,
      errorMessage,
      errorStack,
      timestamp: Date.now(),
      feature: getCurrentFeature(),
    })
    console.log('Datadog RUM: Error tracked', errorMessage, context)
  } catch (trackingError) {
    console.error('Failed to track error:', trackingError)
  }
}

/**
 * Track API calls
 * @param method - HTTP method
 * @param url - API endpoint
 * @param status - Response status
 * @param duration - Request duration in ms
 * @param context - Additional context
 */
export function trackApiCall(
  method: string,
  url: string,
  status: number,
  duration: number,
  context?: Record<string, any>
) {
  try {
    datadogRum.addAction('api_call', {
      method,
      url,
      status,
      duration,
      ...context,
      timestamp: Date.now(),
      feature: getCurrentFeature(),
    })
    console.log('Datadog RUM: API call tracked', method, url, status, duration)
  } catch (error) {
    console.error('Failed to track API call:', error)
  }
}

/**
 * Track feature usage
 * @param feature - Feature name
 * @param action - Action performed
 * @param context - Additional context
 */
export function trackFeatureUsage(feature: string, action: string, context?: Record<string, any>) {
  try {
    datadogRum.addAction('feature_usage', {
      feature,
      action,
      ...context,
      timestamp: Date.now(),
    })
    console.log('Datadog RUM: Feature usage tracked', feature, action, context)
  } catch (error) {
    console.error('Failed to track feature usage:', error)
  }
}

/**
 * Get current feature based on URL path
 */
function getCurrentFeature(): string {
  if (typeof window === 'undefined') return 'unknown'

  const path = window.location.pathname
  if (path.includes('/parity-monitoring')) return 'parity-monitoring'
  if (path.includes('/rate-trend')) return 'rate-trend'
  if (path.includes('/ota-rankings')) return 'ota-rankings'
  if (path.includes('/events-calendar')) return 'events-calendar'
  if (path.includes('/demand')) return 'demand'
  if (path.includes('/help')) return 'help'
  if (path === '/') return 'dashboard'

  return 'unknown'
}

/**
 * Get user type (placeholder - implement based on your auth system)
 */
function getUserType(): string {
  // This should be implemented based on your authentication system
  // For now, returning a placeholder
  return 'authenticated'
}

/**
 * Start a custom action for timing
 * @param name - Action name
 * @param context - Additional context
 */
export function startAction(name: string, context?: Record<string, any>) {
  try {
    // Note: startAction/stopAction are not available in the current RUM API
    // Using addAction instead for custom timing
    datadogRum.addAction(`start_${name}`, context)
    console.log('Datadog RUM: Action started', name, context)
  } catch (error) {
    console.error('Failed to start action:', error)
  }
}

/**
 * Stop a custom action
 * @param name - Action name
 * @param context - Additional context
 */
export function stopAction(name: string, context?: Record<string, any>) {
  try {
    // Note: startAction/stopAction are not available in the current RUM API
    // Using addAction instead for custom timing
    datadogRum.addAction(`stop_${name}`, context)
    console.log('Datadog RUM: Action stopped', name, context)
  } catch (error) {
    console.error('Failed to stop action:', error)
  }
}

/**
 * Set global context property
 * @param key - Property key
 * @param value - Property value
 */
export function setGlobalContext(key: string, value: any) {
  try {
    datadogRum.setGlobalContextProperty(key, value)
    console.log('Datadog RUM: Global context set', key, value)
  } catch (error) {
    console.error('Failed to set global context:', error)
  }
}

/**
 * Get RUM instance for advanced usage
 */
export function getRumInstance() {
  return datadogRum
}
export function DatadogProvider() {
  useEffect(() => {
    initializeDatadogRum();
  }, []);

  return null;
}
// Export the datadogRum instance for direct access if needed
export { datadogRum }
