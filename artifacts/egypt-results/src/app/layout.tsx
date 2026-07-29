import type { Metadata } from 'next';
import { IBM_Plex_Sans_Arabic, Inter } from 'next/font/google';
import { ThemeProvider } from '@/components/theme-provider';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { PreloaderRemover } from '@/components/preloader';
import { Toaster } from 'sonner';
import './globals.css';

const ibmArabic = IBM_Plex_Sans_Arabic({
  subsets: ['arabic', 'latin'],
  weight: ['400', '600', '700'],
  variable: '--font-ibm-arabic',
  display: 'swap',
  preload: true,
});

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
  preload: false,
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
      <head>
        {/* ── inline preloader — visible before any JS runs ── */}
        <style dangerouslySetInnerHTML={{ __html: `
          #__preloader {
            position: fixed; inset: 0; z-index: 9999;
            display: flex; flex-direction: column;
            align-items: center; justify-content: center; gap: 20px;
            background: #fafafa;
            transition: opacity 0.5s ease;
          }
          @media (prefers-color-scheme: dark) {
            #__preloader { background: #0d0d0d; }
            #__preloader .pl-text { color: #f5f5f5; }
            #__preloader .pl-sub { color: #888; }
            #__preloader .pl-dot { background: #f97316; }
          }
          .pl-text {
            font-family: system-ui, -apple-system, sans-serif;
            font-size: 1.6rem; font-weight: 700;
            color: #1a1a1a; letter-spacing: -0.02em;
            direction: rtl;
          }
          .pl-text span { color: #f97316; }
          .pl-sub {
            font-family: system-ui, -apple-system, sans-serif;
            font-size: 0.75rem; color: #888; direction: rtl;
          }
          .pl-dots { display: flex; gap: 6px; }
          .pl-dot {
            width: 7px; height: 7px; border-radius: 50%;
            background: #f97316; opacity: 0.3;
            animation: pl-bounce 1.2s ease-in-out infinite;
          }
          .pl-dot:nth-child(2) { animation-delay: 0.2s; }
          .pl-dot:nth-child(3) { animation-delay: 0.4s; }
          @keyframes pl-bounce {
            0%, 80%, 100% { opacity: 0.25; transform: scale(0.8); }
            40% { opacity: 1; transform: scale(1); }
          }
        ` }} />
      </head>
      <body className="min-h-screen flex flex-col overflow-x-hidden">
        {/* preloader — removed by PreloaderRemover on first React paint */}
        <div id="__preloader" aria-hidden="true">
          <p className="pl-text">نتيجة <span>مصر</span></p>
          <div className="pl-dots">
            <div className="pl-dot" />
            <div className="pl-dot" />
            <div className="pl-dot" />
          </div>
          <p className="pl-sub">جاري التحميل...</p>
        </div>

        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <PreloaderRemover />

          {/* ── very subtle page ambient — same in light & dark ── */}
          <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden" aria-hidden="true">
            <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[480px] h-[260px] rounded-full blur-[100px] bg-primary/6 dark:bg-primary/4" />
            <div className="absolute top-1/3 -right-20 w-56 h-56 rounded-full blur-[80px] bg-primary/4 dark:bg-primary/2" />
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
