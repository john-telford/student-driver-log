import type { Metadata } from 'next';
import { Overpass, Overpass_Mono } from 'next/font/google';
import './globals.css';
import { cn } from '@/lib/utils';

// Overpass is the open-source recreation of Highway Gothic (FHWA Series E Modified)
const overpass = Overpass({
  subsets: ['latin'],
  variable: '--font-sans',
  weight: ['400', '600', '700', '800'],
});

const overpassMono = Overpass_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  weight: ['400', '600'],
});

export const metadata: Metadata = {
  title: 'Student Driver Log',
  description: "Illinois learner's permit hour tracker",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={cn('h-full antialiased', overpass.variable, overpassMono.variable)}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
