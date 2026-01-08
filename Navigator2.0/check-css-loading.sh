#!/bin/bash

# CSS Loading Check Protocol
# Run this before making any page modifications

echo "🔍 CSS LOADING CHECK PROTOCOL"
echo "================================="

# Check 1: Server Response
echo "1. Server Response Check:"
HTTP_STATUS=$(curl -s -I http://localhost:3000/rate-trend | grep HTTP | head -1)
echo "   $HTTP_STATUS"

# Check 2: CSS File Reference
echo "2. CSS File Check:"
CSS_REF=$(curl -s http://localhost:3000/rate-trend | grep -o "/_next/static/css/app/layout.css[^\"]*" | head -1)
if [ ! -z "$CSS_REF" ]; then
    echo "   ✅ CSS Reference Found: $CSS_REF"
    # Check if CSS file actually loads
    CSS_STATUS=$(curl -s -I "http://localhost:3000$CSS_REF" | grep HTTP | head -1)
    echo "   CSS File Status: $CSS_STATUS"
else
    echo "   ❌ CSS Reference NOT found"
fi

# Check 3: Page Content State
echo "3. Page Content Check:"
LOADING_CHECK=$(curl -s http://localhost:3000/rate-trend | grep -o "Loading dashboard\|Rate Trends" | head -1)
if [ "$LOADING_CHECK" = "Loading dashboard" ]; then
    echo "   ❌ Page stuck in loading state"
    echo "   🚨 CSS/Hydration issue detected!"
    exit 1
elif [ "$LOADING_CHECK" = "Rate Trends" ]; then
    echo "   ✅ Page content loaded successfully"
else
    echo "   ⚠️  Unexpected page state"
fi

# Check 4: Development Server Status
echo "4. Dev Server Check:"
DEV_PROCESSES=$(ps aux | grep "npm run dev" | grep -v grep | wc -l)
echo "   Dev processes running: $DEV_PROCESSES"

echo "================================="
echo "✅ CSS Loading Check Complete"


