# API Configuration Setup Guide

## Quick Fix for Current Error

The **AxiosError: Request failed with status code 400** error you're seeing is likely due to missing API configuration. Follow these steps to resolve it:

### Step 1: Create Environment File

Create a `.env.local` file in your project root directory:

```bash
# Create the environment file
touch .env.local
```

### Step 2: Add API Configuration

Add the following content to your `.env.local` file:

```env
# API Configuration
NEXT_PUBLIC_API_BASE_URL=https://your-actual-api-server.com/api
```

**Important:** Replace `https://your-actual-api-server.com/api` with your actual API server URL.

### Step 3: Restart Development Server

After creating the `.env.local` file, restart your development server:

```bash
npm run dev
# or
pnpm dev
```

## What Was Fixed

1. **Enhanced Error Logging**: Added detailed error logging in `lib/channels.ts` to help debug API issues
2. **Improved API Client**: Enhanced `lib/client.ts` with better error handling and configuration checks
3. **Environment Validation**: Added checks to warn when environment variables are missing

## Common Issues and Solutions

### 1. Still Getting 400 Error After Setup

- **Check Parameter Format**: The API expects `SID` parameter (uppercase)
- **Verify API Endpoint**: Ensure `Tax/GetChannelList` endpoint exists on your API server
- **Check Authentication**: Verify if the API requires authentication tokens

### 2. CORS Issues

If you see CORS errors, your API server needs to allow requests from your frontend domain.

### 3. Network Issues

- Verify your API server is running and accessible
- Check if you're behind a firewall or proxy
- Test the API endpoint directly using tools like Postman or curl

## Debug Information

With the enhanced logging, you'll now see detailed error information in the browser console:

- **Request Parameters**: What data is being sent to the API
- **Full URL**: The complete API endpoint being called
- **Response Details**: Status codes, error messages, and response data

## API Endpoints Used

The application uses these API endpoints:

- `Tax/GetChannelList` - Get available channels for a property
- `OTARank/GetOTAChannels` - Get OTA channels
- `OTARank/GetOTARankOnAllChannel` - Get OTA rankings
- `Parity/GetRateSummary` - Get parity data
- And more...

## Next Steps

1. Set up your `.env.local` file with the correct API URL
2. Restart your development server
3. Check the browser console for detailed error information
4. Contact your API administrator if you need the correct API server URL

## Need Help?

If you continue to experience issues:

1. Check the browser console for detailed error logs
2. Verify your API server is running
3. Ensure all required environment variables are set
4. Test API endpoints independently to confirm they work

---

**Note**: Never commit `.env.local` or any environment files containing sensitive information to version control.

