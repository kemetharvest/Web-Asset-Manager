'use client';

import { useEffect, useRef } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { GraduationCap, Star, BookOpen, Award } from 'lucide-react';

/* ── variants ───────────────────────────────────────── */
const fadeUp = (delay = 0) => ({
  hidden: { opacity: 0, y: 32 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1], delay },
  },
});

const wordVariant = {
  hidden: { opacity: 0, y: 40, filter: 'blur(8px)' },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1], delay: 0.15 + i * 0.12 },
  }),
};

/* ── animated underline ─────────────────────────────── */
function AnimatedUnderline() {
  return (
    <div className="relative h-[3px] w-full overflow-hidden rounded-full mt-3">
      <div className="absolute inset-0 bg-border/50 rounded-full" />
      <motion.div
        className="absolute inset-y-0 right-0 rounded-full"
        style={{ background: 'linear-gradient(90deg, hsl(24 95% 53%), hsl(20 100% 68%), hsl(24 95% 53%))' }}
        initial={{ width: 0 }}
        animate={{ width: '100%' }}
        transition={{ delay: 0.7, duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
      />
      <motion.div
        className="absolute inset-y-0 w-20 rounded-full"
        style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.65), transparent)' }}
        initial={{ right: '-15%' }}
        animate={{ right: '115%' }}
        transition={{ delay: 2.2, duration: 1.3, ease: 'easeInOut', repeat: Infinity, repeatDelay: 3 }}
      />
    </div>
  );
}

/* ── floating icon ──────────────────────────────────── */
function FloatingIcon({
  icon: Icon, className, delay, amplitude = 10,
}: { icon: React.ElementType; className: string; delay: number; amplitude?: number }) {
  const reduced = useReducedMotion();
  return (
    <motion.div
      className={`absolute pointer-events-none select-none ${className}`}
      initial={{ opacity: 0, scale: 0.6 }}
      animate={reduced ? { opacity: 0.18 } : {
        opacity: [0, 0.22, 0.18],
        y: [0, -amplitude, 0],
        scale: [0.6, 1, 1],
      }}
      transition={{
        opacity: { duration: 0.6, delay },
        y: { duration: 4 + delay * 0.4, repeat: Infinity, ease: 'easeInOut', delay },
        scale: { duration: 0.6, delay },
      }}
    >
      <Icon className="w-full h-full" />
    </motion.div>
  );
}

/* ── orb ────────────────────────────────────────────── */
function Orb({ className, delay }: { className: string; delay: number }) {
  const reduced = useReducedMotion();
  return (
    <motion.div
      className={`absolute rounded-full blur-3xl pointer-events-none select-none ${className}`}
      initial={{ opacity: 0 }}
      animate={reduced ? { opacity: 1 } : {
        opacity: [0, 1, 0.8],
        scale: [0.8, 1.05, 0.95, 1],
      }}
      transition={{
        opacity: { duration: 1.2, delay },
        scale: { duration: 6, repeat: Infinity, ease: 'easeInOut', delay },
      }}
    />
  );
}

/* ── dot grid ───────────────────────────────────────── */
function DotGrid() {
  return (
    <div
      className="absolute inset-0 pointer-events-none select-none opacity-[0.04]"
      style={{
        backgroundImage: 'radial-gradient(circle, hsl(24 95% 53%) 1px, transparent 1px)',
        backgroundSize: '28px 28px',
      }}
    />
  );
}

/* ── shimmer text ───────────────────────────────────── */
function ShimmerBadge() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="flex justify-center"
    >
      <motion.span
        className="relative inline-flex items-center gap-2 px-5 py-2 rounded-full border border-primary/30 bg-primary/8 text-primary text-xs font-semibold tracking-wide overflow-hidden"
        animate={{
          boxShadow: [
            '0 0 0px hsl(24 95% 53% / 0)',
            '0 0 18px hsl(24 95% 53% / 0.3)',
            '0 0 0px hsl(24 95% 53% / 0)',
          ],
        }}
        transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut' }}
      >
        {/* shimmer sweep */}
        <motion.span
          className="absolute inset-y-0 w-16 pointer-events-none"
          style={{ background: 'linear-gradient(90deg, transparent, rgba(255,180,80,0.25), transparent)' }}
          initial={{ right: '-30%' }}
          animate={{ right: '130%' }}
          transition={{ duration: 1.4, repeat: Infinity, repeatDelay: 2.6, ease: 'easeInOut', delay: 1 }}
        />
        <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
        بوابة نتائج الثانوية العامة — مصر
      </motion.span>
    </motion.div>
  );
}

/* ── hero ───────────────────────────────────────────── */
export function Hero() {
  const words = [
    { text: 'نتيجة', accent: false },
    { text: 'الثانوية', accent: true },
    { text: 'العامة', accent: false },
  ];

  return (
    <section className="relative pt-14 pb-8 px-4 overflow-hidden min-h-[380px] flex items-center">

      {/* ── background layer ── */}
      <DotGrid />

      {/* orbs */}
      <Orb
        className="w-80 h-80 -top-20 -right-24 bg-primary/15"
        delay={0.2}
      />
      <Orb
        className="w-64 h-64 bottom-0 -left-20 bg-orange-300/10"
        delay={0.6}
      />
      <Orb
        className="w-40 h-40 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-primary/8"
        delay={1}
      />

      {/* floating icons */}
      <FloatingIcon icon={GraduationCap} className="top-8 left-6 w-7 h-7 text-primary/50"    delay={0.8} amplitude={12} />
      <FloatingIcon icon={Star}          className="top-12 right-8 w-5 h-5 text-orange-400/60" delay={1.2} amplitude={8}  />
      <FloatingIcon icon={BookOpen}      className="bottom-8 left-10 w-6 h-6 text-primary/40"  delay={1.5} amplitude={10} />
      <FloatingIcon icon={Award}         className="bottom-6 right-6 w-7 h-7 text-orange-400/45" delay={0.9} amplitude={14} />

      {/* ── content ── */}
      <div className="relative z-10 w-full max-w-3xl mx-auto text-center space-y-6">

        {/* badge */}
        <ShimmerBadge />

        {/* headline */}
        <div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight leading-tight flex flex-wrap justify-center gap-x-3">
            {words.map((w, i) => (
              <motion.span
                key={i}
                custom={i}
                variants={wordVariant}
                initial="hidden"
                animate="visible"
                className={w.accent ? 'text-gradient' : 'text-foreground'}
              >
                {w.text}
              </motion.span>
            ))}
          </h1>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="max-w-xs sm:max-w-sm mx-auto"
          >
            <AnimatedUnderline />
          </motion.div>
        </div>

        {/* subtitle */}
        <motion.p
          variants={fadeUp(0.55)}
          initial="hidden"
          animate="visible"
          className="text-sm sm:text-base text-muted-foreground max-w-lg mx-auto leading-relaxed"
        >
          استعلم عن نتيجتك بسهولة وسرعة باستخدام{' '}
          <span className="text-primary font-semibold">رقم الجلوس</span>
          {' '}أو{' '}
          <span className="text-primary font-semibold">الاسم</span>
        </motion.p>

        {/* scroll hint */}
        <motion.div
          variants={fadeUp(0.85)}
          initial="hidden"
          animate="visible"
          className="flex justify-center pt-2"
        >
          <motion.div
            className="flex flex-col items-center gap-1 text-muted-foreground/60"
            animate={{ y: [0, 5, 0] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
          >
            <span className="text-[10px] tracking-widest uppercase font-medium">ابحث الآن</span>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M8 3v10M8 13l-3.5-3.5M8 13l3.5-3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
