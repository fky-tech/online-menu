import { supabase } from '../supabase.js'; // Your Supabase client

// Direct Supabase signIn function (for frontend)
export const signIn = async (email, password) => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Sign in error:', error);
    throw error;
  }
};

// Set auth token for API requests
export const setAuthToken = (token) => {
  // Assuming you're using axios
  if (window.api && window.api.defaults) {
    window.api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }
  // Also store in localStorage/sessionStorage for persistence
  localStorage.setItem('auth_token', token);
  sessionStorage.setItem('current_token', token);
};

// Get stored token
export const getAuthToken = () => {
  return localStorage.getItem('auth_token') || sessionStorage.getItem('current_token');
};

// Clear auth token
export const clearAuthToken = () => {
  localStorage.removeItem('auth_token');
  sessionStorage.removeItem('current_token');
  if (window.api && window.api.defaults) {
    delete window.api.defaults.headers.common['Authorization'];
  }
};