'use client';

import { motion, useReducedMotion } from 'framer-motion';

/* ── variants ───────────────────────────────────────── */
const wordVariant = {
  hidden: { opacity: 0, y: 32, filter: 'blur(6px)' },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1], delay: 0.15 + i * 0.12 },
  }),
};

const fadeUp = (delay = 0) => ({
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1], delay },
  },
});

/* ── animated underline ─────────────────────────────── */
function AnimatedUnderline() {
  return (
    <div className="relative h-[3px] w-full overflow-hidden rounded-full mt-3">
      <div className="absolute inset-0 bg-border/40 rounded-full" />
      <motion.div
        className="absolute inset-y-0 right-0 rounded-full"
        style={{ background: 'linear-gradient(90deg, hsl(24 95% 53%), hsl(20 100% 68%), hsl(24 95% 53%))' }}
        initial={{ width: 0 }}
        animate={{ width: '100%' }}
        transition={{ delay: 0.6, duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
      />
      <motion.div
        className="absolute inset-y-0 w-20 rounded-full"
        style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.6), transparent)' }}
        initial={{ right: '-15%' }}
        animate={{ right: '115%' }}
        transition={{ delay: 2, duration: 1.2, ease: 'easeInOut', repeat: Infinity, repeatDelay: 3 }}
      />
    </div>
  );
}

/* ── shimmer badge ──────────────────────────────────── */
function ShimmerBadge() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="flex justify-center"
    >
      <motion.span
        className="relative inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/30 bg-primary/10 text-primary text-xs font-semibold tracking-wide overflow-hidden"
        animate={{
          boxShadow: [
            '0 0 0px hsl(24 95% 53% / 0)',
            '0 0 16px hsl(24 95% 53% / 0.35)',
            '0 0 0px hsl(24 95% 53% / 0)',
          ],
        }}
        transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut' }}
      >
        <motion.span
          className="absolute inset-y-0 w-12 pointer-events-none"
          style={{ background: 'linear-gradient(90deg, transparent, rgba(255,180,80,0.3), transparent)' }}
          initial={{ right: '-20%' }}
          animate={{ right: '120%' }}
          transition={{ duration: 1.3, repeat: Infinity, repeatDelay: 2.8, ease: 'easeInOut', delay: 1 }}
        />
        <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse flex-shrink-0" />
        بوابة نتائج الثانوية العامة — مصر
      </motion.span>
    </motion.div>
  );
}

/* ── orb ────────────────────────────────────────────── */
function Orb({ className, color, delay }: { className: string; color: string; delay: number }) {
  const reduced = useReducedMotion();
  return (
    <motion.div
      className={`absolute rounded-full pointer-events-none select-none ${className}`}
      style={{ background: color }}
      initial={{ opacity: 0 }}
      animate={reduced ? { opacity: 1 } : { opacity: [0, 1, 0.85, 1], scale: [0.9, 1.05, 0.97, 1] }}
      transition={{
        opacity: { duration: 1, delay },
        scale: { duration: 7 + delay, repeat: Infinity, ease: 'easeInOut', delay },
      }}
    />
  );
}

/* ── hero ───────────────────────────────────────────── */
export function Hero() {
  const words = [
    { text: 'نتيجة',   accent: false },
    { text: 'الثانوية', accent: true  },
    { text: 'العامة',  accent: false },
  ];

  return (
    <section
      className="relative py-10 sm:py-14"
      /* clip horizontal overflow so orbs don't create page scroll */
      style={{ overflowX: 'clip' }}
    >
      {/* ── dot grid ── */}
      <div
        className="absolute inset-0 pointer-events-none select-none"
        style={{
          backgroundImage: 'radial-gradient(circle, hsl(24 95% 53% / 0.07) 1px, transparent 1px)',
          backgroundSize: '28px 28px',
          WebkitMaskImage: 'linear-gradient(to bottom, black 30%, transparent 100%)',
          maskImage: 'linear-gradient(to bottom, black 30%, transparent 100%)',
        }}
      />

      {/* ── orbs (inside clip container — no horizontal overflow) ── */}
      <Orb
        className="w-96 h-96 -top-32 -right-20 blur-3xl"
        color="radial-gradient(circle, hsl(24 95% 53% / 0.2) 0%, transparent 65%)"
        delay={0.2}
      />
      <Orb
        className="w-80 h-80 -bottom-20 -left-16 blur-3xl"
        color="radial-gradient(circle, hsl(30 90% 60% / 0.13) 0%, transparent 65%)"
        delay={0.5}
      />

      {/* ── bottom fade ── */}
      <div
        className="absolute bottom-0 left-0 right-0 h-24 pointer-events-none"
        style={{ background: 'linear-gradient(to bottom, transparent, hsl(var(--background)))' }}
      />

      {/* ── content ── */}
      <div className="relative z-10 max-w-2xl mx-auto text-center space-y-5 px-4">

        <ShimmerBadge />

        {/* headline */}
        <div>
          <h1 className="text-[2.1rem] leading-tight sm:text-5xl md:text-6xl font-extrabold tracking-tight flex flex-wrap justify-center gap-x-3">
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
            transition={{ delay: 0.45 }}
            className="max-w-[260px] sm:max-w-xs mx-auto"
          >
            <AnimatedUnderline />
          </motion.div>
        </div>

        {/* subtitle */}
        <motion.p
          variants={fadeUp(0.5)}
          initial="hidden"
          animate="visible"
          className="text-sm sm:text-base text-muted-foreground max-w-sm mx-auto leading-relaxed"
        >
          استعلم عن نتيجتك بسهولة وسرعة باستخدام{' '}
          <span className="text-primary font-semibold">رقم الجلوس</span>
          {' '}أو{' '}
          <span className="text-primary font-semibold">الاسم</span>
        </motion.p>

        {/* scroll hint */}
        <motion.div
          variants={fadeUp(0.8)}
          initial="hidden"
          animate="visible"
          className="flex justify-center pt-1"
        >
          <motion.div
            className="flex flex-col items-center gap-1 text-muted-foreground/40"
            animate={{ y: [0, 5, 0] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
          >
            <span className="text-[10px] tracking-widest uppercase font-medium">ابحث الآن</span>
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
              <path d="M8 3v10M8 13l-3.5-3.5M8 13l3.5-3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
