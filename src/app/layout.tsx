import type { Metadata } from 'next';
import { Overpass, Overpass_Mono } from 'next/font/google';
import Script from 'next/script';
import './globals.css';
import { cn } from '@/lib/utils';
import { Toaster } from '@/components/ui/sonner';

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
  appleWebApp: {
    capable: true,
    title: 'Student Driver Log',
    statusBarStyle: 'default',
  },
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
      style={{ colorScheme: 'light' }}
    >
      <body className="min-h-full flex flex-col">
        {process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID}`}
              strategy="afterInteractive"
            />
            <Script id="gtag-init" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID}');
              `}
            </Script>
          </>
        )}
        {children}
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}
