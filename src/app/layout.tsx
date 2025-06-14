import './globals.css';
import { Toaster } from 'react-hot-toast';
import NextAuthProvider from './NextAuthProvider';
import ReduxProvider from './ReduxProvider';
import SocketIOProvider from './SocketIOProvider';

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en">
            <head>
                {/* Font family Excon */}
                <link
                    href="https://api.fontshare.com/v2/css?f[]=synonym@1&display=swap"
                    rel="stylesheet"
                />
            </head>
            <body className={`antialiased`}>
                <ReduxProvider>
                    <SocketIOProvider>
                        <NextAuthProvider>
                            {children}
                            <Toaster
                                position="bottom-right"
                                reverseOrder={false}
                            />
                        </NextAuthProvider>
                    </SocketIOProvider>
                </ReduxProvider>
            </body>
        </html>
    );
}
