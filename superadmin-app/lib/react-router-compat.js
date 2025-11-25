// React Router DOM compatibility layer for Next.js
'use client';

import { useRouter as useNextRouter, usePathname, useSearchParams } from 'next/navigation';
import { useParams as useNextParams } from 'next/navigation';
import NextLink from 'next/link';

// useNavigate compatibility
export function useNavigate() {
    const router = useNextRouter();

    return (path, options = {}) => {
        if (options.replace) {
            router.replace(path);
        } else {
            router.push(path);
        }
    };
}

// useParams compatibility
export function useParams() {
    return useNextParams();
}

// useLocation compatibility
export function useLocation() {
    const pathname = usePathname();
    const searchParams = useSearchParams();

    return {
        pathname,
        search: searchParams ? `?${searchParams.toString()}` : '',
        hash: typeof window !== 'undefined' ? window.location.hash : '',
    };
}

// Link component compatibility - just export Next.js Link
export { default as Link } from 'next/link';

// NavLink component - compatibility wrapper for Next.js
export function NavLink({ to, children, className, ...props }) {
    const pathname = usePathname();
    const isActive = pathname === to || pathname.startsWith(to + '/');

    const computedClassName = typeof className === 'function'
        ? className({ isActive })
        : className;

    return (
        <NextLink href={to} className={computedClassName} {...props}>
            {typeof children === 'function' ? children({ isActive }) : children}
        </NextLink>
    );
}

// BrowserRouter not needed in Next.js - export a dummy
export function BrowserRouter({ children }) {
    return children;
}
