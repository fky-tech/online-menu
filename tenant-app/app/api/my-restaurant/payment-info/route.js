import { NextResponse } from 'next/server';
import { getUserFromRequest, isTenantAdmin } from '@/lib/auth';
import { supabaseAdmin, uploadFile, getPublicUrl } from '@/lib/supabase';

// GET payment info
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

        const { getPaymentModel } = await import('@/lib/models/supabasePaymentModel');
        const payments = await getPaymentModel(restaurantId);

        return NextResponse.json({
            success: true,
            data: payments || []
        });
    } catch (error) {
        console.error('Error fetching payment info:', error);
        return NextResponse.json(
            { success: false, message: 'Failed to fetch payment info' },
            { status: 500 }
        );
    }
}

// POST update payment info
export async function POST(request) {
    try {
        const authResult = await getUserFromRequest(request);

        if (!authResult.success || !isTenantAdmin(authResult.user)) {
            return NextResponse.json(
                { success: false, message: 'Tenant admin access required' },
                { status: 403 }
            );
        }

        const formData = await request.formData();
        const restaurantId = authResult.user.restaurant_id;

        const paymentData = {
            restaurant_id: restaurantId,
            account_details: formData.get('account_number') || formData.get('bank_name') || '',
            payment_method: 'bank_transfer',
            is_active: true
        };

        const logoFile = formData.get('logo');
        const logoUrl = formData.get('logo_url');

        if (logoFile) {
            const fileBuffer = await logoFile.arrayBuffer();
            const fileName = `payment-${restaurantId}-${Date.now()}.${logoFile.name.split('.').pop()}`;
            await uploadFile('payment-logos', fileName, Buffer.from(fileBuffer), {
                contentType: logoFile.type
            });
            paymentData.logo_url = getPublicUrl('payment-logos', fileName);
        } else if (logoUrl) {
            paymentData.logo_url = logoUrl;
        }

        const { data, error } = await supabaseAdmin
            .from('payment')
            .insert(paymentData)
            .select()
            .single();

        if (error) throw error;

        return NextResponse.json({
            success: true,
            message: 'Payment info updated successfully',
            data
        });
    } catch (error) {
        console.error('Error updating payment info:', error);
        return NextResponse.json(
            { success: false, message: 'Failed to update payment info' },
            { status: 500 }
        );
    }
}
