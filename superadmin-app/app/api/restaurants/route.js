import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
import { getUserFromRequest, isSuperAdmin } from '@/lib/auth';
import { supabaseAdmin, uploadFile, getPublicUrl } from '@/lib/supabase';
// GET all restaurants (super admin only)
export async function GET(request) {
    try {
        const authResult = await getUserFromRequest(request);

        if (!authResult.success || !isSuperAdmin(authResult.user)) {
            return NextResponse.json(
                { success: false, message: 'Super admin access required' },
                { status: 403 }
            );
        }

        const { data, error } = await supabaseAdmin
            .from('restaurants')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;

        return NextResponse.json({
            success: true,
            data
        });
    } catch (error) {
        console.error('Error fetching restaurants:', error);
        return NextResponse.json(
            { success: false, message: 'Failed to fetch restaurants' },
            { status: 500 }
        );
    }
}

// POST create restaurant (super admin only)
export async function POST(request) {
    try {
        const authResult = await getUserFromRequest(request);

        if (!authResult.success || !isSuperAdmin(authResult.user)) {
            return NextResponse.json(
                { success: false, message: 'Super admin access required' },
                { status: 403 }
            );
        }

        const formData = await request.formData();
        const name = formData.get('name');
        const slug = formData.get('slug');
        const description = formData.get('description') || '';
        const adminEmail = formData.get('admin_email');
        const packageType = formData.get('package_type') || 'basic';
        const comment = formData.get('comment') === 'true';
        const logoFile = formData.get('logo');

        if (!name || !slug || !adminEmail) {
            return NextResponse.json(
                { success: false, message: 'Name, slug, and admin email are required' },
                { status: 400 }
            );
        }

        // Check if slug already exists
        const { data: existing } = await supabaseAdmin
            .from('restaurants')
            .select('id')
            .eq('slug', slug.toLowerCase())
            .single();

        if (existing) {
            return NextResponse.json(
                { success: false, message: 'Slug already exists' },
                { status: 400 }
            );
        }

        // Handle logo upload
        let logoUrl = formData.get('logo_url') || null;
        if (logoFile) {
            const fileBuffer = await logoFile.arrayBuffer();
            const fileName = `${slug}-${Date.now()}.${logoFile.name.split('.').pop()}`;
            await uploadFile('restaurant-logos', fileName, Buffer.from(fileBuffer), {
                contentType: logoFile.type
            });
            logoUrl = getPublicUrl('restaurant-logos', fileName);
        }

        // Create restaurant with all fields
        const { data: restaurant, error: restaurantError } = await supabaseAdmin
            .from('restaurants')
            .insert({
                name,
                slug: slug.toLowerCase(),
                description,
                logo_url: logoUrl,
                comment
            })
            .select()
            .single();

        if (restaurantError) throw restaurantError;

        // Generate random password
        const crypto = require('crypto');
        const plainPassword = crypto.randomBytes(12).toString('base64').slice(0, 16);

        // Create tenant admin user in Supabase Auth
        const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
            email: adminEmail,
            password: plainPassword,
            email_confirm: true,
            user_metadata: {
                name: `${name} Admin`,
                role: 'tenant_admin',
                restaurant_id: restaurant.id
            }
        });

        if (authError) {
            console.error('Auth user creation error:', authError);
            throw new Error(`Failed to create admin user: ${authError.message}`);
        }

        // Create user record in users table
        await supabaseAdmin
            .from('users')
            .insert({
                id: authData.user.id,
                email: adminEmail,
                name: `${name} Admin`,
                role: 'tenant_admin',
                restaurant_id: restaurant.id
            });

        // Store admin credentials for super admin reference
        await supabaseAdmin
            .from('restaurant_admin_credentials')
            .insert({
                restaurant_id: restaurant.id,
                admin_email: adminEmail,
                plain_password: plainPassword
            });

        // Create subscription
        const packages = {
            basic: { label: 'Basic Package', years: 1, price: 0 },
            premium: { label: 'Premium Package', years: 2, price: 100 },
            enterprise: { label: 'Enterprise Package', years: 3, price: 500 }
        };

        const pkg = packages[packageType.toLowerCase()] || packages.basic;
        const today = new Date();
        const endDate = new Date(today);
        endDate.setFullYear(endDate.getFullYear() + pkg.years);

        await supabaseAdmin
            .from('subscriptions')
            .insert({
                restaurant_id: restaurant.id,
                package_name: pkg.label,
                start_date: today.toISOString().slice(0, 10),
                end_date: endDate.toISOString().slice(0, 10),
                status: 'active',
                price: pkg.price
            });

        return NextResponse.json({
            success: true,
            message: 'Restaurant created successfully',
            data: {
                restaurant,
                admin_credentials: {
                    email: adminEmail,
                    password: plainPassword
                },
                package: pkg
            }
        }, { status: 201 });
    } catch (error) {
        console.error('Error creating restaurant:', error);
        return NextResponse.json(
            { success: false, message: error.message || 'Failed to create restaurant' },
            { status: 500 }
        );
    }
}
