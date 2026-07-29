'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useTheme } from 'next-themes';
import { motion, AnimatePresence } from 'framer-motion';
import { Sun, Moon, Monitor, Database, Menu, X, GraduationCap, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { DataStatus } from '@/types';

export function Header() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [status, setStatus] = useState<DataStatus | null>(null);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  useEffect(() => {
    fetch('/api/admin/status')
      .then(r => r.json())
      .then(setStatus)
      .catch(() => {});
  }, []);

  const navLinks = [
    { href: '/', label: 'الرئيسية' },
    { href: '/admin', label: 'الإدارة' },
  ];

  return (
    <>
      <header
        className={cn(
          'fixed top-0 z-50 w-full transition-all duration-300 no-print',
          scrolled
            ? 'glass glass-border shadow-lg shadow-black/5'
            : 'bg-transparent'
        )}
      >
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <motion.div
              whileHover={{ rotate: 10, scale: 1.1 }}
              transition={{ type: 'spring', stiffness: 300 }}
              className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center text-primary-foreground shadow-md"
            >
              <GraduationCap className="w-5 h-5" />
            </motion.div>
            <span className="font-bold text-base hidden sm:block group-hover:text-primary transition-colors">
              بوابة الثانوية العامة
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-6">
            {status?.loaded && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center gap-1.5 text-xs font-medium text-success bg-success/10 px-3 py-1.5 rounded-full border border-success/20"
              >
                <Database className="w-3 h-3" />
                <span dir="rtl">{status.count.toLocaleString('ar-EG')} طالب</span>
              </motion.div>
            )}

            {navLinks.map(link => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                {link.label}
              </Link>
            ))}

            {/* Theme Toggle */}
            <div className="flex items-center bg-muted rounded-full p-1 gap-0.5">
              {[
                { value: 'light', icon: Sun, label: 'فاتح' },
                { value: 'system', icon: Monitor, label: 'تلقائي' },
                { value: 'dark', icon: Moon, label: 'داكن' },
              ].map(({ value, icon: Icon, label }) => (
                <button
                  key={value}
                  onClick={() => setTheme(value)}
                  aria-label={label}
                  className={cn(
                    'p-1.5 rounded-full transition-all duration-200',
                    mounted && theme === value
                      ? 'bg-background shadow-sm text-foreground'
                      : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  <Icon className="w-3.5 h-3.5" />
                </button>
              ))}
            </div>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="القائمة"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm md:hidden"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 z-50 h-full w-72 bg-card border-l border-border shadow-2xl md:hidden"
            >
              <div className="p-6 space-y-6">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-lg">القائمة</span>
                  <button onClick={() => setMobileOpen(false)} className="p-2 rounded-xl hover:bg-muted transition-colors">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {status?.loaded && (
                  <div className="flex items-center gap-2 text-xs font-medium text-success bg-success/10 px-3 py-2 rounded-full border border-success/20 w-fit">
                    <Database className="w-3 h-3" />
                    <span>{status.count.toLocaleString('ar-EG')} طالب مسجل</span>
                  </div>
                )}

                <nav className="space-y-1">
                  {navLinks.map(link => (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                    >
                      {link.href === '/admin' && <Settings className="w-4 h-4" />}
                      {link.label}
                    </Link>
                  ))}
                </nav>

                <div className="pt-4 border-t border-border">
                  <p className="text-xs text-muted-foreground mb-3">المظهر</p>
                  <div className="flex bg-muted rounded-full p-1 w-fit">
                    {[
                      { value: 'light', icon: Sun, label: 'فاتح' },
                      { value: 'system', icon: Monitor, label: 'تلقائي' },
                      { value: 'dark', icon: Moon, label: 'داكن' },
                    ].map(({ value, icon: Icon, label }) => (
                      <button
                        key={value}
                        onClick={() => setTheme(value)}
                        aria-label={label}
                        className={cn(
                          'p-2 rounded-full transition-all duration-200',
                          mounted && theme === value
                            ? 'bg-background shadow-sm text-foreground'
                            : 'text-muted-foreground'
                        )}
                      >
                        <Icon className="w-4 h-4" />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
