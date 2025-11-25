import { NextResponse } from 'next/server';
import { supabase, supabaseAdmin } from '@/lib/supabase';
import { ensureUserMetadata } from '@/lib/auth';


export const dynamic = 'force-dynamic';
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

        // Sign in with Supabase Auth (use regular client, not admin)
        const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
            email,
            password
        });

        if (authError) {
            console.error('Auth error:', authError);
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

        // Get restaurant data if tenant admin
        let restaurant = null;
        if (userMetadata.role === 'tenant_admin' && userMetadata.restaurant_id) {
            const { data: rest } = await supabaseAdmin
                .from('restaurants')
                .select('*')
                .eq('id', userMetadata.restaurant_id)
                .single();
            restaurant = rest;
        }

        return NextResponse.json({
            success: true,
            message: 'Login successful',
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
        console.error('Login error:', error);
        return NextResponse.json(
            { success: false, message: error.message || 'Login failed' },
            { status: 500 }
        );
    }
}
