import { NextResponse } from 'next/server';
import { getSessionUserId } from '@/lib/auth';
import { getDashboardData } from '@/lib/dashboard';

export async function GET() {
  try {
    const userId = await getSessionUserId();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const dashboardData = await getDashboardData(userId);

    return NextResponse.json(dashboardData);
  } catch (error) {
    console.error('Failed to fetch dashboard data:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
