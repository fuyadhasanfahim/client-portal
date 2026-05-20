import React from 'react';

import { Metadata } from 'next';
import RootTeamMembers from '@/components/team-members/RootTeamMembers';

export const metadata: Metadata = {
    title: 'Team Members | Client Portal',
};

export default function TeamMembersPage() {
    return <RootTeamMembers />;
}
