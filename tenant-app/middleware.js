import { NextResponse } from 'next/server';

export function middleware(request) {
    const { pathname } = request.nextUrl;
    const hostname = request.headers.get('host') || '';

    console.log('[Tenant] Middleware - hostname:', hostname, 'pathname:', pathname);

    // Extract subdomain from hostname
    // For localhost: subdomain.localhost:3000 -> subdomain = "subdomain"
    // For production: subdomain.domain.com -> subdomain = "subdomain"
    const parts = hostname.split('.');
    let subdomain = null;

    // Check if this is a localhost environment
    const isLocalhost = hostname.includes('localhost');

    if (isLocalhost) {
        // For localhost: extract subdomain from "subdomain.localhost:3000" format
        const hostWithoutPort = hostname.split(':')[0];
        const localhostParts = hostWithoutPort.split('.');
        if (localhostParts.length > 1 && localhostParts[localhostParts.length - 1] === 'localhost') {
            // Get everything before ".localhost"
            subdomain = localhostParts.slice(0, -1).join('.');
        }
    } else {
        // For production: subdomain.domain.com
        if (parts.length >= 3) {
            subdomain = parts[0];
        }
    }

    console.log('[Tenant] Extracted subdomain:', subdomain);

    // Add subdomain header for API routes and pages to use
    const headers = new Headers(request.headers);
    if (subdomain) {
        headers.set('x-tenant-subdomain', subdomain);
    }

    return NextResponse.next({
        request: {
            headers
        }
    });
}

export const config = {
    matcher: [
        '/((?!_next/static|_next/image|favicon.ico|.*\\.png$|.*\\.jpg$|.*\\.jpeg$|.*\\.gif$|.*\\.svg$).*)',
    ],
};
