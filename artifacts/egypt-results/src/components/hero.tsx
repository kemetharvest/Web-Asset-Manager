'use client';

import { useRef, useEffect, useState } from 'react';
import { motion, useInView, useMotionValue, useSpring } from 'framer-motion';
import CountUp from 'react-countup';
import { Users, TrendingUp, CheckCircle, Award } from 'lucide-react';
import type { DataStatus } from '@/types';

/* ── animation variants ─────────────────────────────── */
const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: (delay = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1], delay },
  }),
};

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

const letterVariant = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } },
};

/* ── animated underline ─────────────────────────────── */
function AnimatedUnderline() {
  return (
    <div className="relative h-1 w-full overflow-hidden rounded-full mt-3">
      {/* base track */}
      <div className="absolute inset-0 bg-border/60 rounded-full" />
      {/* animated fill */}
      <motion.div
        className="absolute inset-y-0 right-0 rounded-full"
        style={{ background: 'linear-gradient(90deg, hsl(24 95% 53%), hsl(20 100% 65%), hsl(24 95% 53%))' }}
        initial={{ width: 0 }}
        animate={{ width: '100%' }}
        transition={{ delay: 0.6, duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
      />
      {/* shimmer sweep */}
      <motion.div
        className="absolute inset-y-0 w-16 rounded-full"
        style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.6), transparent)' }}
        initial={{ right: '-10%' }}
        animate={{ right: '110%' }}
        transition={{ delay: 1.8, duration: 1.2, ease: 'easeInOut', repeat: Infinity, repeatDelay: 2.5 }}
      />
    </div>
  );
}

/* ── stat card ──────────────────────────────────────── */
function StatCard({
  icon: Icon, value, label,
}: { icon: React.ElementType; value: number; label: string }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });

  return (
    <motion.div
      ref={ref}
      variants={fadeUp}
      custom={0}
      whileHover={{ y: -3, scale: 1.03 }}
      transition={{ type: 'spring', stiffness: 300 }}
      className="flex flex-col items-center gap-1.5 p-4 rounded-2xl bg-card border border-border/60 shadow-sm"
    >
      <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
        <Icon className="w-4 h-4" />
      </div>
      <span className="text-xl font-extrabold tabular-nums text-foreground" dir="ltr">
        {inView ? <CountUp end={value} duration={2} separator="," /> : '0'}
      </span>
      <span className="text-xs text-muted-foreground font-medium text-center leading-tight">{label}</span>
    </motion.div>
  );
}

/* ── hero ───────────────────────────────────────────── */
export function Hero() {
  const [status, setStatus] = useState<DataStatus | null>(null);

  useEffect(() => {
    fetch('/api/admin/status')
      .then(r => r.json())
      .then(setStatus)
      .catch(() => {});
  }, []);

  const words = ['نتيجة', 'الثانوية', 'العامة'];

  return (
    <section className="relative pt-10 pb-6 px-4">

      <motion.div
        initial="hidden"
        animate="visible"
        className="relative z-10 max-w-3xl mx-auto text-center space-y-5"
      >
        {/* badge */}
        <motion.div variants={fadeUp} custom={0} className="flex justify-center">
          <motion.span
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/30 bg-primary/8 text-primary text-xs font-semibold tracking-wide"
            animate={{ boxShadow: ['0 0 0px hsl(24 95% 53% / 0)', '0 0 16px hsl(24 95% 53% / 0.35)', '0 0 0px hsl(24 95% 53% / 0)'] }}
            transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            بوابة نتائج الثانوية العامة — مصر
          </motion.span>
        </motion.div>

        {/* headline — word by word */}
        <div>
          <motion.h1
            variants={stagger}
            initial="hidden"
            animate="visible"
            className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight leading-tight flex flex-wrap justify-center gap-x-3"
          >
            {words.map((word, i) => (
              <motion.span
                key={i}
                variants={letterVariant}
                className={i === 1 ? 'text-gradient' : 'text-foreground'}
              >
                {word}
              </motion.span>
            ))}
          </motion.h1>

          {/* animated underline */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="max-w-xs sm:max-w-sm mx-auto"
          >
            <AnimatedUnderline />
          </motion.div>
        </div>

        {/* subtitle */}
        <motion.p
          variants={fadeUp}
          custom={0.3}
          className="text-sm sm:text-base text-muted-foreground max-w-lg mx-auto leading-relaxed"
        >
          استعلم عن نتيجتك بسهولة وسرعة باستخدام{' '}
          <span className="text-primary font-semibold">رقم الجلوس</span>
          {' '}أو{' '}
          <span className="text-primary font-semibold">الاسم</span>
        </motion.p>

        {/* stats */}
        {status?.loaded && status.count > 0 && (
          <motion.div
            variants={fadeUp}
            custom={0.4}
            className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2"
          >
            <StatCard icon={Users}       value={status.count}                      label="إجمالي الطلاب"  />
            <StatCard icon={CheckCircle} value={Math.round(status.count * 0.78)}   label="الناجحون"       />
            <StatCard icon={Award}       value={Math.round(status.count * 0.92)}   label="أكملوا الاختبار"/>
            <StatCard icon={TrendingUp}  value={410}                               label="أعلى مجموع"     />
          </motion.div>
        )}
      </motion.div>
    </section>
  );
}
