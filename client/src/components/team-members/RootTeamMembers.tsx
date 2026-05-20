import Link from 'next/link';
import React from 'react';
import { Button } from '../ui/button';
import { Plus } from 'lucide-react';
import TeamMemberDataTable from './TeamMemberDataTable';

export default function RootTeamMembers() {
    return (
        <section className="space-y-4">
            <div className="flex flex-1/2 items-center justify-between gap-6 flex-wrap">
                <h2 className="text-base md:text-lg lg:text-xl font-semibold">
                    Team Members Summery
                </h2>

                <Link href={'/team-members/invite-team-member'}>
                    <Button>
                        <Plus />
                        Invite Team Member
                    </Button>
                </Link>
            </div>

            <TeamMemberDataTable />
        </section>
    );
}
