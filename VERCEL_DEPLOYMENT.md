# Vercel Deployment Guide

This guide will help you deploy your Opportunities Hub backend to Vercel.

## Prerequisites

1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
2. **MongoDB Database**: Set up a MongoDB database (MongoDB Atlas recommended)
3. **Environment Variables**: Prepare your environment variables

## Step 1: Prepare Your Environment Variables

Create the following environment variables in your Vercel project:

### Required Variables
- `MONGO_URI`: Your MongoDB connection string
- `JWT_SECRET`: A secure JWT secret (minimum 32 characters)

### Optional Variables
- `JWT_EXPIRES_IN`: JWT token expiration (default: 15m)
- `REFRESH_TOKEN_EXPIRES_IN`: Refresh token expiration (default: 30d)
- `BCRYPT_ROUNDS`: Password hashing rounds (default: 12)
- `MIN_PASSWORD_LENGTH`: Minimum password length (default: 8)
- `REQUIRE_PASSWORD_COMPLEXITY`: Require complex passwords (default: true)
- `RATE_LIMIT_WINDOW_MS`: Rate limiting window (default: 900000ms)
- `RATE_LIMIT_MAX`: Rate limiting max requests (default: 100)
- `ALLOWED_ORIGINS`: Comma-separated list of allowed CORS origins
- `NODE_ENV`: Set to "production"

## Step 2: Deploy to Vercel

### Option A: Deploy via Vercel CLI

1. Install Vercel CLI:
   ```bash
   npm i -g vercel
   ```

2. Login to Vercel:
   ```bash
   vercel login
   ```

3. Deploy your project:
   ```bash
   vercel
   ```

4. Follow the prompts to configure your project

### Option B: Deploy via GitHub Integration

1. Push your code to a GitHub repository
2. Go to [vercel.com](https://vercel.com) and create a new project
3. Import your GitHub repository
4. Configure your environment variables
5. Deploy

## Step 3: Configure Environment Variables in Vercel

1. Go to your Vercel project dashboard
2. Navigate to Settings > Environment Variables
3. Add all the required environment variables listed above
4. Redeploy your application

## Step 4: Test Your Deployment

1. Check the health endpoint: `https://your-app.vercel.app/health`
2. Test your API endpoints
3. Verify database connectivity

## Important Notes

### Serverless Limitations
- **Cold Starts**: Your API may experience cold starts on first request
- **Connection Limits**: Database connections are managed differently in serverless
- **Timeout**: Functions have a 30-second timeout by default

### Database Considerations
- Use MongoDB Atlas or a cloud database service
- Ensure your database allows connections from Vercel's IP ranges
- Consider using connection pooling for better performance

### Environment Variables
- Never commit sensitive environment variables to your repository
- Use Vercel's environment variable management
- Different environments (development, preview, production) can have different variables

## Troubleshooting

### Common Issues

1. **Database Connection Errors**
   - Verify your `MONGO_URI` is correct
   - Ensure your database allows external connections
   - Check if your database service is running

2. **CORS Errors**
   - Configure `ALLOWED_ORIGINS` properly
   - Include your frontend domain in the allowed origins

3. **JWT Errors**
   - Ensure `JWT_SECRET` is set and secure
   - Verify JWT expiration settings

4. **Rate Limiting**
   - Adjust rate limiting settings if needed
   - Monitor your API usage

### Debugging

1. Check Vercel function logs in the dashboard
2. Use the health endpoint to verify basic functionality
3. Test endpoints individually to isolate issues

## API Endpoints

Your deployed API will be available at:
- Base URL: `https://your-app.vercel.app`
- Health Check: `https://your-app.vercel.app/health`
- API Routes: `https://your-app.vercel.app/api/*`

## Security Best Practices

1. **Environment Variables**: Keep sensitive data in Vercel environment variables
2. **CORS**: Configure allowed origins properly
3. **Rate Limiting**: Implement appropriate rate limits
4. **Input Validation**: Validate all user inputs
5. **HTTPS**: Vercel provides HTTPS by default

## Monitoring and Analytics

1. Use Vercel Analytics to monitor performance
2. Set up error tracking (e.g., Sentry)
3. Monitor database performance
4. Track API usage and errors

## Support

If you encounter issues:
1. Check Vercel documentation
2. Review function logs in Vercel dashboard
3. Test locally with similar environment variables
4. Contact Vercel support if needed 