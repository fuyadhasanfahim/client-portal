import RootInvitationForm from '@/components/auth/invitation-form/RootInvitationForm';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Invitation Form | Client Portal',
};

export default function InvitationFormPage() {
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
                            <RootInvitationForm />
                        </CardContent>
                    </Card>
                </div>
            </div>
        </section>
    );
}
