import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
import { supabaseAdmin } from '@/lib/supabase';
import { ensureUserMetadata } from '@/lib/auth';
export async function POST(request) {
    try {
        const body = await request.json();
        const { email, password } = body;

        if (!email || !password) {
            return NextResponse.json(
                { success: false, message: 'Email and password are required' },
                { status: 400 }
            );
        }

        // Sign in with Supabase Auth
        const { data: authData, error: authError } = await supabaseAdmin.auth.signInWithPassword({
            email,
            password
        });

        if (authError) {
            return NextResponse.json(
                { success: false, message: 'Invalid credentials' },
                { status: 401 }
            );
        }

        // Ensure user metadata exists
        const userMetadata = await ensureUserMetadata(
            authData.user.id,
            authData.user.email,
            authData.user.user_metadata
        );

        if (!userMetadata) {
            return NextResponse.json(
                { success: false, message: 'User metadata not found' },
                { status: 404 }
            );
        }

        // Check if user has tenant admin role
        if (userMetadata.role !== 'tenant_admin') {
            return NextResponse.json(
                { success: false, message: 'Access denied. Tenant admin role required' },
                { status: 403 }
            );
        }

        let restaurant = null;
        if (userMetadata.restaurant_id) {
            const { data: rest } = await supabaseAdmin
                .from('restaurants')
                .select('*')
                .eq('id', userMetadata.restaurant_id)
                .single();
            restaurant = rest;
        }

        return NextResponse.json({
            success: true,
            message: 'Tenant login successful',
            data: {
                user: {
                    id: authData.user.id,
                    email: authData.user.email,
                    role: userMetadata.role,
                    restaurant_id: userMetadata.restaurant_id,
                    name: userMetadata.name
                },
                session: {
                    access_token: authData.session.access_token,
                    refresh_token: authData.session.refresh_token,
                    expires_at: authData.session.expires_at
                },
                restaurant
            }
        });
    } catch (error) {
        console.error('Error in tenant login:', error);
        return NextResponse.json(
            { success: false, message: error.message || 'Login failed' },
            { status: 500 }
        );
    }
}
