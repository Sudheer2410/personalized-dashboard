import { NextResponse } from 'next/server';

export async function GET() {
  // This is a simple status endpoint
  // In a real app, you'd check actual cache status and rate limit info
  return NextResponse.json({
    status: 'ok',
    usingCachedData: false, // This would be dynamic in a real implementation
    rateLimitReached: false, // This would be dynamic in a real implementation
    timestamp: new Date().toISOString()
  });
} 