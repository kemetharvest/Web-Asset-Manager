import type { Metadata } from 'next';
import { IBM_Plex_Sans_Arabic, Inter } from 'next/font/google';
import { ThemeProvider } from '@/components/theme-provider';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { Toaster } from 'sonner';
import './globals.css';

const ibmArabic = IBM_Plex_Sans_Arabic({
  subsets: ['arabic', 'latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-ibm-arabic',
  display: 'swap',
  preload: true,
});

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'بوابة الثانوية العامة | نتيجة الثانوية العامة مصر',
    template: '%s | بوابة الثانوية العامة',
  },
  description: 'استعلم عن نتيجة الثانوية العامة في جمهورية مصر العربية برقم الجلوس أو الاسم بسهولة وسرعة.',
  keywords: ['نتيجة الثانوية العامة', 'نتيجة الثانوية', 'ثانوية عامة مصر', 'نتائج الطلاب'],
  authors: [{ name: 'Ahmed Elhenawy' }],
  openGraph: {
    title: 'بوابة الثانوية العامة',
    description: 'استعلم عن نتيجة الثانوية العامة في جمهورية مصر العربية',
    locale: 'ar_EG',
    type: 'website',
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning className={`${ibmArabic.variable} ${inter.variable}`}>
      <body className="min-h-screen flex flex-col">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <Header />
          <main className="flex-1 container mx-auto px-4 pt-20">
            {children}
          </main>
          <Footer />
          <Toaster richColors position="top-center" dir="rtl" />
        </ThemeProvider>
      </body>
    </html>
  );
}
