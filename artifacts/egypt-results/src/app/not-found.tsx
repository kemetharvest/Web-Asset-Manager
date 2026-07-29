import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-6 px-4">
      <div className="text-8xl font-black text-gradient">٤٠٤</div>
      <h2 className="text-3xl font-bold">الصفحة غير موجودة</h2>
      <p className="text-muted-foreground text-lg max-w-md">
        عذراً، الصفحة التي تبحث عنها غير موجودة أو تم نقلها.
      </p>
      <Link
        href="/"
        className="inline-flex items-center gap-2 px-8 py-3 rounded-2xl bg-primary text-primary-foreground font-bold shadow-md hover:bg-primary/90 transition-all"
      >
        العودة للرئيسية
      </Link>
    </div>
  );
}
