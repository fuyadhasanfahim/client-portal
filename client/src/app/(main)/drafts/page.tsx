import RootDraft from '@/components/draft/RootDraft';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Drafts | Client Portal',
    description: 'Drafts | Client Portal',
};

export default async function DraftPage() {

    return <RootDraft />;
}
