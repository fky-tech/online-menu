import { NextResponse } from 'next/server';

export function middleware(request) {
    const { pathname } = request.nextUrl;
    const hostname = request.headers.get('host') || '';

    console.log('[SuperAdmin] Middleware - hostname:', hostname, 'pathname:', pathname);

    // Add custom header to identify this as admin app
    const headers = new Headers(request.headers);
    headers.set('x-admin-app', 'true');

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
