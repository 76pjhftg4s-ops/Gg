import type { Metadata } from 'next';
import './globals.css';
import Sidebar from '@/components/shared/Sidebar';

export const metadata: Metadata = {
  title: 'Goal Tracker',
  description: 'Your daily life, optimized.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ display: 'flex', minHeight: '100vh' }}>
        <Sidebar />
        <main style={{ flex: 1, minHeight: '100vh', overflowY: 'auto' }}>
          {children}
        </main>
      </body>
    </html>
  );
}
