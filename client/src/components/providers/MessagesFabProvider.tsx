'use client';

import React, { useState } from 'react';
import FloatingMessenger from '@/components/shared/FloatingMessages/FloatingMessenger';
import FloatingMessageButton from '@/components/shared/FloatingMessages/FloatingMessageButton';
import useLoggedInUser from '@/utils/getLoggedInUser';

export default function MessagesFabProvider() {
    const { user } = useLoggedInUser();
    const [open, setOpen] = useState(false);
    const [unreadCount, setUnreadCount] = useState<number>(0);

    if (!user || user.role !== 'user') return null;

    const handleOpenChange = async (val: boolean) => {
        setOpen(val);
        if (val) {
            setUnreadCount(0);
        }
    };

    return (
        <>
            <FloatingMessenger
                open={open}
                onOpenChange={handleOpenChange}
                user={user}
                setUnreadCount={setUnreadCount}
            />
            <FloatingMessageButton
                isOpen={open}
                onToggle={() => handleOpenChange(!open)}
                unreadCount={unreadCount}
            />
        </>
    );
}
