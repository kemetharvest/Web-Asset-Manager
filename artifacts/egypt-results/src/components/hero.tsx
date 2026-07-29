'use client';

import { motion } from 'framer-motion';

/* ── variants ───────────────────────────────────────── */
const wordVariant = {
  hidden: { opacity: 0, y: 28, filter: 'blur(6px)' },
  visible: (i: number) => ({
    opacity: 1, y: 0, filter: 'blur(0px)',
    transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] as const, delay: 0.1 + i * 0.11 },
  }),
};

const fadeUp = (delay = 0) => ({
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] as const, delay } },
});

/* ── underline ──────────────────────────────────────── */
function AnimatedUnderline() {
  return (
    <div className="relative h-[3px] rounded-full mt-2.5 overflow-hidden">
      <div className="absolute inset-0 bg-border/40 rounded-full" />
      <motion.div
        className="absolute inset-y-0 right-0 rounded-full"
        style={{ background: 'linear-gradient(90deg,hsl(24 95% 53%),hsl(20 100% 68%),hsl(24 95% 53%))' }}
        initial={{ width: 0 }}
        animate={{ width: '100%' }}
        transition={{ delay: 0.55, duration: 1.0, ease: [0.22, 1, 0.36, 1] as const }}
      />
      <motion.div
        className="absolute inset-y-0 w-16 rounded-full"
        style={{ background: 'linear-gradient(90deg,transparent,rgba(255,255,255,0.55),transparent)' }}
        initial={{ right: '-15%' }}
        animate={{ right: '115%' }}
        transition={{ delay: 1.9, duration: 1.1, ease: 'easeInOut', repeat: Infinity, repeatDelay: 3.2 }}
      />
    </div>
  );
}

/* ── badge ──────────────────────────────────────────── */
function Badge() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.92 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] as const }}
      className="flex justify-center"
    >
      <motion.span
        className="relative inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/25 bg-primary/8 text-primary text-xs font-semibold overflow-hidden"
        animate={{ boxShadow: ['0 0 0px hsl(24 95% 53%/0)','0 0 14px hsl(24 95% 53%/0.3)','0 0 0px hsl(24 95% 53%/0)'] }}
        transition={{ duration: 2.6, repeat: Infinity, ease: 'easeInOut' }}
      >
        {/* shimmer */}
        <motion.span
          className="absolute inset-y-0 w-10 pointer-events-none"
          style={{ background: 'linear-gradient(90deg,transparent,rgba(255,180,80,0.28),transparent)' }}
          initial={{ right: '-20%' }} animate={{ right: '120%' }}
          transition={{ duration: 1.2, repeat: Infinity, repeatDelay: 3, ease: 'easeInOut', delay: 1 }}
        />
        <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse shrink-0" />
        بوابة نتائج الثانوية العامة — مصر
      </motion.span>
    </motion.div>
  );
}

/* ── hero ───────────────────────────────────────────── */
export function Hero() {
  const words = [
    { text: 'نتيجة',    accent: false },
    { text: 'الثانوية', accent: true  },
    { text: 'العامة',   accent: false },
  ];

  return (
    /*
     * No background, no border, no overflow clip on the section itself.
     * The page-level ambient glow (fixed in layout) provides all colour.
     * A bottom mask fades the dot-grid into the page naturally.
     */
    <section className="relative py-10 sm:py-14">

      {/* dot-grid — fades top→bottom into the page */}
      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none select-none"
        style={{
          backgroundImage: 'radial-gradient(circle,hsl(24 95% 53%/0.07) 1px,transparent 1px)',
          backgroundSize: '26px 26px',
          WebkitMaskImage: 'linear-gradient(to bottom,black 20%,transparent 95%)',
          maskImage:       'linear-gradient(to bottom,black 20%,transparent 95%)',
        }}
      />

      {/* content */}
      <div className="relative z-10 max-w-2xl mx-auto text-center space-y-5 px-2">

        <Badge />

        {/* headline */}
        <div>
          <h1 className="text-[2rem] leading-snug sm:text-5xl md:text-6xl font-extrabold tracking-tight flex flex-wrap justify-center gap-x-3">
            {words.map((w, i) => (
              <motion.span
                key={i} custom={i}
                variants={wordVariant} initial="hidden" animate="visible"
                className={w.accent ? 'text-gradient' : 'text-foreground'}
              >
                {w.text}
              </motion.span>
            ))}
          </h1>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="max-w-[240px] sm:max-w-xs mx-auto"
          >
            <AnimatedUnderline />
          </motion.div>
        </div>

        {/* subtitle */}
        <motion.p
          variants={fadeUp(0.45)} initial="hidden" animate="visible"
          className="text-sm sm:text-base text-muted-foreground max-w-sm mx-auto leading-relaxed"
        >
          استعلم عن نتيجتك بسهولة وسرعة باستخدام{' '}
          <span className="text-primary font-semibold">رقم الجلوس</span>
          {' '}أو{' '}
          <span className="text-primary font-semibold">الاسم</span>
        </motion.p>

        {/* scroll hint */}
        <motion.div
          variants={fadeUp(0.75)} initial="hidden" animate="visible"
          className="flex justify-center pt-1"
        >
          <motion.div
            className="flex flex-col items-center gap-0.5 text-muted-foreground/35 select-none"
            animate={{ y: [0, 4, 0] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
          >
            <span className="text-[9px] tracking-widest uppercase font-medium">ابحث الآن</span>
            <svg width="13" height="13" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path d="M8 3v10M8 13l-3.5-3.5M8 13l3.5-3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
