import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase environment variables.');
}

// Client-side Supabase client (anon key)
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Server-side Supabase admin client (service role key) - Only use in API routes
export const supabaseAdmin = supabaseServiceRoleKey
    ? createClient(supabaseUrl, supabaseServiceRoleKey, {
        auth: { autoRefreshToken: false, persistSession: false }
    })
    : null;

// Create a client scoped to a user JWT (server-side)
export const createUserClient = (userJwt) => {
    return createClient(supabaseUrl, supabaseAnonKey, {
        global: { headers: { Authorization: `Bearer ${userJwt}` } }
    });
};

// Get user from JWT (server-side only)
export const getUserFromJWT = async (jwt) => {
    if (!supabaseAdmin) {
        throw new Error('Supabase admin client not initialized');
    }

    try {
        const { data: { user }, error } = await supabaseAdmin.auth.getUser(jwt);
        if (error) throw error;
        return user;
    } catch (error) {
        console.error('Error getting user from JWT:', error);
        return null;
    }
};

// Helper function to get user metadata (role, restaurant_id)
export const getUserMetadata = async (userId) => {
    if (!supabaseAdmin) {
        throw new Error('Supabase admin client not initialized');
    }

    try {
        const { data, error } = await supabaseAdmin
            .from('users')
            .select('*')
            .eq('id', userId)
            .single();

        if (error) throw error;
        return data;
    } catch (error) {
        console.error('Error getting user metadata:', error);
        return null;
    }
};

// Helper function to create user metadata record
export const createUserMetadata = async (userId, email, role, restaurantId = null, name = null) => {
    if (!supabaseAdmin) {
        throw new Error('Supabase admin client not initialized');
    }

    try {
        const { data, error } = await supabaseAdmin
            .from('users')
            .insert({
                id: userId,
                email,
                role,
                restaurant_id: restaurantId,
                name
            })
            .select()
            .single();

        if (error) throw error;
        return data;
    } catch (error) {
        console.error('Error creating user metadata:', error);
        throw error;
    }
};

// Storage helpers
export const uploadFile = async (bucket, path, file, options = {}) => {
    if (!supabaseAdmin) {
        throw new Error('Supabase admin client not initialized');
    }

    try {
        const { data, error } = await supabaseAdmin.storage
            .from(bucket)
            .upload(path, file, options);

        if (error) throw error;
        return data;
    } catch (error) {
        console.error('Error uploading file:', error);
        throw error;
    }
};

export const getPublicUrl = (bucket, path) => {
    if (!supabaseAdmin) {
        throw new Error('Supabase admin client not initialized');
    }

    const { data } = supabaseAdmin.storage
        .from(bucket)
        .getPublicUrl(path);

    return data.publicUrl;
};

export const deleteFile = async (bucket, path) => {
    if (!supabaseAdmin) {
        throw new Error('Supabase admin client not initialized');
    }

    try {
        const { error } = await supabaseAdmin.storage
            .from(bucket)
            .remove([path]);

        if (error) throw error;
        return true;
    } catch (error) {
        console.error('Error deleting file:', error);
        throw error;
    }
};

// Auth helper functions for client-side
export const signIn = async (email, password) => {
    try {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            return { user: null, session: null, error };
        }

        return { user: data.user, session: data.session, error: null };
    } catch (error) {
        console.error('Sign in error:', error);
        return { user: null, session: null, error };
    }
};

export const signOut = async () => {
    try {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
        return { error: null };
    } catch (error) {
        console.error('Sign out error:', error);
        return { error };
    }
};

// Get current session on client-side
export const getCurrentSession = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    return session;
};

console.log('Supabase clients initialized successfully');

export default supabase;
