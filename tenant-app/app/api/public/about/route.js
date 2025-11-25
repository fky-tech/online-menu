import { NextResponse } from 'next/server';
import { resolveRestaurantFromHost } from '@/lib/tenant';

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

        // Import payment model dynamically
        const { getPaymentModel } = await import('@/lib/models/supabasePaymentModel');

        const allPayments = await getPaymentModel(restaurant.id);

        return NextResponse.json({
            success: true,
            data: {
                restaurant,
                paymentInfo: allPayments || []
            }
        });
    } catch (error) {
        console.error('About page error:', error);
        return NextResponse.json(
            { success: false, message: 'Failed to fetch about information' },
            { status: 500 }
        );
    }
}
