import './globals.css';
import { ReactQueryProvider } from './providers';

export const metadata = {
    title: 'Super Admin - Online Menu System',
    description: 'Super admin dashboard for restaurant management',
};

export default function RootLayout({ children }) {
    return (
        <html lang="en">
            <head>
                <meta charSet="utf-8" />
            </head>
            <body suppressHydrationWarning>
                <ReactQueryProvider>
                    {children}
                </ReactQueryProvider>
            </body>
        </html>
    );
}
