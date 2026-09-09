import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '../context/AuthContext';

export const metadata: Metadata = {
  title: 'FinFlow — Society Accounting & Financial Management System',
  description: 'Auditable, event-driven financial management and accounting system for university student societies.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full antialiased">
      <head>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200"
        />
      </head>
      <body className="min-h-full flex flex-col bg-[#f8f9ff] text-[#0b1c30]">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
