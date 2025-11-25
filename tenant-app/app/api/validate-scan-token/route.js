import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
import { resolveRestaurantFromHost } from '@/lib/tenant';
import { validateScanToken } from '@/lib/tokenService';

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const slug = searchParams.get('slug');
        const token = request.headers.get('x-scan-token') || request.cookies.get('scan_token')?.value;

        if (!token) {
            console.log('No scan token provided');
            return NextResponse.json({ success: false, message: 'No token provided' }, { status: 200 });
        }

        const hostname = request.headers.get('host') || '';
        const headers = Object.fromEntries(request.headers.entries());
        const restaurant = await resolveRestaurantFromHost(hostname, headers);

        // If slug provided, verify it matches resolved restaurant or use it if resolution failed (local dev)
        const effectiveSlug = restaurant?.slug || slug;

        if (!effectiveSlug) {
            return NextResponse.json({ success: false, message: 'Restaurant not found' }, { status: 404 });
        }

        const isValid = await validateScanToken(token, effectiveSlug);

        if (isValid) {
            return NextResponse.json({ success: true });
        } else {
            return NextResponse.json({ success: false, message: 'Invalid or expired token' }, { status: 401 });
        }
    } catch (error) {
        console.error('Validate token error:', error);
        return NextResponse.json({ success: false, message: 'Validation failed' }, { status: 500 });
    }
}
