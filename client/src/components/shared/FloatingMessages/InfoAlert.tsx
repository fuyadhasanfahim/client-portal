'use client';

import React from 'react';

import useLoggedInUser from '@/utils/getLoggedInUser';
import VerificationAlert from '../VerificationAlert';
import AdditionalInformationAlert from '../AdditionalInformationAlert';
import { Loader2 } from 'lucide-react';

export default function InfoAlert({ children }: { children: React.ReactNode }) {
    const { user, isLoading } = useLoggedInUser();

    return isLoading ? (
        <div className="h-[80vh] flex items-center justify-center">
            <Loader2 className="animate-spin" />
        </div>
    ) : !user?.isEmailVerified ? (
        <VerificationAlert email={user.email} />
    ) : !user?.address || !user.phone ? (
        <AdditionalInformationAlert />
    ) : (
        children
    );
}
