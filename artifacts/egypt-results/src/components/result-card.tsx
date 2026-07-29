'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import {
  CheckCircle2, XCircle, Printer, ArrowRight,
  GraduationCap, Share2, Copy, Check,
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { getPercentage, isPass, MAX_DEGREE } from '@/lib/utils';
import { fetchResultBySeat } from '@/lib/api';
import type { Student } from '@/types';

/* ── circular progress ring ── */
function RingProgress({ value, pass }: { value: number; pass: boolean }) {
  const r = 48;
  const circ = 2 * Math.PI * r;
  const offset = circ - (value / 100) * circ;

  return (
    <div className="relative w-32 h-32 flex items-center justify-center">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 110 110">
        {/* track */}
        <circle cx="55" cy="55" r={r} fill="none"
          stroke="hsl(var(--border))" strokeWidth="8" />
        {/* fill */}
        <motion.circle
          cx="55" cy="55" r={r} fill="none"
          strokeWidth="8" strokeLinecap="round"
          stroke={pass ? 'hsl(142 71% 45%)' : 'hsl(0 84% 60%)'}
          strokeDasharray={circ}
          initial={{ strokeDashoffset: circ }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.6, ease: 'easeOut', delay: 0.4 }}
        />
        {/* glow duplicate */}
        <motion.circle
          cx="55" cy="55" r={r} fill="none"
          strokeWidth="4" strokeLinecap="round"
          stroke={pass ? 'hsl(142 71% 45% / 0.3)' : 'hsl(0 84% 60% / 0.3)'}
          strokeDasharray={circ}
          initial={{ strokeDashoffset: circ }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.6, ease: 'easeOut', delay: 0.45 }}
          style={{ filter: 'blur(4px)' }}
        />
      </svg>
      <div className="absolute text-center">
        <p className="text-2xl font-extrabold leading-none tabular-nums" dir="ltr">
          {value.toFixed(0)}%
        </p>
        <p className="text-[10px] text-muted-foreground mt-0.5">النسبة</p>
      </div>
    </div>
  );
}

/* ── skeleton ── */
function LoadingSkeleton() {
  return (
    <div className="max-w-xl mx-auto space-y-4 pt-6">
      <Skeleton className="w-24 h-8 rounded-xl" />
      <Skeleton className="w-full h-80 rounded-2xl" />
    </div>
  );
}

/* ── error ── */
function ErrorState() {
  return (
    <div className="max-w-sm mx-auto pt-20 text-center space-y-5">
      <motion.div
        initial={{ scale: 0 }} animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 220, delay: 0.1 }}
        className="w-20 h-20 bg-destructive/10 rounded-full flex items-center justify-center mx-auto"
      >
        <XCircle className="w-10 h-10 text-destructive" />
      </motion.div>
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <h2 className="text-2xl font-bold mb-2">لم يتم العثور على نتيجة</h2>
        <p className="text-muted-foreground text-sm">تأكد من رقم الجلوس وحاول مرة أخرى.</p>
      </motion.div>
      <Link
        href="/"
        className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-primary text-white font-bold text-sm shadow-md shadow-primary/30 hover:opacity-90 transition-opacity"
      >
        <ArrowRight className="w-4 h-4" />
        بحث جديد
      </Link>
    </div>
  );
}

/* ── copy-to-clipboard hook ── */
function useCopy() {
  const [copied, setCopied] = useState(false);
  const copy = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };
  return { copied, copy };
}

/* ── main card ── */
export function ResultCard({ seatNumber }: { seatNumber: number }) {
  const router = useRouter();
  const { copied, copy } = useCopy();
  const [student, setStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const confettiFired = useRef(false);
  // Detect Web Share API only after mount to avoid SSR/client hydration mismatch
  const [canShare, setCanShare] = useState(false);
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

  /* fire confetti once when a passing result loads */
  useEffect(() => {
    if (!student || !isPass(student.studentCaseDesc) || confettiFired.current) return;
    confettiFired.current = true;
    const fire = (particleRatio: number, opts: confetti.Options) =>
      confetti({ origin: { y: 0.6 }, ...opts, particleCount: Math.floor(200 * particleRatio) });

    setTimeout(() => {
      fire(0.25, { spread: 26, startVelocity: 55, colors: ['#f97316', '#fb923c', '#fed7aa'] });
      fire(0.2,  { spread: 60, colors: ['#f97316', '#000000', '#ffffff'] });
      fire(0.35, { spread: 100, decay: 0.91, scalar: 0.8, colors: ['#f97316', '#fb923c'] });
      fire(0.1,  { spread: 120, startVelocity: 25, decay: 0.92, scalar: 1.2 });
      fire(0.1,  { spread: 120, startVelocity: 45, colors: ['#f97316', '#000'] });
    }, 600);
  }, [student]);

  if (loading) return <LoadingSkeleton />;
  if (error || !student) return <ErrorState />;

  const percentage = getPercentage(student.totalDegree);
  const pass = isPass(student.studentCaseDesc);
  const StatusIcon = pass ? CheckCircle2 : XCircle;

  const shareText = `نتيجتي في الثانوية العامة 🎓\nالاسم: ${student.arabicName}\nالمجموع: ${student.totalDegree}/${MAX_DEGREE} (${percentage.toFixed(1)}%)\nالحالة: ${student.studentCaseDesc}`;

  return (
    <div className="max-w-xl mx-auto pt-4 pb-16 space-y-4">

      {/* ── top action bar ── */}
      <div className="flex items-center justify-between no-print">
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

      {/* ── main card ── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] as const }}
        className="print-card rounded-2xl bg-card border border-border shadow-xl shadow-black/8 overflow-hidden"
      >
        {/* accent top bar */}
        <div
          className="h-1 w-full"
          style={{
            background: pass
              ? 'linear-gradient(90deg, hsl(24 95% 53%), hsl(142 71% 45%))'
              : 'linear-gradient(90deg, hsl(0 84% 60%), hsl(0 72% 51%))',
          }}
        />

        <div className="p-5 sm:p-7">

          {/* ── score + name block ── */}
          <div className="flex flex-col items-center gap-4 pb-5 border-b border-border">

            {/* ring */}
            <RingProgress value={percentage} pass={pass} />

            {/* label */}
            <motion.div
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.5, type: 'spring', stiffness: 200 }}
              className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full border text-sm font-bold ${
                pass
                  ? 'bg-green-50 border-green-200 text-green-700 dark:bg-green-950/40 dark:border-green-800 dark:text-green-400'
                  : 'bg-red-50 border-red-200 text-red-700 dark:bg-red-950/40 dark:border-red-800 dark:text-red-400'
              }`}
            >
              <StatusIcon className="w-4 h-4" />
              {student.studentCaseDesc}
            </motion.div>

            {/* student name */}
            <div className="text-center w-full">
              <p className="text-[11px] text-muted-foreground uppercase tracking-wider mb-1 flex items-center justify-center gap-1.5">
                <GraduationCap className="w-3.5 h-3.5" />
                اسم الطالب
              </p>
              <motion.h1
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.25 }}
                className="text-2xl sm:text-3xl font-extrabold leading-snug break-words"
              >
                {student.arabicName}
              </motion.h1>
            </div>
          </div>

          {/* ── score detail row ── */}
          <div className="grid grid-cols-3 gap-3 py-5 border-b border-border text-center">
            {[
              { label: 'رقم الجلوس', value: student.seatNumber, ltr: true },
              { label: 'المجموع',    value: `${student.totalDegree}`, ltr: true },
              { label: 'من',         value: String(MAX_DEGREE), ltr: true },
            ].map(({ label, value, ltr }) => (
              <div key={label} className="space-y-1">
                <p className="text-[10px] text-muted-foreground font-medium">{label}</p>
                <p className="text-lg font-extrabold tabular-nums" dir={ltr ? 'ltr' : 'rtl'}>{value}</p>
              </div>
            ))}
          </div>

          {/* ── action buttons ── */}
          <div className="pt-5 flex flex-col sm:flex-row gap-2 no-print">

            {/* copy result */}
            <motion.button
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              onClick={() => copy(shareText)}
              className="flex-1 inline-flex items-center justify-center gap-2 h-10 rounded-xl border border-border text-sm font-semibold hover:bg-muted transition-colors"
            >
              <AnimatePresence mode="wait">
                {copied
                  ? <motion.span key="ok" initial={{ scale: 0 }} animate={{ scale: 1 }}
                      className="inline-flex items-center gap-1.5 text-green-600">
                      <Check className="w-4 h-4" /> تم النسخ
                    </motion.span>
                  : <motion.span key="cp" initial={{ scale: 0 }} animate={{ scale: 1 }}
                      className="inline-flex items-center gap-1.5">
                      <Copy className="w-4 h-4" /> نسخ النتيجة
                    </motion.span>
                }
              </AnimatePresence>
            </motion.button>

            {/* share */}
            {canShare && (
              <motion.button
                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                onClick={() => navigator.share({ title: 'نتيجتي', text: shareText })}
                className="flex-1 inline-flex items-center justify-center gap-2 h-10 rounded-xl text-sm font-bold text-white transition-opacity hover:opacity-90"
                style={{ background: 'linear-gradient(135deg, hsl(24 95% 50%), hsl(20 100% 60%))' }}
              >
                <Share2 className="w-4 h-4" />
                مشاركة النتيجة
              </motion.button>
            )}
          </div>

          {/* disclaimer */}
          <p className="mt-4 text-center text-[11px] text-muted-foreground leading-relaxed">
            ⚠️ هذه النتيجة استرشادية ولا تغني عن الشهادة الرسمية المعتمدة من المدرسة.
          </p>
        </div>
      </motion.div>
    </div>
  );
}
