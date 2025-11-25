// Next.js API client utility
// Replaces the old axios-based api.js

// Get auth token from localStorage
export function getAuthToken() {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('auth_token');
}

// Set auth token
export function setAuthToken(token) {
    if (typeof window === 'undefined') return;
    localStorage.setItem('auth_token', token);
}

// Clear auth token
export function clearAuthToken() {
    if (typeof window === 'undefined') return;
    localStorage.removeItem('auth_token');
    localStorage.removeItem('current_user');
}

// API request wrapper
async function apiRequest(url, options = {}) {
    const token = getAuthToken();

    // Automatically add /api prefix if not already present
    let apiUrl = url.startsWith('/api') ? url : `/api${url}`;

    // Handle query parameters
    if (options.params) {
        const queryParams = new URLSearchParams();
        Object.entries(options.params).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
                queryParams.append(key, value);
            }
        });
        const queryString = queryParams.toString();
        if (queryString) {
            apiUrl += (apiUrl.includes('?') ? '&' : '?') + queryString;
        }
    }

    const headers = {
        ...options.headers,
    };

    if (!(options.body instanceof FormData)) {
        headers['Content-Type'] = 'application/json';
    }

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    // Remove params from options to avoid passing invalid option to fetch
    const { params, ...fetchOptions } = options;

    const response = await fetch(apiUrl, {
        ...fetchOptions,
        headers,
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || `API Error: ${response.status}`);
    }

    return { data, status: response.status };
}

const api = {
    get: (url, options) => apiRequest(url, { ...options, method: 'GET' }),
    post: (url, body, options) => apiRequest(url, { ...options, method: 'POST', body: body instanceof FormData ? body : JSON.stringify(body) }),
    put: (url, body, options) => apiRequest(url, { ...options, method: 'PUT', body: body instanceof FormData ? body : JSON.stringify(body) }),
    delete: (url, options) => apiRequest(url, { ...options, method: 'DELETE' }),
};

export default api;

