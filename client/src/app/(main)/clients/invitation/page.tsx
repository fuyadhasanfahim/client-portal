import RootInvitation from '@/components/clients/invitation/RootInvitation';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Invitation | Client Portal',
};

export default function InvitationPage() {
    return <RootInvitation />;
}
