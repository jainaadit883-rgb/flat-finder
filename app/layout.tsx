import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'FlatMate — Find a flat, together',
  description: 'Help three flatmates in Pune agree on a flat.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50 text-gray-900 antialiased">
        <header className="border-b border-gray-200 bg-white">
          <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-2">
            <span className="text-xl">🏠</span>
            <span className="font-bold text-indigo-700 text-lg">FlatMate</span>
            <span className="text-gray-400 text-sm ml-1">Pune flat-finder for three</span>
          </div>
        </header>
        <main className="max-w-2xl mx-auto px-4 py-8">
          {children}
        </main>
      </body>
    </html>
  );
}
