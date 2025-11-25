import { NextResponse } from 'next/server';
import { getUserFromRequest, isTenantAdmin } from '@/lib/auth';
import { resolveRestaurantFromHost } from '@/lib/tenant';
import { validateAndConsumeScanToken } from '@/lib/tokenService';
import { supabaseAdmin } from '@/lib/supabase';


export const dynamic = 'force-dynamic';
// GET comments for restaurant (tenant admin)
export async function GET(request) {
    try {
        const authResult = await getUserFromRequest(request);

        if (!authResult.success || !isTenantAdmin(authResult.user)) {
            return NextResponse.json(
                { success: false, message: 'Tenant admin access required' },
                { status: 403 }
            );
        }

        const restaurantId = authResult.user.restaurant_id;

        const { data, error } = await supabaseAdmin
            .from('comments')
            .select('id, comment_text, menu_item_name, created_at')
            .eq('restaurant_id', restaurantId)
            .order('created_at', { ascending: false });

        if (error) throw error;

        return NextResponse.json({
            success: true,
            data: data || []
        });
    } catch (error) {
        console.error('Get comments error:', error);
        return NextResponse.json(
            { success: false, message: 'Failed to fetch comments' },
            { status: 500 }
        );
    }
}

// POST comment (public with scan token)
export async function POST(request) {
    try {
        const body = await request.json();
        const { comment_text, menu_item_name, scan_token } = body;

        const hostname = request.headers.get('host') || '';
        const headers = Object.fromEntries(request.headers.entries());

        const restaurant = await resolveRestaurantFromHost(hostname, headers);

        if (!restaurant) {
            return NextResponse.json(
                { success: false, message: 'Restaurant not found' },
                { status: 404 }
            );
        }

        const useCookies = process.env.NEXT_PUBLIC_USE_SCAN_COOKIES === 'true';
        let token;

        console.log('Comment API - useCookies:', useCookies);
        console.log('Comment API - body:', { comment_text, menu_item_name, scan_token });
        console.log('Comment API - cookies:', request.cookies.getAll());
        console.log('Comment API - x-scan-token header:', request.headers.get('x-scan-token'));

        // Try to get token from cookies first
        token = request.cookies.get('scan_token')?.value;

        // If not in cookies, try body or header (fallback)
        if (!token) {
            token = scan_token || request.headers.get('x-scan-token');
        }

        console.log('Comment API - Final token value:', token);

        if (!comment_text || !comment_text.trim()) {
            return NextResponse.json(
                { success: false, message: 'Comment text is required' },
                { status: 400 }
            );
        }

        if (!token) {
            return NextResponse.json(
                { success: false, message: 'No scan token found. Please scan QR code first.' },
                { status: 401 }
            );
        }

        // Validate and consume scan token
        const isValid = await validateAndConsumeScanToken(token, restaurant.slug);
        if (!isValid) {
            return NextResponse.json(
                { success: false, message: 'Invalid or expired scan token. Please scan QR code again.' },
                { status: 401 }
            );
        }

        const { data, error } = await supabaseAdmin
            .from('comments')
            .insert({
                restaurant_id: restaurant.id,
                comment_text: comment_text.trim(),
                menu_item_name: menu_item_name || null
            })
            .select()
            .single();

        if (error) throw error;

        return NextResponse.json({
            success: true,
            message: 'Comment posted successfully',
            data: {
                id: data.id,
                created_at: data.created_at
            }
        }, { status: 201 });
    } catch (error) {
        console.error('Post comment error:', error);
        return NextResponse.json(
            { success: false, message: 'Failed to post comment' },
            { status: 500 }
        );
    }
}
