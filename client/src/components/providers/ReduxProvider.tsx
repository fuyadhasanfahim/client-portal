'use client';
import { Provider } from 'react-redux';
import { useRef } from 'react';
import { store, type AppStore } from '@/redux/store';

export default function ReduxProvider({
    children,
}: {
    children: React.ReactNode;
}) {
    const storeRef = useRef<AppStore>(null);
    if (!storeRef.current) storeRef.current = store();
    return <Provider store={storeRef.current}>{children}</Provider>;
}
