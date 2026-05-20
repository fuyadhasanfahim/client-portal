'use client';

import { Loader2 } from 'lucide-react';

export default function Loading() {
    return (
        <section className="flex items-center justify-center h-screen">
            <Loader2 size={40} className="animate-spin" />
        </section>
    );
}
