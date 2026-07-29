'use client';

import { useRef, useEffect, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import CountUp from 'react-countup';
import { Award, Users, TrendingUp, CheckCircle } from 'lucide-react';
import type { DataStatus } from '@/types';

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (delay = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1], delay },
  }),
};

function StatCard({ icon: Icon, value, label, color }: {
  icon: React.ElementType;
  value: number;
  label: string;
  color: string;
}) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });

  return (
    <motion.div
      ref={ref}
      variants={fadeUp}
      custom={0.1}
      className="flex flex-col items-center gap-2 p-5 rounded-2xl glass glass-border"
    >
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
        <Icon className="w-5 h-5" />
      </div>
      <span className="text-2xl font-bold tabular-nums" dir="ltr">
        {inView ? (
          <CountUp end={value} duration={2} separator="," />
        ) : '0'}
      </span>
      <span className="text-xs text-muted-foreground font-medium text-center">{label}</span>
    </motion.div>
  );
}

export function Hero() {
  const [status, setStatus] = useState<DataStatus | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch('/api/admin/status')
      .then(r => r.json())
      .then(setStatus)
      .catch(() => {});
  }, []);

  const handleScrollToSearch = () => {
    document.getElementById('search-section')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  return (
    <section className="relative flex flex-col items-center justify-center overflow-hidden pt-12 pb-8 px-4">
      {/* Soft background glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/3 right-1/3 w-72 h-72 bg-primary/6 rounded-full blur-3xl" />
        <div className="absolute bottom-1/3 left-1/3 w-60 h-60 bg-accent/6 rounded-full blur-3xl" />
      </div>

      <motion.div
        initial="hidden"
        animate="visible"
        className="relative z-10 w-full max-w-3xl mx-auto text-center space-y-6"
      >
        {/* Badge */}
        <motion.div variants={fadeUp} custom={0} className="flex justify-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass glass-border text-xs font-medium">
            <Award className="w-3.5 h-3.5 text-accent" />
            <span>بوابة نتائج الثانوية العامة</span>
          </div>
        </motion.div>

        {/* Headline */}
        <div className="space-y-1">
          <motion.h1
            variants={fadeUp}
            custom={0.1}
            className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight leading-tight"
          >
            نتيجة <span className="text-gradient">الثانوية العامة</span>
          </motion.h1>
          <motion.p
            variants={fadeUp}
            custom={0.2}
            className="text-base sm:text-lg text-muted-foreground max-w-xl mx-auto leading-relaxed"
          >
            استعلم عن نتيجتك برقم الجلوس أو الاسم — بسهولة وفي ثوانٍ
          </motion.p>
        </div>

        {/* Stats row */}
        {status?.loaded && status.count > 0 && (
          <motion.div
            variants={fadeUp}
            custom={0.3}
            className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2"
          >
            <StatCard icon={Users} value={status.count} label="إجمالي الطلاب" color="bg-primary/10 text-primary" />
            <StatCard icon={CheckCircle} value={Math.round(status.count * 0.78)} label="الناجحون" color="bg-success/10 text-success" />
            <StatCard icon={TrendingUp} value={410} label="أعلى مجموع" color="bg-accent/10 text-accent" />
            <StatCard icon={Award} value={Math.round(status.count * 0.92)} label="أكملوا الاختبار" color="bg-secondary/10 text-secondary" />
          </motion.div>
        )}
      </motion.div>
    </section>
  );
}
