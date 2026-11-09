import type { Metadata } from 'next';
import AuthProvider from '@/components/AuthProvider';
import Header from '@/components/Header';
import '@/styles/globals.scss';

export const metadata: Metadata = {
    title: 'Quiz Builder',
    description: 'Create and browse custom quizzes',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en">
            <body>
                <AuthProvider>
                    <Header />
                    <main className="container">{children}</main>
                </AuthProvider>
            </body>
        </html>
    );
}
