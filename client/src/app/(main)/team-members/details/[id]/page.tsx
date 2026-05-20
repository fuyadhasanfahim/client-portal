import React from 'react';
import { Metadata } from 'next';
import RootTeamMemberDetails from '@/components/team-members/details/RootTeamMemberDetails';

export const metadata: Metadata = {
    title: 'Team Member Details | Client Portal',
};

export default async function TeamMemberDetailsPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;

    return <RootTeamMemberDetails id={id} />;
}
