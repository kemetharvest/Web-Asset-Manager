'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { CheckCircle2, XCircle, Printer, ArrowRight, GraduationCap } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { ShareButtons } from '@/components/share-buttons';
import { getPercentage, isPass, MAX_DEGREE } from '@/lib/utils';
import { fetchResultBySeat } from '@/lib/api';
import type { Student } from '@/types';

function CircularProgress({ value, color }: { value: number; color: string }) {
  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;

  return (
    <div className="relative w-36 h-36 flex items-center justify-center">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
        <circle className="text-muted stroke-current" strokeWidth="7" cx="50" cy="50" r={radius} fill="transparent" />
        <motion.circle
          className={`stroke-current ${color}`}
          strokeWidth="7"
          strokeLinecap="round"
          cx="50" cy="50" r={radius}
          fill="transparent"
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.8, ease: 'easeOut', delay: 0.3 }}
          style={{ strokeDasharray: circumference }}
        />
      </svg>
      <div className="absolute flex flex-col items-center justify-center">
        <span className="text-2xl font-bold" dir="ltr">{value.toFixed(1)}%</span>
        <span className="text-xs text-muted-foreground">النسبة</span>
      </div>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="max-w-3xl mx-auto space-y-6 pt-8">
      <Skeleton className="w-28 h-10" />
      <Skeleton className="w-full h-[500px] rounded-3xl" />
    </div>
  );
}

function ErrorState() {
  return (
    <div className="max-w-xl mx-auto pt-24 text-center space-y-6">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 200, delay: 0.1 }}
        className="w-24 h-24 bg-destructive/10 rounded-full flex items-center justify-center mx-auto"
      >
        <XCircle className="w-12 h-12 text-destructive" />
      </motion.div>
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <h2 className="text-3xl font-bold mb-3">عذراً، لم يتم العثور على نتيجة</h2>
        <p className="text-muted-foreground text-lg">تأكد من كتابة رقم الجلوس بشكل صحيح وحاول مرة أخرى.</p>
      </motion.div>
      <Link href="/" className="inline-flex items-center gap-2 px-8 py-3 rounded-2xl bg-primary text-primary-foreground font-bold shadow-md hover:bg-primary/90 transition-all">
        <ArrowRight className="w-5 h-5" />
        العودة للبحث
      </Link>
    </div>
  );
}

export function ResultCard({ seatNumber }: { seatNumber: number }) {
  const router = useRouter();
  const [student, setStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!seatNumber) return;
    setLoading(true);
    fetchResultBySeat(seatNumber)
      .then(data => { setStudent(data); setLoading(false); })
      .catch(() => { setError(true); setLoading(false); });
  }, [seatNumber]);

  if (loading) return <LoadingSkeleton />;
  if (error || !student) return <ErrorState />;

  const percentage = getPercentage(student.totalDegree);
  const pass = isPass(student.studentCaseDesc);
  const statusColor = pass ? 'text-success' : 'text-destructive';
  const progressColor = pass ? 'text-success' : 'text-destructive';
  const statusBg = pass ? 'bg-success/10 border-success/20 text-success' : 'bg-destructive/10 border-destructive/20 text-destructive';
  const StatusIcon = pass ? CheckCircle2 : XCircle;

  return (
    <div className="max-w-3xl mx-auto space-y-6 pt-4 pb-16">
      {/* Top bar */}
      <div className="flex items-center justify-between no-print">
        <button
          onClick={() => router.push('/')}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors font-medium"
        >
          <ArrowRight className="w-4 h-4" />
          بحث جديد
        </button>
        <button
          onClick={() => window.print()}
          className="flex items-center gap-2 px-4 py-2 rounded-xl border border-border text-sm font-medium hover:bg-muted transition-colors"
        >
          <Printer className="w-4 h-4" />
          طباعة
        </button>
      </div>

      {/* Main Result Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="print-card rounded-3xl glass glass-border shadow-2xl shadow-black/10 overflow-hidden relative"
      >
        {/* Top gradient bar */}
        <div className={`h-1.5 w-full ${pass ? 'bg-gradient-to-l from-success via-primary to-secondary' : 'bg-gradient-to-l from-destructive via-destructive/70 to-destructive/40'}`} />

        <div className="p-4 sm:p-8 md:p-10">
          {/* Header */}
          <div className="flex flex-col items-center gap-6 pb-6 border-b border-border">
            {/* Circular progress - top on mobile */}
            <div className="flex-shrink-0 flex flex-col items-center gap-2">
              <CircularProgress value={percentage} color={progressColor} />
              <p className="text-sm text-muted-foreground font-medium text-center">
                المجموع:{' '}
                <span className="text-foreground font-bold text-lg" dir="ltr">{student.totalDegree}</span>
                <span className="text-xs"> / {MAX_DEGREE}</span>
              </p>
            </div>

            <div className="w-full text-center space-y-3">
              <div className="flex items-center justify-center gap-2 text-sm font-semibold tracking-widest text-accent uppercase">
                <GraduationCap className="w-4 h-4" />
                بطاقة نتيجة طالب
              </div>
              <motion.h1
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-2xl sm:text-3xl md:text-4xl font-extrabold leading-snug break-words w-full"
              >
                {student.arabicName}
              </motion.h1>
              <div className="flex flex-wrap items-center justify-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-muted text-sm font-semibold">
                  رقم الجلوس:
                  <span className="text-foreground font-bold" dir="ltr">{student.seatNumber}</span>
                </span>
                <motion.span
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.4, type: 'spring' }}
                  className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-sm font-bold ${statusBg}`}
                >
                  <StatusIcon className="w-4 h-4" />
                  {student.studentCaseDesc}
                </motion.span>
              </div>
            </div>
          </div>

          {/* Share */}
          <div className="pt-8 space-y-6">
            <ShareButtons
              student={student}
              percentage={percentage}
              isPass={pass}
            />

            <div className="bg-muted/50 rounded-2xl p-5 text-center text-sm text-muted-foreground leading-relaxed">
              ⚠️ هذه النتيجة استرشادية ولا تغني عن الشهادة الرسمية المعتمدة من المدرسة.
            </div>
          </div>
        </div>

        {/* Background decoration */}
        <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -top-20 -right-20 w-60 h-60 bg-accent/5 rounded-full blur-3xl pointer-events-none" />
      </motion.div>
    </div>
  );
}
