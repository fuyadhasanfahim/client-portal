import React from 'react';
import { Metadata } from 'next';
import RootAccess from '@/components/clients/details/RootAccess';

export const metadata: Metadata = {
    title: 'Invitation | Client Portal',
};

export default async function AccessPage({
    params,
}: {
    params: Promise<{ userID: string }>;
}) {
    const { userID } = await params;

    return <RootAccess userID={userID} />;
}
