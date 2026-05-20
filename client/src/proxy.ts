/* eslint-disable @typescript-eslint/no-explicit-any */
import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';
import getAccessibleRoutes from './utils/getAccessibleRoutes';

const authProxy = withAuth(
    async function proxy(req) {
        const { pathname } = req.nextUrl;
        const isAuthenticated = !!req.nextauth.token;
        const user = (req.nextauth.token as any) || {};

        const isAuthPage =
            pathname.startsWith('/sign-in') ||
            pathname.startsWith('/sign-up') ||
            pathname.startsWith('/forgot-password') ||
            pathname.startsWith('/reset-password') ||
            pathname.startsWith('/invitation-form') ||
            pathname.startsWith('/invite-team-member');

        const isApiAuthRoute = pathname.startsWith('/api/auth');

        // Allow API auth routes to pass through (handled by next-auth)
        if (isApiAuthRoute) {
            return NextResponse.next();
        }

        if ((isAuthenticated && isAuthPage) || pathname === '/') {
            return NextResponse.redirect(new URL('/dashboard', req.url));
        }

        if (!isAuthenticated && isAuthPage) {
            return NextResponse.next();
        }

        if (!isAuthenticated) {
            // Redirect to sign-in, adding the callbackUrl to facilitate returning after login
            const url = new URL('/sign-in', req.url);
            url.searchParams.set('callbackUrl', encodeURI(req.url));
            return NextResponse.redirect(url);
        }

        // If user is authenticated, check for access permissions
        const hasAccess = await getAccessibleRoutes({
            pathname,
            role: user?.role as string,
        });

        if (hasAccess === false) {
            // If trying to access a restricted page, redirect to unauthorized
            // Check if we are already on the unauthorized page to avoid loop
            if (pathname === '/unauthorized') {
                return NextResponse.next();
            }
            return NextResponse.redirect(new URL('/unauthorized', req.url));
        }

        return NextResponse.next();
    },
    {
        callbacks: {
            authorized: () => true,
        },
    },
);

export const proxy = authProxy;
export default authProxy;

export const config = {
    matcher: ['/((?!_next/static|_next/image|favicon.ico|api/).*)'],
};
