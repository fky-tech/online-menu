import './globals.css';
import { ReactQueryProvider } from './providers';
import { I18nProvider } from '@/contexts/i18n';

export const metadata = {
    title: 'Restaurant Menu',
    description: 'Digital restaurant menu system',
};

export default function RootLayout({ children }) {
    return (
        <html lang="en">
            <head>
                <meta charSet="utf-8" />
            </head>
            <body suppressHydrationWarning>
                <ReactQueryProvider>
                    <I18nProvider>
                        {children}
                    </I18nProvider>
                </ReactQueryProvider>
            </body>
        </html>
    );
}
