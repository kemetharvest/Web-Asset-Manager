import { Moon, Sun, Monitor, Database } from 'lucide-react';
import { useTheme } from './theme-provider';
import { Link } from 'wouter';
import { Button } from './ui/button';
import { useGetDataStatus } from '@workspace/api-client-react';

export function Layout({ children }: { children: React.ReactNode }) {
  const { theme, setTheme } = useTheme();
  
  const { data: status } = useGetDataStatus({
    query: {
      refetchInterval: 30000,
      queryKey: ['/api/admin/status']
    }
  });

  return (
    <div className="min-h-[100dvh] flex flex-col font-sans">
      <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md no-print">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold">
              م
            </div>
            <span className="font-bold text-lg hidden sm:inline-block">بوابة الثانوية العامة</span>
          </Link>

          <div className="flex items-center gap-4">
            {status?.loaded && (
              <div className="hidden md:flex items-center gap-2 text-xs font-medium text-success bg-success/10 px-3 py-1.5 rounded-full">
                <Database className="w-3 h-3" />
                <span dir="rtl">{status.count.toLocaleString('ar-EG')} طالب مسجل</span>
              </div>
            )}
            
            <Link href="/admin" className="text-sm text-muted-foreground hover:text-foreground transition-colors hidden sm:block">
              بوابة الإدارة
            </Link>
            
            <div className="flex bg-muted rounded-full p-1">
              <button
                onClick={() => setTheme('light')}
                className={`p-1.5 rounded-full transition-colors ${theme === 'light' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground'}`}
                aria-label="وضع نهاري"
              >
                <Sun className="w-4 h-4" />
              </button>
              <button
                onClick={() => setTheme('system')}
                className={`p-1.5 rounded-full transition-colors ${theme === 'system' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground'}`}
                aria-label="تبعاً للنظام"
              >
                <Monitor className="w-4 h-4" />
              </button>
              <button
                onClick={() => setTheme('dark')}
                className={`p-1.5 rounded-full transition-colors ${theme === 'dark' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground'}`}
                aria-label="وضع ليلي"
              >
                <Moon className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-8">
        {children}
      </main>

      <footer className="border-t py-6 bg-card no-print">
        <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} جميع الحقوق محفوظة لوزارة التربية والتعليم.</p>
          <p>
            برمجة <span className="text-accent font-semibold drop-shadow-[0_0_8px_rgba(197,157,95,0.4)]">Ahmed Elhenawy</span>
          </p>
        </div>
      </footer>
    </div>
  );
}
