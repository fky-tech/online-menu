import { NextResponse } from 'next/server';
import { resolveRestaurantFromHost } from '@/lib/tenant';
import { createScanToken } from '@/lib/tokenService';


export const dynamic = 'force-dynamic';
export async function GET(request) {
    try {
        const hostname = request.headers.get('host') || '';
        const headers = Object.fromEntries(request.headers.entries());

        const restaurant = await resolveRestaurantFromHost(hostname, headers);

        if (!restaurant) {
            return NextResponse.json(
                { success: false, message: 'Restaurant not found' },
                { status: 404 }
            );
        }

        // Generate scan token
        const { token, expiresAt } = await createScanToken(restaurant.slug);

        const response = NextResponse.json({
            success: true,
            data: {
                token,
                expiresAt,
                restaurant: {
                    id: restaurant.id,
                    name: restaurant.name,
                    slug: restaurant.slug
                }
            }
        });

        // Set cookie if configured
        const useCookies = process.env.USE_SCAN_COOKIES === 'true';
        if (useCookies) {
            response.cookies.set('scan_token', token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
                maxAge: 10 * 60 // 10 minutes
            });
        }

        return response;
    } catch (error) {
        console.error('Scan QR error:', error);
        return NextResponse.json(
            { success: false, message: 'Failed to generate scan token' },
            { status: 500 }
        );
    }
}
