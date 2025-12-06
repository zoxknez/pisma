import type { Metadata, Viewport } from "next";
import { Inter, Playfair_Display, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { Toaster } from "sonner";
import AuthProvider from "@/components/providers/AuthProvider";
import { NewYearBannerWrapper } from "@/components/NewYearBannerWrapper";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });
const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-serif" });
const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono" });

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: '(prefers-color-scheme: dark)', color: '#000000' },
    { media: '(prefers-color-scheme: light)', color: '#000000' },
  ],
};

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXTAUTH_URL || 'https://pisma.app'),
  title: {
    default: "PISMA | Digital Heritage",
    template: "%s | PISMA",
  },
  description: "The art of waiting in the age of instant. Send time-locked digital letters with custom wax seals, voice messages, and beautiful paper textures.",
  keywords: ["digital letters", "time-locked messages", "virtual mail", "handwritten letters", "nostalgic communication", "wax seals"],
  authors: [{ name: "PISMA Team" }],
  creator: "PISMA",
  publisher: "PISMA",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://pisma.app',
    siteName: 'PISMA',
    title: 'PISMA | Digital Heritage',
    description: 'The art of waiting in the age of instant. Send time-locked digital letters.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'PISMA - Digital Letters',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'PISMA | Digital Heritage',
    description: 'The art of waiting in the age of instant. Send time-locked digital letters.',
    images: ['/og-image.png'],
    creator: '@pisma_app',
  },
  manifest: '/manifest.json',
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'PISMA',
  },
  formatDetection: {
    telephone: false,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className={cn(
        "min-h-screen bg-background font-sans antialiased",
        inter.variable,
        playfair.variable,
        mono.variable
      )}>
        <AuthProvider>
          <NewYearBannerWrapper />
          {children}
          <Toaster 
            position="bottom-center" 
            toastOptions={{
              style: {
                background: '#1a1a1a',
                border: '1px solid rgba(255,255,255,0.1)',
                color: '#fff',
              },
            }}
          />
        </AuthProvider>
      </body>
    </html>
  );
}
