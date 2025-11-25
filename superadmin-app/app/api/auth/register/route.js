import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { ensureUserMetadata } from '@/lib/auth';

export async function POST(request) {
    try {
        const body = await request.json();
        const { name, email, password } = body;

        if (!name || !email || !password) {
            return NextResponse.json(
                { success: false, message: 'Name, email, and password are required' },
                { status: 400 }
            );
        }

        // Check if user already exists
        const { data: existingUser } = await supabaseAdmin
            .from('users')
            .select('id')
            .eq('email', email)
            .single();

        if (existingUser) {
            return NextResponse.json(
                { success: false, message: 'User already exists' },
                { status: 400 }
            );
        }

        // Create super admin
        const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
            email,
            password,
            email_confirm: true,
            user_metadata: {
                name,
                role: 'super_admin'
            }
        });

        if (authError) {
            throw authError;
        }

        // Create user metadata
        const { data: userMetadata, error: metadataError } = await supabaseAdmin
            .from('users')
            .insert({
                id: authData.user.id,
                email,
                name,
                role: 'super_admin',
                restaurant_id: null
            })
            .select()
            .single();

        if (metadataError) {
            throw metadataError;
        }

        return NextResponse.json({
            success: true,
            message: 'Super admin created successfully',
            data: {
                id: userMetadata.id,
                name: userMetadata.name,
                email: userMetadata.email,
                role: userMetadata.role
            }
        }, { status: 201 });
    } catch (error) {
        console.error('Error registering admin:', error);
        return NextResponse.json(
            { success: false, message: error.message || 'Failed to create admin' },
            { status: 500 }
        );
    }
}
