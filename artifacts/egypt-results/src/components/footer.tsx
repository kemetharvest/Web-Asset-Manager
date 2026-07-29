import Link from 'next/link';
import { GraduationCap, Heart } from 'lucide-react';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-border bg-card/50 no-print mt-auto">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div className="space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center text-primary-foreground shadow-sm">
                <GraduationCap className="w-4 h-4" />
              </div>
              <span className="font-bold text-sm">بوابة الثانوية العامة</span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">
              بوابة رسمية للاستعلام عن نتائج امتحانات الثانوية العامة في جمهورية مصر العربية.
            </p>
          </div>

          {/* Links */}
          <div className="space-y-3">
            <h4 className="font-semibold text-sm">روابط سريعة</h4>
            <nav className="flex flex-col gap-2">
              {[
                { href: '/', label: 'الرئيسية' },
                { href: '/admin', label: 'بوابة الإدارة' },
              ].map(link => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors w-fit"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Info */}
          <div className="space-y-3">
            <h4 className="font-semibold text-sm">ملاحظة</h4>
            <p className="text-sm text-muted-foreground leading-relaxed">
              النتائج المعروضة استرشادية. الشهادة الرسمية المعتمدة تصدر من المدرسة.
            </p>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <p>© {currentYear} جميع الحقوق محفوظة لوزارة التربية والتعليم</p>
          <p className="flex items-center gap-1.5">
            صُنع بـ <Heart className="w-3.5 h-3.5 text-destructive fill-destructive" /> بواسطة{' '}
            <span className="text-gradient-gold font-semibold">Ahmed Elhenawy</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
