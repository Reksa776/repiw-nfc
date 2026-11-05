import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs', dynamic = 'force-dynamic';

// Keep old bookmarks working while the download format has moved to CSV.
export async function GET(request: NextRequest) {
  return NextResponse.redirect(new URL('/api/admin/cards/inactive-csv', request.url), 307);
}
