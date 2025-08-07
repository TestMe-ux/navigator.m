# Universal Helper Text System

## Overview
This application now uses a centralized helper text system that allows you to update styling for all helper text throughout the application from a single location.

## CSS Classes Location
All helper text classes are defined in `app/globals.css` under the "Universal Helper Text System" section.

## Available Classes

### Primary Helper Text Classes
- `.helper-text` - Standard helper text (14px, muted foreground, 8px margin-top)
- `.helper-text-xs` - Small helper text (12px, muted foreground, 8px margin-top) 
- `.helper-text-lg` - Large helper text (16px, muted foreground, 8px margin-top)
- `.heading-with-helper` - Container for heading + helper text with consistent 8px spacing

### Legacy Support Classes
- `.text-minimal-body` - Maps to `.helper-text` (14px, muted foreground, 8px margin-top)
- `.text-minimal-caption` - Maps to `.helper-text-xs` (12px, muted foreground, 8px margin-top)
- `.text-minimal-subtitle` - Subtitle text (16px, medium weight, foreground)

## Current Standardization
All helper text across the application now uses:
- **Font size**: `text-sm` (14px) for consistency
- **Margin-top**: `mt-2` (8px) matching Rate Trends reference
- **Spacing**: `space-y-2` (8px) for heading + helper text combinations

This includes:

### Components Updated:
- ✅ Overview KPI cards
- ✅ Demand Summary cards  
- ✅ Navigation header
- ✅ Support ticket form
- ✅ Rate Trend calendar
- ✅ Market Demand widget
- ✅ Weekly Pricing drawer
- ✅ Theme toggle
- ✅ Property Health Score widget
- ✅ Market Demand widget (spacing consistency)

## Usage Examples

### Before (Multiple font sizes)
```tsx
<p className="text-xs text-muted-foreground">Helper text</p>
<p className="text-sm text-muted-foreground">Helper text</p>
<p className="text-base text-muted-foreground">Helper text</p>
```

### After (Centralized classes)
```tsx
<p className="helper-text">Helper text</p>
<p className="helper-text-xs">Small helper text</p>
<p className="helper-text-lg">Large helper text</p>

<!-- For heading + helper text combinations -->
<div className="heading-with-helper">
  <h2 className="text-xl font-bold">Heading</h2>
  <p className="helper-text">Helper text with consistent spacing</p>
</div>
```

## Benefits

1. **Single Source of Truth**: Update font size, color, margins, or other properties in one place
2. **Consistency**: All helper text uses the same styling and spacing
3. **Maintainability**: Easy to update across the entire application
4. **Flexibility**: Different sizes available for different use cases
5. **Standardized Spacing**: Consistent 8px margin-top matching Rate Trends reference

## How to Update Styles

To change helper text styling across the entire application:

1. Open `app/globals.css`
2. Find the "Universal Helper Text System" section
3. Modify the classes as needed:

```css
/* Example: Change all helper text to be slightly larger */
.helper-text {
  @apply text-base text-muted-foreground leading-relaxed mt-1;
}

/* Example: Change color to be more prominent */
.helper-text {
  @apply text-sm text-slate-600 dark:text-slate-300 leading-relaxed mt-1;
}

/* Example: Change margin-top for all helper text */
.helper-text {
  @apply text-sm text-muted-foreground leading-relaxed mt-3;
}
```

## Migration Guide

To migrate existing helper text to the universal system:

1. Replace `text-xs text-muted-foreground` with `helper-text-xs`
2. Replace `text-sm text-muted-foreground` with `helper-text` 
3. Replace `text-base text-muted-foreground` with `helper-text-lg`
4. Replace `text-minimal-body` with `helper-text` (already supported)
5. Replace `text-minimal-caption` with `helper-text-xs` (already supported)

## Future Enhancements

Consider adding these specialized classes as needed:
- `.helper-text-success` - For positive helper text
- `.helper-text-warning` - For warning helper text
- `.helper-text-error` - For error helper text
- `.helper-text-info` - For informational helper text

## Implementation Status

✅ **Complete**: All helper text across the application now uses consistent `text-sm` sizing
✅ **Standardized Spacing**: All helper text uses `mt-2` (8px) margin-top matching Rate Trends reference
✅ **Centralized**: Universal classes available in `app/globals.css`
✅ **Documented**: This guide provides clear usage instructions 