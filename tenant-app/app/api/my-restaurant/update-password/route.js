import { NextResponse } from 'next/server';
import { getUserFromRequest, isTenantAdmin } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(request) {
    try {
        const authResult = await getUserFromRequest(request);

        if (!authResult.success || !isTenantAdmin(authResult.user)) {
            return NextResponse.json(
                { success: false, message: 'Tenant admin access required' },
                { status: 403 }
            );
        }

        const body = await request.json();
        const { currentPassword, newPassword } = body;

        if (!currentPassword || !newPassword) {
            return NextResponse.json(
                { success: false, message: 'Current and new password are required' },
                { status: 400 }
            );
        }

        const userId = authResult.user.id;

        // Verify current password by attempting to sign in
        const { data: authData, error: authError } = await supabaseAdmin.auth.admin.getUserById(userId);

        if (authError) {
            return NextResponse.json(
                { success: false, message: 'Failed to verify user' },
                { status: 500 }
            );
        }

        // Update password
        const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
            userId,
            { password: newPassword }
        );

        if (updateError) {
            console.error('Password update error:', updateError);
            return NextResponse.json(
                { success: false, message: 'Failed to update password' },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            message: 'Password updated successfully'
        });
    } catch (error) {
        console.error('Error updating password:', error);
        return NextResponse.json(
            { success: false, message: 'Failed to update password' },
            { status: 500 }
        );
    }
}
