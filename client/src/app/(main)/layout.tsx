import { Metadata } from 'next';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import NextAuthProvider from '../../components/providers/NextAuthProvider';
import { AppSidebar } from '@/components/shared/app-sidebar';
import { SiteHeader } from '@/components/shared/site-header';
import InfoAlert from '@/components/shared/InfoAlert';
import RouteGuard from '@/components/shared/RouteGuard';

export const metadata: Metadata = {
    title: 'Client Portal',
    description: 'Client Portal',
};

export default async function Layout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <NextAuthProvider>
            <RouteGuard>
                <SidebarProvider
                    style={
                        {
                            '--sidebar-width': 'calc(var(--spacing) * 72)',
                            '--header-height': 'calc(var(--spacing) * 12)',
                        } as React.CSSProperties
                    }
                >
                    <AppSidebar />
                    <SidebarInset>
                        <SiteHeader />
                        <main className="p-4">
                            <InfoAlert>{children}</InfoAlert>
                        </main>
                    </SidebarInset>
                </SidebarProvider>
            </RouteGuard>
        </NextAuthProvider>
    );
}
