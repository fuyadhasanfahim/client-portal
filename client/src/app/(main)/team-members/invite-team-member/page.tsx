import React from 'react';

import RootInviteTeamMember from '@/components/team-members/invite-team-member/RootInviteTeamMember';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Create Invite URL | Client Portal',
};

export default function InviteTeamMemberPage() {
    return <RootInviteTeamMember />;
}
