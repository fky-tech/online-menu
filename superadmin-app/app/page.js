'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function SuperAdminHome() {
    const router = useRouter();

    useEffect(() => {
        router.push('/admin/login');
    }, [router]);

    return null;
}
