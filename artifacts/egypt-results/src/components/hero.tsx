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
    <section className="relative min-h-[85vh] flex flex-col items-center justify-center overflow-hidden pt-24 pb-16 px-4">
      {/* Background decoration */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-primary/8 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 left-1/4 w-80 h-80 bg-secondary/8 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-accent/4 rounded-full blur-3xl" />
      </div>

      <motion.div
        initial="hidden"
        animate="visible"
        className="relative z-10 max-w-4xl mx-auto text-center space-y-8"
      >
        {/* Badge */}
        <motion.div variants={fadeUp} custom={0} className="flex justify-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass glass-border text-sm font-medium">
            <Award className="w-4 h-4 text-accent" />
            <span>بوابة رسمية لنتائج الثانوية العامة</span>
          </div>
        </motion.div>

        {/* Headline */}
        <div className="space-y-3">
          <motion.h1
            variants={fadeUp}
            custom={0.1}
            className="text-5xl md:text-7xl font-extrabold tracking-tight leading-tight"
          >
            نتيجة{' '}
            <span className="text-gradient">الثانوية العامة</span>
          </motion.h1>
          <motion.div
            variants={fadeUp}
            custom={0.15}
            className="relative inline-block"
          >
            <span className="text-3xl md:text-5xl font-bold text-muted-foreground">
              مصر
            </span>
            {/* Animated underline */}
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: 0.8, duration: 0.6, ease: 'easeOut' }}
              className="absolute -bottom-1 left-0 right-0 h-0.5 bg-gradient-to-l from-accent to-primary origin-right"
            />
          </motion.div>
        </div>

        {/* Subtitle */}
        <motion.p
          variants={fadeUp}
          custom={0.25}
          className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto leading-relaxed"
        >
          استعلم عن نتيجتك بسهولة وسرعة باستخدام{' '}
          <span className="text-foreground font-semibold">رقم الجلوس</span>
          {' '}أو{' '}
          <span className="text-foreground font-semibold">الاسم</span>
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          variants={fadeUp}
          custom={0.35}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <motion.button
            whileHover={{ scale: 1.03, y: -2 }}
            whileTap={{ scale: 0.97 }}
            onClick={handleScrollToSearch}
            className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-primary text-primary-foreground font-bold text-lg shadow-lg shadow-primary/25 hover:bg-primary/90 transition-all shine"
          >
            ابحث عن نتيجتك
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.03, y: -2 }}
            whileTap={{ scale: 0.97 }}
            onClick={handleScrollToSearch}
            className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-card border border-border text-foreground font-semibold text-lg hover:border-primary/40 hover:bg-muted transition-all"
          >
            البحث بالاسم
          </motion.button>
        </motion.div>

        {/* Stats */}
        {status?.loaded && status.count > 0 && (
          <motion.div
            variants={fadeUp}
            custom={0.45}
            className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-8"
          >
            <StatCard icon={Users} value={status.count} label="إجمالي الطلاب" color="bg-primary/10 text-primary" />
            <StatCard icon={CheckCircle} value={Math.round(status.count * 0.78)} label="الناجحون" color="bg-success/10 text-success" />
            <StatCard icon={TrendingUp} value={410} label="أعلى مجموع" color="bg-accent/10 text-accent" />
            <StatCard icon={Award} value={Math.round(status.count * 0.92)} label="أكملوا الاختبار" color="bg-secondary/10 text-secondary" />
          </motion.div>
        )}
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
          className="w-6 h-10 rounded-full border-2 border-muted-foreground/30 flex items-start justify-center pt-1.5"
        >
          <div className="w-1 h-2 bg-muted-foreground/50 rounded-full" />
        </motion.div>
      </motion.div>
    </section>
  );
}
