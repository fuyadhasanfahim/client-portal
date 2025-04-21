import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
    function middleware(req) {
        const { pathname } = req.nextUrl;
        const isAuthenticated = !!req.nextauth.token;

        if (
            isAuthenticated &&
            (pathname === '/sign-in' || pathname === '/sign-up')
        ) {
            return NextResponse.redirect(new URL('/', req.url));
        }

        const isAuthPage =
            pathname.startsWith('/sign-in') || pathname.startsWith('/sign-up');
        if (!isAuthenticated && !isAuthPage) {
            return NextResponse.redirect(new URL('/sign-in', req.url));
        }

        return NextResponse.next();
    },
    {
        callbacks: {
            authorized: ({}) => {
                return true;
            },
        },
    }
);

export const config = {
    matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
