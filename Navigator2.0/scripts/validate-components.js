#!/usr/bin/env node

/**
 * Component Validation Script
 * Runs comprehensive checks on all components to prevent runtime errors
 */

const fs = require('fs')
const path = require('path')

// Component directories to check
const COMPONENT_DIRS = [
  'components',
  'app',
  'lib'
]

// Known import patterns to validate
const IMPORT_PATTERNS = [
  /@\/components\/ui\/\w+/g,
  /@\/components\/\w+/g,
  /@\/lib\/\w+/g,
  /from ['"]@\/[^'"]+['"]/g
]

// Required UI components that should always exist
const REQUIRED_UI_COMPONENTS = [
  'button',
  'card',
  'input',
  'select',
  'dialog',
  'popover',
  'tooltip',
  'skeleton',
  'progress'
]

class ComponentValidator {
  constructor() {
    this.errors = []
    this.warnings = []
    this.checkedFiles = new Set()
  }

  log(message, type = 'info') {
    const timestamp = new Date().toISOString()
    const prefix = type === 'error' ? '❌' : type === 'warning' ? '⚠️' : 'ℹ️'
    console.log(`${prefix} [${timestamp}] ${message}`)
  }

  checkFileExists(filePath) {
    try {
      return fs.existsSync(filePath)
    } catch {
      return false
    }
  }

  checkUIComponents() {
    this.log('Checking UI components...', 'info')
    
    const uiDir = path.join(process.cwd(), 'components', 'ui')
    
    if (!this.checkFileExists(uiDir)) {
      this.errors.push('UI components directory not found: components/ui')
      return
    }

    REQUIRED_UI_COMPONENTS.forEach(component => {
      const componentPath = path.join(uiDir, `${component}.tsx`)
      if (!this.checkFileExists(componentPath)) {
        this.errors.push(`Required UI component missing: ${component}.tsx`)
      } else {
        this.log(`✓ UI component found: ${component}.tsx`)
      }
    })
  }

  checkImportsInFile(filePath) {
    if (this.checkedFiles.has(filePath)) {
      return
    }
    this.checkedFiles.add(filePath)

    try {
      const content = fs.readFileSync(filePath, 'utf8')
      
      // Check for import statements
      const importLines = content.split('\n').filter(line => 
        line.trim().startsWith('import') && line.includes('@/')
      )

      importLines.forEach((line, index) => {
        const lineNumber = content.split('\n').indexOf(line) + 1
        
        // Extract the import path
        const pathMatch = line.match(/from ['"](@\/[^'"]+)['"]/)
        if (pathMatch) {
          const importPath = pathMatch[1]
          const actualPath = importPath.replace('@/', '')
          const fullPath = path.join(process.cwd(), actualPath + '.tsx')
          const fullPathJs = path.join(process.cwd(), actualPath + '.ts')
          
          if (!this.checkFileExists(fullPath) && !this.checkFileExists(fullPathJs)) {
            // Check without extension
            const withoutExt = path.join(process.cwd(), actualPath)
            if (!this.checkFileExists(withoutExt)) {
              this.errors.push(
                `Import path not found in ${filePath}:${lineNumber} - ${importPath}`
              )
            }
          }
        }

        // Check for specific component imports
        const componentMatch = line.match(/import\s*\{([^}]+)\}\s*from/)
        if (componentMatch) {
          const components = componentMatch[1]
            .split(',')
            .map(c => c.trim())
            .filter(c => c.length > 0)
          
          // Log imported components for debugging
          if (components.length > 0) {
            this.log(`Importing from ${pathMatch?.[1] || 'unknown'}: ${components.join(', ')}`)
          }
        }
      })

    } catch (error) {
      this.warnings.push(`Could not read file ${filePath}: ${error.message}`)
    }
  }

  scanDirectory(dirPath, recursive = true) {
    if (!this.checkFileExists(dirPath)) {
      this.warnings.push(`Directory not found: ${dirPath}`)
      return
    }

    try {
      const entries = fs.readdirSync(dirPath, { withFileTypes: true })
      
      entries.forEach(entry => {
        const fullPath = path.join(dirPath, entry.name)
        
        if (entry.isDirectory() && recursive) {
          // Skip node_modules and .next
          if (!['node_modules', '.next', '.git'].includes(entry.name)) {
            this.scanDirectory(fullPath, recursive)
          }
        } else if (entry.isFile() && /\.(tsx?|jsx?)$/.test(entry.name)) {
          this.checkImportsInFile(fullPath)
        }
      })
    } catch (error) {
      this.warnings.push(`Could not scan directory ${dirPath}: ${error.message}`)
    }
  }

  checkSpecificComponents() {
    this.log('Checking specific critical components...', 'info')
    
    const criticalComponents = [
      'components/loading-skeleton.tsx',
      'components/error-boundary.tsx', 
      'components/error-fallback.tsx',
      'lib/component-validator.ts'
    ]

    criticalComponents.forEach(component => {
      const fullPath = path.join(process.cwd(), component)
      if (!this.checkFileExists(fullPath)) {
        this.errors.push(`Critical component missing: ${component}`)
      } else {
        this.log(`✓ Critical component found: ${component}`)
      }
    })
  }

  generateReport() {
    this.log('\n📊 VALIDATION REPORT', 'info')
    this.log('='.repeat(50), 'info')
    
    if (this.errors.length === 0 && this.warnings.length === 0) {
      this.log('✅ All components validated successfully!', 'info')
      return true
    }

    if (this.errors.length > 0) {
      this.log(`\n❌ ERRORS (${this.errors.length}):`, 'error')
      this.errors.forEach((error, index) => {
        this.log(`${index + 1}. ${error}`, 'error')
      })
    }

    if (this.warnings.length > 0) {
      this.log(`\n⚠️  WARNINGS (${this.warnings.length}):`, 'warning')
      this.warnings.forEach((warning, index) => {
        this.log(`${index + 1}. ${warning}`, 'warning')
      })
    }

    this.log('\n💡 RECOMMENDATIONS:', 'info')
    this.log('1. Fix all import errors before deploying', 'info')
    this.log('2. Ensure all UI components are present', 'info')
    this.log('3. Use ErrorBoundary components for critical sections', 'info')
    this.log('4. Add fallback components for complex imports', 'info')

    return this.errors.length === 0
  }

  run() {
    this.log('🚀 Starting component validation...', 'info')
    
    // Check UI components first
    this.checkUIComponents()
    
    // Check critical components
    this.checkSpecificComponents()
    
    // Scan all component directories
    COMPONENT_DIRS.forEach(dir => {
      const fullDir = path.join(process.cwd(), dir)
      this.log(`Scanning directory: ${dir}`, 'info')
      this.scanDirectory(fullDir)
    })

    // Generate and return report
    return this.generateReport()
  }
}

// Run the validator
if (require.main === module) {
  const validator = new ComponentValidator()
  const success = validator.run()
  process.exit(success ? 0 : 1)
}

module.exports = ComponentValidator
