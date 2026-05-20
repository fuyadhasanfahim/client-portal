import React from 'react';

import RootInviteTeamMemberForm from '@/components/auth/invite-team-member/RootInviteTeamMemberForm';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Invite Team Member Form | Client Portal',
};

export default function inviteTeamMemberPage() {
    return (
        <section className="padding-x padding-y bg-background min-h-dvh w-full">
            <div className="container">
                <div className="mx-auto max-w-md">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-2xl">
                                Sign Up Form
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <RootInviteTeamMemberForm />
                        </CardContent>
                    </Card>
                </div>
            </div>
        </section>
    );
}
