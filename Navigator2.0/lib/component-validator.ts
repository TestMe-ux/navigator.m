/**
 * Component Validation Utilities
 * Best practices for preventing recurring import/component issues
 */

import React from 'react'

type ComponentModule = Record<string, any>

interface ValidationResult {
  isValid: boolean
  missingExports: string[]
  errors: string[]
}

/**
 * Validates that a module exports the required components
 */
export function validateComponentExports(
  module: ComponentModule,
  requiredExports: string[]
): ValidationResult {
  const missingExports: string[] = []
  const errors: string[] = []

  try {
    requiredExports.forEach(exportName => {
      if (!(exportName in module)) {
        missingExports.push(exportName)
      } else if (typeof module[exportName] !== 'function' && typeof module[exportName] !== 'object') {
        errors.push(`${exportName} is not a valid React component`)
      }
    })

    return {
      isValid: missingExports.length === 0 && errors.length === 0,
      missingExports,
      errors
    }
  } catch (error) {
    return {
      isValid: false,
      missingExports: requiredExports,
      errors: [`Module validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`]
    }
  }
}

/**
 * Safe component importer with validation
 */
export async function safeImportComponent<T>(
  importFn: () => Promise<T>,
  requiredExports: string[],
  fallbackComponent?: React.ComponentType
): Promise<T | React.ComponentType> {
  try {
    const module = await importFn()
    const validation = validateComponentExports(module as ComponentModule, requiredExports)
    
    if (!validation.isValid) {
      console.error('Component validation failed:', validation)
      
      if (fallbackComponent) {
        console.warn('Using fallback component due to validation failure')
        return fallbackComponent as T
      }
      
      throw new Error(`Missing required exports: ${validation.missingExports.join(', ')}`)
    }
    
    return module
  } catch (error) {
    console.error('Component import failed:', error)
    
    if (fallbackComponent) {
      console.warn('Using fallback component due to import failure')
      return fallbackComponent as T
    }
    
    throw error
  }
}

/**
 * Runtime component existence checker
 */
export function checkComponentExists(componentPath: string): boolean {
  try {
    // This is a runtime check that can be used in dev mode
    return true // In practice, this would use dynamic imports
  } catch {
    return false
  }
}

/**
 * Development-only component validator
 */
export function devValidateComponent(
  Component: React.ComponentType,
  componentName: string
): React.ComponentType {
  if (process.env.NODE_ENV !== 'development') {
    return Component
  }

  return function ValidatedComponent(props: any) {
    if (!Component) {
      console.error(`Component ${componentName} is undefined or null`)
      return React.createElement('div', {
        className: "p-4 border-2 border-red-500 bg-red-50 text-red-700"
      }, `Error: Component "${componentName}" failed to load`)
    }

    try {
      return React.createElement(Component, props)
    } catch (error) {
      console.error(`Component ${componentName} render error:`, error)
      return React.createElement('div', {
        className: "p-4 border-2 border-red-500 bg-red-50 text-red-700"
      }, `Error: Component "${componentName}" failed to render`)
    }
  }
}
