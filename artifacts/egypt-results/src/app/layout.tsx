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
            align-items: center; justify-content: center;
            gap: 0;
            background: #fafafa;
            transition: opacity 0.55s cubic-bezier(0.4,0,0.2,1);
          }
          @media (prefers-color-scheme: dark) {
            #__preloader { background: #0c0c0c; }
            .pl-title { color: #f0f0f0; }
            .pl-sub { color: #555; }
            .pl-ring { border-color: #1f1f1f; }
          }

          /* ── icon ring ── */
          .pl-icon {
            width: 56px; height: 56px; border-radius: 16px;
            background: linear-gradient(135deg, #f97316, #fb923c);
            display: flex; align-items: center; justify-content: center;
            margin-bottom: 22px;
            box-shadow: 0 8px 28px rgba(249,115,22,0.35);
            animation: pl-pulse 2.4s ease-in-out infinite;
          }
          .pl-icon svg { width: 26px; height: 26px; fill: white; }

          /* ── brand text ── */
          .pl-title {
            font-family: var(--font-ibm-arabic, 'IBM Plex Sans Arabic', system-ui, sans-serif);
            font-size: clamp(1.75rem, 6vw, 2.5rem);
            font-weight: 700;
            color: #111;
            letter-spacing: -0.03em;
            direction: rtl;
            line-height: 1.1;
            margin-bottom: 8px;
          }
          .pl-title .pl-accent {
            background: linear-gradient(135deg, #f97316, #fb923c);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
          }

          /* ── tagline ── */
          .pl-sub {
            font-family: var(--font-ibm-arabic, 'IBM Plex Sans Arabic', system-ui, sans-serif);
            font-size: 0.8rem;
            color: #999;
            direction: rtl;
            letter-spacing: 0.01em;
            margin-bottom: 36px;
          }

          /* ── slim loading bar ── */
          .pl-track {
            width: 120px; height: 2px;
            background: rgba(249,115,22,0.12);
            border-radius: 9999px;
            overflow: hidden;
          }
          .pl-fill {
            height: 100%;
            background: linear-gradient(90deg, #f97316, #fb923c);
            border-radius: 9999px;
            animation: pl-slide 1.6s cubic-bezier(0.4,0,0.2,1) infinite;
          }

          @keyframes pl-pulse {
            0%, 100% { box-shadow: 0 8px 28px rgba(249,115,22,0.3); transform: scale(1); }
            50%       { box-shadow: 0 8px 36px rgba(249,115,22,0.5); transform: scale(1.04); }
          }
          @keyframes pl-slide {
            0%   { transform: translateX(-100%); width: 60%; }
            50%  { transform: translateX(50%);   width: 80%; }
            100% { transform: translateX(200%);  width: 60%; }
          }
        ` }} />
      </head>
      <body className="min-h-screen flex flex-col overflow-x-hidden">
        {/* preloader — removed by PreloaderRemover on first React paint */}
        <div id="__preloader" aria-hidden="true">
          {/* graduation-cap icon */}
          <div className="pl-icon">
            <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 3L1 9l11 6 9-4.91V17h2V9L12 3zM5 13.18V17l7 4 7-4v-3.82l-7 3.82-7-3.82z"/>
            </svg>
          </div>
          <p className="pl-title">نتيجة <span className="pl-accent">مصر</span></p>
          <p className="pl-sub">بوابة الثانوية العامة</p>
          <div className="pl-track"><div className="pl-fill" /></div>
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
