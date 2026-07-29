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
      <body className="min-h-screen flex flex-col overflow-x-hidden">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          {/* ── subtle page-level ambient glow ── */}
          <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
            {/* light mode: soft top glow | dark mode: very subtle so it doesn't overwhelm */}
            <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[500px] h-[280px] rounded-full blur-[90px]
                            bg-primary/8 dark:bg-primary/4" />
            <div className="absolute top-1/3 -right-24 w-64 h-64 rounded-full blur-[70px]
                            bg-primary/6 dark:bg-primary/3" />
            <div className="absolute bottom-1/4 -left-20 w-52 h-52 rounded-full blur-[60px]
                            bg-primary/4 dark:bg-primary/2" />
          </div>

          <Header />
          <main className="relative z-10 flex-1 container mx-auto px-4 pt-20">
            {children}
          </main>
          <Footer />
          <Toaster richColors position="top-center" dir="rtl" />
        </ThemeProvider>
      </body>
    </html>
  );
}
