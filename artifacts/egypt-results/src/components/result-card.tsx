'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  CheckCircle2, XCircle, Printer, ArrowRight,
  GraduationCap, Share2, Copy, Check,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { cn, getPercentage, isPass, MAX_DEGREE } from '@/lib/utils';
import { fetchResultBySeat } from '@/lib/api';
import type { Student } from '@/types';
import { Skeleton } from '@/components/ui/skeleton';

/* ─────────────────────────────────────────────────────────────────────────────
   Animated score bar — CSS-only, no AnimatePresence
───────────────────────────────────────────────────────────────────────────── */
function ScoreBar({ percentage, pass }: { percentage: number; pass: boolean }) {
  const [width, setWidth] = useState(0);
  useEffect(() => {
    const id = setTimeout(() => setWidth(percentage), 120);
    return () => clearTimeout(id);
  }, [percentage]);

  return (
    <div className="h-2.5 rounded-full bg-white/10 overflow-hidden">
      <div
        className="h-full rounded-full transition-all duration-1000 ease-out"
        style={{
          width: `${width}%`,
          background: pass
            ? 'linear-gradient(90deg, #10b981 0%, #f97316 100%)'
            : 'linear-gradient(90deg, #ef4444 0%, #f97316 100%)',
        }}
      />
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   Skeleton
───────────────────────────────────────────────────────────────────────────── */
function LoadingSkeleton() {
  return (
    <div className="max-w-md mx-auto space-y-3 pt-6">
      <Skeleton className="h-8 w-28 rounded-xl" />
      <Skeleton className="h-[420px] w-full rounded-3xl" />
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   Error state
───────────────────────────────────────────────────────────────────────────── */
function ErrorState() {
  return (
    <div className="max-w-sm mx-auto pt-20 text-center space-y-5">
      <div className="w-20 h-20 bg-destructive/10 rounded-full flex items-center justify-center mx-auto">
        <XCircle className="w-10 h-10 text-destructive" />
      </div>
      <div>
        <h2 className="text-2xl font-bold mb-2">لم يتم العثور على نتيجة</h2>
        <p className="text-muted-foreground text-sm">تأكد من رقم الجلوس وحاول مرة أخرى.</p>
      </div>
      <a
        href="/"
        className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-primary text-white font-bold text-sm shadow-md shadow-primary/30 hover:opacity-90 transition-opacity"
      >
        <ArrowRight className="w-4 h-4" />
        بحث جديد
      </a>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   Main card
   • Zero AnimatePresence — all transitions are CSS only or motion.div
     without exit animations (no DOM insertions / removals that break React 19)
───────────────────────────────────────────────────────────────────────────── */
export function ResultCard({ seatNumber }: { seatNumber: number }) {
  const router = useRouter();
  const [student, setStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [copied, setCopied] = useState(false);
  const [canShare, setCanShare] = useState(false);
  const [entered, setEntered] = useState(false);
  const confettiFired = useRef(false);

  /* client-only checks — prevents SSR/hydration mismatch */
  useEffect(() => {
    setCanShare(typeof navigator !== 'undefined' && 'share' in navigator);
  }, []);

  useEffect(() => {
    if (!seatNumber) return;
    setLoading(true);
    fetchResultBySeat(seatNumber)
      .then(data => { setStudent(data); setLoading(false); })
      .catch(() => { setError(true); setLoading(false); });
  }, [seatNumber]);

  /* entrance animation trigger (CSS class swap, no Framer motion.div needed) */
  useEffect(() => {
    if (!loading && !error) {
      const id = requestAnimationFrame(() => setEntered(true));
      return () => cancelAnimationFrame(id);
    }
  }, [loading, error]);

  /* confetti for passing results */
  useEffect(() => {
    if (!student || !isPass(student.studentCaseDesc) || confettiFired.current) return;
    confettiFired.current = true;
    const fire = (r: number, opts: confetti.Options) =>
      confetti({ origin: { y: 0.6 }, ...opts, particleCount: Math.floor(200 * r) });
    setTimeout(() => {
      fire(0.25, { spread: 26, startVelocity: 55, colors: ['#f97316', '#fb923c', '#fed7aa'] });
      fire(0.2,  { spread: 60,  colors: ['#f97316', '#000000', '#ffffff'] });
      fire(0.35, { spread: 100, decay: 0.91, scalar: 0.8, colors: ['#f97316', '#fb923c'] });
      fire(0.1,  { spread: 120, startVelocity: 25, decay: 0.92, scalar: 1.2 });
      fire(0.1,  { spread: 120, startVelocity: 45, colors: ['#f97316', '#000'] });
    }, 600);
  }, [student]);

  if (loading) return <LoadingSkeleton />;
  if (error || !student) return <ErrorState />;

  const percentage = getPercentage(student.totalDegree);
  const pass = isPass(student.studentCaseDesc);
  const shareText = `نتيجتي في الثانوية العامة 🎓\nالاسم: ${student.arabicName}\nالمجموع: ${student.totalDegree}/${MAX_DEGREE} (${percentage.toFixed(1)}%)\nالحالة: ${student.studentCaseDesc}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(shareText).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  };

  return (
    <div className="max-w-md mx-auto pt-3 pb-16">

      {/* ── top action bar ── */}
      <div className="flex items-center justify-between mb-4 no-print">
        <button
          onClick={() => router.push('/')}
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors font-medium"
        >
          <ArrowRight className="w-4 h-4" />
          بحث جديد
        </button>
        <button
          onClick={() => window.print()}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border text-xs font-medium hover:bg-muted transition-colors"
        >
          <Printer className="w-3.5 h-3.5" />
          طباعة
        </button>
      </div>

      {/* ── main card — CSS entrance, no AnimatePresence ── */}
      <div
        className={cn(
          'rounded-3xl overflow-hidden shadow-2xl print-card',
          'transition-all duration-500 ease-out',
          entered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5',
        )}
      >

        {/* ════════════════════════════════════════
            TOP — dark gradient hero section
        ════════════════════════════════════════ */}
        <div
          className="relative px-6 pt-7 pb-8 text-white overflow-hidden"
          style={{
            background: pass
              ? 'linear-gradient(140deg, #0f172a 0%, #052e16 55%, #14532d 100%)'
              : 'linear-gradient(140deg, #0f172a 0%, #450a0a 55%, #7f1d1d 100%)',
          }}
        >
          {/* ambient glow blobs */}
          <div
            className="absolute -top-20 -right-20 w-64 h-64 rounded-full blur-3xl pointer-events-none"
            style={{ background: pass ? 'rgba(16,185,129,0.25)' : 'rgba(239,68,68,0.25)' }}
          />
          <div
            className="absolute -bottom-12 -left-12 w-44 h-44 rounded-full blur-2xl pointer-events-none"
            style={{ background: 'rgba(249,115,22,0.2)' }}
          />

          {/* top-right subtle badge / label */}
          <div className="relative z-10 flex items-start justify-between mb-5">
            <div className="flex items-center gap-1.5 text-white/30 text-[10px] font-semibold tracking-widest uppercase">
              <GraduationCap className="w-3.5 h-3.5" />
              بوابة الثانوية العامة
            </div>
            {/* seat number chip */}
            <div className="bg-white/10 backdrop-blur-sm border border-white/10 rounded-lg px-2.5 py-1 text-white/70 text-[11px] font-mono" dir="ltr">
              # {student.seatNumber}
            </div>
          </div>

          {/* status badge */}
          <div className="relative z-10 flex justify-center mb-5">
            <div
              className={cn(
                'inline-flex items-center gap-2 px-5 py-2 rounded-full text-sm font-bold',
                'border backdrop-blur-sm',
                pass
                  ? 'bg-emerald-500/20 border-emerald-400/30 text-emerald-300'
                  : 'bg-red-500/20 border-red-400/30 text-red-300',
              )}
            >
              {pass
                ? <CheckCircle2 className="w-4 h-4" />
                : <XCircle className="w-4 h-4" />}
              {student.studentCaseDesc}
            </div>
          </div>

          {/* big percentage */}
          <div className="relative z-10 text-center mb-6">
            <p
              className="text-[78px] sm:text-[90px] font-black leading-none tabular-nums"
              style={{
                background: pass
                  ? 'linear-gradient(160deg, #ffffff 30%, #6ee7b7 100%)'
                  : 'linear-gradient(160deg, #ffffff 30%, #fca5a5 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                filter: 'drop-shadow(0 2px 12px rgba(0,0,0,0.4))',
              }}
              dir="ltr"
            >
              {percentage.toFixed(1)}%
            </p>
            <p className="text-white/50 text-xs mt-1 font-medium tracking-wide">النسبة المئوية</p>
          </div>

          {/* animated score bar */}
          <div className="relative z-10 space-y-2.5">
            <ScoreBar percentage={percentage} pass={pass} />
            <div className="flex justify-between text-[11px]" dir="ltr">
              <span className="text-white/35">0</span>
              <span className="text-white/80 font-bold">{student.totalDegree} / {MAX_DEGREE}</span>
              <span className="text-white/35">{MAX_DEGREE}</span>
            </div>
          </div>
        </div>

        {/* ════════════════════════════════════════
            BOTTOM — student info + actions
        ════════════════════════════════════════ */}
        <div className="bg-card px-6 py-6 space-y-5">

          {/* student name */}
          <div className="text-center space-y-1.5 pb-5 border-b border-border">
            <p className="text-[10px] text-muted-foreground font-semibold tracking-widest uppercase">
              اسم الطالب
            </p>
            <h1 className="text-2xl sm:text-3xl font-extrabold leading-snug break-words">
              {student.arabicName}
            </h1>
          </div>

          {/* stats row */}
          <div className="grid grid-cols-3 gap-2.5">
            {[
              { label: 'رقم الجلوس', value: String(student.seatNumber) },
              { label: 'المجموع',    value: String(student.totalDegree) },
              { label: 'من',         value: String(MAX_DEGREE) },
            ].map(({ label, value }) => (
              <div
                key={label}
                className="rounded-xl bg-muted/60 border border-border/50 p-3 text-center"
              >
                <p className="text-[9px] text-muted-foreground font-semibold tracking-wider uppercase mb-1">
                  {label}
                </p>
                <p className="text-base font-extrabold tabular-nums" dir="ltr">
                  {value}
                </p>
              </div>
            ))}
          </div>

          {/* action buttons */}
          <div className="flex flex-col sm:flex-row gap-2 no-print">

            {/* copy */}
            <button
              onClick={handleCopy}
              className={cn(
                'flex-1 inline-flex items-center justify-center gap-2 h-11 rounded-xl',
                'border border-border text-sm font-semibold',
                'transition-all duration-200 active:scale-95',
                copied
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-700 dark:bg-emerald-950/40 dark:border-emerald-800 dark:text-emerald-400'
                  : 'hover:bg-muted',
              )}
            >
              {copied
                ? <><Check className="w-4 h-4" /> تم النسخ</>
                : <><Copy className="w-4 h-4" /> نسخ النتيجة</>}
            </button>

            {/* share — only rendered client-side via canShare state */}
            {canShare && (
              <button
                onClick={() => navigator.share({ title: 'نتيجتي', text: shareText })}
                className="flex-1 inline-flex items-center justify-center gap-2 h-11 rounded-xl text-sm font-bold text-white transition-all duration-200 active:scale-95 hover:opacity-90"
                style={{ background: 'linear-gradient(135deg, hsl(24 95% 50%), hsl(20 100% 60%))' }}
              >
                <Share2 className="w-4 h-4" />
                مشاركة النتيجة
              </button>
            )}
          </div>

          {/* disclaimer */}
          <p className="text-center text-[11px] text-muted-foreground/70 leading-relaxed">
            ⚠️ هذه النتيجة استرشادية ولا تغني عن الشهادة الرسمية المعتمدة من المدرسة.
          </p>
        </div>
      </div>
    </div>
  );
}
